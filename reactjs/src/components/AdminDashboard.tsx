import { useEffect, useState, useCallback } from "react";
import {
  Icon,
  Logo,
  StatusBadge,
  Button,
  TextField,
  LinkButton,
  Heading,
} from "./ui.jsx";
import { api } from "../api/axios";

const ITEMS_PER_PAGE = 20;

function Sidebar({ onLogout, onPatient, tab, setTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><Logo inverse /></div>
      <div className="workspace-label">QUẢN TRỊ</div>
      <nav>
        <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
          <Icon name="grid" />Tổng quan
        </button>
        <button className={tab === "appointments" ? "active" : ""} onClick={() => setTab("appointments")}>
          <Icon name="calendar" />Lịch hẹn
        </button>
        <button className={tab === "doctors" ? "active" : ""} onClick={() => setTab("doctors")}>
          <Icon name="doctor" />Bác sĩ
        </button>
        <button className={tab === "services" ? "active" : ""} onClick={() => setTab("services")}>
          <Icon name="clipboard" />Dịch vụ
        </button>
      </nav>
      <div className="workspace-label lower">TÀI KHOẢN</div>
      <nav>
        <button onClick={onPatient}><Icon name="user" />Cổng bệnh nhân</button>
      </nav>
      <div className="sidebar-user">
        <span className="avatar teal small">AD</span>
        <div><strong>Admin</strong><small>admin@clinic.test</small></div>
        <button aria-label="Đăng xuất" onClick={onLogout} style={{ border: 0, background: "none", color: "#94a3b8", cursor: "pointer" }}><Icon name="logout" /></button>
      </div>
    </aside>
  );
}

function Topbar({ tab }) {
  const titles = {
    overview: "Tổng quan",
    appointments: "Lịch hẹn",
    doctors: "Bác sĩ",
    services: "Dịch vụ",
  };
  return (
    <header className="admin-topbar">
      <div className="breadcrumb">
        <span>Workspace</span><i>/</i><strong>{titles[tab] || "Tổng quan"}</strong>
      </div>
    </header>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function Overview() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      api.get(`/admin/statistics/appointments?from=${today}&to=${today}`),
      api.get("/admin/appointments?limit=5"),
    ])
      .then(([s, r]) => {
        setStats(s.data?.data || s.data || {});
        setRecent(r.data?.data?.items || r.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading"><span>Đang tải…</span></div>;

  const byStatus = stats?.byStatus || {};
  const total = stats?.total ?? 0;

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi">
          <span className="kpi-icon neutral"><Icon name="calendar" /></span>
          <div>
            <small>TỔNG CA KHÁM</small>
            <strong>{total}</strong>
            <p>Hôm nay</p>
          </div>
        </div>
        <div className="kpi">
          <span className="kpi-icon amber"><Icon name="clock" /></span>
          <div>
            <small>CHỜ XÁC NHẬN</small>
            <strong>{byStatus.PENDING ?? 0}</strong>
            <p>Cần xử lý</p>
          </div>
        </div>
        <div className="kpi">
          <span className="kpi-icon green"><Icon name="check" /></span>
          <div>
            <small>ĐÃ XÁC NHẬN</small>
            <strong>{byStatus.CONFIRMED ?? 0}</strong>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div className="kpi">
          <span className="kpi-icon slate"><Icon name="user" /></span>
          <div>
            <small>HOÀN THÀNH</small>
            <strong>{byStatus.COMPLETED ?? 0}</strong>
            <p>Đã khám xong</p>
          </div>
        </div>
      </div>

      <div className="table-card" style={{ marginTop: 22 }}>
        <div className="table-toolbar">
          <div className="table-title">
            <h2>Lịch hẹn gần đây</h2>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>MÃ</th><th>BỆNH NHÂN</th><th>BÁC SĨ</th><th>NGÀY</th><th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, padding: 24 }}>Không có dữ liệu</td></tr>
              )}
              {recent.map((a) => (
                <tr key={a.id}>
                  <td><strong className="code">{a.bookingCode}</strong></td>
                  <td><strong>{a.patientName}</strong><small>{a.patientPhone}</small></td>
                  <td><strong>{a.doctor?.fullName || "—"}</strong><small>{a.service?.name || ""}</small></td>
                  <td>
                    <strong>{a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString("vi-VN") : "—"}</strong>
                    <small>{a.startTime}</small>
                  </td>
                  <td><StatusBadge status={a.status?.replace("_", "-")} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
function Appointments({ setTab }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(null);

  const fetchData = useCallback((page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: ITEMS_PER_PAGE });
    if (filter !== "All") params.set("status", filter);
    if (search.trim()) params.set("search", search.trim());
    api.get(`/admin/appointments?${params}`)
      .then((r) => {
        const d = r.data?.data;
        setItems(d?.items || []);
        setMeta(d?.meta || { page, totalPages: 1, total: 0 });
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filter, search]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleStatusChange = async (id, newStatus, reason) => {
    try {
      const payload = { status: newStatus };
      if (reason) payload.reason = reason;
      await api.patch(`/admin/appointments/${id}/status`, payload);
      setItems(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      if (drawer?.id === id) setDrawer(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    }
  };

  const tabCounts = { All: meta.total, PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0, NO_SHOW: 0 };
  items.forEach(a => {
    if (tabCounts.hasOwnProperty(a.status)) tabCounts[a.status]++;
  });

  const pages = [];
  for (let i = 1; i <= meta.totalPages; i++) pages.push(i);

  const tabLabels = {
    All: "Tất cả",
    PENDING: "Chờ",
    CONFIRMED: "Đã xác nhận",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    NO_SHOW: "Vắng",
  };

  return (
    <>
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-title">
            <h2>Quản lý lịch hẹn</h2>
            <span>{meta.total} cuộc hẹn</span>
          </div>
          <div className="table-tools">
            <div className="search-box">
              <Icon name="search" size={15} />
              <input placeholder="Tìm bệnh nhân, mã phiếu…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="table-tabs">
          {Object.keys(tabLabels).map(s => (
            <button key={s} className={filter === s ? "active" : ""} onClick={() => setFilter(s)}>
              {tabLabels[s]} <span>({tabCounts[s] || 0})</span>
            </button>
          ))}
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>MÃ</th><th>BỆNH NHÂN</th><th>BÁC SĨ / DỊCH VỤ</th><th>NGÀY &amp; GIỜ</th><th>TRẠNG THÁI</th><th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={{ textAlign: "center", padding: 24 }}>Đang tải…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Không có dữ liệu</td></tr>}
              {!loading && items.map(a => (
                <tr key={a.id}>
                  <td><strong className="code">{a.bookingCode}</strong></td>
                  <td><strong>{a.patientName}</strong><small>{a.patientPhone}</small></td>
                  <td><strong>{a.doctor?.fullName || "—"}</strong><small>{a.service?.name || ""}</small></td>
                  <td>
                    <strong>{a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString("vi-VN") : "—"}</strong>
                    <small>{a.startTime} – {a.endTime}</small>
                  </td>
                  <td><StatusBadge status={a.status?.replace("_", "-")} /></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="quick-actions">
                      {a.status === "PENDING" && (
                        <button className="quick confirm" onClick={() => handleStatusChange(a.id, "CONFIRMED")}>Xác nhận</button>
                      )}
                      {a.status === "CONFIRMED" && (
                        <button className="quick" onClick={() => handleStatusChange(a.id, "COMPLETED")}>Hoàn thành</button>
                      )}
                      {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                        <button className="quick cancel" onClick={() => handleStatusChange(a.id, "CANCELLED", "Hủy bởi admin")}>Hủy</button>
                      )}
                      <button className="quick" onClick={() => setDrawer(a)}>Chi tiết</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="table-footer">
            <span>Trang {meta.page} trên {meta.totalPages} · {meta.total} kết quả</span>
            <div>
              <button disabled={meta.page <= 1} onClick={() => fetchData(meta.page - 1)}>‹</button>
              {pages.map(p => (
                <button key={p} className={p === meta.page ? "active" : ""} onClick={() => fetchData(p)}>{p}</button>
              ))}
              <button disabled={meta.page >= meta.totalPages} onClick={() => fetchData(meta.page + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {drawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(null)} />
          <aside className="drawer">
            <div className="drawer-head">
              <div>
                <span className="micro-label">CHI TIẾT LỊCH HẸN</span>
                <h2>{drawer.bookingCode}</h2>
              </div>
              <button onClick={() => setDrawer(null)}><Icon name="x" /></button>
            </div>
            <div className="drawer-status">
              <span>Trạng thái: <StatusBadge status={drawer.status?.replace("_", "-")} /></span>
            </div>
            <div className="drawer-patient">
              <div>
                <h3>{drawer.patientName}</h3>
                <p><Icon name="phone" size={14} />{drawer.patientPhone || "—"}</p>
                {drawer.patientEmail && <p><Icon name="mail" size={14} />{drawer.patientEmail}</p>}
              </div>
            </div>
            <div className="drawer-section">
              <h3>Thông tin cuộc hẹn</h3>
              <div className="detail-grid">
                <div><span>BÁC SĨ</span><strong>{drawer.doctor?.fullName || "—"}</strong></div>
                <div><span>DỊCH VỤ</span><strong>{drawer.service?.name || "—"}</strong></div>
                <div><span>NGÀY</span><strong>{drawer.appointmentDate ? new Date(drawer.appointmentDate).toLocaleDateString("vi-VN") : "—"}</strong></div>
                <div><span>GIỜ BẮT ĐẦU</span><strong>{drawer.startTime || "—"}</strong></div>
                <div><span>GIỜ KẾT THÚC</span><strong>{drawer.endTime || "—"}</strong></div>
                {drawer.cancelReason && <div><span>LÝ DO HỦY</span><strong style={{ color: "#b91c1c" }}>{drawer.cancelReason}</strong></div>}
              </div>
            </div>
            <div className="drawer-footer">
              {drawer.status === "PENDING" && (
                <button className="btn primary" onClick={() => { handleStatusChange(drawer.id, "CONFIRMED"); setDrawer(null); }}>Xác nhận lịch hẹn</button>
              )}
              {(drawer.status === "PENDING" || drawer.status === "CONFIRMED") && (
                <button className="btn danger-outline" onClick={() => { handleStatusChange(drawer.id, "CANCELLED", "Hủy bởi admin"); setDrawer(null); }}>Hủy lịch hẹn</button>
              )}
              <button className="btn secondary" onClick={() => setDrawer(null)}>Đóng</button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

// ─── DOCTORS ──────────────────────────────────────────────────────────────────
function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/doctors")
      .then(r => setDoctors(r.data?.data || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const statusLabels = { ACTIVE: "Hoạt động", INACTIVE: "Không hoạt động" };

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <div className="table-title">
          <h2>Quản lý bác sĩ</h2>
          <span>{doctors.length} bác sĩ</span>
        </div>
        <Button variant="primary">
          <Icon name="plus" />Thêm bác sĩ
        </Button>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>BÁC SĨ</th><th>CHUYÊN KHOA</th><th>LIÊN HỆ</th><th>TRẠNG THÁI</th><th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} style={{ textAlign: "center", padding: 24 }}>Đang tải…</td></tr>}
            {!loading && doctors.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Không có dữ liệu</td></tr>}
            {!loading && doctors.map(d => (
              <tr key={d.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="avatar teal">{d.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</span>
                    <div>
                      <strong>{d.fullName}</strong>
                      <small>{d.title || "Bác sĩ"}</small>
                    </div>
                  </div>
                </td>
                <td>
                  {d.specialties?.map(s => s.name).join(", ") || "—"}
                </td>
                <td>
                  <strong>{d.phone || "—"}</strong>
                  <small>{d.email}</small>
                </td>
                <td>
                  <StatusBadge status={d.status === "ACTIVE" ? "Confirmed" : "Pending"} />
                </td>
                <td>
                  <div className="quick-actions">
                    <button className="quick">Sửa</button>
                    <button className="quick cancel">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SERVICES ─────────────────────────────────────────────────────────────────
function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/services")
      .then(r => setServices(r.data?.data || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <div className="table-title">
          <h2>Quản lý dịch vụ</h2>
          <span>{services.length} dịch vụ</span>
        </div>
        <Button variant="primary">
          <Icon name="plus" />Thêm dịch vụ
        </Button>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>DỊCH VỤ</th><th>CHUYÊN KHOA</th><th>GIÁ</th><th>TRẠNG THÁI</th><th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} style={{ textAlign: "center", padding: 24 }}>Đang tải…</td></tr>}
            {!loading && services.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Không có dữ liệu</td></tr>}
            {!loading && services.map(s => (
              <tr key={s.id}>
                <td>
                  <strong>{s.name}</strong>
                  <small>{s.description?.slice(0, 60) || ""}</small>
                </td>
                <td>{s.specialty?.name || "—"}</td>
                <td><strong>{parseFloat(s.price).toLocaleString("vi-VN")}đ</strong></td>
                <td>
                  <StatusBadge status={s.status === "ACTIVE" ? "Confirmed" : "Pending"} />
                </td>
                <td>
                  <div className="quick-actions">
                    <button className="quick">Sửa</button>
                    <button className="quick cancel">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function AdminDashboard({ onLogout, onPatient }) {
  const [tab, setTab] = useState("overview");
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  return (
    <div className="admin-shell">
      <Sidebar
        onLogout={onLogout}
        onPatient={onPatient}
        tab={tab}
        setTab={setTab}
      />

      <main className="admin-main">
        <Topbar tab={tab} />

        <div className="admin-content">
          {tab === "overview" && <Overview />}
          {tab === "appointments" && <Appointments setTab={setTab} />}
          {tab === "doctors" && <Doctors />}
          {tab === "services" && <Services />}
        </div>
      </main>
    </div>
  );
}
