import { useEffect, useState } from "react";
import {
  Logo,
  Heading,
  Icon,
  Button,
  TextField,
  LinkButton,
  StatusBadge,
} from "./components/ui.jsx";
import AdminDashboard, { CLINIC_LOCATIONS, getAppointmentLocation } from "./components/AdminDashboard";
import { api } from "./api/axios.js";

export { Logo, Heading, Icon, Button, TextField, LinkButton, StatusBadge, CLINIC_LOCATIONS };

// ─── PATIENT PORTAL ────────────────────────────────────────────────────────────

export function PatientPortal({ onAdmin, onLogout }) {
  const [user, setUser] = useState(null);
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
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        setPatientName(u.fullName || "");
        setPatientPhone(u.phone || "");
        setPatientEmail(u.email || "");
      }
    } catch {}
  }, []);

  const fetchMyAppointments = () => {
    api
      .get("/appointments/my")
      .then((r) => setMyAppointments(r.data?.data || []))
      .catch(() => setMyAppointments([]));
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchMyAppointments();
    }
  }, []);

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

  const handleCancelAppointment = async (apt) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy lịch hẹn mã ${apt.bookingCode}?`)) {
      return;
    }
    setCancelLoading(true);
    try {
      await api.post(`/appointments/${apt.id}/cancel`, {
        patientPhone: apt.patientPhone || user?.phone || "",
        cancelReason: "Bệnh nhân yêu cầu hủy qua portal",
      });
      alert("Hủy lịch khám thành công!");
      fetchMyAppointments();
    } catch (err) {
      alert("Hủy lịch thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setCancelLoading(false);
    }
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
      alert("Lưu hồ sơ thành công!");
    } catch (err) {
      alert("Lưu thất bại: " + (err.response?.data?.message || "Lỗi"));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setShowResults(true);
    try {
      const params = new URLSearchParams();
      if (searchSpecialty.trim()) params.append("search", searchSpecialty.trim());
      const res = await api.get(`/doctors?${params.toString()}`);
      setSearchResults(res.data?.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const activeAppointment = myAppointments.find((a) =>
    ["PENDING", "CONFIRMED"].includes(a.status)
  );

  return (
    <div className="patient-portal">
      <header className="patient-header">
        <Logo />
        <nav aria-label="Patient navigation">
          <LinkButton href="#find">Tìm bác sĩ</LinkButton>
          <LinkButton href="#appointments">Lịch hẹn của tôi</LinkButton>
          <LinkButton href="#records">Hồ sơ sức khỏe</LinkButton>
        </nav>
        <div className="patient-header__actions">
          {(user?.role === "ADMIN" || user?.role === "STAFF") && (
            <Button
              className="portal-switch portal-switch--patient"
              variant="secondary"
              onClick={onAdmin}
            >
              <Icon name="grid" />
              <span>
                <strong>Staff admin</strong>
                <small>Mở bảng điều khiển</small>
              </span>
              <Icon name="chevron" size={13} />
            </Button>
          )}
          <div className="patient-avatar-wrapper">
            <Button
              className="patient-avatar"
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span>{initials}</span>
              <div>
                <strong>{user?.fullName || "Bệnh nhân"}</strong>
                <small>ID #{user?.id ? user.id.slice(0, 8) : "—"}</small>
              </div>
              <Icon name="chevron" size={13} />
            </Button>
            {showUserMenu && (
              <div className="patient-avatar-dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowProfile(true);
                    fetchMedicalRecord();
                    setShowUserMenu(false);
                  }}
                >
                  <Icon name="user" size={14} /> Xem hồ sơ
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item danger"
                  onClick={() => {
                    if (onLogout) onLogout();
                    else {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      window.location.reload();
                    }
                  }}
                >
                  <Icon name="log-out" size={14} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="patient-main">
        <section className="patient-welcome">
          <div>
            <p>Chào buổi sáng</p>
            <Heading level={1}>Xin chào, {user?.fullName || "Quý khách"}!</Heading>
            <span>Quản lý lịch hẹn và thông tin sức khỏe của bạn tại đây.</span>
          </div>
          <Button onClick={() => handleBookAppointment()}>
            <Icon name="plus" />
            Đặt lịch khám
          </Button>
        </section>

        <section className="patient-search" id="find">
          <div>
            <Heading level={2}>Tìm bác sĩ phù hợp</Heading>
            <p>Tìm kiếm bác sĩ và lịch khám có sẵn.</p>
          </div>
          <TextField
            label="Chuyên khoa hoặc bác sĩ"
            icon={<Icon name="search" />}
            placeholder="VD: Tim mạch"
            value={searchSpecialty}
            onChange={(e) => setSearchSpecialty(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <div className="field">
            <label htmlFor="search-location-select">Địa điểm cơ sở</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
              <span style={{ position: "absolute", left: 12, pointerEvents: "none", color: "var(--teal)", display: "flex", alignItems: "center" }}>
                <Icon name="building" size={16} />
              </span>
              <select
                id="search-location-select"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  paddingLeft: "38px",
                  paddingRight: "28px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "#fff",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#0f172a",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">Tất cả cơ sở ({clinicLocations.length} chi nhánh)</option>
                {clinicLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.shortName || loc.name} - {loc.city}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <TextField
            label="Ngày khám"
            type="date"
            icon={<Icon name="calendar" />}
            value={searchDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setSearchDate(e.target.value)}
            onClear={() => setSearchDate("")}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            <Icon name="search" />
            {isSearching ? "Đang tìm..." : "Tìm kiếm"}
          </Button>
        </section>

        {/* Search Results */}
        {showResults && (
          <section className="search-results">
            <div className="search-results-header">
              <h3>Kết quả tìm kiếm ({searchResults.length})</h3>
              <Button variant="ghost" onClick={() => setShowResults(false)}>
                <Icon name="x" />
                Đóng
              </Button>
            </div>
            {searchResults.length === 0 ? (
              <p className="no-results">Không tìm thấy bác sĩ nào phù hợp.</p>
            ) : (
              <div className="doctor-list">
                {searchResults.map((doc) => (
                  <div
                    key={doc.id}
                    className="doctor-option"
                    onClick={() => {
                      setShowResults(false);
                      handleBookAppointment(doc);
                    }}
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
                      <small>
                        {doc.specialties?.map((s) => s.name).join(", ") || ""}
                      </small>
                    </div>
                    <Button variant="secondary" size="sm">
                      Đặt lịch
                    </Button>
                  </div>
                ))}
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
                  <p>Cuộc hẹn tiếp theo</p>
                  <Heading level={2}>
                    {activeAppointment
                      ? activeAppointment.doctor?.fullName || "Bác sĩ phụ trách"
                      : "Chưa có lịch hẹn"}
                  </Heading>
                </div>
                <StatusBadge
                  status={
                    activeAppointment
                      ? activeAppointment.status === "CONFIRMED"
                        ? "Confirmed"
                        : "Pending"
                      : "Pending"
                  }
                />
              </div>

              {activeAppointment ? (
                <>
                  <div className="appointment-doctor">
                    <span
                      style={{
                        width: "2.7rem",
                        height: "2.7rem",
                        borderRadius: "50%",
                        background: "#dcefeb",
                        color: "var(--teal)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                      }}
                    >
                      {activeAppointment.doctor?.fullName
                        ? activeAppointment.doctor.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "BS"}
                    </span>
                    <div>
                      <strong>{activeAppointment.service?.name || "Khám chuyên khoa"}</strong>
                      <small>
                        Mã lịch:{" "}
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            color: "var(--teal)",
                          }}
                        >
                          {activeAppointment.bookingCode}
                        </span>
                      </small>
                    </div>
                  </div>
                  <div className="appointment-details">
                    <div>
                      <Icon name="calendar" />
                      <span>
                        <small>Ngày &amp; giờ</small>
                        <strong>
                          {activeAppointment.startTime} – {activeAppointment.endTime},{" "}
                          {new Date(activeAppointment.appointmentDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </strong>
                      </span>
                    </div>
                    <div>
                      <Icon name="building" />
                      {(() => {
                        const loc = getAppointmentLocation(activeAppointment);
                        return (
                          <span>
                            <small>Địa điểm</small>
                            <strong>{loc.name}</strong>
                            <small style={{ color: "#64748b", marginTop: 2, display: "block" }}>{loc.address}</small>
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="patient-card__actions" style={{ display: "flex", gap: "8px" }}>
                    <Button variant="secondary" onClick={() => handleBookAppointment()}>
                      Đặt lịch mới
                    </Button>
                    <Button
                      variant="ghost"
                      style={{ color: "#b91c1c" }}
                      onClick={() => handleCancelAppointment(activeAppointment)}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? "Đang xử lý..." : "Hủy lịch này"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="appointment-doctor">
                    <span
                      style={{
                        width: "2.7rem",
                        height: "2.7rem",
                        borderRadius: "50%",
                        background: "#dcefeb",
                        color: "var(--teal)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                      }}
                    >
                      TA
                    </span>
                    <div>
                      <strong>Phòng khám Tâm An</strong>
                      <small>Đặt lịch khám đầu tiên của bạn</small>
                    </div>
                  </div>
                  <div className="appointment-details">
                    <div>
                      <Icon name="calendar" />
                      <span>
                        <small>Ngày &amp; giờ</small>
                        <strong>—</strong>
                      </span>
                    </div>
                    <div>
                      <Icon name="building" />
                      <span>
                        <small>Địa điểm</small>
                        <strong>Phòng khám Tâm An</strong>
                      </span>
                    </div>
                  </div>
                  <div className="patient-card__actions">
                    <Button variant="secondary" onClick={() => handleBookAppointment()}>
                      Đặt lịch khám
                    </Button>
                  </div>
                </>
              )}
            </section>

            <section className="patient-card health-summary" id="records">
              <div className="patient-section-title">
                <div>
                  <p>Tóm tắt sức khỏe</p>
                  <Heading level={2}>Hồ sơ của bạn</Heading>
                </div>
                <LinkButton onClick={handleViewProfile}>Xem hồ sơ</LinkButton>
              </div>
              <div className="health-metrics">
                <div>
                  <span>Cân nặng</span>
                  <strong>{medicalRecord?.weight ? `${medicalRecord.weight} kg` : "—"}</strong>
                  <small>{medicalRecord?.weight ? "Đã cập nhật" : "Chưa cập nhật"}</small>
                </div>
                <div>
                  <span>Chiều cao</span>
                  <strong>{medicalRecord?.height ? `${medicalRecord.height} cm` : "—"}</strong>
                  <small>{medicalRecord?.height ? "Đã cập nhật" : "Chưa cập nhật"}</small>
                </div>
                <div>
                  <span>Huyết áp</span>
                  <strong>{medicalRecord?.bloodPressure || "—"}</strong>
                  <small>{medicalRecord?.bloodPressure ? "Bình thường" : "Chưa cập nhật"}</small>
                </div>
              </div>
            </section>
          </div>

          {/* Cột phụ: Đội ngũ bác sĩ & Tiện ích (Thao tác nhanh) */}
          <aside className="patient-side-col">
            <section className="patient-card care-team">
              <div className="patient-section-title">
                <div>
                  <p>Đội ngũ bác sĩ</p>
                  <Heading level={2}>Chuyên khoa</Heading>
                </div>
                <LinkButton onClick={() => setShowAllDoctors(true)}>
                  Xem tất cả
                </LinkButton>
              </div>
              {[
                ["TM", "BS.CKII Nguyễn Minh An", "Tim mạch", "noi-tong-quat"],
                ["TH", "BS. Trần Thu Hà", "Nhi khoa", "nhi-khoa"],
                ["LN", "BS.CKII Lê Hoàng Nam", "Cơ xương khớp", "co-xuong-khop"],
              ].map(([init, name, role, slug], idx) => (
                <div className="care-row" key={slug}>
                  <span
                    className={`doctor-avatar doctor-avatar--${
                      ["teal", "blue", "violet"][idx % 3]
                    }`}
                  >
                    {init}
                  </span>
                  <div>
                    <strong>{name}</strong>
                    <small>{role}</small>
                  </div>
                  <small>
                    <b>—</b>
                    <br />
                    Chưa khám
                  </small>
                  <Button
                    className="square"
                    variant="ghost"
                    aria-label={`Đặt khám với ${name}`}
                    onClick={() => {
                      const found = doctors.find((d) => d.fullName?.includes(name));
                      handleBookAppointment(found || null);
                    }}
                  >
                    <Icon name="chevron" />
                  </Button>
                </div>
              ))}
            </section>

            <aside className="patient-card portal-quick-actions">
              <div className="patient-section-title">
                <div>
                  <p>Thao tác nhanh</p>
                  <Heading level={2}>Tiện ích</Heading>
                </div>
              </div>
              <Button variant="ghost" onClick={() => handleBookAppointment()}>
                <Icon name="calendar" size={17} />
                <span>Đặt lịch khám</span>
                <Icon name="chevron" size={14} />
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setDoctorFilter("");
                  setShowAllDoctors(true);
                }}
              >
                <Icon name="doctor" size={17} />
                <span>Tìm bác sĩ</span>
                <Icon name="chevron" size={14} />
              </Button>
              <Button variant="ghost" onClick={() => handleViewProfile()}>
                <Icon name="chart" size={17} />
                <span>Hồ sơ sức khỏe</span>
                <Icon name="chevron" size={14} />
              </Button>
              <Button variant="ghost" onClick={() => setShowSupportModal(true)}>
                <Icon name="help" size={17} />
                <span>Liên hệ hỗ trợ</span>
                <Icon name="chevron" size={14} />
              </Button>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
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
                    <Icon name="building" size={16} style={{ color: "var(--teal)" }} /> Hệ thống {clinicLocations.length} cơ sở phòng khám Tâm An
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
                    <p>hotro@phongkhamtaman.vn</p>
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
    </div>
  );
}

// ─── AUTH SCREEN ────────────────────────────────────────────────────────────────
function AuthScreen({ mode, navigate }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [clinic, setClinic] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    setSent(false);
  }, [mode]);

  const copy = {
    login: ["Chào mừng trở lại", "Đăng nhập vào workspace phòng khám của bạn"],
    register: ["Tạo workspace của bạn", "Thiết lập quyền truy cập bảo mật cho đội ngũ phòng khám"],
    forgot: ["Đặt lại mật khẩu", "Chúng tôi sẽ gửi liên kết đặt lại đến email công việc của bạn"],
  }[mode] || ["", ""];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === "forgot") {
      if (!email.trim()) { setError("Vui lòng nhập địa chỉ email."); return; }
      setSent(true);
      return;
    }

    if (mode === "register") {
      if (!agreedTerms) { setError("Bạn cần đồng ý với Điều khoản dịch vụ."); return; }
      setLoading(true);
      try {
        const response = await api.post("/auth/register", {
          email: email.trim(), password,
          firstName: firstName.trim(), lastName: lastName.trim(),
          clinicName: clinic.trim(),
        });
        const data = response.data?.data;
        if (data?.accessToken) {
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.user));
          if (keepSignedIn) localStorage.setItem("keepMeSignedIn", "true");
        }
        navigate("dashboard");
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
        const response = await api.post("/auth/login", { email: email.trim(), password });
        const data = response.data?.data;
        if (data?.accessToken) {
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.user));
          if (keepSignedIn) localStorage.setItem("keepMeSignedIn", "true");
          navigate(data.user?.role === "PATIENT" ? "patient" : "dashboard");
        } else {
          navigate("dashboard");
        }
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
          <span><Icon name="shield" />HỆ THỐNG QUẢN LÝ PHÒNG KHÁM</span>
          <Heading level={1}>Quản lý phòng khám chuyên nghiệp và hiệu quả.</Heading>
          <p>Một workspace duy nhất cho lịch hẹn, luồng bệnh nhân, điều phối nhân sự và báo cáo vận hành.</p>
          <div className="auth-stats">
            <div><strong>99.99%</strong><small>Uptime hệ thống</small></div>
            <div><strong>256-bit</strong><small>Mã hóa dữ liệu</small></div>
            <div><strong>24/7</strong><small>Hỗ trợ ưu tiên</small></div>
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
              <p>Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong>{email || "alex@centralclinic.vn"}</strong>.</p>
              <Button onClick={() => navigate("login")}> Quay lại đăng nhập</Button>
              <Button variant="ghost" onClick={() => setSent(false)}>Không nhận được? Gửi lại</Button>
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <span>{mode === "login" ? "CỔNG NHÂN VIÊN" : mode === "register" ? "TỔ CHỨC MỚI" : "KHÔI PHỤC TÀI KHOẢN"}</span>
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
                    <TextField label="Họ" placeholder="Alex" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    <TextField label="Tên" placeholder="Tran" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                )}
                {mode === "register" && (
                  <TextField label="Tên phòng khám" icon={<Icon name="building" />} placeholder="Phòng khám Trung tâm" value={clinic} onChange={(e) => setClinic(e.target.value)} />
                )}
                <TextField label="Email công việc" icon={<Icon name="mail" />} placeholder="name@clinic.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
                  {loading ? "Đang xử lý…" : mode === "login" ? "Đăng nhập workspace" : mode === "register" ? "Tạo workspace" : "Gửi liên kết đặt lại"}
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

              {mode !== "forgot" && (
                <>
                  <div className="divider"><span>hoặc tiếp tục với</span></div>
                  <Button className="sso" variant="secondary" onClick={() => alert("Google SSO yêu cầu cấu hình tenant.")}>
                    <b>G</b>Đăng nhập với Google Workspace
                  </Button>
                </>
              )}

              <p className="auth-switch">
                {mode === "login" ? "Mới dùng Medora?" : mode === "register" ? "Đã có tài khoản?" : "Nhớ mật khẩu?"}{" "}
                <Button variant="ghost" onClick={() => navigate(mode === "login" ? "register" : "login")}>
                  {mode === "login" ? "Tạo workspace" : "Đăng nhập"}
                </Button>
              </p>
            </>
          )}
        </div>
        <footer className="auth-footer"><span>© 2025 Medora Health Systems</span><span>Quyền riêng tư · Bảo mật · Hỗ trợ</span></footer>
      </section>
    </main>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState(() => {
    const token = localStorage.getItem("token");
    const keepSignedIn = localStorage.getItem("keepMeSignedIn");
    if (token && keepSignedIn) {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return user?.role === "PATIENT" ? "patient" : "dashboard";
      } catch { return "login"; }
    }
    return "login";
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("keepMeSignedIn");
    setScreen("login");
  };

  if (screen === "dashboard") return <AdminDashboard onLogout={handleLogout} onPatient={() => setScreen("patient")} />;
  if (screen === "patient") return <PatientPortal onAdmin={() => setScreen("dashboard")} onLogout={handleLogout} />;
  return <AuthScreen mode={screen} navigate={setScreen} />;
}
