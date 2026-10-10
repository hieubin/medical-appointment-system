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

export const CLINIC_LOCATIONS = [
  {
    id: "loc-q5",
    name: "Phòng khám Tâm An - Quận 5",
    shortName: "Cơ sở Quận 5 (Trụ sở chính)",
    address: "123 Nguyễn Văn Cừ, Q.5, TP.HCM",
    fullAddress: "123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh",
    city: "TP. Hồ Chí Minh",
    phone: "028 3835 1234",
    hotline: "1900 1234 (Nhánh 1)",
  },
  {
    id: "loc-bt",
    name: "Phòng khám Tâm An - Bình Thạnh",
    shortName: "Cơ sở Bình Thạnh",
    address: "456 Điện Biên Phủ, Q. Bình Thạnh, TP.HCM",
    fullAddress: "456 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
    city: "TP. Hồ Chí Minh",
    phone: "028 3512 8888",
    hotline: "1900 1234 (Nhánh 2)",
  },
  {
    id: "loc-td",
    name: "Phòng khám Tâm An - TP. Thủ Đức",
    shortName: "Cơ sở TP. Thủ Đức",
    address: "88 Võ Văn Ngân, TP. Thủ Đức, TP.HCM",
    fullAddress: "88 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh",
    city: "TP. Hồ Chí Minh",
    phone: "028 3722 5555",
    hotline: "1900 1234 (Nhánh 3)",
  },
  {
    id: "loc-cg",
    name: "Phòng khám Tâm An - Cầu Giấy (HN)",
    shortName: "Cơ sở Cầu Giấy (Hà Nội)",
    address: "78 Duy Tân, Cầu Giấy, Hà Nội",
    fullAddress: "78 Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội",
    city: "Hà Nội",
    phone: "024 3795 6666",
    hotline: "1900 1234 (Nhánh 4)",
  },
];

export function getAppointmentLocation(app) {
  if (!app) return CLINIC_LOCATIONS[0];
  if (app.locationId) {
    const found = CLINIC_LOCATIONS.find((l) => l.id === app.locationId);
    if (found) return found;
  }
  const note = app.patientNote || "";
  for (const loc of CLINIC_LOCATIONS) {
    if (note.includes(loc.name) || note.includes(loc.shortName) || note.includes(loc.id)) {
      return loc;
    }
  }
  if (app.location && typeof app.location === "string") {
    const found = CLINIC_LOCATIONS.find(
      (l) =>
        l.name.toLowerCase().includes(app.location.toLowerCase()) ||
        l.shortName.toLowerCase().includes(app.location.toLowerCase()) ||
        l.id === app.location
    );
    if (found) return found;
  }
  const key = app.bookingCode || app.id || "default";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return CLINIC_LOCATIONS[hash % CLINIC_LOCATIONS.length];
}

export function getDoctorLocation(doc, index = 0) {
  if (!doc) return CLINIC_LOCATIONS[0];
  const key = doc.licenseNumber || doc.id || String(index);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return CLINIC_LOCATIONS[hash % CLINIC_LOCATIONS.length];
}

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

function Topbar({ tab, selectedLocation, setSelectedLocation }) {
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
      <div
        className="admin-topbar-location"
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "#475569",
          background: "#f8fafc",
          padding: "5px 12px",
          borderRadius: 20,
          border: "1px solid var(--border)",
        }}
      >
        <Icon name="building" size={14} style={{ color: "var(--teal)" }} />
        <span style={{ fontSize: 12, color: "#64748b" }}>Cơ sở:</span>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          aria-label="Chọn cơ sở phòng khám"
          style={{
            border: "none",
            background: "transparent",
            fontWeight: 700,
            color: "var(--teal)",
            fontSize: 12,
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="all">Tất cả cơ sở ({CLINIC_LOCATIONS.length})</option>
          {CLINIC_LOCATIONS.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.shortName}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function Overview({ selectedLocation = "all" }) {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      api.get(`/admin/statistics/appointments?from=${today}&to=${today}`),
      api.get("/admin/appointments?limit=15"),
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

  const displayedRecent = selectedLocation === "all"
    ? recent
    : recent.filter((a) => getAppointmentLocation(a).id === selectedLocation);

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
                <th style={{ minWidth: 140 }}>MÃ PHIẾU</th>
                <th style={{ minWidth: 180 }}>BỆNH NHÂN</th>
                <th style={{ minWidth: 200 }}>BÁC SĨ / DỊCH VỤ</th>
                <th style={{ minWidth: 200 }}>ĐỊA ĐIỂM CƠ SỞ</th>
                <th style={{ minWidth: 150 }}>NGÀY &amp; GIỜ</th>
                <th style={{ minWidth: 140 }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecent.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 28 }}>Không có dữ liệu tại cơ sở này</td></tr>
              )}
              {displayedRecent.map((a) => {
                const loc = getAppointmentLocation(a);
                return (
                  <tr key={a.id}>
                    <td><strong className="code">{a.bookingCode}</strong></td>
                    <td>
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>{a.patientName}</strong>
                      <small style={{ fontSize: 12, color: "#64748b" }}>{a.patientPhone}</small>
                    </td>
                    <td>
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>{a.doctor?.fullName || "—"}</strong>
                      <small style={{ fontSize: 12, color: "#64748b" }}>{a.service?.name || ""}</small>
                    </td>
                    <td>
                      <strong style={{ fontSize: 13, color: "#0f172a", display: "flex", alignItems: "center", gap: 5 }}>
                        <Icon name="building" size={14} /> {loc.name}
                      </strong>
                      <small style={{ fontSize: 12, color: "#64748b" }}>{loc.address}</small>
                    </td>
                    <td>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>{a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString("vi-VN") : "—"}</strong>
                      <small style={{ fontSize: 12, color: "#64748b" }}>{a.startTime}</small>
                    </td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
function Appointments({ setTab, selectedLocation = "all", setSelectedLocation }) {
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

  const filteredItems = selectedLocation === "all"
    ? items
    : items.filter(a => getAppointmentLocation(a).id === selectedLocation);

  const tabCounts = { All: filteredItems.length, PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0, NO_SHOW: 0 };
  filteredItems.forEach(a => {
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
            <span>{filteredItems.length} cuộc hẹn {selectedLocation !== "all" ? `(${CLINIC_LOCATIONS.find(l => l.id === selectedLocation)?.shortName})` : ""}</span>
          </div>
          <div className="table-tools">
            <div className="search-box">
              <Icon name="search" size={15} />
              <input placeholder="Tìm bệnh nhân, mã phiếu…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 10px", height: 38, border: "1px solid var(--border)", borderRadius: 6, background: "#f8fafc", fontSize: 12, color: "#475569" }}>
              <Icon name="building" size={14} style={{ color: "var(--teal)" }} />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Lọc theo cơ sở"
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#334155",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all">Tất cả cơ sở ({CLINIC_LOCATIONS.length})</option>
                {CLINIC_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.shortName}
                  </option>
                ))}
              </select>
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
                <th style={{ minWidth: 140 }}>MÃ PHIẾU</th>
                <th style={{ minWidth: 180 }}>BỆNH NHÂN</th>
                <th style={{ minWidth: 200 }}>BÁC SĨ / DỊCH VỤ</th>
                <th style={{ minWidth: 200 }}>ĐỊA ĐIỂM CƠ SỞ</th>
                <th style={{ minWidth: 150 }}>NGÀY &amp; GIỜ</th>
                <th style={{ minWidth: 140 }}>TRẠNG THÁI</th>
                <th style={{ minWidth: 220, textAlign: "right" }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} style={{ textAlign: "center", padding: 28, fontSize: 13, color: "#64748b" }}>Đang tải…</td></tr>}
              {!loading && filteredItems.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: 28, fontSize: 13 }}>Không có dữ liệu tại cơ sở này</td></tr>}
              {!loading && filteredItems.map(a => {
                const loc = getAppointmentLocation(a);
                return (
                  <tr key={a.id}>
                    <td><strong className="code">{a.bookingCode}</strong></td>
                    <td>
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>{a.patientName}</strong>
                      <small style={{ fontSize: 12, color: "#64748b" }}>{a.patientPhone}</small>
                    </td>
                    <td>
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>{a.doctor?.fullName || "—"}</strong>
                      <small style={{ fontSize: 12, color: "#64748b" }}>{a.service?.name || ""}</small>
                    </td>
                    <td>
                      <strong style={{ fontSize: 13, color: "#0f172a", display: "flex", alignItems: "center", gap: 5 }}>
                        <Icon name="building" size={14} /> {loc.name}
                      </strong>
                      <small style={{ fontSize: 12, color: "#64748b" }}>{loc.address}</small>
                    </td>
                    <td>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>{a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString("vi-VN") : "—"}</strong>
                      <small style={{ fontSize: 12, color: "#64748b" }}>{a.startTime} – {a.endTime}</small>
                    </td>
                    <td><StatusBadge status={a.status} /></td>
                    <td onClick={e => e.stopPropagation()} style={{ textAlign: "right" }}>
                      <div className="quick-actions" style={{ justifyContent: "flex-end" }}>
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
                );
              })}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="table-footer">
            <span>Trang {meta.page} trên {meta.totalPages} · {filteredItems.length} kết quả</span>
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

      {drawer && (() => {
        const drawerLoc = getAppointmentLocation(drawer);
        return (
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
                  <div>
                    <span>ĐỊA ĐIỂM KHÁM</span>
                    <strong style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Icon name="building" size={14} /> {drawerLoc.name}
                    </strong>
                    <small style={{ display: "block", color: "#64748b", fontSize: 11, marginTop: 2 }}>
                      {drawerLoc.fullAddress}
                    </small>
                    <small style={{ display: "block", color: "var(--teal)", fontSize: 11, marginTop: 2 }}>
                      Hotline: {drawerLoc.hotline}
                    </small>
                  </div>
                  <div><span>NGÀY</span><strong>{drawer.appointmentDate ? new Date(drawer.appointmentDate).toLocaleDateString("vi-VN") : "—"}</strong></div>
                  <div><span>GIỜ BẮT ĐẦU</span><strong>{drawer.startTime || "—"}</strong></div>
                  <div><span>GIỜ KẾT THÚC</span><strong>{drawer.endTime || "—"}</strong></div>
                  {drawer.patientNote && <div><span>GHI CHÚ</span><strong>{drawer.patientNote}</strong></div>}
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
        );
      })()}
    </>
  );
}

// ─── DOCTORS ──────────────────────────────────────────────────────────────────
function Doctors({ selectedLocation = "all" }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/doctors")
      .then(r => setDoctors(r.data?.data || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const displayedDoctors = selectedLocation === "all"
    ? doctors
    : doctors.filter((d, idx) => getDoctorLocation(d, idx).id === selectedLocation);

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <div className="table-title">
          <h2>Quản lý bác sĩ</h2>
          <span>{displayedDoctors.length} bác sĩ {selectedLocation !== "all" ? `(${CLINIC_LOCATIONS.find(l => l.id === selectedLocation)?.shortName})` : ""}</span>
        </div>
        <Button variant="primary">
          <Icon name="plus" />Thêm bác sĩ
        </Button>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th style={{ minWidth: 240 }}>BÁC SĨ</th>
              <th style={{ minWidth: 160 }}>CHUYÊN KHOA</th>
              <th style={{ minWidth: 200 }}>ĐỊA ĐIỂM LÀM VIỆC</th>
              <th style={{ minWidth: 160 }}>LIÊN HỆ</th>
              <th style={{ minWidth: 140 }}>TRẠNG THÁI</th>
              <th style={{ minWidth: 120, textAlign: "right" }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ textAlign: "center", padding: 28, fontSize: 13, color: "#64748b" }}>Đang tải…</td></tr>}
            {!loading && displayedDoctors.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: 28, fontSize: 13 }}>Không có bác sĩ tại cơ sở này</td></tr>}
            {!loading && displayedDoctors.map((d, idx) => {
              const docLoc = getDoctorLocation(d, idx);
              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span className="avatar teal" style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, fontWeight: 700, fontSize: 13 }}>
                        {d.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                      <div style={{ minWidth: 150 }}>
                        <strong style={{ fontSize: 14, color: "#0f172a", whiteSpace: "nowrap" }}>{d.fullName}</strong>
                        <small style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{d.title || "Bác sĩ"}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>
                      {d.specialties?.map(s => s.name).join(", ") || "—"}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: 13, color: "#0f172a", display: "flex", alignItems: "center", gap: 5 }}>
                      <Icon name="building" size={14} /> {docLoc.shortName}
                    </strong>
                    <small style={{ fontSize: 12, color: "#64748b" }}>{docLoc.address}</small>
                  </td>
                  <td>
                    <strong style={{ fontSize: 13 }}>{d.phone || "—"}</strong>
                    <small style={{ fontSize: 12, color: "#64748b" }}>{d.email || "—"}</small>
                  </td>
                  <td>
                    <StatusBadge status={d.status || "ACTIVE"} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="quick-actions" style={{ justifyContent: "flex-end" }}>
                      <button className="quick">Sửa</button>
                      <button className="quick cancel">Xóa</button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
              <th style={{ minWidth: 260 }}>DỊCH VỤ</th>
              <th style={{ minWidth: 180 }}>CHUYÊN KHOA</th>
              <th style={{ minWidth: 150 }}>GIÁ DỊCH VỤ</th>
              <th style={{ minWidth: 140 }}>TRẠNG THÁI</th>
              <th style={{ minWidth: 120, textAlign: "right" }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} style={{ textAlign: "center", padding: 28, fontSize: 13, color: "#64748b" }}>Đang tải…</td></tr>}
            {!loading && services.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: 28, fontSize: 13 }}>Không có dữ liệu</td></tr>}
            {!loading && services.map(s => (
              <tr key={s.id}>
                <td>
                  <strong style={{ fontSize: 14, color: "#0f172a" }}>{s.name}</strong>
                  <small style={{ fontSize: 12, color: "#64748b", display: "block", marginTop: 2 }}>{s.description || ""}</small>
                </td>
                <td>
                  <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>
                    {s.specialty?.name || "—"}
                  </span>
                </td>
                <td>
                  <strong style={{ fontSize: 14, color: "#0f766e" }}>{parseFloat(s.price).toLocaleString("vi-VN")}đ</strong>
                </td>
                <td>
                  <StatusBadge status={s.status || "ACTIVE"} />
                </td>
                <td style={{ textAlign: "right" }}>
                  <div className="quick-actions" style={{ justifyContent: "flex-end" }}>
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
  const [selectedLocation, setSelectedLocation] = useState("all");

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
        <Topbar
          tab={tab}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />

        <div className="admin-content">
          {tab === "overview" && <Overview selectedLocation={selectedLocation} />}
          {tab === "appointments" && (
            <Appointments
              setTab={setTab}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
            />
          )}
          {tab === "doctors" && <Doctors selectedLocation={selectedLocation} />}
          {tab === "services" && <Services />}
        </div>
      </main>
    </div>
  );
}
