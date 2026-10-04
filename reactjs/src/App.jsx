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
import AdminDashboard from "./components/AdminDashboard";
import { api } from "./api/axios.js";

export { Logo, Heading, Icon, Button, TextField, LinkButton, StatusBadge };

// ─── PATIENT PORTAL ────────────────────────────────────────────────────────────

export function PatientPortal({ onAdmin }) {
  const [user, setUser] = useState(null);
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: select specialty, 2: select time, 3: confirm
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    try { const stored = localStorage.getItem("user"); if (stored) setUser(JSON.parse(stored)); } catch {}
  }, []);

  const initials = user?.fullName ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "LT";

  // Fetch doctors for booking
  useEffect(() => {
    if (showBooking) {
      setLoading(true);
      api.get('/doctors')
        .then(r => setDoctors(r.data?.data || []))
        .catch(() => setDoctors([]))
        .finally(() => setLoading(false));
    }
  }, [showBooking]);

  const handleBookAppointment = () => {
    setShowBooking(true);
    setBookingStep(1);
    setSelectedSpecialty(null);
    setSelectedDoctor(null);
    setError(null);
  };

  const handleBookingSubmit = async () => {
    if (!selectedSpecialty || !selectedDoctor) {
      setError('Vui lòng chọn bác sĩ và chuyên khoa');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post('/appointments', {
        specialtyId: selectedSpecialty.id,
        doctorId: selectedDoctor.id,
        appointmentDate: new Date().toISOString().split('T')[0],
        notes: 'Đặt lịch khám từ Patient Portal'
      });
      alert('Đặt lịch khám thành công!');
      setShowBooking(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt lịch thất bại');
    } finally {
      setLoading(false);
    }
  };

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
          <Button className="portal-switch portal-switch--patient" variant="secondary" onClick={onAdmin}>
            <Icon name="grid" />
            <span><strong>Staff admin</strong><small>Mở bảng điều khiển</small></span>
            <Icon name="chevron" size={13} />
          </Button>
          <Button className="patient-avatar" variant="ghost">
            <span>{initials}</span>
            <div>
              <strong>{user?.fullName || "Bệnh nhân"}</strong>
              <small>ID #{user?.id ? user.id.slice(0, 8) : "—"}</small>
            </div>
            <Icon name="chevron" size={13} />
          </Button>
        </div>
      </header>

      <main className="patient-main">
        <section className="patient-welcome">
          <div>
            <p>Chào buổi sáng</p>
            <Heading level={1}>Xin chào, {user?.fullName ? user.fullName.split(" ")[0] : "Khách"}!</Heading>
            <span>Quản lý lịch hẹn và thông tin sức khỏe của bạn tại đây.</span>
          </div>
          <Button onClick={handleBookAppointment}><Icon name="plus" />Đặt lịch khám</Button>
        </section>

        <section className="patient-search" id="find">
          <div>
            <Heading level={2}>Tìm bác sĩ phù hợp</Heading>
            <p>Tìm kiếm bác sĩ và lịch khám có sẵn.</p>
          </div>
          <TextField label="Chuyên khoa hoặc bác sĩ" icon={<Icon name="search" />} placeholder="VD: Tim mạch" value={searchSpecialty} onChange={e => setSearchSpecialty(e.target.value)} />
          <TextField label="Địa điểm" icon={<Icon name="building" />} placeholder="Phòng khám Tâm An" value={searchLocation} onChange={e => setSearchLocation(e.target.value)} />
          <TextField label="Ngày khám" icon={<Icon name="calendar" />} placeholder="VD: 04/10/2026" value={searchDate} onChange={e => setSearchDate(e.target.value)} />
          <Button><Icon name="search" />Tìm kiếm</Button>
        </section>

        <div className="patient-grid">
          <section className="patient-card upcoming" id="appointments">
            <div className="patient-section-title">
              <div><p>Cuộc hẹn tiếp theo</p><Heading level={2}>Chưa có lịch hẹn</Heading></div>
              <StatusBadge status="Pending" />
            </div>
            <div className="appointment-doctor">
              <span style={{ width: "2.7rem", height: "2.7rem", borderRadius: "50%", background: "#dcefeb", color: "var(--teal)", display: "grid", placeItems: "center", fontSize: "0.65rem", fontWeight: 700 }}>
                TA
              </span>
              <div><strong>Phòng khám Tâm An</strong><small>Đặt lịch khám đầu tiên của bạn</small></div>
            </div>
            <div className="appointment-details">
              <div><Icon name="calendar" /><span><small>Ngày &amp; giờ</small><strong>—</strong></span></div>
              <div><Icon name="building" /><span><small>Địa điểm</small><strong>Phòng khám Tâm An</strong></span></div>
            </div>
            <div className="patient-card__actions">
              <Button variant="secondary" onClick={handleBookAppointment}>Đặt lịch khám</Button>
            </div>
          </section>

          <section className="patient-card care-team">
            <div className="patient-section-title">
              <div><p>Đội ngũ bác sĩ</p><Heading level={2}>Chuyên khoa</Heading></div>
              <LinkButton href="#all">Xem tất cả</LinkButton>
            </div>
            {[
              ["TM", "BS.CKII Nguyễn Minh An", "Tim mạch", "noi-tong-quat"],
              ["TH", "BS. Trần Thu Hà", "Nhi khoa", "nhi-khoa"],
              ["LN", "BS.CKII Lê Hoàng Nam", "Cơ xương khớp", "co-xuong-khop"],
            ].map(([init, name, role, slug]) => (
              <div className="care-row" key={slug}>
                <span className={`doctor-avatar doctor-avatar--${["teal", "blue", "violet"][0]}`}>{init}</span>
                <div><strong>{name}</strong><small>{role}</small></div>
                <small><b>—</b><br />Chưa khám</small>
                <Button className="square" variant="ghost" aria-label={`Xem ${name}`}><Icon name="chevron" /></Button>
              </div>
            ))}
          </section>

          <section className="patient-card health-summary" id="records">
            <div className="patient-section-title">
              <div><p>Tóm tắt sức khỏe</p><Heading level={2}>Hồ sơ của bạn</Heading></div>
              <LinkButton href="#records">Xem hồ sơ</LinkButton>
            </div>
            <div className="health-metrics">
              <div><span>Cân nặng</span><strong>—</strong><small>Chưa cập nhật</small></div>
              <div><span>Chiều cao</span><strong>—</strong><small>Chưa cập nhật</small></div>
              <div><span>Nhóm máu</span><strong>—</strong><small>Chưa cập nhật</small></div>
            </div>
          </section>

          <aside className="patient-card portal-quick-actions">
            <div className="patient-section-title">
              <div><p>Thao tác nhanh</p><Heading level={2}>Tiện ích</Heading></div>
            </div>
            {[
              ["calendar", "Đặt lịch khám", handleBookAppointment],
              ["doctor", "Tìm bác sĩ"],
              ["chart", "Xem kết quả xét nghiệm"],
              ["help", "Liên hệ hỗ trợ"],
            ].map(([icon, label, handler]) => (
              <Button variant="ghost" key={label} onClick={handler}>
                <Icon name={icon} /><span>{label}</span><Icon name="chevron" size={13} />
              </Button>
            ))}
          </aside>
        </div>
      </main>

      {/* Booking Modal */}
      {showBooking && (
        <>
          <div className="drawer-backdrop" onClick={() => setShowBooking(false)} />
          <aside className="drawer">
            <div className="drawer-head">
              <div>
                <span className="micro-label">ĐẶT LỊCH KHÁM</span>
                <h2>Đặt lịch hẹn mới</h2>
              </div>
              <button onClick={() => setShowBooking(false)}><Icon name="x" /></button>
            </div>
            <div className="drawer-section">
              <h3>Chọn bác sĩ</h3>
              {error && <div className="auth-alert error" style={{marginBottom: 12}}>{error}</div>}
              {loading ? (
                <p>Đang tải...</p>
              ) : (
                <div className="doctor-list">
                  {doctors.map(doc => (
                    <div 
                      key={doc.id}
                      className={`doctor-option ${selectedDoctor?.id === doc.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setSelectedSpecialty(doc.specialties?.[0] || null);
                      }}
                    >
                      <span className="avatar teal">{doc.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}</span>
                      <div>
                        <strong>{doc.fullName}</strong>
                        <small>{doc.title || 'Bác sĩ'}</small>
                        <small>{doc.specialties?.map(s => s.name).join(', ') || ''}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="drawer-footer">
              <Button variant="primary" onClick={handleBookingSubmit} disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
              </Button>
              <Button variant="secondary" onClick={() => setShowBooking(false)}>Hủy</Button>
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
        setError(err.response?.data?.message || "Email hoặc mật khẩu không chính xác.");
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
  if (screen === "patient") return <PatientPortal onAdmin={() => setScreen("dashboard")} />;
  return <AuthScreen mode={screen} navigate={setScreen} />;
}
