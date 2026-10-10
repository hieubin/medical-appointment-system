import { useEffect, useRef, useState } from "react";
import {
  Logo,
  Heading,
  Icon,
  Button,
  TextField,
  LinkButton,
  StatusBadge,
  Toast,
  ConfirmModal,
  InfoModal,
} from "./components/ui.jsx";
import AdminDashboard, { CLINIC_LOCATIONS, getAppointmentLocation, getDoctorLocation } from "./components/AdminDashboard";
import { api } from "./api/axios.js";

export { Logo, Heading, Icon, Button, TextField, LinkButton, StatusBadge, Toast, ConfirmModal, InfoModal, CLINIC_LOCATIONS };

/**
 * Lấy lời chào phù hợp theo thời gian thực trong ngày
 * - 05:00 - 10:59: Chào buổi sáng
 * - 11:00 - 13:59: Chào buổi trưa
 * - 14:00 - 17:59: Chào buổi chiều
 * - 18:00 - 04:59: Chào buổi tối
 */
export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) {
    return "Chào buổi sáng";
  }
  if (hour >= 11 && hour < 14) {
    return "Chào buổi trưa";
  }
  if (hour >= 14 && hour < 18) {
    return "Chào buổi chiều";
  }
  return "Chào buổi tối";
}

// ─── PATIENT PORTAL ────────────────────────────────────────────────────────────

export function PatientPortal({ onAdmin, onLogout, currentUser }) {
  const [user, setUser] = useState(currentUser || null);
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [clinicLocations, setClinicLocations] = useState(CLINIC_LOCATIONS);
  const [bookingLocation, setBookingLocation] = useState(CLINIC_LOCATIONS[0].id);

  useEffect(() => {
    api.get("/locations")
      .then((r) => {
        const data = r.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          setClinicLocations(data);
          setBookingLocation((prev) => (data.some((l) => l.id === prev) ? prev : data[0].id));
        }
      })
      .catch(() => {});
  }, []);

  // Booking Wizard States
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Bác sĩ & Dịch vụ, 2: Ngày & Khung giờ, 3: Thông tin, 4: Thành công
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const getDefaultDate = () => {
    const d = new Date();
    const day = d.getDay();
    if (day === 6) d.setDate(d.getDate() + 2);
    else if (day === 0) d.setDate(d.getDate() + 1);
    else if (d.getHours() >= 16) d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    else if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const [appointmentDate, setAppointmentDate] = useState(getDefaultDate());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientNote, setPatientNote] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedResult, setBookedResult] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);

  // Appointments
  const [myAppointments, setMyAppointments] = useState([]);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelModalAppointment, setCancelModalAppointment] = useState(null);
  const [toast, setToast] = useState(null);

  // Search & Modals
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [copyHotlineSuccess, setCopyHotlineSuccess] = useState(false);
  const [doctorFilter, setDoctorFilter] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [profileForm, setProfileForm] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setUser(currentUser);
    setPatientName(currentUser.fullName || "");
    setPatientPhone(currentUser.phone || "");
    setPatientEmail(currentUser.email || "");
  }, [currentUser]);

  const fetchMyAppointments = () => {
    api
      .get("/appointments/my")
      .then((r) => setMyAppointments(r.data?.data || []))
      .catch(() => setMyAppointments([]));
  };

  // Fetch and update medical profile
  const fetchMedicalRecord = async () => {
    setProfileLoading(true);
    try {
      const res = await api.get("/medical-records");
      setMedicalRecord(res.data?.data);
      setProfileForm(res.data?.data || {});
    } catch {
      setMedicalRecord(null);
      setProfileForm({});
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchMyAppointments();
    fetchMedicalRecord();
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".patient-avatar-wrapper")) setShowUserMenu(false);
    };
    if (showUserMenu) document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showUserMenu]);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "LT";

  // Fetch doctors on mount for directory, quick booking, and care team
  useEffect(() => {
    setLoading(true);
    api
      .get("/doctors")
      .then((r) => {
        const list = r.data?.data || [];
        setDoctors(list);
        if (list.length > 0 && !selectedDoctor) {
          handleSelectDoctor(list[0]);
        }
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    if (!doctorFilter.trim()) return true;
    const q = doctorFilter.toLowerCase();
    const nameMatch = doc.fullName?.toLowerCase().includes(q);
    const specMatch = doc.specialties?.some((s) => s.name?.toLowerCase().includes(q));
    const titleMatch = doc.title?.toLowerCase().includes(q);
    return nameMatch || specMatch || titleMatch;
  });

  const handleSelectDoctor = async (doc) => {
    setSelectedDoctor(doc);
    const spec = doc.specialties?.[0] || null;
    setSelectedSpecialty(spec);
    setSelectedSlot(null);
    setError(null);
    try {
      const url = spec?.id ? `/services?specialtyId=${spec.id}` : "/services";
      const res = await api.get(url);
      const srvs = res.data?.data || [];
      setServices(srvs);
      if (srvs.length > 0) {
        setSelectedService(srvs[0]);
      } else {
        setSelectedService(null);
      }
    } catch {
      setServices([]);
      setSelectedService(null);
    }
  };

  // Fetch available slots when doctor and date change
  useEffect(() => {
    if (showBooking && selectedDoctor?.id && appointmentDate) {
      setSlotsLoading(true);
      api
        .get(`/doctors/${selectedDoctor.id}/available-slots?date=${appointmentDate}`)
        .then((r) => {
          setSlots(r.data?.data || []);
        })
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [showBooking, selectedDoctor?.id, appointmentDate]);

  const handleBookAppointment = (initialDoc = null) => {
    setShowBooking(true);
    setBookingStep(1);
    setError(null);
    setBookedResult(null);
    setSelectedSlot(null);
    if (searchLocation) {
      setBookingLocation(searchLocation);
    }
    if (searchDate) {
      setAppointmentDate(searchDate);
    }
    if (user) {
      setPatientName(user.fullName || "");
      setPatientPhone(user.phone || "");
      setPatientEmail(user.email || "");
    }
    if (initialDoc) {
      handleSelectDoctor(initialDoc);
    } else if (selectedDoctor) {
      handleSelectDoctor(selectedDoctor);
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedDoctor) {
      setError("Vui lòng chọn bác sĩ.");
      setBookingStep(1);
      return;
    }
    if (!selectedService) {
      setError("Vui lòng chọn dịch vụ khám.");
      setBookingStep(1);
      return;
    }
    if (!appointmentDate || !selectedSlot) {
      setError("Vui lòng chọn ngày khám và khung giờ còn trống.");
      setBookingStep(2);
      return;
    }
    if (!patientName.trim()) {
      setError("Vui lòng nhập họ và tên người khám.");
      setBookingStep(3);
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 8) {
      setError("Vui lòng nhập số điện thoại hợp lệ (tối thiểu 8 số).");
      setBookingStep(3);
      return;
    }

    setBookingLoading(true);
    setError(null);
    try {
      const selectedLocObj = clinicLocations.find((l) => l.id === bookingLocation) || clinicLocations[0] || {};
      const fullNote = patientNote.trim()
        ? `[Cơ sở: ${selectedLocObj.name || "Cơ sở phòng khám"}] ${patientNote.trim()}`
        : `[Cơ sở: ${selectedLocObj.name || "Cơ sở phòng khám"}]`;

      const payload = {
        doctorId: selectedDoctor.id,
        specialtyId: selectedSpecialty?.id || selectedService.specialtyId || undefined,
        serviceId: selectedService.id,
        appointmentDate,
        startTime: selectedSlot.startTime,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim() || undefined,
        patientNote: fullNote,
        patientId: user?.id || undefined,
      };

      const res = await api.post("/appointments", payload);
      const booked = res.data?.data || res.data;
      setBookedResult({
        ...booked,
        doctor: selectedDoctor,
        service: selectedService,
        appointmentDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        location: selectedLocObj,
      });
      setBookingStep(4);
      fetchMyAppointments();
    } catch (err) {
      const backendMsg = err.response?.data?.message || err.message;
      const issues = err.response?.data?.errors?.map((e) => e.message).join(", ");
      setError(issues ? `${backendMsg}: ${issues}` : backendMsg || "Đặt lịch thất bại.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = (apt) => {
    if (!apt) return;
    setCancelModalAppointment(apt);
  };

  const handleConfirmCancelAppointment = async () => {
    if (!cancelModalAppointment) return;
    setCancelLoading(true);
    try {
      await api.post(`/appointments/${cancelModalAppointment.id}/cancel`, {
        patientPhone: cancelModalAppointment.patientPhone || user?.phone || "",
        cancelReason: "Bệnh nhân yêu cầu hủy qua portal",
      });
      setToast({
        type: "success",
        message: `Hủy lịch khám mã #${cancelModalAppointment.bookingCode} thành công!`,
      });
      setCancelModalAppointment(null);
      fetchMyAppointments();
    } catch (err) {
      setToast({
        type: "error",
        message: "Hủy lịch thất bại: " + (err.response?.data?.message || err.message),
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleViewProfile = () => {
    setShowProfile(true);
    fetchMedicalRecord();
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      if (medicalRecord?.id) {
        await api.patch(`/medical-records/${medicalRecord.id}`, profileForm);
      } else {
        const res = await api.post("/medical-records", profileForm);
        setMedicalRecord(res.data?.data);
      }
      setToast({
        type: "success",
        message: "Lưu và cập nhật hồ sơ sức khỏe thành công!",
      });
    } catch (err) {
      setToast({
        type: "error",
        message: "Lưu thất bại: " + (err.response?.data?.message || "Lỗi kết nối"),
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSearchWithQuery = async (specialtyQuery = searchSpecialty, locationId = searchLocation) => {
    setIsSearching(true);
    setShowResults(true);
    try {
      const params = new URLSearchParams();
      if (specialtyQuery && specialtyQuery.trim()) {
        params.append("search", specialtyQuery.trim());
      }
      const res = await api.get(`/doctors?${params.toString()}`);
      let docs = res.data?.data || [];
      if (locationId) {
        docs = docs.filter((d, idx) => getDoctorLocation(d, idx, clinicLocations).id === locationId);
      }
      setSearchResults(docs);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    handleSearchWithQuery(searchSpecialty, searchLocation);
  };

  const activeAppointment = myAppointments.find((a) =>
    ["PENDING", "CONFIRMED"].includes(a.status)
  );

  const bmi =
    medicalRecord?.weight && medicalRecord?.height
      ? (
          Number(medicalRecord.weight) /
          Math.pow(Number(medicalRecord.height) / 100, 2)
        ).toFixed(1)
      : null;

  let bmiCategory = "";
  if (bmi) {
    const val = parseFloat(bmi);
    if (val < 18.5) bmiCategory = "Thể trạng gầy";
    else if (val < 23) bmiCategory = "Chuẩn y khoa";
    else if (val < 25) bmiCategory = "Tiền béo phì";
    else bmiCategory = "Thừa cân";
  }

  return (
    <div className="patient-portal">
      <header className="patient-header">
        <div className="patient-header-inner">
          <div className="patient-header-left">
            <div className="header-brand-wrap" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <span className="brand-logo-gem">
                <span className="gem-plus">+</span>
              </span>
              <div className="brand-text-col">
                <span className="brand-title">Hiếu Hải</span>
                <span className="brand-sub">PHÒNG KHÁM ĐA KHOA</span>
              </div>
            </div>

            <nav className="patient-nav" aria-label="Patient navigation">
              <a href="#find" className="nav-pill active">
                <Icon name="search" size={15} />
                <span>Tìm bác sĩ</span>
              </a>
              <a href="#appointments" className="nav-pill">
                <Icon name="calendar" size={15} />
                <span>Lịch hẹn của tôi</span>
                {myAppointments.length > 0 && (
                  <span className="nav-pill-badge">{myAppointments.length}</span>
                )}
              </a>
              <a
                href="#records"
                className="nav-pill"
                onClick={(e) => {
                  e.preventDefault();
                  handleViewProfile();
                }}
              >
                <Icon name="clipboard" size={15} />
                <span>Hồ sơ sức khỏe</span>
              </a>
              <button
                type="button"
                className="nav-pill nav-btn-support"
                onClick={() => setShowSupportModal(true)}
              >
                <Icon name="phone" size={15} />
                <span>Hỗ trợ 24/7</span>
              </button>
            </nav>
          </div>

          <div className="patient-header__actions">
            <button
              type="button"
              className="btn-header-cta"
              onClick={() => handleBookAppointment()}
            >
              <Icon name="plus" size={14} />
              <span>Đặt lịch khám</span>
            </button>

            {user?.role === "ADMIN" && (
              <button
                type="button"
                className="btn-header-switch"
                onClick={onAdmin}
                title="Mở bảng điều khiển Quản trị viên"
              >
                <Icon name="grid" size={14} />
                <span>Quản trị</span>
              </button>
            )}

            <div className="patient-avatar-wrapper">
              <button
                type="button"
                className="patient-user-chip"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
              >
                <span className="user-avatar-disc">{initials}</span>
                <div className="user-text-meta">
                  <strong className="user-meta-name">{user?.fullName || "Bệnh Nhân"}</strong>
                  <span className="user-meta-role">
                    <span className="live-status-dot" />
                    <span>Bệnh nhân</span>
                  </span>
                </div>
                <span className={`user-chip-chevron ${showUserMenu ? "active" : ""}`}>
                  <Icon name="chevron" size={13} />
                </span>
              </button>

              {showUserMenu && (
                <div className="patient-avatar-dropdown modern-dropdown">
                  <div className="dropdown-user-banner">
                    <span className="dropdown-avatar-big">{initials}</span>
                    <div className="dropdown-user-info">
                      <strong>{user?.fullName || "Bệnh Nhân"}</strong>
                      <small>{user?.email || "patient@clinic.test"}</small>
                      {user?.phone && (
                        <span className="dropdown-phone-chip">
                          <Icon name="phone" size={11} /> {user.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="dropdown-menu-group">
                    <button
                      type="button"
                      className="dropdown-menu-item"
                      onClick={() => {
                        setShowProfile(true);
                        fetchMedicalRecord();
                        setShowUserMenu(false);
                      }}
                    >
                      <span className="menu-icon-wrap teal"><Icon name="user" size={15} /></span>
                      <div className="menu-text-wrap">
                        <strong>Hồ sơ &amp; Bệnh án</strong>
                        <small>Xem và cập nhật chỉ số sức khỏe</small>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="dropdown-menu-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        const el = document.getElementById("appointments");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <span className="menu-icon-wrap blue"><Icon name="calendar" size={15} /></span>
                      <div className="menu-text-wrap">
                        <strong>Lịch hẹn của tôi</strong>
                        <small>{myAppointments.length} cuộc hẹn trong hệ thống</small>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="dropdown-menu-item"
                      onClick={() => {
                        setShowSupportModal(true);
                        setShowUserMenu(false);
                      }}
                    >
                      <span className="menu-icon-wrap amber"><Icon name="phone" size={15} /></span>
                      <div className="menu-text-wrap">
                        <strong>Tổng đài hỗ trợ</strong>
                        <small>Hotline: 1900 1234 (Nhánh 1-4)</small>
                      </div>
                    </button>

                    {user?.role === "ADMIN" && (
                      <button
                        type="button"
                        className="dropdown-menu-item"
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onAdmin) onAdmin();
                        }}
                      >
                        <span className="menu-icon-wrap violet"><Icon name="grid" size={15} /></span>
                        <div className="menu-text-wrap">
                          <strong>Cổng Quản trị (Admin)</strong>
                          <small>Quản lý toàn bộ phòng khám</small>
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="dropdown-divider" />

                  <div className="dropdown-menu-footer">
                    <button
                      type="button"
                      className="dropdown-logout-btn"
                      onClick={() => onLogout?.()}
                    >
                      <Icon name="logout" size={15} />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="patient-main">
        <section className="patient-welcome">
          <div>
            <p>{getTimeGreeting()}</p>
            <Heading level={1}>Xin chào, {user?.fullName || "Quý khách"}!</Heading>
            <span>Quản lý lịch hẹn và thông tin sức khỏe của bạn tại đây.</span>
          </div>
          <Button onClick={() => handleBookAppointment()}>
            <Icon name="plus" />
            Đặt lịch khám
          </Button>
        </section>

        <section className="patient-search-card" id="find">
          <div className="search-card-header">
            <div className="search-header-text">
              <span className="search-eyebrow">
                <Icon name="search" size={13} />
                ĐẶT LỊCH KHÁM NHANH CHÓNG
              </span>
              <h2>Tìm bác sĩ &amp; Chuyên khoa phù hợp</h2>
              <p>Tra cứu thông tin bác sĩ, chọn cơ sở và đặt lịch khám dễ dàng tại hệ thống Phòng khám Đa khoa Hiếu Hải</p>
            </div>
            {clinicLocations.length > 0 && (
              <div className="search-branches-badge">
                <Icon name="building" size={14} />
                <span>{clinicLocations.length} cơ sở hoạt động</span>
              </div>
            )}
          </div>

          <div className="search-form-grid">
            <div className="search-field-group">
              <label htmlFor="search-specialty-input">
                <Icon name="search" size={14} />
                <span>Chuyên khoa hoặc bác sĩ</span>
              </label>
              <div className="search-input-wrap">
                <input
                  id="search-specialty-input"
                  type="text"
                  placeholder="Nhập tên bác sĩ, chuyên khoa (VD: Tim mạch, Nhi...)"
                  value={searchSpecialty}
                  onChange={(e) => setSearchSpecialty(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                {searchSpecialty && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => {
                      setSearchSpecialty("");
                      handleSearchWithQuery("", searchLocation);
                    }}
                    aria-label="Xóa tìm kiếm"
                  >
                    <Icon name="x" size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="search-field-group">
              <label htmlFor="search-location-select">
                <Icon name="building" size={14} />
                <span>Địa điểm cơ sở</span>
              </label>
              <div className="search-input-wrap">
                <select
                  id="search-location-select"
                  value={searchLocation}
                  onChange={(e) => {
                    const nextLoc = e.target.value;
                    setSearchLocation(nextLoc);
                    if (showResults) {
                      handleSearchWithQuery(searchSpecialty, nextLoc);
                    }
                  }}
                >
                  <option value="">Tất cả cơ sở ({clinicLocations.length} chi nhánh)</option>
                  {clinicLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.shortName || loc.name} ({loc.city})
                    </option>
                  ))}
                </select>
                <span className="select-arrow">
                  <Icon name="chevron" size={12} />
                </span>
              </div>
            </div>

            <div className="search-field-group">
              <label htmlFor="search-date-input">
                <Icon name="calendar" size={14} />
                <span>Ngày khám</span>
              </label>
              <div className="search-input-wrap">
                <input
                  id="search-date-input"
                  type="date"
                  value={searchDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setSearchDate(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                {searchDate && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => setSearchDate("")}
                    aria-label="Xóa ngày"
                  >
                    <Icon name="x" size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="search-action-group">
              <span className="action-spacer">&nbsp;</span>
              <button
                type="button"
                className="search-submit-btn"
                onClick={handleSearch}
                disabled={isSearching}
              >
                <Icon name="search" size={16} />
                <span>{isSearching ? "Đang tìm..." : "Tìm kiếm"}</span>
              </button>
            </div>
          </div>

          <div className="search-tags-row">
            <span className="tags-label">Gợi ý tìm kiếm:</span>
            <div className="tags-list">
              {[
                { label: "Tim mạch", type: "specialty", val: "Tim mạch" },
                { label: "Nhi khoa", type: "specialty", val: "Nhi khoa" },
                { label: "Nội tổng quát", type: "specialty", val: "Nội tổng quát" },
                { label: "Cơ xương khớp", type: "specialty", val: "Cơ xương khớp" },
                ...clinicLocations.slice(0, 3).map((l) => ({
                  label: l.shortName || l.name,
                  type: "location",
                  val: l.id,
                })),
              ].map((chip, idx) => {
                const isActive =
                  chip.type === "location"
                    ? searchLocation === chip.val
                    : searchSpecialty === chip.val;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`search-chip ${isActive ? "active" : ""}`}
                    onClick={() => {
                      if (chip.type === "specialty") {
                        const nextVal = searchSpecialty === chip.val ? "" : chip.val;
                        setSearchSpecialty(nextVal);
                        handleSearchWithQuery(nextVal, searchLocation);
                      } else if (chip.type === "location") {
                        const nextLoc = searchLocation === chip.val ? "" : chip.val;
                        setSearchLocation(nextLoc);
                        handleSearchWithQuery(searchSpecialty, nextLoc);
                      }
                    }}
                  >
                    {chip.type === "location" ? <Icon name="building" size={11} /> : <Icon name="tag" size={11} />}
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Search Results */}
        {showResults && (
          <section className="search-results-card">
            <div className="search-results-header">
              <div>
                <h3>
                  Kết quả tìm kiếm
                  <span className="results-count">({searchResults.length} bác sĩ phù hợp)</span>
                </h3>
                {(searchSpecialty || searchLocation) && (
                  <p className="results-filter-info">
                    {searchSpecialty && <span>Từ khóa: <strong>"{searchSpecialty}"</strong></span>}
                    {searchSpecialty && searchLocation && <span> · </span>}
                    {searchLocation && (
                      <span>
                        Cơ sở: <strong>{clinicLocations.find((l) => l.id === searchLocation)?.name || "Đã chọn"}</strong>
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {(searchSpecialty || searchLocation) && (
                  <button
                    className="clear-filter-btn"
                    onClick={() => {
                      setSearchSpecialty("");
                      setSearchLocation("");
                      handleSearchWithQuery("", "");
                    }}
                  >
                    Xem tất cả ({doctors.length || "14"} BS)
                  </button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowResults(false)}>
                  <Icon name="x" size={14} />
                  Đóng
                </Button>
              </div>
            </div>

            {searchResults.length === 0 ? (
              <div className="search-no-results">
                <span className="no-res-icon"><Icon name="search" size={24} /></span>
                <p>Không tìm thấy bác sĩ nào phù hợp tại cơ sở này với tiêu chí đã chọn.</p>
                <button
                  className="btn-reset-search"
                  onClick={() => {
                    setSearchSpecialty("");
                    setSearchLocation("");
                    handleSearchWithQuery("", "");
                  }}
                >
                  Hiển thị tất cả bác sĩ trên toàn hệ thống
                </button>
              </div>
            ) : (
              <div className="search-doctors-grid">
                {searchResults.map((doc, idx) => {
                  const docLoc = getDoctorLocation(doc, idx, clinicLocations);
                  return (
                    <div
                      key={doc.id}
                      className="search-doctor-card"
                      onClick={() => {
                        setShowResults(false);
                        if (searchLocation) setBookingLocation(searchLocation);
                        else setBookingLocation(docLoc.id);
                        if (searchDate) setAppointmentDate(searchDate);
                        handleBookAppointment(doc);
                      }}
                    >
                      <div className="doc-card-top">
                        <span className="avatar teal doc-avatar">
                          {doc.fullName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                        <div className="doc-info">
                          <strong>{doc.fullName}</strong>
                          <span className="doc-title">{doc.title || "Bác sĩ chuyên khoa"}</span>
                          <span className="doc-spec">
                            {doc.specialties?.map((s) => s.name).join(", ") || "Đa khoa"}
                          </span>
                        </div>
                      </div>

                      <div className="doc-location-tag">
                        <Icon name="building" size={13} />
                        <span>{docLoc.name}</span>
                      </div>

                      <div className="doc-card-action">
                        <span className="doc-address-sub">{docLoc.address}</span>
                        <Button variant="secondary" size="sm">
                          Đặt lịch khám
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <div className="patient-grid">
          {/* Cột chính: Cuộc hẹn tiếp theo & Tóm tắt sức khỏe */}
          <div className="patient-main-col">
            <section className="patient-card upcoming" id="appointments">
              <div className="patient-section-title">
                <div>
                  <p>Lịch hẹn sắp tới</p>
                  <Heading level={2}>
                    {activeAppointment
                      ? activeAppointment.doctor?.fullName || "Bác sĩ phụ trách"
                      : "Lịch khám của bạn"}
                  </Heading>
                </div>
                {activeAppointment && (
                  <StatusBadge
                    status={
                      activeAppointment.status === "CONFIRMED"
                        ? "Confirmed"
                        : "Pending"
                    }
                  />
                )}
              </div>

              {activeAppointment ? (
                <>
                  <div className="appointment-doctor">
                    <span className="doctor-avatar-disc">
                      {activeAppointment.doctor?.fullName
                        ? activeAppointment.doctor.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "BS"}
                    </span>
                    <div className="appointment-doc-meta">
                      <strong>{activeAppointment.doctor?.fullName || "Bác sĩ phụ trách"}</strong>
                      <span className="service-name">{activeAppointment.service?.name || "Khám chuyên khoa"}</span>
                      <span className="booking-code-chip">
                        Mã phiếu: <code>#{activeAppointment.bookingCode}</code>
                      </span>
                    </div>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-item">
                      <span className="detail-icon"><Icon name="calendar" size={17} /></span>
                      <div>
                        <small>Thời gian khám</small>
                        <strong>
                          {activeAppointment.startTime} – {activeAppointment.endTime},{" "}
                          {new Date(activeAppointment.appointmentDate).toLocaleDateString("vi-VN")}
                        </strong>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon"><Icon name="building" size={17} /></span>
                      {(() => {
                        const loc = getAppointmentLocation(activeAppointment);
                        return (
                          <div>
                            <small>Địa điểm khám</small>
                            <strong>{loc.name}</strong>
                            <small className="loc-address-text">{loc.address}</small>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="patient-card__actions">
                    <Button variant="secondary" onClick={() => handleBookAppointment()}>
                      <Icon name="plus" size={14} />
                      Đặt thêm lịch mới
                    </Button>
                    <Button
                      variant="ghost"
                      className="btn-cancel-appt"
                      onClick={() => handleCancelAppointment(activeAppointment)}
                      disabled={cancelLoading}
                    >
                      <Icon name="x" size={14} />
                      {cancelLoading ? "Đang xử lý..." : "Hủy lịch này"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="empty-appointment-state">
                  <div className="empty-appt-icon-wrap">
                    <Icon name="calendar" size={26} />
                  </div>
                  <div className="empty-appt-content">
                    <h3>Bạn chưa có lịch hẹn nào sắp tới</h3>
                    <p>
                      Đặt lịch khám trực tuyến để được các bác sĩ chuyên khoa tại Phòng khám Đa khoa Hiếu Hải tiếp đón chu đáo và không mất thời gian chờ đợi.
                    </p>
                  </div>
                  <Button variant="primary" className="btn-empty-book" onClick={() => handleBookAppointment()}>
                    <Icon name="plus" size={15} />
                    <span>Đặt lịch khám ngay</span>
                  </Button>
                  <div className="empty-appt-support-hint">
                    <Icon name="phone" size={13} />
                    <span>Hỗ trợ đặt khám 24/7 qua Hotline: <strong>1900 1234</strong></span>
                  </div>
                </div>
              )}
            </section>

            <section className="patient-card health-summary" id="records">
              <div className="patient-section-title">
                <div>
                  <p>Chỉ số sức khỏe</p>
                  <Heading level={2}>Hồ sơ của bạn</Heading>
                </div>
                <LinkButton onClick={handleViewProfile}>
                  <Icon name="clipboard" size={14} />
                  <span>{medicalRecord?.id ? "Cập nhật hồ sơ" : "Tạo hồ sơ y tế"}</span>
                </LinkButton>
              </div>

              <div className="health-metrics-grid">
                <div className="metric-box">
                  <div className="metric-top">
                    <span className="metric-icon weight"><Icon name="activity" size={14} /></span>
                    <span className="metric-label">Cân nặng</span>
                  </div>
                  <strong className="metric-value">
                    {medicalRecord?.weight ? `${medicalRecord.weight} kg` : "—"}
                  </strong>
                  <span className={`metric-sub ${medicalRecord?.weight ? "updated" : "empty"}`}>
                    {medicalRecord?.weight ? "Đã ghi nhận" : "Chưa cập nhật"}
                  </span>
                </div>

                <div className="metric-box">
                  <div className="metric-top">
                    <span className="metric-icon height"><Icon name="user" size={14} /></span>
                    <span className="metric-label">Chiều cao</span>
                  </div>
                  <strong className="metric-value">
                    {medicalRecord?.height ? `${medicalRecord.height} cm` : "—"}
                  </strong>
                  <span className={`metric-sub ${medicalRecord?.height ? "updated" : "empty"}`}>
                    {medicalRecord?.height ? "Đã ghi nhận" : "Chưa cập nhật"}
                  </span>
                </div>

                <div className="metric-box">
                  <div className="metric-top">
                    <span className="metric-icon bp"><Icon name="activity" size={14} /></span>
                    <span className="metric-label">Huyết áp</span>
                  </div>
                  <strong className="metric-value">
                    {medicalRecord?.bloodPressure || "—"}
                  </strong>
                  <span className={`metric-sub ${medicalRecord?.bloodPressure ? "updated" : "empty"}`}>
                    {medicalRecord?.bloodPressure ? "Chỉ số bình thường" : "Chưa cập nhật"}
                  </span>
                </div>

                <div className="metric-box">
                  <div className="metric-top">
                    <span className="metric-icon bmi"><Icon name="chart" size={14} /></span>
                    <span className="metric-label">Chỉ số BMI</span>
                  </div>
                  <strong className="metric-value">
                    {bmi ? `${bmi}` : "—"}
                  </strong>
                  <span className={`metric-sub ${bmi ? "updated" : "empty"}`}>
                    {bmi ? bmiCategory : "Tự động tính toán"}
                  </span>
                </div>
              </div>

              {!medicalRecord?.weight && !medicalRecord?.height && !medicalRecord?.bloodPressure && (
                <div className="health-empty-banner" onClick={handleViewProfile}>
                  <Icon name="clipboard" size={16} />
                  <span>Chưa có dữ liệu sinh hiệu. Nhấn vào đây để cập nhật hồ sơ theo dõi sức khỏe.</span>
                  <Icon name="chevron" size={14} />
                </div>
              )}
            </section>
          </div>

          {/* Cột phụ: Bác sĩ nổi bật & Tiện ích (Thao tác nhanh) */}
          <aside className="patient-side-col">
            <section className="patient-card care-team">
              <div className="patient-section-title">
                <div>
                  <p>Đội ngũ chuyên gia</p>
                  <Heading level={2}>Bác sĩ nổi bật</Heading>
                </div>
                <LinkButton onClick={() => setShowAllDoctors(true)}>
                  Xem tất cả {doctors.length > 0 ? `(${doctors.length})` : ""}
                </LinkButton>
              </div>

              {(doctors.length > 0 ? doctors.slice(0, 4) : [
                { id: "d1", fullName: "BS.CKII Nguyễn Minh An", title: "Bác sĩ Chuyên khoa II", specialties: [{ name: "Tim mạch" }] },
                { id: "d2", fullName: "ThS.BS Trần Thu Hà", title: "Thạc sĩ Bác sĩ", specialties: [{ name: "Nhi khoa" }] },
                { id: "d3", fullName: "BS.CKII Lê Hoàng Nam", title: "Bác sĩ Chuyên khoa II", specialties: [{ name: "Cơ xương khớp" }] },
              ]).map((doc, idx) => {
                const docLoc = getDoctorLocation(doc, idx, clinicLocations);
                const specName = doc.specialties?.map((s) => s.name).join(", ") || "Đa khoa";
                const docInitials = doc.fullName
                  ? doc.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "BS";

                return (
                  <div
                    className="care-row clickable"
                    key={doc.id || idx}
                    onClick={() => handleBookAppointment(doc)}
                    title={`Nhấp để đặt lịch khám ngay với ${doc.fullName}`}
                  >
                    <span
                      className={`doctor-avatar doctor-avatar--${
                        ["teal", "blue", "violet"][idx % 3]
                      }`}
                    >
                      {docInitials}
                    </span>
                    <div className="care-doc-info">
                      <strong>{doc.fullName}</strong>
                      <span className="care-doc-spec">{doc.title || "Bác sĩ"} • {specName}</span>
                      <small className="care-doc-loc">
                        <Icon name="building" size={11} /> {docLoc.shortName || docLoc.name}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="btn-book-quick"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookAppointment(doc);
                      }}
                      title="Đặt lịch khám"
                    >
                      <span>Đặt khám</span>
                      <Icon name="chevron" size={12} />
                    </button>
                  </div>
                );
              })}
            </section>

            <aside className="patient-card portal-quick-actions">
              <div className="patient-section-title">
                <div>
                  <p>Trợ giúp &amp; Dịch vụ</p>
                  <Heading level={2}>Tiện ích nhanh</Heading>
                </div>
              </div>

              <button
                type="button"
                className="quick-action-btn"
                onClick={() => handleBookAppointment()}
              >
                <span className="quick-action-icon-disc teal">
                  <Icon name="calendar" size={18} />
                </span>
                <div className="quick-action-text">
                  <strong>Đặt lịch khám mới</strong>
                  <small>Đặt hẹn trực tuyến nhanh chóng</small>
                </div>
                <span className="quick-action-chevron">
                  <Icon name="chevron" size={14} />
                </span>
              </button>

              <button
                type="button"
                className="quick-action-btn"
                onClick={() => {
                  setDoctorFilter("");
                  setShowAllDoctors(true);
                }}
              >
                <span className="quick-action-icon-disc blue">
                  <Icon name="doctor" size={18} />
                </span>
                <div className="quick-action-text">
                  <strong>Tra cứu đội ngũ bác sĩ</strong>
                  <small>Xem danh sách chuyên khoa &amp; lịch</small>
                </div>
                <span className="quick-action-chevron">
                  <Icon name="chevron" size={14} />
                </span>
              </button>

              <button
                type="button"
                className="quick-action-btn"
                onClick={() => handleViewProfile()}
              >
                <span className="quick-action-icon-disc violet">
                  <Icon name="clipboard" size={18} />
                </span>
                <div className="quick-action-text">
                  <strong>Hồ sơ &amp; Bệnh án của tôi</strong>
                  <small>Theo dõi chỉ số sinh hiệu cá nhân</small>
                </div>
                <span className="quick-action-chevron">
                  <Icon name="chevron" size={14} />
                </span>
              </button>

              <button
                type="button"
                className="quick-action-btn"
                onClick={() => setShowSupportModal(true)}
              >
                <span className="quick-action-icon-disc amber">
                  <Icon name="phone" size={18} />
                </span>
                <div className="quick-action-text">
                  <strong>Tổng đài hỗ trợ 24/7</strong>
                  <small>Hotline CSKH: 1900 1234</small>
                </div>
                <span className="quick-action-chevron">
                  <Icon name="chevron" size={14} />
                </span>
              </button>
            </aside>
          </aside>
        </div>
      </main>

      {/* Booking Wizard Drawer */}
      {showBooking && (
        <>
          <div className="drawer-backdrop" onClick={() => setShowBooking(false)} />
          <aside className="drawer" style={{ width: "520px" }}>
            <div className="drawer-head">
              <div>
                <span className="micro-label">ĐẶT LỊCH KHÁM</span>
                <h2>{bookingStep === 4 ? "Hoàn tất đặt lịch" : "Đặt lịch hẹn mới"}</h2>
              </div>
              <button onClick={() => setShowBooking(false)}>
                <Icon name="x" />
              </button>
            </div>

            {/* Progress steps bar */}
            {bookingStep < 4 && (
              <div className="booking-steps-bar">
                <div
                  className={`booking-step-item ${
                    bookingStep === 1 ? "active" : bookingStep > 1 ? "done" : ""
                  }`}
                  onClick={() => setBookingStep(1)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="booking-step-num">1</span>
                  <span>Bác sĩ &amp; Dịch vụ</span>
                </div>
                <div className="booking-step-line" />
                <div
                  className={`booking-step-item ${
                    bookingStep === 2 ? "active" : bookingStep > 2 ? "done" : ""
                  }`}
                  onClick={() => selectedDoctor && selectedService && setBookingStep(2)}
                  style={{ cursor: selectedDoctor && selectedService ? "pointer" : "default" }}
                >
                  <span className="booking-step-num">2</span>
                  <span>Ngày &amp; Giờ</span>
                </div>
                <div className="booking-step-line" />
                <div
                  className={`booking-step-item ${bookingStep === 3 ? "active" : ""}`}
                >
                  <span className="booking-step-num">3</span>
                  <span>Thông tin</span>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div style={{ padding: "12px 22px 0" }}>
                <div className="auth-alert error" role="alert">
                  <Icon name="alert" size={16} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Step 1: Bác sĩ & Dịch vụ */}
            {bookingStep === 1 && (
              <div className="drawer-section">
                <h3>1. Chọn cơ sở phòng khám</h3>
                <div className="booking-location-grid">
                  {clinicLocations.map((loc) => {
                    const isSelected = bookingLocation === loc.id;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => setBookingLocation(loc.id)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: isSelected ? "2px solid var(--teal)" : "1px solid var(--border)",
                          background: isSelected ? "rgba(13, 148, 136, 0.06)" : "#fff",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <strong style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: isSelected ? "var(--teal)" : "#0f172a" }}>
                          <Icon name="building" size={14} /> {loc.shortName}
                        </strong>
                        <small style={{ display: "block", fontSize: 11, color: "#64748b", marginTop: 2 }}>
                          {loc.address}
                        </small>
                      </div>
                    );
                  })}
                </div>

                <h3>2. Chọn bác sĩ</h3>
                {loading ? (
                  <p style={{ color: "#64748b", fontSize: 13 }}>Đang tải danh sách bác sĩ...</p>
                ) : (
                  <div className="doctor-list" style={{ maxHeight: 220 }}>
                    {doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className={`doctor-option ${
                          selectedDoctor?.id === doc.id ? "selected" : ""
                        }`}
                        onClick={() => handleSelectDoctor(doc)}
                      >
                        <span className="avatar teal">
                          {doc.fullName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                        <div>
                          <strong>{doc.fullName}</strong>
                          <small>{doc.title || "Bác sĩ"}</small>
                          <small style={{ color: "var(--teal)" }}>
                            {doc.specialties?.map((s) => s.name).join(", ") || ""}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedDoctor && (
                  <div style={{ marginTop: 20 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <h3 style={{ margin: 0 }}>3. Chọn dịch vụ khám</h3>
                      <small style={{ color: "#64748b" }}>
                        {services.length} dịch vụ
                      </small>
                    </div>
                    {services.length === 0 ? (
                      <p style={{ fontSize: 12, color: "#64748b" }}>
                        Đang tải dịch vụ...
                      </p>
                    ) : (
                      <div className="service-list">
                        {services.map((srv) => (
                          <div
                            key={srv.id}
                            className={`service-option ${
                              selectedService?.id === srv.id ? "selected" : ""
                            }`}
                            onClick={() => setSelectedService(srv)}
                          >
                            <div className="service-info">
                              <strong>{srv.name}</strong>
                              <small>
                                {srv.description ||
                                  `${srv.durationMinutes} phút khám chuyên sâu`}
                              </small>
                            </div>
                            <span className="service-price-tag">
                              {parseInt(srv.price).toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Chọn Ngày & Giờ khám */}
            {bookingStep === 2 && (
              <div className="drawer-section">
                <div className="booking-summary-box">
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Cơ sở khám:</span>
                    <span className="booking-summary-val" style={{ fontWeight: 600, color: "var(--teal)" }}>
                      {clinicLocations.find((l) => l.id === bookingLocation)?.shortName || clinicLocations.find((l) => l.id === bookingLocation)?.name}
                    </span>
                  </div>
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Bác sĩ:</span>
                    <span className="booking-summary-val">{selectedDoctor?.fullName}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Dịch vụ:</span>
                    <span className="booking-summary-val">
                      {selectedService?.name} (
                      {parseInt(selectedService?.price || 0).toLocaleString("vi-VN")}đ)
                    </span>
                  </div>
                </div>

                <h3>Chọn ngày khám</h3>
                <div className="date-preset-group">
                  {[
                    { label: "Hôm nay", val: new Date().toISOString().slice(0, 10) },
                    {
                      label: "Ngày mai",
                      val: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
                    },
                    {
                      label: "Ngày kia",
                      val: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
                    },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      className={`date-preset-btn ${
                        appointmentDate === p.val ? "active" : ""
                      }`}
                      onClick={() => {
                        setAppointmentDate(p.val);
                        setSelectedSlot(null);
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <input
                    type="date"
                    value={appointmentDate}
                    min={new Date().toISOString().slice(0, 10)}
                    max={new Date(Date.now() + 30 * 86400000)
                      .toISOString()
                      .slice(0, 10)}
                    onChange={(e) => {
                      setAppointmentDate(e.target.value);
                      setSelectedSlot(null);
                    }}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <h3 style={{ margin: 0 }}>Khung giờ khám còn trống</h3>
                  {selectedSlot && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--teal)",
                        fontWeight: 600,
                      }}
                    >
                      Đã chọn: {selectedSlot.startTime} – {selectedSlot.endTime}
                    </span>
                  )}
                </div>

                {slotsLoading ? (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      padding: "16px 0",
                      textAlign: "center",
                    }}
                  >
                    Đang tìm khung giờ trống...
                  </p>
                ) : slots.length === 0 ? (
                  <div
                    style={{
                      background: "#fef3c7",
                      border: "1px solid #fde68a",
                      color: "#92400e",
                      padding: "12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      marginTop: 8,
                    }}
                  >
                    Bác sĩ không có lịch trống vào ngày này (phòng khám làm việc Thứ 2 – Thứ 6, 08:00 – 17:00). Vui lòng chọn ngày khác.
                  </div>
                ) : (
                  <div className="slot-grid">
                    {slots.map((s) => (
                      <button
                        key={s.startTime}
                        type="button"
                        className={`slot-btn ${
                          selectedSlot?.startTime === s.startTime ? "selected" : ""
                        }`}
                        onClick={() => {
                          setSelectedSlot(s);
                          setError(null);
                        }}
                      >
                        {s.startTime} – {s.endTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Thông tin người khám & Xác nhận */}
            {bookingStep === 3 && (
              <div className="drawer-section">
                <div className="booking-summary-box">
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Cơ sở khám:</span>
                    <span className="booking-summary-val" style={{ fontWeight: 600 }}>
                      {clinicLocations.find((l) => l.id === bookingLocation)?.name}
                    </span>
                  </div>
                  <div className="booking-summary-row" style={{ marginTop: -4 }}>
                    <span className="booking-summary-label">Địa chỉ:</span>
                    <span className="booking-summary-val" style={{ fontSize: 11, color: "#64748b" }}>
                      {clinicLocations.find((l) => l.id === bookingLocation)?.fullAddress || clinicLocations.find((l) => l.id === bookingLocation)?.address}
                    </span>
                  </div>
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Bác sĩ:</span>
                    <span className="booking-summary-val">{selectedDoctor?.fullName}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Dịch vụ:</span>
                    <span className="booking-summary-val">{selectedService?.name}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Thời gian:</span>
                    <span className="booking-summary-val">
                      {selectedSlot?.startTime} – {selectedSlot?.endTime}, Ngày{" "}
                      {new Date(appointmentDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Chi phí:</span>
                    <span
                      className="booking-summary-val"
                      style={{ color: "#0f766e", fontSize: 14 }}
                    >
                      {parseInt(selectedService?.price || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                <h3>Thông tin người khám</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <TextField
                    label="Họ và tên bệnh nhân"
                    placeholder="VD: Nguyễn Văn A"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                  <TextField
                    label="Số điện thoại liên hệ"
                    placeholder="VD: 0912345678"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    required
                  />
                  <TextField
                    label="Địa chỉ email (tùy chọn)"
                    type="email"
                    placeholder="VD: vana@email.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                  />
                  <div className="form-group">
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                      Triệu chứng / Ghi chú cho bác sĩ
                    </label>
                    <textarea
                      value={patientNote}
                      onChange={(e) => setPatientNote(e.target.value)}
                      placeholder="Mô tả lý do khám, triệu chứng hiện tại..."
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        fontSize: 12,
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Đặt lịch thành công */}
            {bookingStep === 4 && bookedResult && (
              <div className="drawer-section">
                <div className="booking-success-box">
                  <div className="booking-success-icon">
                    <Icon name="check" size={28} />
                  </div>
                  <Heading
                    level={2}
                    style={{ fontSize: 18, color: "#16a34a", marginBottom: 4 }}
                  >
                    Đặt lịch khám thành công!
                  </Heading>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                    Vui lòng lưu lại mã đặt lịch để xuất trình tại quầy tiếp đón
                  </p>

                  <div className="booking-code-badge">
                    <span>{bookedResult.bookingCode}</span>
                    <button
                      type="button"
                      className="booking-code-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(bookedResult.bookingCode);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }}
                    >
                      {copySuccess ? "Đã chép!" : "Sao chép"}
                    </button>
                  </div>

                  <div className="booking-details-card">
                    <div className="booking-summary-row">
                      <span className="booking-summary-label">Cơ sở khám:</span>
                      <span className="booking-summary-val" style={{ fontWeight: 600 }}>
                        {bookedResult.location?.name || clinicLocations.find((l) => l.id === bookingLocation)?.name}
                      </span>
                    </div>
                    <div className="booking-summary-row" style={{ marginTop: -4 }}>
                      <span className="booking-summary-label">Địa chỉ:</span>
                      <span className="booking-summary-val" style={{ fontSize: 11, color: "#64748b" }}>
                        {bookedResult.location?.fullAddress || clinicLocations.find((l) => l.id === bookingLocation)?.fullAddress || clinicLocations.find((l) => l.id === bookingLocation)?.address}
                      </span>
                    </div>
                    <div className="booking-summary-row">
                      <span className="booking-summary-label">Hotline cơ sở:</span>
                      <span className="booking-summary-val" style={{ color: "var(--teal)", fontWeight: 600 }}>
                        {bookedResult.location?.hotline || clinicLocations.find((l) => l.id === bookingLocation)?.hotline}
                      </span>
                    </div>
                    <div className="booking-summary-row">
                      <span className="booking-summary-label">Bác sĩ:</span>
                      <span className="booking-summary-val">
                        {bookedResult.doctor?.fullName || selectedDoctor?.fullName}
                      </span>
                    </div>
                    <div className="booking-summary-row">
                      <span className="booking-summary-label">Dịch vụ:</span>
                      <span className="booking-summary-val">
                        {bookedResult.service?.name || selectedService?.name}
                      </span>
                    </div>
                    <div className="booking-summary-row">
                      <span className="booking-summary-label">Thời gian:</span>
                      <span className="booking-summary-val">
                        {bookedResult.startTime} – {bookedResult.endTime}, Ngày{" "}
                        {new Date(
                          bookedResult.appointmentDate || appointmentDate
                        ).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="booking-summary-row">
                      <span className="booking-summary-label">Bệnh nhân:</span>
                      <span className="booking-summary-val">
                        {bookedResult.patientName} ({bookedResult.patientPhone})
                      </span>
                    </div>
                    <div className="booking-summary-row">
                      <span className="booking-summary-label">Trạng thái:</span>
                      <span className="booking-summary-val" style={{ color: "#d97706" }}>
                        Chờ xác nhận (Pending)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Drawer Footer Controls */}
            <div className="drawer-footer">
              {bookingStep === 1 && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!selectedDoctor) {
                        setError("Vui lòng chọn bác sĩ");
                        return;
                      }
                      if (!selectedService) {
                        setError("Vui lòng chọn dịch vụ khám");
                        return;
                      }
                      setError(null);
                      setBookingStep(2);
                    }}
                    disabled={!selectedDoctor || !selectedService}
                  >
                    Tiếp tục: Chọn giờ khám <Icon name="chevron" size={14} />
                  </Button>
                  <Button variant="secondary" onClick={() => setShowBooking(false)}>
                    Hủy
                  </Button>
                </>
              )}

              {bookingStep === 2 && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setBookingStep(1);
                      setError(null);
                    }}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!selectedSlot) {
                        setError("Vui lòng bấm chọn một khung giờ khám còn trống");
                        return;
                      }
                      setError(null);
                      setBookingStep(3);
                    }}
                    disabled={!selectedSlot}
                  >
                    Tiếp tục: Điền thông tin <Icon name="chevron" size={14} />
                  </Button>
                </>
              )}

              {bookingStep === 3 && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setBookingStep(2);
                      setError(null);
                    }}
                    disabled={bookingLoading}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleBookingSubmit}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                  </Button>
                </>
              )}

              {bookingStep === 4 && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowBooking(false);
                    document
                      .getElementById("appointments")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Xem cuộc hẹn của tôi
                </Button>
              )}
            </div>
          </aside>
        </>
      )}

      {/* All Doctors Modal */}
      {showAllDoctors && (
        <>
          <div className="drawer-backdrop" onClick={() => setShowAllDoctors(false)} />
          <aside className="drawer" style={{ width: "480px" }}>
            <div className="drawer-head">
              <div>
                <span className="micro-label">ĐỘI NGŨ CHUYÊN GIA</span>
                <h2>Tất cả bác sĩ</h2>
              </div>
              <button onClick={() => setShowAllDoctors(false)}><Icon name="x" /></button>
            </div>
            <div className="drawer-section">
              <div style={{ marginBottom: "16px" }}>
                <TextField
                  placeholder="Tìm theo tên bác sĩ hoặc chuyên khoa..."
                  icon={<Icon name="search" size={16} />}
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  onClear={() => setDoctorFilter("")}
                />
              </div>
              {loading ? (
                <p style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)" }}>Đang tải danh sách bác sĩ...</p>
              ) : (
                <div className="doctor-list">
                  {filteredDoctors.length === 0 ? (
                    <div className="no-results" style={{ padding: "24px 0", textAlign: "center", color: "var(--muted)" }}>
                      <p>Không tìm thấy bác sĩ phù hợp với từ khóa.</p>
                      {doctorFilter && (
                        <Button variant="ghost" size="sm" onClick={() => setDoctorFilter("")} style={{ marginTop: "8px" }}>
                          Xem tất cả bác sĩ
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredDoctors.map(doc => (
                      <div 
                        key={doc.id}
                        className={`doctor-option ${selectedDoctor?.id === doc.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setSelectedSpecialty(doc.specialties?.[0] || null);
                          setShowAllDoctors(false);
                          setTimeout(() => handleBookAppointment(doc), 100);
                        }}
                      >
                        <span className="avatar teal">{doc.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}</span>
                        <div>
                          <strong>{doc.fullName}</strong>
                          <small>{doc.title || 'Bác sĩ'}</small>
                          <small>{doc.specialties?.map(s => s.name).join(', ') || ''}</small>
                        </div>
                        <Button variant="secondary" size="sm">Đặt lịch</Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Medical Profile Modal */}
      {showProfile && (
        <>
          <div className="drawer-backdrop" onClick={() => setShowProfile(false)} />
          <aside className="drawer">
            <div className="drawer-head">
              <div>
                <span className="micro-label">HỒ SƠ SỨC KHỎE</span>
                <h2>Hồ sơ của bạn</h2>
              </div>
              <button onClick={() => setShowProfile(false)}><Icon name="x" /></button>
            </div>
            <div className="drawer-section">
              {profileLoading ? (
                <p>Đang tải...</p>
              ) : (
                <div className="profile-form">
                  <div className="form-row">
                    <TextField 
                      label="Cân nặng (kg)" 
                      type="number" 
                      value={profileForm.weight || ''} 
                      onChange={e => setProfileForm({...profileForm, weight: parseFloat(e.target.value) || undefined})}
                      placeholder="VD: 65"
                    />
                    <TextField 
                      label="Chiều cao (cm)" 
                      type="number" 
                      value={profileForm.height || ''} 
                      onChange={e => setProfileForm({...profileForm, height: parseFloat(e.target.value) || undefined})}
                      placeholder="VD: 170"
                    />
                  </div>
                  <div className="form-row">
                    <TextField 
                      label="Huyết áp" 
                      value={profileForm.bloodPressure || ''} 
                      onChange={e => setProfileForm({...profileForm, bloodPressure: e.target.value})}
                      placeholder="VD: 120/80"
                    />
                    <TextField 
                      label="Nhịp tim (bpm)" 
                      type="number" 
                      value={profileForm.heartRate || ''} 
                      onChange={e => setProfileForm({...profileForm, heartRate: parseInt(e.target.value) || undefined})}
                      placeholder="VD: 75"
                    />
                  </div>
                  <TextField 
                    label="Nhiệt độ (°C)" 
                    type="number" 
                    step="0.1"
                    value={profileForm.temperature || ''} 
                    onChange={e => setProfileForm({...profileForm, temperature: parseFloat(e.target.value) || undefined})}
                    placeholder="VD: 36.5"
                  />
                  <div className="form-group">
                    <label>Dị ứng</label>
                    <textarea 
                      value={profileForm.allergies || ''} 
                      onChange={e => setProfileForm({...profileForm, allergies: e.target.value})}
                      placeholder="VD: Hải sản, phấn hoa..."
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tiền sử bệnh</label>
                    <textarea 
                      value={profileForm.medicalHistory || ''} 
                      onChange={e => setProfileForm({...profileForm, medicalHistory: e.target.value})}
                      placeholder="Các bệnh đã mắc phải..."
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Ghi chú</label>
                    <textarea 
                      value={profileForm.notes || ''} 
                      onChange={e => setProfileForm({...profileForm, notes: e.target.value})}
                      placeholder="Các thông tin khác..."
                      rows="2"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="drawer-footer">
              <Button variant="primary" onClick={handleSaveProfile} disabled={profileLoading}>
                {profileLoading ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </Button>
              <Button variant="secondary" onClick={() => setShowProfile(false)}>Đóng</Button>
            </div>
          </aside>
        </>
      )}

      {/* Support Contact Drawer */}
      {showSupportModal && (
        <>
          <div className="drawer-backdrop" onClick={() => setShowSupportModal(false)} />
          <aside className="drawer" style={{ width: "480px" }}>
            <div className="drawer-head">
              <div>
                <span className="micro-label">TRỢ GIÚP 24/7</span>
                <h2>Liên hệ &amp; Hỗ trợ</h2>
              </div>
              <button onClick={() => setShowSupportModal(false)}>
                <Icon name="x" />
              </button>
            </div>

            <div className="drawer-section" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Card Hotline */}
              <div className="support-card hotline">
                <div className="support-card-header">
                  <div className="support-icon-badge teal">
                    <Icon name="phone" size={20} />
                  </div>
                  <div>
                    <span className="support-badge-label">TỔNG ĐÀI ĐẶT LỊCH &amp; TƯ VẤN</span>
                    <h3 className="support-phone-number">1900 1234</h3>
                    <p className="support-sub">Hoạt động 24/7 (Cước gọi: 1.000đ/phút)</p>
                  </div>
                </div>
                <div className="support-card-actions">
                  <a
                    href="tel:19001234"
                    className="btn primary"
                    style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Icon name="phone" size={15} /> Gọi ngay 1900 1234
                  </a>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard?.writeText("19001234");
                      setCopyHotlineSuccess(true);
                      setTimeout(() => setCopyHotlineSuccess(false), 2000);
                    }}
                  >
                    <Icon name={copyHotlineSuccess ? "check" : "clipboard"} size={15} />
                    {copyHotlineSuccess ? "Đã chép số!" : "Sao chép số"}
                  </Button>
                </div>
              </div>

              {/* Card Emergency */}
              <div className="support-card emergency">
                <div className="support-card-header">
                  <div className="support-icon-badge red">
                    <Icon name="activity" size={20} />
                  </div>
                  <div>
                    <span className="support-badge-label red">CẤP CỨU Y TẾ KHẨN CẤP</span>
                    <h3 className="support-phone-number red">028 3822 9999</h3>
                    <p className="support-sub">Đội phản ứng nhanh tiếp nhận cấp cứu 24/24</p>
                  </div>
                </div>
                <div className="support-card-actions">
                  <a
                    href="tel:02838229999"
                    className="btn secondary"
                    style={{
                      color: "var(--rose)",
                      borderColor: "#fecdd3",
                      background: "#fff1f2",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Icon name="phone" size={15} /> Gọi cấp cứu
                  </a>
                </div>
              </div>

              {/* Card Clinic Details with 4 Branches */}
              <div className="support-info-list">
                <div style={{ marginBottom: 4 }}>
                  <strong style={{ fontSize: 13, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="building" size={16} style={{ color: "var(--teal)" }} /> Hệ thống {clinicLocations.length} cơ sở Phòng khám Đa khoa Hiếu Hải
                  </strong>
                </div>
                {clinicLocations.map((loc) => (
                  <div key={loc.id} className="support-info-item" style={{ padding: "8px 0", borderBottom: "1px dashed var(--border)" }}>
                    <div style={{ width: "100%" }}>
                      <strong style={{ fontSize: 13, color: "var(--teal)" }}>{loc.name}</strong>
                      <p style={{ margin: "2px 0", fontSize: 12, color: "#475569" }}>{loc.fullAddress}</p>
                      <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: 11, color: "#64748b" }}>
                        <span>Điện thoại: <strong>{loc.phone}</strong></span>
                        <span>Hotline: <strong style={{ color: "var(--teal)" }}>{loc.hotline}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="support-info-item" style={{ marginTop: 8 }}>
                  <Icon name="clock" size={18} />
                  <div>
                    <strong>Giờ tiếp nhận khám bệnh</strong>
                    <p>Thứ Hai – Chủ Nhật: 07:00 – 20:00 (kể cả ngày Lễ)</p>
                  </div>
                </div>
                <div className="support-info-item">
                  <Icon name="mail" size={18} />
                  <div>
                    <strong>Email tiếp nhận ý kiến</strong>
                    <p>hotro@phongkhamhieuhai.vn</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <Button variant="secondary" onClick={() => setShowSupportModal(false)}>
                Đóng
              </Button>
            </div>
          </aside>
        </>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="patient-mobile-bottom-nav" aria-label="Mobile Navigation">
        <a href="#find" className="mobile-nav-item active">
          <Icon name="search" size={18} />
          <span>Tìm kiếm</span>
        </a>
        <a href="#appointments" className="mobile-nav-item">
          <Icon name="calendar" size={18} />
          <span>Lịch hẹn</span>
          {myAppointments.length > 0 && (
            <span className="mobile-nav-badge">{myAppointments.length}</span>
          )}
        </a>
        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => handleViewProfile()}
        >
          <Icon name="clipboard" size={18} />
          <span>Hồ sơ</span>
        </button>
        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => setShowSupportModal(true)}
        >
          <Icon name="phone" size={18} />
          <span>CSKH 24/7</span>
        </button>
      </nav>

      {/* Custom Confirm Modal for Cancelling Appointment */}
      <ConfirmModal
        isOpen={Boolean(cancelModalAppointment)}
        onClose={() => !cancelLoading && setCancelModalAppointment(null)}
        onConfirm={handleConfirmCancelAppointment}
        title="Xác nhận hủy lịch khám"
        subtitle={`Mã phiếu khám: #${cancelModalAppointment?.bookingCode}`}
        confirmText="Xác nhận hủy lịch"
        cancelText="Giữ lại lịch"
        variant="danger"
        loading={cancelLoading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn hủy lịch hẹn khám với bác sĩ{" "}
            <strong style={{ color: "#0f172a" }}>
              {cancelModalAppointment?.doctor?.fullName || "Bác sĩ phụ trách"}
            </strong>{" "}
            vào lúc{" "}
            <strong style={{ color: "#0f172a" }}>
              {cancelModalAppointment?.startTime} ngày{" "}
              {cancelModalAppointment?.appointmentDate
                ? new Date(cancelModalAppointment.appointmentDate).toLocaleDateString("vi-VN")
                : ""}
            </strong>
            ?
          </p>
          <div
            style={{
              padding: "10px 14px",
              background: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: 8,
              fontSize: 12,
              color: "#92400e",
              lineHeight: 1.5,
            }}
          >
            ⚠️ Lưu ý: Thao tác này không thể hoàn tác sau khi đã xác nhận.
          </div>
        </div>
      </ConfirmModal>

      {/* Custom Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ─── AUTH SCREEN ────────────────────────────────────────────────────────────────
function AuthScreen({ mode, navigate, onAuthenticated }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    setSent(false);
  }, [mode]);

  const copy = {
    login: ["Chào mừng trở lại", "Đăng nhập để đặt lịch và theo dõi lịch khám của bạn"],
    register: ["Tạo tài khoản bệnh nhân", "Tài khoản dùng để đăng ký khám và theo dõi lịch hẹn tại bệnh viện"],
    forgot: ["Đặt lại mật khẩu", "Chúng tôi sẽ gửi liên kết đặt lại đến email của bạn"],
  }[mode] || ["", ""];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === "forgot") {
      if (!email.trim()) { setError("Vui lòng nhập địa chỉ email."); return; }
      setLoading(true);
      try {
        await api.post("/auth/forgot-password", { email: email.trim() });
        setSent(true);
      } catch (err) {
        setError(err.response?.data?.message || "Không gửi được yêu cầu đặt lại mật khẩu.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === "register") {
      if (!agreedTerms) { setError("Bạn cần đồng ý với Điều khoản dịch vụ."); return; }
      setLoading(true);
      try {
        const response = await api.post("/auth/register", {
          email: email.trim(), password,
          firstName: firstName.trim(), lastName: lastName.trim(),
          phone: phone.trim(),
        });
        const data = response.data?.data;
        if (data?.user) onAuthenticated?.(data.user);
        else navigate("patient");
      } catch (err) {
        setError(err.response?.data?.message || "Đăng ký không thành công.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === "login") {
      setLoading(true);
      try {
        const response = await api.post("/auth/login", {
          email: email.trim(),
          password,
          keepSignedIn,
        });
        const data = response.data?.data;
        if (data?.user) onAuthenticated?.(data.user);
        else navigate("patient");
      } catch (err) {
        if (!err.response) {
          setError("Không thể kết nối đến máy chủ backend (Port 4000). Vui lòng đảm bảo server đang chạy.");
        } else {
          setError(err.response?.data?.message || "Email hoặc mật khẩu không chính xác.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <main className="auth-shell">
      <section className="auth-aside">
        <Logo inverse />
        <div className="auth-aside-copy">
          <span><Icon name="shield" />ĐẶT LỊCH KHÁM BỆNH</span>
          <Heading level={1}>Đặt lịch khám tại bệnh viện, nhanh và rõ ràng.</Heading>
          <p>Một tài khoản bệnh nhân để chọn chuyên khoa, bác sĩ, khung giờ và theo dõi lịch hẹn.</p>
          <div className="auth-stats">
            <div><strong>Online</strong><small>Đặt lịch khám</small></div>
            <div><strong>Lịch hẹn</strong><small>Theo dõi trạng thái</small></div>
            <div><strong>Hồ sơ</strong><small>Thông tin sức khỏe</small></div>
          </div>
        </div>
        <div className="compliance">
          <Icon name="shield" />
          <span><strong>Bảo mật y tế</strong><small>Ghi nhận kiểm tra · Phân quyền · Mã hóa dữ liệu</small></span>
        </div>
      </section>

      <section className="auth-main">
        <div className="auth-mobile-logo"><Logo /></div>
        <div className="auth-card">
          {mode === "forgot" && (
            <Button className="back" variant="ghost" onClick={() => navigate("login")}>
              <Icon name="arrow" />Quay lại đăng nhập
            </Button>
          )}

          {sent ? (
            <div className="success-state">
              <span><Icon name="mail" size={25} /></span>
              <Heading level={1}>Kiểm tra hộp thư</Heading>
              <p>Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong>{email || "email của bạn"}</strong>.</p>
              <Button onClick={() => navigate("login")}> Quay lại đăng nhập</Button>
              <Button variant="ghost" onClick={() => setSent(false)}>Không nhận được? Gửi lại</Button>
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <span>{mode === "login" ? "BỆNH NHÂN" : mode === "register" ? "ĐĂNG KÝ KHÁM BỆNH" : "KHÔI PHỤC TÀI KHOẢN"}</span>
                <Heading level={1}>{copy[0]}</Heading>
                <p>{copy[1]}</p>
              </div>

              {error && (
                <div className="auth-alert error" role="alert">
                  <Icon name="alert" size={16} /><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {mode === "register" && (
                  <div className="field-row">
                    <TextField label="Họ" placeholder="Nguyễn" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    <TextField label="Tên" placeholder="An" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                )}
                {mode === "register" && (
                  <TextField label="Số điện thoại" icon={<Icon name="phone" />} placeholder="0901234567" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                )}
                <TextField label="Email" icon={<Icon name="mail" />} placeholder="ban@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                {mode !== "forgot" && (
                  <TextField label="Mật khẩu" icon={<Icon name="lock" />} placeholder={mode === "register" ? "Tối thiểu 8 ký tự" : "Nhập mật khẩu"} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                )}

                {mode === "login" && (
                  <div className="form-options">
                    <label><input type="checkbox" checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} />Duy trì đăng nhập</label>
                    <Button type="button" variant="ghost" onClick={() => navigate("forgot")}>Quên mật khẩu?</Button>
                  </div>
                )}

                {mode === "register" && (
                  <label className="terms">
                    <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} required />
                    <span>Tôi đồng ý với <LinkButton href="#terms">Điều khoản Dịch vụ</LinkButton> và <LinkButton href="#privacy">Chính sách Bảo mật</LinkButton>.</span>
                  </label>
                )}

                <Button className="submit" type="submit" disabled={loading}>
                  {loading ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : mode === "register" ? "Tạo tài khoản" : "Gửi liên kết đặt lại"}
                  <Icon name="chevron" />
                </Button>
              </form>

              {mode === "login" && (
                <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center", justifyContent: "center", flexWrap: "wrap", fontSize: 11, color: "#64748b" }}>
                  <span>Demo:</span>
                  {[
                    ["admin@clinic.test", "Admin123!", "Admin"],
                    ["patient@clinic.test", "Patient123!", "Bệnh nhân"],
                  ].map(([e, p, l]) => (
                    <button key={e} type="button" onClick={() => handleDemoFill(e, p)} style={{ background: "#edf6f7", border: "1px solid #cce5e9", color: "#0f4c5c", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                      {l}
                    </button>
                  ))}
                </div>
              )}

              <p className="auth-switch">
                {mode === "login" ? "Chưa có tài khoản?" : mode === "register" ? "Đã có tài khoản?" : "Nhớ mật khẩu?"}{" "}
                <Button variant="ghost" onClick={() => navigate(mode === "login" ? "register" : "login")}>
                  {mode === "login" ? "Đăng ký khám bệnh" : "Đăng nhập"}
                </Button>
              </p>
            </>
          )}
        </div>
        <footer className="auth-footer"><span>© 2025 Phòng khám Đa khoa Hiếu Hải</span><span>Quyền riêng tư · Bảo mật · Hỗ trợ</span></footer>
      </section>

    </main>
  );
}

// ─── ROUTING & APP ROOT ────────────────────────────────────────────────────────
function getPathForScreen(scr) {
  switch (scr) {
    case "dashboard":
      return "/admin";
    case "patient":
      return "/patient";
    case "register":
      return "/register";
    case "forgot":
      return "/forgot";
    case "login":
    default:
      return "/login";
  }
}

function screenForSession(user) {
  const path = (window.location.pathname || "/").toLowerCase();
  if (user) {
    const isAdmin = user.role === "ADMIN";
    if (path === "/admin") {
      if (!isAdmin) {
        window.history.replaceState(null, "", "/patient");
        return "patient";
      }
      return "dashboard";
    }
    if (path === "/patient") return "patient";
    const dest = isAdmin ? "/admin" : "/patient";
    if (path !== dest) window.history.replaceState(null, "", dest);
    return isAdmin ? "dashboard" : "patient";
  }
  if (path === "/register") return "register";
  if (path === "/forgot") return "forgot";
  if (path === "/admin" || path === "/patient") {
    window.history.replaceState(null, "", "/login");
  }
  return "login";
}

export default function App() {
  const [screen, setScreen] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const sessionRef = useRef(null);
  sessionRef.current = sessionUser;

  const navigateTo = (nextScreen) => {
    const targetPath = getPathForScreen(nextScreen);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
    setScreen(nextScreen);
  };

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("keepMeSignedIn");
    let cancelled = false;
    api.get("/auth/me")
      .then((response) => {
        if (cancelled) return;
        const user = response.data?.data || null;
        setSessionUser(user);
        setScreen(screenForSession(user));
      })
      .catch(() => {
        if (cancelled) return;
        setSessionUser(null);
        setScreen(screenForSession(null));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setScreen(screenForSession(sessionRef.current));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (screen === "dashboard") {
      document.title = "Quản Trị Hệ Thống | Phòng khám Đa khoa Hiếu Hải";
    } else if (screen === "patient") {
      document.title = "Cổng Bệnh Nhân | Phòng khám Đa khoa Hiếu Hải";
    } else if (screen === "register") {
      document.title = "Đăng Ký Tài Khoản | Phòng khám Đa khoa Hiếu Hải";
    } else if (screen === "forgot") {
      document.title = "Quên Mật Khẩu | Phòng khám Đa khoa Hiếu Hải";
    } else {
      document.title = "Đăng Nhập | Phòng khám Đa khoa Hiếu Hải";
    }
  }, [screen]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Cookie vẫn được xóa ở phía trình duyệt nếu server đã phản hồi xóa.
    }
    setSessionUser(null);
    navigateTo("login");
  };

  const handleAuthenticated = (user) => {
    setSessionUser(user);
    navigateTo(user?.role === "ADMIN" ? "dashboard" : "patient");
  };

  if (!screen) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#475569", fontFamily: "inherit" }}>
        Đang kiểm tra phiên đăng nhập…
      </main>
    );
  }

  if (screen === "dashboard") {
    return (
      <AdminDashboard
        onLogout={handleLogout}
      />
    );
  }
  if (screen === "patient") {
    return (
      <PatientPortal
        currentUser={sessionUser}
        onAdmin={() => navigateTo("dashboard")}
        onLogout={handleLogout}
      />
    );
  }
  return <AuthScreen mode={screen} navigate={navigateTo} onAuthenticated={handleAuthenticated} />;
}
