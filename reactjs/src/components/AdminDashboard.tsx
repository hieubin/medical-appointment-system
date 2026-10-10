import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Icon,
  Logo,
  StatusBadge,
  Button,
  TextField,
  LinkButton,
  Heading,
  ConfirmModal,
} from "./ui.jsx";
import { api } from "../api/axios";

const ITEMS_PER_PAGE = 20;

export const CLINIC_LOCATIONS = [
  {
    id: "loc-q5",
    name: "Phòng khám Đa khoa Hiếu Hải - Quận 5",
    shortName: "Cơ sở Quận 5 (Trụ sở chính)",
    address: "123 Nguyễn Văn Cừ, Q.5, TP.HCM",
    fullAddress: "123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh",
    city: "TP. Hồ Chí Minh",
    phone: "028 3835 1234",
    hotline: "1900 1234 (Nhánh 1)",
  },
  {
    id: "loc-bt",
    name: "Phòng khám Đa khoa Hiếu Hải - Bình Thạnh",
    shortName: "Cơ sở Bình Thạnh",
    address: "456 Điện Biên Phủ, Q. Bình Thạnh, TP.HCM",
    fullAddress: "456 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
    city: "TP. Hồ Chí Minh",
    phone: "028 3512 8888",
    hotline: "1900 1234 (Nhánh 2)",
  },
  {
    id: "loc-td",
    name: "Phòng khám Đa khoa Hiếu Hải - TP. Thủ Đức",
    shortName: "Cơ sở TP. Thủ Đức",
    address: "88 Võ Văn Ngân, TP. Thủ Đức, TP.HCM",
    fullAddress: "88 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh",
    city: "TP. Hồ Chí Minh",
    phone: "028 3722 5555",
    hotline: "1900 1234 (Nhánh 3)",
  },
  {
    id: "loc-cg",
    name: "Phòng khám Đa khoa Hiếu Hải - Cầu Giấy (HN)",
    shortName: "Cơ sở Cầu Giấy (Hà Nội)",
    address: "78 Duy Tân, Cầu Giấy, Hà Nội",
    fullAddress: "78 Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội",
    city: "Hà Nội",
    phone: "024 3795 6666",
    hotline: "1900 1234 (Nhánh 4)",
  },
];

export function getAppointmentLocation(app, locations = CLINIC_LOCATIONS) {
  const locList = locations && locations.length > 0 ? locations : CLINIC_LOCATIONS;
  if (!app) return locList[0];
  if (app.locationId) {
    const found = locList.find((l) => l.id === app.locationId);
    if (found) return found;
  }
  const note = app.patientNote || "";
  for (const loc of locList) {
    if (note.includes(loc.name) || note.includes(loc.shortName) || note.includes(loc.id)) {
      return loc;
    }
  }
  if (app.location && typeof app.location === "string") {
    const found = locList.find(
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
  return locList[hash % locList.length];
}

export function getDoctorLocation(doc, index = 0, locations = CLINIC_LOCATIONS) {
  const locList = locations && locations.length > 0 ? locations : CLINIC_LOCATIONS;
  if (!doc) return locList[0];
  const key = doc.licenseNumber || doc.id || String(index);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return locList[hash % locList.length];
}

function Sidebar({ onLogout, tab, setTab, mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} />
      )}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Logo inverse />
          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onCloseMobile}
            aria-label="Đóng menu"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="workspace-label">QUẢN TRỊ</div>
        <nav>
          <button
            className={tab === "overview" ? "active" : ""}
            onClick={() => { setTab("overview"); onCloseMobile?.(); }}
          >
            <Icon name="grid" />Tổng quan
          </button>
          <button
            className={tab === "appointments" ? "active" : ""}
            onClick={() => { setTab("appointments"); onCloseMobile?.(); }}
          >
            <Icon name="calendar" />Lịch hẹn
          </button>
          <button
            className={tab === "doctors" ? "active" : ""}
            onClick={() => { setTab("doctors"); onCloseMobile?.(); }}
          >
            <Icon name="doctor" />Bác sĩ
          </button>
          <button
            className={tab === "services" ? "active" : ""}
            onClick={() => { setTab("services"); onCloseMobile?.(); }}
          >
            <Icon name="clipboard" />Dịch vụ
          </button>
          <button
            className={tab === "locations" ? "active" : ""}
            onClick={() => { setTab("locations"); onCloseMobile?.(); }}
          >
            <Icon name="building" />Cơ sở
          </button>
        </nav>
        <div className="sidebar-user">
          <span className="avatar teal small">AD</span>
          <div><strong>Admin</strong><small>admin@clinic.test</small></div>
          <button aria-label="Đăng xuất" onClick={onLogout} style={{ border: 0, background: "none", color: "#94a3b8", cursor: "pointer" }}><Icon name="logout" /></button>
        </div>
      </aside>
    </>
  );
}

function Topbar({ tab, selectedLocation, setSelectedLocation, locations = CLINIC_LOCATIONS, onOpenMobileSidebar }) {
  const titles = {
    overview: "Tổng quan",
    appointments: "Lịch hẹn",
    doctors: "Bác sĩ",
    services: "Dịch vụ",
    locations: "Cơ sở",
  };
  const locList = locations && locations.length > 0 ? locations : CLINIC_LOCATIONS;
  return (
    <header className="admin-topbar">
      <button
        type="button"
        className="admin-menu-toggle"
        onClick={onOpenMobileSidebar}
        aria-label="Mở menu quản trị"
      >
        <Icon name="menu" size={20} />
      </button>
      <div className="breadcrumb">
        <span>Bệnh viện</span><i>/</i><strong>{titles[tab] || "Tổng quan"}</strong>
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
          <option value="all">Tất cả cơ sở ({locList.length})</option>
          {locList.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.shortName || loc.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function Overview({ selectedLocation = "all", locations = CLINIC_LOCATIONS, setTab }) {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/admin/statistics/appointments"),
      api.get("/admin/appointments?limit=100"),
    ])
      .then(([s, r]) => {
        setStats(s.data?.data || s.data || {});
        setRecent(r.data?.data?.items || r.data?.data || []);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu tổng quan:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);

  const displayedRecent = useMemo(() => {
    if (selectedLocation === "all") return recent;
    return recent.filter((a) => getAppointmentLocation(a, locations).id === selectedLocation);
  }, [recent, selectedLocation, locations]);

  const statsData = useMemo(() => {
    if (selectedLocation === "all") {
      const byStat = stats?.byStatus || {};
      const tot = stats?.total ?? recent.length;
      const today = stats?.todayCount ?? recent.filter((a) => {
        const d = a.appointmentDate ? new Date(a.appointmentDate).toISOString().slice(0, 10) : "";
        return d === todayStr;
      }).length;

      return {
        total: tot,
        todayCount: today,
        pending: byStat.PENDING ?? recent.filter((a) => a.status === "PENDING").length,
        confirmed: byStat.CONFIRMED ?? recent.filter((a) => a.status === "CONFIRMED").length,
        completed: byStat.COMPLETED ?? recent.filter((a) => a.status === "COMPLETED").length,
      };
    } else {
      let pending = 0;
      let confirmed = 0;
      let completed = 0;
      let today = 0;

      for (const a of displayedRecent) {
        if (a.status === "PENDING") pending++;
        else if (a.status === "CONFIRMED") confirmed++;
        else if (a.status === "COMPLETED") completed++;

        const d = a.appointmentDate ? new Date(a.appointmentDate).toISOString().slice(0, 10) : "";
        if (d === todayStr) today++;
      }

      return {
        total: displayedRecent.length,
        todayCount: today,
        pending,
        confirmed,
        completed,
      };
    }
  }, [selectedLocation, stats, recent, displayedRecent, todayStr]);

  if (loading) return <div className="admin-loading"><span>Đang tải…</span></div>;

  const currentLocObj = locations.find((l) => l.id === selectedLocation);
  const locName = currentLocObj ? (currentLocObj.shortName || currentLocObj.name) : "Toàn bộ cơ sở";

  return (
    <>
      <div className="kpi-grid">
        <div
          className="kpi"
          style={{ cursor: setTab ? "pointer" : "default" }}
          onClick={() => setTab && setTab("appointments")}
          title="Xem danh sách lịch hẹn"
        >
          <span className="kpi-icon neutral"><Icon name="calendar" /></span>
          <div>
            <small>TỔNG CA KHÁM</small>
            <strong>{statsData.total}</strong>
            <p>{statsData.todayCount > 0 ? `Hôm nay: ${statsData.todayCount} ca` : (selectedLocation === "all" ? "Toàn bộ hệ thống" : locName)}</p>
          </div>
        </div>
        <div
          className="kpi"
          style={{ cursor: setTab ? "pointer" : "default" }}
          onClick={() => setTab && setTab("appointments")}
          title="Xem các lịch hẹn chờ duyệt"
        >
          <span className="kpi-icon amber"><Icon name="clock" /></span>
          <div>
            <small>CHỜ XÁC NHẬN</small>
            <strong>{statsData.pending}</strong>
            <p>Cần xử lý</p>
          </div>
        </div>
        <div
          className="kpi"
          style={{ cursor: setTab ? "pointer" : "default" }}
          onClick={() => setTab && setTab("appointments")}
          title="Xem các lịch hẹn đã xác nhận"
        >
          <span className="kpi-icon green"><Icon name="check" /></span>
          <div>
            <small>ĐÃ XÁC NHẬN</small>
            <strong>{statsData.confirmed}</strong>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div
          className="kpi"
          style={{ cursor: setTab ? "pointer" : "default" }}
          onClick={() => setTab && setTab("appointments")}
          title="Xem các lịch hẹn đã hoàn thành"
        >
          <span className="kpi-icon slate"><Icon name="user" /></span>
          <div>
            <small>HOÀN THÀNH</small>
            <strong>{statsData.completed}</strong>
            <p>Đã khám xong</p>
          </div>
        </div>
      </div>

      <div className="table-card" style={{ marginTop: 22 }}>
        <div className="table-toolbar">
          <div className="table-title">
            <h2>Lịch hẹn gần đây</h2>
            <span style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              {displayedRecent.length} cuộc hẹn {selectedLocation !== "all" ? `(${locName})` : "(Toàn bộ cơ sở)"}
            </span>
          </div>
          {setTab && (
            <button
              onClick={() => setTab("appointments")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "#ffffff",
                color: "var(--teal)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <span>Xem tất cả</span>
              <Icon name="arrowRight" size={14} />
            </button>
          )}
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
                const loc = getAppointmentLocation(a, locations);
                return (
                  <tr key={a.id}>
                    <td><strong className="code">{a.bookingCode}</strong></td>
                    <td>
                      <strong style={{ display: "block", fontSize: 14, color: "#0f172a" }}>{a.patientName}</strong>
                      <small style={{ display: "block", fontSize: 12, color: "#64748b", marginTop: 2 }}>{a.patientPhone}</small>
                    </td>
                    <td>
                      <strong style={{ display: "block", fontSize: 14, color: "#0f172a" }}>{a.doctor?.fullName || "—"}</strong>
                      <small style={{ display: "block", fontSize: 12, color: "#64748b", marginTop: 2 }}>{a.service?.name || ""}</small>
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
function Appointments({ setTab, selectedLocation = "all", setSelectedLocation, locations = CLINIC_LOCATIONS }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

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
    : items.filter(a => getAppointmentLocation(a, locations).id === selectedLocation);

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
            <span>{filteredItems.length} cuộc hẹn {selectedLocation !== "all" ? `(${locations.find(l => l.id === selectedLocation)?.shortName || ""})` : ""}</span>
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
                <option value="all">Tất cả cơ sở ({locations.length})</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.shortName || loc.name}
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
                const loc = getAppointmentLocation(a, locations);
                return (
                  <tr key={a.id}>
                    <td><strong className="code">{a.bookingCode}</strong></td>
                    <td>
                      <strong style={{ display: "block", fontSize: 14, color: "#0f172a" }}>{a.patientName}</strong>
                      <small style={{ display: "block", fontSize: 12, color: "#64748b", marginTop: 2 }}>{a.patientPhone}</small>
                    </td>
                    <td>
                      <strong style={{ display: "block", fontSize: 14, color: "#0f172a" }}>{a.doctor?.fullName || "—"}</strong>
                      <small style={{ display: "block", fontSize: 12, color: "#64748b", marginTop: 2 }}>{a.service?.name || ""}</small>
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
                          <button className="quick cancel" onClick={() => setCancelTarget(a)}>Hủy</button>
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
        const drawerLoc = getAppointmentLocation(drawer, locations);
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
                  <button className="btn danger-outline" onClick={() => setCancelTarget(drawer)}>Hủy lịch hẹn</button>
                )}
                <button className="btn secondary" onClick={() => setDrawer(null)}>Đóng</button>
              </div>
            </aside>
          </>
        );
      })()}
      {/* Custom Confirm Modal for Admin Cancelling Appointment */}
      <ConfirmModal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={async () => {
          if (!cancelTarget) return;
          await handleStatusChange(cancelTarget.id, "CANCELLED", "Hủy bởi admin");
          setToastMessage(`Đã hủy lịch hẹn mã #${cancelTarget.bookingCode} thành công!`);
          if (drawer?.id === cancelTarget.id) setDrawer(null);
          setCancelTarget(null);
        }}
        title="Xác nhận hủy lịch hẹn"
        subtitle={`Mã phiếu khám: #${cancelTarget?.bookingCode}`}
        confirmText="Xác nhận hủy lịch"
        cancelText="Giữ lại lịch"
        variant="danger"
      >
        <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Bạn có chắc chắn muốn hủy cuộc hẹn của bệnh nhân{" "}
          <strong style={{ color: "#0f172a" }}>{cancelTarget?.patientName}</strong>{" "}
          với bác sĩ{" "}
          <strong style={{ color: "#0f172a" }}>{cancelTarget?.doctor?.fullName || "Bác sĩ phụ trách"}</strong>{" "}
          không?
        </p>
      </ConfirmModal>

      {toastMessage && (
        <div className="admin-toast-success">
          <Icon name="check" size={16} />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ border: 0, background: "none", color: "#fff", cursor: "pointer", marginLeft: 8 }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      )}
    </>
  );
}

// ─── DOCTOR MODAL & CONFIRM ───────────────────────────────────────────────────
function DoctorModal({ isOpen, mode, doctor, specialties, onClose, onSaved }) {
  if (!isOpen) return null;
  const isEdit = mode === "edit";

  const [fullName, setFullName] = useState(doctor?.fullName || "");
  const [title, setTitle] = useState(doctor?.title || "");
  const [phone, setPhone] = useState(doctor?.phone || "");
  const [email, setEmail] = useState(doctor?.email || "");
  const [licenseNumber, setLicenseNumber] = useState(doctor?.licenseNumber || "");
  const [bio, setBio] = useState(doctor?.bio || "");
  const [status, setStatus] = useState(doctor?.status || "ACTIVE");
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState(
    doctor?.specialties?.map(s => s.id) || (specialties[0] ? [specialties[0].id] : [])
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const toggleSpecialty = (id) => {
    setSelectedSpecialtyIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên bác sĩ.");
      return;
    }
    if (selectedSpecialtyIds.length === 0) {
      setErrorMsg("Vui lòng chọn ít nhất một chuyên khoa.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      fullName: fullName.trim(),
      title: title.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      bio: bio.trim() || undefined,
      status,
      specialtyIds: selectedSpecialtyIds,
    };

    try {
      if (isEdit) {
        await api.put(`/admin/doctors/${doctor.id}`, payload);
      } else {
        await api.post("/admin/doctors", payload);
      }
      onSaved(isEdit ? "Cập nhật thông tin bác sĩ thành công!" : "Thêm bác sĩ thành công!");
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Không thể lưu thông tin bác sĩ.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <div>
            <h3>{isEdit ? "Chỉnh sửa thông tin bác sĩ" : "Thêm bác sĩ mới"}</h3>
            <p>{isEdit ? `Cập nhật hồ sơ bác sĩ: ${doctor?.fullName}` : "Điền thông tin và chỉ định chuyên khoa cho bác sĩ"}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng"><Icon name="x" size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "contents" }}>
          <div className="admin-modal-body">
            {errorMsg && (
              <div className="admin-alert-error">
                <Icon name="alert" size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="admin-form-group">
              <label>Họ và tên bác sĩ <span className="req">*</span></label>
              <input
                type="text"
                placeholder="Ví dụ: BS.CKII Nguyễn Văn A"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label>Chức danh / Học vị</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bác sĩ chuyên khoa I, ThS.BS..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>Trạng thái hoạt động</label>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="INACTIVE">Tạm dừng (INACTIVE)</option>
                </select>
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="Ví dụ: 0912 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Ví dụ: doctor@hieuhai.vn"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Số chứng chỉ hành nghề (CCHN)</label>
              <input
                type="text"
                placeholder="Ví dụ: CCHN-12345/BYT"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>
                Chuyên khoa phụ trách <span className="req">*</span>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400, marginLeft: 6 }}>
                  (chọn ít nhất 1 chuyên khoa)
                </span>
              </label>
              {specialties.length === 0 ? (
                <small style={{ color: "#94a3b8" }}>Đang tải chuyên khoa…</small>
              ) : (
                <div className="specialty-selector">
                  {specialties.map(s => {
                    const selected = selectedSpecialtyIds.includes(s.id);
                    return (
                      <span
                        key={s.id}
                        className={`specialty-chip ${selected ? "selected" : ""}`}
                        onClick={() => toggleSpecialty(s.id)}
                      >
                        {selected ? <Icon name="check" size={12} /> : null}
                        {s.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="admin-form-group">
              <label>Tiểu sử / Quá trình đào tạo</label>
              <textarea
                rows={3}
                placeholder="Kinh nghiệm khám chữa bệnh, quá trình học tập và công tác..."
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-modal-foot">
            <button type="button" className="btn secondary" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? "Đang lưu…" : (isEdit ? "Lưu thay đổi" : "Thêm bác sĩ")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteDoctorModal({ doctor, onClose, onDeleted }) {
  if (!doctor) return null;
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await api.delete(`/admin/doctors/${doctor.id}`);
      onDeleted(`Đã xóa/ngừng hoạt động bác sĩ "${doctor.fullName}".`);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Không thể xóa bác sĩ.");
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <h3>Xác nhận xóa bác sĩ</h3>
          <button type="button" onClick={onClose} aria-label="Đóng"><Icon name="x" size={18} /></button>
        </div>
        <div className="admin-modal-body">
          {errorMsg && (
            <div className="admin-alert-error">
              <Icon name="alert" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
          <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, margin: 0 }}>
            Bạn có chắc chắn muốn xóa bác sĩ <strong>{doctor.fullName}</strong> ({doctor.title || "Bác sĩ"}) không?
          </p>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: 12, borderRadius: 6, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
            <Icon name="alert" size={14} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
            Nếu bác sĩ đã từng có cuộc hẹn, hệ thống sẽ tự động chuyển trạng thái sang <strong>Tạm dừng (INACTIVE)</strong> để bảo toàn toàn vẹn dữ liệu lịch sử.
          </div>
        </div>
        <div className="admin-modal-foot">
          <button type="button" className="btn secondary" onClick={onClose} disabled={submitting}>
            Hủy bỏ
          </button>
          <button type="button" className="btn danger-outline" onClick={handleConfirm} disabled={submitting} style={{ background: "#ef4444", color: "#fff", borderColor: "#ef4444" }}>
            {submitting ? "Đang xử lý…" : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DOCTORS ──────────────────────────────────────────────────────────────────
function Doctors({ selectedLocation = "all", locations = CLINIC_LOCATIONS }) {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState(null); // null | { mode: 'create' } | { mode: 'edit', doctor }
  const [deleteDoctor, setDeleteDoctor] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchDoctors = useCallback(() => {
    setLoading(true);
    api.get("/admin/doctors")
      .then(r => setDoctors(r.data?.data || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDoctors();
    api.get("/admin/specialties")
      .then(r => setSpecialties(r.data?.data || []))
      .catch(() => setSpecialties([]));
  }, [fetchDoctors]);

  const displayedDoctors = selectedLocation === "all"
    ? doctors
    : doctors.filter((d, idx) => getDoctorLocation(d, idx, locations).id === selectedLocation);

  return (
    <>
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-title">
            <h2>Quản lý bác sĩ</h2>
            <span>{displayedDoctors.length} bác sĩ {selectedLocation !== "all" ? `(${locations.find(l => l.id === selectedLocation)?.shortName || ""})` : ""}</span>
          </div>
          <Button variant="primary" onClick={() => setModalState({ mode: "create" })}>
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
                const docLoc = getDoctorLocation(d, idx, locations);
                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span className="avatar teal" style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, fontWeight: 700, fontSize: 13 }}>
                          {d.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                        <div style={{ minWidth: 150, display: "flex", flexDirection: "column" }}>
                          <strong style={{ fontSize: 14, color: "#0f172a" }}>{d.fullName}</strong>
                          <small style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{d.title || "Bác sĩ"}</small>
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
                        <button className="quick" onClick={() => setModalState({ mode: "edit", doctor: d })}>Sửa</button>
                        <button className="quick cancel" onClick={() => setDeleteDoctor(d)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalState && (
        <DoctorModal
          isOpen={true}
          mode={modalState.mode}
          doctor={modalState.doctor}
          specialties={specialties}
          onClose={() => setModalState(null)}
          onSaved={(msg) => {
            fetchDoctors();
            setToastMessage(msg);
          }}
        />
      )}

      {deleteDoctor && (
        <DeleteDoctorModal
          doctor={deleteDoctor}
          onClose={() => setDeleteDoctor(null)}
          onDeleted={(msg) => {
            fetchDoctors();
            setToastMessage(msg);
          }}
        />
      )}

      {toastMessage && (
        <div className="admin-toast-success">
          <Icon name="check" size={16} />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ border: 0, background: "none", color: "rgba(255,255,255,0.8)", marginLeft: 8, cursor: "pointer" }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      )}
    </>
  );
}

// ─── SERVICE MODAL & CONFIRM ──────────────────────────────────────────────────
function ServiceModal({ isOpen, mode, service, specialties, onClose, onSaved }) {
  if (!isOpen) return null;
  const isEdit = mode === "edit";

  const [name, setName] = useState(service?.name || "");
  const [description, setDescription] = useState(service?.description || "");
  const [price, setPrice] = useState(service?.price ? String(service.price) : "200000");
  const [durationMinutes, setDurationMinutes] = useState(service?.durationMinutes ? String(service.durationMinutes) : "30");
  const [specialtyId, setSpecialtyId] = useState(service?.specialty?.id || service?.specialtyId || (specialties[0]?.id || ""));
  const [status, setStatus] = useState(service?.status || "ACTIVE");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập tên dịch vụ.");
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg("Giá dịch vụ không hợp lệ.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      durationMinutes: Number(durationMinutes) || 30,
      price: numPrice,
      specialtyId: specialtyId || undefined,
      status,
    };

    try {
      if (isEdit) {
        await api.put(`/admin/services/${service.id}`, payload);
      } else {
        await api.post("/admin/services", payload);
      }
      onSaved(isEdit ? "Cập nhật dịch vụ thành công!" : "Thêm dịch vụ thành công!");
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Không thể lưu dịch vụ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <div>
            <h3>{isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</h3>
            <p>{isEdit ? `Cập nhật thông tin dịch vụ: ${service?.name}` : "Điền thông tin và giá dịch vụ khám bệnh"}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng"><Icon name="x" size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "contents" }}>
          <div className="admin-modal-body">
            {errorMsg && (
              <div className="admin-alert-error">
                <Icon name="alert" size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="admin-form-group">
              <label>Tên dịch vụ <span className="req">*</span></label>
              <input
                type="text"
                placeholder="Ví dụ: Khám nội tổng quát, Khám nhi..."
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label>Chuyên khoa liên quan</label>
                <select value={specialtyId} onChange={e => setSpecialtyId(e.target.value)}>
                  <option value="">-- Không phân chuyên khoa --</option>
                  {specialties.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Trạng thái</label>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="INACTIVE">Tạm dừng (INACTIVE)</option>
                </select>
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label>Giá dịch vụ (VNĐ) <span className="req">*</span></label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  placeholder="Ví dụ: 200000"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Thời lượng khám (phút)</label>
                <input
                  type="number"
                  min="5"
                  max="240"
                  placeholder="Ví dụ: 30"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Mô tả dịch vụ</label>
              <textarea
                rows={3}
                placeholder="Nội dung thăm khám, xét nghiệm hoặc quy trình thực hiện..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-modal-foot">
            <button type="button" className="btn secondary" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? "Đang lưu…" : (isEdit ? "Lưu thay đổi" : "Thêm dịch vụ")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteServiceModal({ service, onClose, onDeleted }) {
  if (!service) return null;
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await api.delete(`/admin/services/${service.id}`);
      onDeleted(`Đã xóa/ngừng cung cấp dịch vụ "${service.name}".`);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Không thể xóa dịch vụ.");
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <h3>Xác nhận xóa dịch vụ</h3>
          <button type="button" onClick={onClose} aria-label="Đóng"><Icon name="x" size={18} /></button>
        </div>
        <div className="admin-modal-body">
          {errorMsg && (
            <div className="admin-alert-error">
              <Icon name="alert" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
          <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, margin: 0 }}>
            Bạn có chắc chắn muốn xóa dịch vụ <strong>{service.name}</strong> không?
          </p>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: 12, borderRadius: 6, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
            <Icon name="alert" size={14} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
            Nếu dịch vụ đã có cuộc hẹn trong hệ thống, hệ thống sẽ tự động chuyển sang trạng thái <strong>Tạm dừng (INACTIVE)</strong> để lưu giữ chứng từ y tế.
          </div>
        </div>
        <div className="admin-modal-foot">
          <button type="button" className="btn secondary" onClick={onClose} disabled={submitting}>
            Hủy bỏ
          </button>
          <button type="button" className="btn danger-outline" onClick={handleConfirm} disabled={submitting} style={{ background: "#ef4444", color: "#fff", borderColor: "#ef4444" }}>
            {submitting ? "Đang xử lý…" : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SERVICES ─────────────────────────────────────────────────────────────────
function Services() {
  const [services, setServices] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceModal, setServiceModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', service }
  const [deleteService, setDeleteService] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchServices = useCallback(() => {
    setLoading(true);
    api.get("/admin/services")
      .then(r => setServices(r.data?.data || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchServices();
    api.get("/admin/specialties")
      .then(r => setSpecialties(r.data?.data || []))
      .catch(() => setSpecialties([]));
  }, [fetchServices]);

  return (
    <>
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-title">
            <h2>Quản lý dịch vụ</h2>
            <span>{services.length} dịch vụ</span>
          </div>
          <Button variant="primary" onClick={() => setServiceModal({ mode: "create" })}>
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
                      <button className="quick" onClick={() => setServiceModal({ mode: "edit", service: s })}>Sửa</button>
                      <button className="quick cancel" onClick={() => setDeleteService(s)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {serviceModal && (
        <ServiceModal
          isOpen={true}
          mode={serviceModal.mode}
          service={serviceModal.service}
          specialties={specialties}
          onClose={() => setServiceModal(null)}
          onSaved={(msg) => {
            fetchServices();
            setToastMessage(msg);
          }}
        />
      )}

      {deleteService && (
        <DeleteServiceModal
          service={deleteService}
          onClose={() => setDeleteService(null)}
          onDeleted={(msg) => {
            fetchServices();
            setToastMessage(msg);
          }}
        />
      )}

      {toastMessage && (
        <div className="admin-toast-success">
          <Icon name="check" size={16} />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ border: 0, background: "none", color: "rgba(255,255,255,0.8)", marginLeft: 8, cursor: "pointer" }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      )}
    </>
  );
}

// ─── LOCATION MODAL & CONFIRM ─────────────────────────────────────────────────
function LocationModal({ isOpen, mode, location, onClose, onSaved }) {
  if (!isOpen) return null;
  const isEdit = mode === "edit";

  const [name, setName] = useState(location?.name || "");
  const [shortName, setShortName] = useState(location?.shortName || "");
  const [address, setAddress] = useState(location?.address || "");
  const [fullAddress, setFullAddress] = useState(location?.fullAddress || "");
  const [city, setCity] = useState(location?.city || "TP. Hồ Chí Minh");
  const [phone, setPhone] = useState(location?.phone || "");
  const [hotline, setHotline] = useState(location?.hotline || "");
  const [status, setStatus] = useState(location?.status || "ACTIVE");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập tên cơ sở.");
      return;
    }
    if (!shortName.trim()) {
      setErrorMsg("Vui lòng nhập tên rút gọn của cơ sở.");
      return;
    }
    if (!address.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ cơ sở.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      shortName: shortName.trim(),
      address: address.trim(),
      fullAddress: fullAddress.trim() || address.trim(),
      city: city.trim() || "TP. Hồ Chí Minh",
      phone: phone.trim() || undefined,
      hotline: hotline.trim() || undefined,
      status,
    };

    try {
      if (isEdit) {
        await api.put(`/admin/locations/${location.id}`, payload);
      } else {
        await api.post("/admin/locations", payload);
      }
      onSaved(isEdit ? "Cập nhật cơ sở thành công!" : "Thêm cơ sở mới thành công!");
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Không thể lưu thông tin cơ sở.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <div>
            <h3>{isEdit ? "Chỉnh sửa cơ sở phòng khám" : "Thêm cơ sở mới"}</h3>
            <p>{isEdit ? `Cập nhật thông tin chi nhánh: ${location?.name}` : "Khai báo địa chỉ và thông tin chi nhánh phòng khám"}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng"><Icon name="x" size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "contents" }}>
          <div className="admin-modal-body">
            {errorMsg && (
              <div className="admin-alert-error">
                <Icon name="alert" size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="admin-form-group">
              <label>Tên đầy đủ cơ sở <span className="req">*</span></label>
              <input
                type="text"
                placeholder="Ví dụ: Phòng khám Đa khoa Hiếu Hải - Quận 1"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label>Tên rút gọn hiển thị <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cơ sở Quận 1"
                  value={shortName}
                  onChange={e => setShortName(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Khu vực / Tỉnh, Thành phố</label>
                <input
                  type="text"
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Địa chỉ ngắn gọn <span className="req">*</span></label>
              <input
                type="text"
                placeholder="Ví dụ: 12 Lê Lợi, Q.1, TP.HCM"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Địa chỉ chi tiết đầy đủ</label>
              <input
                type="text"
                placeholder="Ví dụ: Số 12 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                value={fullAddress}
                onChange={e => setFullAddress(e.target.value)}
              />
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label>Số điện thoại bàn / Lễ tân</label>
                <input
                  type="tel"
                  placeholder="Ví dụ: 028 3822 9999"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>Hotline hỗ trợ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 1900 1234 (Nhánh 5)"
                  value={hotline}
                  onChange={e => setHotline(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Trạng thái hoạt động</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="INACTIVE">Tạm dừng (INACTIVE)</option>
              </select>
            </div>
          </div>

          <div className="admin-modal-foot">
            <button type="button" className="btn secondary" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? "Đang lưu…" : (isEdit ? "Lưu thay đổi" : "Thêm cơ sở")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteLocationModal({ location, onClose, onDeleted }) {
  if (!location) return null;
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await api.delete(`/admin/locations/${location.id}`);
      onDeleted(`Đã xóa/ngừng hoạt động cơ sở "${location.shortName || location.name}".`);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Không thể xóa cơ sở.");
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <h3>Xác nhận xóa cơ sở</h3>
          <button type="button" onClick={onClose} aria-label="Đóng"><Icon name="x" size={18} /></button>
        </div>
        <div className="admin-modal-body">
          {errorMsg && (
            <div className="admin-alert-error">
              <Icon name="alert" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
          <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, margin: 0 }}>
            Bạn có chắc chắn muốn xóa cơ sở <strong>{location.name}</strong> ({location.shortName}) không?
          </p>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: 12, borderRadius: 6, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
            <Icon name="alert" size={14} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
            Nếu cơ sở đã có lịch hẹn hoặc bác sĩ trực thuộc, hệ thống sẽ tự động chuyển sang trạng thái <strong>Tạm dừng (INACTIVE)</strong> để bảo toàn toàn vẹn dữ liệu.
          </div>
        </div>
        <div className="admin-modal-foot">
          <button type="button" className="btn secondary" onClick={onClose} disabled={submitting}>
            Hủy bỏ
          </button>
          <button type="button" className="btn danger-outline" onClick={handleConfirm} disabled={submitting} style={{ background: "#ef4444", color: "#fff", borderColor: "#ef4444" }}>
            {submitting ? "Đang xử lý…" : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LOCATIONS (QUẢN LÝ CƠ SỞ) ────────────────────────────────────────────────
function Locations({ locations = [], onLocationsChanged }) {
  const [items, setItems] = useState(locations);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState(null); // null | { mode: 'create' } | { mode: 'edit', location }
  const [deleteLocation, setDeleteLocation] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchLocationsList = useCallback(() => {
    setLoading(true);
    api.get("/admin/locations")
      .then(r => {
        const data = r.data?.data || [];
        setItems(data);
        if (onLocationsChanged) onLocationsChanged();
      })
      .catch(() => {
        api.get("/locations")
          .then(r => setItems(r.data?.data || []))
          .catch(() => setItems([]));
      })
      .finally(() => setLoading(false));
  }, [onLocationsChanged]);

  useEffect(() => {
    fetchLocationsList();
  }, [fetchLocationsList]);

  useEffect(() => {
    if (locations && locations.length > 0) {
      setItems(locations);
    }
  }, [locations]);

  return (
    <>
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-title">
            <h2>Quản lý cơ sở phòng khám</h2>
            <span>{items.length} chi nhánh trên toàn quốc</span>
          </div>
          <Button variant="primary" onClick={() => setModalState({ mode: "create" })}>
            <Icon name="plus" />Thêm cơ sở
          </Button>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: 240 }}>CƠ SỞ</th>
                <th style={{ minWidth: 160 }}>TÊN RÚT GỌN / KHU VỰC</th>
                <th style={{ minWidth: 260 }}>ĐỊA CHỈ HOẠT ĐỘNG</th>
                <th style={{ minWidth: 180 }}>LIÊN HỆ &amp; HOTLINE</th>
                <th style={{ minWidth: 130 }}>TRẠNG THÁI</th>
                <th style={{ minWidth: 120, textAlign: "right" }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={{ textAlign: "center", padding: 28, fontSize: 13, color: "#64748b" }}>Đang tải danh sách cơ sở…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: 28, fontSize: 13 }}>Chưa có cơ sở nào</td></tr>}
              {!loading && items.map((loc) => (
                <tr key={loc.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span className="avatar teal" style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, fontWeight: 700, fontSize: 13, display: "grid", placeItems: "center" }}>
                        <Icon name="building" size={18} />
                      </span>
                      <div style={{ minWidth: 160, display: "flex", flexDirection: "column" }}>
                        <strong style={{ fontSize: 14, color: "#0f172a" }}>{loc.name}</strong>
                        <small style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Mã: {loc.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>{loc.shortName}</strong>
                    <span style={{ fontSize: 11, color: "var(--teal)", background: "#ccfbf1", padding: "2px 6px", borderRadius: 4, display: "inline-block", marginTop: 4, fontWeight: 600 }}>
                      {loc.city || "TP. Hồ Chí Minh"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, display: "block" }}>{loc.fullAddress || loc.address}</span>
                    <small style={{ fontSize: 11, color: "#64748b" }}>{loc.address}</small>
                  </td>
                  <td>
                    <strong style={{ fontSize: 13, display: "block", color: "#0f172a" }}>{loc.hotline || "—"}</strong>
                    <small style={{ fontSize: 12, color: "#64748b" }}>{loc.phone ? `SĐT: ${loc.phone}` : ""}</small>
                  </td>
                  <td>
                    <StatusBadge status={loc.status || "ACTIVE"} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="quick-actions" style={{ justifyContent: "flex-end" }}>
                      <button className="quick" onClick={() => setModalState({ mode: "edit", location: loc })}>Sửa</button>
                      <button className="quick cancel" onClick={() => setDeleteLocation(loc)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalState && (
        <LocationModal
          isOpen={true}
          mode={modalState.mode}
          location={modalState.location}
          onClose={() => setModalState(null)}
          onSaved={(msg) => {
            fetchLocationsList();
            setToastMessage(msg);
          }}
        />
      )}

      {deleteLocation && (
        <DeleteLocationModal
          location={deleteLocation}
          onClose={() => setDeleteLocation(null)}
          onDeleted={(msg) => {
            fetchLocationsList();
            setToastMessage(msg);
          }}
        />
      )}

      {toastMessage && (
        <div className="admin-toast-success">
          <Icon name="check" size={16} />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ border: 0, background: "none", color: "rgba(255,255,255,0.8)", marginLeft: 8, cursor: "pointer" }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      )}
    </>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [locations, setLocations] = useState(CLINIC_LOCATIONS);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fetchLocations = useCallback(() => {
    api.get("/admin/locations")
      .then(r => {
        const data = r.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          setLocations(data);
        }
      })
      .catch(() => {
        api.get("/locations")
          .then(r => {
            const data = r.data?.data;
            if (Array.isArray(data) && data.length > 0) {
              setLocations(data);
            }
          })
          .catch(() => {});
      });
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return (
    <div className="admin-shell">
      <Sidebar
        onLogout={onLogout}
        tab={tab}
        setTab={setTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <main className="admin-main">
        <Topbar
          tab={tab}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          locations={locations}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <div className="admin-content">
          {tab === "overview" && <Overview selectedLocation={selectedLocation} locations={locations} setTab={setTab} />}
          {tab === "appointments" && (
            <Appointments
              setTab={setTab}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              locations={locations}
            />
          )}
          {tab === "doctors" && <Doctors selectedLocation={selectedLocation} locations={locations} />}
          {tab === "services" && <Services />}
          {tab === "locations" && <Locations locations={locations} onLocationsChanged={fetchLocations} />}
        </div>
      </main>
    </div>
  );
}
