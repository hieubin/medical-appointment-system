import React, { useEffect, useState } from "react";
import {
  Logo,
  Heading,
  Icon,
  Button,
  TextField,
  LinkButton,
} from "./components/ui.tsx";
import { api } from "./api/axios.js";

export type Screen = "dashboard" | "patient" | "login" | "register" | "forgot";

interface AuthScreenProps {
  mode: Exclude<Screen, "dashboard">;
  navigate: (screen: Screen) => void;
}

export function AuthScreen({ mode, navigate }: AuthScreenProps) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [clinic, setClinic] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setSent(false);
  }, [mode]);

  const copy = {
    login: ["Welcome back", "Sign in to your clinic workspace"],
    register: [
      "Create your workspace",
      "Set up secure access for your clinic team",
    ],
    forgot: [
      "Reset your password",
      "We'll send a secure reset link to your work email",
    ],
  }[mode];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (mode === "forgot") {
      if (!email.trim()) {
        setError("Vui lòng nhập địa chỉ email công việc.");
        return;
      }
      setSent(true);
      return;
    }

    if (mode === "register") {
      if (!agreedTerms) {
        setError(
          "Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư.",
        );
        return;
      }
      setLoading(true);
      try {
        const response = await api.post("/auth/register", {
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          clinicName: clinic.trim(),
        });
        const data = response.data?.data;
        if (data?.accessToken) {
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.user));
          if (keepSignedIn) {
            localStorage.setItem("keepMeSignedIn", "true");
          }
        }
        navigate("dashboard");
      } catch (err: any) {
        setError(err.message || "Đăng ký không thành công. Vui lòng thử lại.");
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
        });
        const data = response.data?.data;
        if (data?.accessToken) {
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.user));
          if (keepSignedIn) {
            localStorage.setItem("keepMeSignedIn", "true");
          }
          if (data.user?.role === "PATIENT") {
            navigate("patient");
          } else {
            navigate("dashboard");
          }
        } else {
          navigate("dashboard");
        }
      } catch (err: any) {
        setError(err.message || "Email hoặc mật khẩu không chính xác.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <main className="auth-shell">
      <section className="auth-aside">
        <Logo inverse />

        <div className="auth-aside-copy">
          <span>
            <Icon name="shield" />
            ENTERPRISE CLINICAL OPERATIONS
          </span>

          <Heading level={1}>
            Run your clinic with clarity and control.
          </Heading>

          <p>
            One secure workspace for schedules, patient flow, staff
            coordination, and operational reporting.
          </p>

          <div className="auth-stats">
            <div>
              <strong>99.99%</strong>
              <small>Platform uptime</small>
            </div>

            <div>
              <strong>256-bit</strong>
              <small>Data encryption</small>
            </div>

            <div>
              <strong>24/7</strong>
              <small>Priority support</small>
            </div>
          </div>
        </div>

        <div className="compliance">
          <Icon name="shield" />

          <span>
            <strong>Built for clinical security</strong>
            <small>
              Audit logging · Role-based access · Data encryption
            </small>
          </span>
        </div>
      </section>

      <section className="auth-main">
        <div className="auth-mobile-logo">
          <Logo />
        </div>

        <div className="auth-card">
          {mode === "forgot" && (
            <Button
              className="back"
              variant="ghost"
              onClick={() => navigate("login")}
            >
              <Icon name="arrow" />
              Back to sign in
            </Button>
          )}

          {sent ? (
            <div className="success-state">
              <span>
                <Icon name="mail" size={25} />
              </span>

              <Heading level={1}>Check your inbox</Heading>

              <p>
                We sent password reset instructions to{" "}
                <strong>{email || "alex@centralclinic.vn"}</strong>. The link
                expires in 15 minutes.
              </p>

              <Button onClick={() => navigate("login")}>
                Return to sign in
              </Button>

              <Button variant="ghost" onClick={() => setSent(false)}>
                Didn't receive it? Send again
              </Button>
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <span>
                  {mode === "login"
                    ? "STAFF PORTAL"
                    : mode === "register"
                      ? "NEW ORGANIZATION"
                      : "ACCOUNT RECOVERY"}
                </span>

                <Heading level={1}>{copy[0]}</Heading>
                <p>{copy[1]}</p>
              </div>

              {error && (
                <div className="auth-alert error" role="alert">
                  <Icon name="alert" size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {mode === "register" && (
                  <div className="field-row">
                    <TextField
                      label="First name"
                      placeholder="Alex"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    <TextField
                      label="Last name"
                      placeholder="Tran"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                )}

                {mode === "register" && (
                  <TextField
                    label="Clinic or organization"
                    icon={<Icon name="building" />}
                    placeholder="Central Clinic"
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value)}
                  />
                )}

                <TextField
                  label="Work email"
                  icon={<Icon name="mail" />}
                  placeholder="name@clinic.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {mode !== "forgot" && (
                  <TextField
                    label="Password"
                    icon={<Icon name="lock" />}
                    placeholder={
                      mode === "register"
                        ? "Minimum 8 characters"
                        : "Enter your password"
                    }
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                )}

                {mode === "login" && (
                  <div className="form-options">
                    <label>
                      <input
                        type="checkbox"
                        checked={keepSignedIn}
                        onChange={(e) => setKeepSignedIn(e.target.checked)}
                      />
                      Keep me signed in
                    </label>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate("forgot")}
                    >
                      Forgot password?
                    </Button>
                  </div>
                )}

                {mode === "register" && (
                  <label className="terms">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      required
                    />
                    <span>
                      I agree to the{" "}
                      <LinkButton href="#terms">Terms of Service</LinkButton>{" "}
                      and{" "}
                      <LinkButton href="#privacy">Privacy Policy</LinkButton>.
                    </span>
                  </label>
                )}

                <Button className="submit" type="submit" disabled={loading}>
                  {loading
                    ? mode === "login"
                      ? "Signing in..."
                      : mode === "register"
                        ? "Creating workspace..."
                        : "Sending..."
                    : mode === "login"
                      ? "Sign in to workspace"
                      : mode === "register"
                        ? "Create workspace"
                        : "Send reset link"}

                  <Icon name="chevron" />
                </Button>
              </form>

              {mode === "login" && (
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    fontSize: 11,
                    color: "#64748b",
                  }}
                >
                  <span>Quick demo login:</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleDemoFill("admin@clinic.test", "Admin123!")
                    }
                    style={{
                      background: "#edf6f7",
                      border: "1px solid #cce5e9",
                      color: "#0f4c5c",
                      borderRadius: 4,
                      padding: "2px 8px",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDemoFill("staff@clinic.test", "Staff123!")
                    }
                    style={{
                      background: "#edf6f7",
                      border: "1px solid #cce5e9",
                      color: "#0f4c5c",
                      borderRadius: 4,
                      padding: "2px 8px",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Staff
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDemoFill("patient@clinic.test", "Patient123!")
                    }
                    style={{
                      background: "#edf6f7",
                      border: "1px solid #cce5e9",
                      color: "#0f4c5c",
                      borderRadius: 4,
                      padding: "2px 8px",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Patient
                  </button>
                </div>
              )}

              {mode !== "forgot" && (
                <>
                  <div className="divider">
                    <span>or continue with</span>
                  </div>

                  <Button
                    className="sso"
                    variant="secondary"
                    onClick={() =>
                      alert(
                        "Google Workspace SSO requires clinical tenant configuration.",
                      )
                    }
                  >
                    <b>G</b>
                    Continue with Google Workspace
                  </Button>
                </>
              )}

              <p className="auth-switch">
                {mode === "login"
                  ? "New to Medora?"
                  : mode === "register"
                    ? "Already have an account?"
                    : "Remember your password?"}{" "}
                <Button
                  variant="ghost"
                  onClick={() =>
                    navigate(mode === "login" ? "register" : "login")
                  }
                >
                  {mode === "login" ? "Create a workspace" : "Sign in"}
                </Button>
              </p>
            </>
          )}
        </div>

        <footer className="auth-footer">
          <span>© 2025 Medora Health Systems</span>
          <span>Privacy · Security · Support</span>
        </footer>
      </section>
    </main>
  );
}

const initialAppointments = [
  {
    code: "MED-8492-AX",
    patient: "Nguyen Minh Anh",
    phone: "0912 345 678",
    doctor: "BS.CKII Nguyễn Minh An",
    specialty: "Nội tổng quát",
    date: "14 May 2025",
    time: "09:30",
    status: "Confirmed",
  },
  {
    code: "MED-2841-QP",
    patient: "Tran Thi Thanh",
    phone: "0903 882 105",
    doctor: "BS. Trần Thu Hà",
    specialty: "Tim mạch",
    date: "14 May 2025",
    time: "10:00",
    status: "Pending",
  },
  {
    code: "MED-7730-KL",
    patient: "Le Hoang Nam",
    phone: "0988 402 912",
    doctor: "BS.CKII Nguyễn Minh An",
    specialty: "Tim mạch",
    date: "14 May 2025",
    time: "10:30",
    status: "Confirmed",
  },
  {
    code: "MED-1598-JT",
    patient: "Pham Thu Huong",
    phone: "0918 555 203",
    doctor: "BS. Trần Thu Hà",
    specialty: "Nội tổng quát",
    date: "14 May 2025",
    time: "11:00",
    status: "No-Show",
  },
  {
    code: "MED-6412-BN",
    patient: "Vo Quang Huy",
    phone: "0907 310 884",
    doctor: "BS.CKII Nguyễn Minh An",
    specialty: "Tim mạch",
    date: "14 May 2025",
    time: "13:30",
    status: "Pending",
  },
  {
    code: "MED-3387-WC",
    patient: "Do Mai Lan",
    phone: "0932 728 410",
    doctor: "BS. Trần Thu Hà",
    specialty: "Nội tổng quát",
    date: "14 May 2025",
    time: "14:00",
    status: "Completed",
  },
];

export function Dashboard({
  onLogout,
  onPatient,
}: {
  onLogout: () => void;
  onPatient: () => void;
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<any>(null);
  const [user, setUser] = useState<{ fullName?: string; email?: string } | null>(
    null,
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const handleStatusChange = (code: string, newStatus: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.code === code ? { ...a, status: newStatus } : a)),
    );
    if (drawer && drawer.code === code) {
      setDrawer({ ...drawer, status: newStatus });
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filter === "Pending" && a.status !== "Pending") return false;
    if (filter === "Confirmed" && a.status !== "Confirmed") return false;
    if (filter === "Completed" && a.status !== "Completed") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.patient.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.doctor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    confirmed: appointments.filter((a) => a.status === "Confirmed").length,
    noShow: appointments.filter((a) => a.status === "No-Show").length,
  };

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Logo inverse />
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          <button className="active">
            <Icon name="calendar" />
            Appointments<span>{counts.all}</span>
          </button>
          <button onClick={onPatient}>
            <Icon name="user" />
            Patient Portal
          </button>
        </nav>
        <div className="workspace-label lower">SECURITY</div>
        <nav>
          <button>
            <Icon name="shield" />
            Audit Logging
          </button>
        </nav>
        <div className="sidebar-user">
          <span className="avatar teal small">
            {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "AD"}
          </span>
          <div>
            <strong>{user?.fullName || "Clinic Admin"}</strong>
            <small>{user?.email || "admin@clinic.test"}</small>
          </div>
          <button
            aria-label="Log out"
            onClick={onLogout}
            title="Log out"
            style={{ border: 0, background: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <Icon name="logout" />
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <i>/</i>
            <strong>Clinical Appointments</strong>
          </div>
          <div className="admin-top-actions" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Button variant="secondary" onClick={onPatient}>
              <Icon name="user" size={14} />
              Switch to Patient Portal
            </Button>
            <Button variant="ghost" onClick={onLogout}>
              <Icon name="logout" size={14} />
              Sign out
            </Button>
          </div>
        </header>

        <div className="admin-content">
          <div className="page-title-row">
            <div>
              <h1>Clinic Workspace</h1>
              <p>Welcome back, {user?.fullName || "Admin"}. Today's patient schedule and operational flow.</p>
            </div>
          </div>

          <div className="kpi-grid">
            <div className="kpi">
              <span className="kpi-icon neutral">
                <Icon name="calendar" />
              </span>
              <div>
                <small>TOTAL TODAY</small>
                <strong>{counts.all}</strong>
                <p>Scheduled appointments</p>
              </div>
            </div>
            <div className="kpi">
              <span className="kpi-icon amber">
                <Icon name="clock" />
              </span>
              <div>
                <small>PENDING</small>
                <strong>{counts.pending}</strong>
                <p>Needs review</p>
              </div>
            </div>
            <div className="kpi">
              <span className="kpi-icon green">
                <Icon name="check" />
              </span>
              <div>
                <small>CONFIRMED</small>
                <strong>{counts.confirmed}</strong>
                <p>Active appointments</p>
              </div>
            </div>
            <div className="kpi">
              <span className="kpi-icon slate">
                <Icon name="user" />
              </span>
              <div>
                <small>NO-SHOW</small>
                <strong>{counts.noShow}</strong>
                <p>Recorded</p>
              </div>
            </div>
          </div>

          <section className="table-card">
            <div className="table-toolbar">
              <div className="table-title">
                <h2>Today's Schedule</h2>
                <span>{filteredAppointments.length} bookings</span>
              </div>
              <div className="table-tools">
                <div className="search-box">
                  <Icon name="search" size={15} />
                  <input
                    placeholder="Search patient, code, doctor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="table-tabs">
              <button
                className={filter === "All" ? "active" : ""}
                onClick={() => setFilter("All")}
              >
                All <span>{counts.all}</span>
              </button>
              <button
                className={filter === "Pending" ? "active" : ""}
                onClick={() => setFilter("Pending")}
              >
                Pending <span>{counts.pending}</span>
              </button>
              <button
                className={filter === "Confirmed" ? "active" : ""}
                onClick={() => setFilter("Confirmed")}
              >
                Confirmed <span>{counts.confirmed}</span>
              </button>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>BOOKING CODE</th>
                    <th>PATIENT</th>
                    <th>CLINICIAN / SPECIALTY</th>
                    <th>DATE & TIME</th>
                    <th>STATUS</th>
                    <th>QUICK ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((a) => (
                    <tr key={a.code} onClick={() => setDrawer(a)}>
                      <td>
                        <strong className="code">{a.code}</strong>
                      </td>
                      <td>
                        <strong>{a.patient}</strong>
                        <small>{a.phone}</small>
                      </td>
                      <td>
                        <strong>{a.doctor}</strong>
                        <small>{a.specialty}</small>
                      </td>
                      <td>
                        <strong>{a.time}</strong>
                        <small>{a.date}</small>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            background:
                              a.status === "Confirmed"
                                ? "#dcfce7"
                                : a.status === "Pending"
                                  ? "#fef3c7"
                                  : a.status === "Completed"
                                    ? "#e0e7ff"
                                    : "#fee2e2",
                            color:
                              a.status === "Confirmed"
                                ? "#15803d"
                                : a.status === "Pending"
                                  ? "#b45309"
                                  : a.status === "Completed"
                                    ? "#4338ca"
                                    : "#b91c1c",
                          }}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="quick-actions">
                          {a.status === "Pending" && (
                            <button
                              className="quick confirm"
                              onClick={() => handleStatusChange(a.code, "Confirmed")}
                            >
                              Confirm
                            </button>
                          )}
                          {a.status === "Confirmed" && (
                            <button
                              className="quick"
                              onClick={() => handleStatusChange(a.code, "Completed")}
                            >
                              Complete
                            </button>
                          )}
                          {a.status !== "Cancelled" && (
                            <button
                              className="quick cancel"
                              onClick={() => handleStatusChange(a.code, "Cancelled")}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {drawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(null)} />
          <aside className="drawer">
            <div className="drawer-head">
              <div>
                <span className="micro-label">APPOINTMENT DETAILS</span>
                <h2>{drawer.code}</h2>
              </div>
              <button onClick={() => setDrawer(null)}>
                <Icon name="x" />
              </button>
            </div>
            <div className="drawer-status">
              <span>Status: {drawer.status}</span>
              <small>Real-time record</small>
            </div>
            <div className="drawer-patient">
              <div>
                <h3>{drawer.patient}</h3>
                <p>
                  <Icon name="phone" size={14} />
                  {drawer.phone}
                </p>
              </div>
            </div>
            <div className="drawer-section">
              <h3>Appointment Overview</h3>
              <div className="detail-grid">
                <div>
                  <span>CLINICIAN</span>
                  <strong>{drawer.doctor}</strong>
                </div>
                <div>
                  <span>SPECIALTY</span>
                  <strong>{drawer.specialty}</strong>
                </div>
                <div>
                  <span>DATE</span>
                  <strong>{drawer.date}</strong>
                </div>
                <div>
                  <span>TIME</span>
                  <strong>{drawer.time}</strong>
                </div>
              </div>
            </div>
            <div className="drawer-footer">
              <button
                className="btn danger-outline"
                onClick={() => {
                  handleStatusChange(drawer.code, "Cancelled");
                  setDrawer(null);
                }}
              >
                Cancel booking
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  handleStatusChange(drawer.code, "Confirmed");
                  setDrawer(null);
                }}
              >
                Confirm booking
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

export function PatientPortal({
  onAdmin,
  onLogout,
}: {
  onAdmin: () => void;
  onLogout?: () => void;
}) {
  const [user, setUser] = useState<{ fullName?: string; email?: string } | null>(
    null,
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  return (
    <div className="patient-shell">
      <aside className="patient-sidebar">
        <div className="patient-side-head">
          <Logo />
        </div>
        <nav>
          <span>MY HEALTH</span>
          <button className="active">
            <Icon name="calendar" />
            Overview
          </button>
          <span>WORKSPACE</span>
          <button onClick={onAdmin}>
            <Icon name="grid" />
            Staff / Admin Portal
          </button>
        </nav>
        <button
          className="patient-logout"
          onClick={onLogout || onAdmin}
          style={{ cursor: "pointer" }}
        >
          <Icon name="logout" />
          Sign out
        </button>
      </aside>

      <main className="patient-main">
        <header className="patient-topbar">
          <div>
            <span>Patient Portal</span>
            <i>/</i>
            <strong>Dashboard</strong>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={onAdmin}>
              <Icon name="shield" size={14} />
              Open Clinic Admin
            </Button>
            <Button variant="ghost" onClick={onLogout || onAdmin}>
              <Icon name="logout" size={14} />
              Sign out
            </Button>
          </div>
        </header>

        <div className="patient-content">
          <div className="welcome-row">
            <div>
              <h1>Welcome, {user?.fullName || "Patient"}</h1>
              <p>View your clinical bookings and healthcare history.</p>
            </div>
          </div>

          <div className="next-appointment">
            <div className="next-label">
              <span>UPCOMING APPOINTMENT</span>
            </div>
            <div className="next-body">
              <div className="next-date">
                <strong>14</strong>
                <span>MAY</span>
                <small>09:30 ICT</small>
              </div>
              <div className="next-doctor">
                <div>
                  <h2>BS.CKII Nguyễn Minh An</h2>
                  <p>Central Clinic · Specialty: Tim mạch</p>
                  <span>
                    <Icon name="check" size={14} />
                    Appointment Confirmed
                  </span>
                </div>
              </div>
              <div className="next-code">
                <small>BOOKING CODE</small>
                <strong>MED-8492-AX</strong>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");

  if (screen === "dashboard") {
    return (
      <Dashboard
        onLogout={() => setScreen("login")}
        onPatient={() => setScreen("patient")}
      />
    );
  }

  if (screen === "patient") {
    return (
      <PatientPortal
        onAdmin={() => setScreen("dashboard")}
        onLogout={() => setScreen("login")}
      />
    );
  }

  return <AuthScreen mode={screen} navigate={setScreen} />;
}
