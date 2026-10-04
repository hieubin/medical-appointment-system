import React from "react";

export function Logo({ inverse = false }) {
  return (
    <div className={`brand ${inverse ? "brand-inverse" : ""}`}>
      <span className="brand-mark">
        <span></span>
        <span></span>
      </span>
      <span className="brand-name">Medora</span>
    </div>
  );
}

export function Heading({ level = 1, children, className = "" }) {
  const Tag = `h${level}`;
  return <Tag className={`heading heading-${level} ${className}`.trim()}>{children}</Tag>;
}

export function Icon({ name, size = 18, className = "" }) {
  const paths = {
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8.5 7 10 4.2-1.5 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    arrow: <path d="m15 18-6-6 6-6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    "chevron-right": <path d="m9 18 6-6-6-6" />,
    "chevron-left": <path d="m15 18-6-6 6-6" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    building: <><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v8h4" /><path d="M18 9h2a2 2 0 0 1 2 2v11h-4" /><path d="M10 6h4M10 10h4M10 14h4M10 18h4" /></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    alert: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    "eye-off": <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M16 11a4 4 0 0 0 0-8M22 21v-2a4 4 0 0 0-3-3.7" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    activity: <path d="M3 12h4l2-7 4 14 2-7h6" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    x: <path d="m6 6 12 12M18 6 6 18" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />,
    plus: <><path d="M5 12h14M12 5v14" /></>,
    more: <><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>,
    doctor: <><circle cx="12" cy="8" r="5" /><path d="M12 5v14M7 10h5M12 10v5" /></>,
    chart: <><path d="M18 20V10M12 20V4M6 20v-6" /></>,
    help: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>,
    // Icons bổ sung
    filter: <><path d="M3 5h18M7 12h10M10 19h4" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M5 21h14" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 8a7 7 0 0 1 12-2l2 2M4 16l2 2a7 7 0 0 0 12-2" /></>,
    edit: <><path d="m15 5 4 4L8 20H4v-4L15 5Z" /><path d="m13 7 4 4" /></>,
    inbox: <><path d="M4 5h16l2 10v4H2v-4L4 5Z" /><path d="M2 15h6l1.5 2h5L16 15h6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    clipboard: <><path d="M6 5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6Z" /><path d="M8 3H6a2 2 0 0 0-2 2v1m12-3h1a2 2 0 0 1 2 2v1" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.shield}
    </svg>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({ href, children, className = "", onClick, ...props }) {
  return (
    <a href={href} className={`link-btn ${className}`.trim()} onClick={onClick} {...props}>
      {children}
    </a>
  );
}

export function TextField({
  label,
  icon,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  required,
  name,
  id,
  className = "",
  autoComplete,
  ...props
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className={`field ${error ? "field-error" : ""} ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId}>
          {label} {required && <b>*</b>}
        </label>
      )}
      <div className={`input-wrap ${icon ? "has-icon" : ""}`}>
        {icon && <span className="field-icon">{icon}</span>}
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          {...props}
        />
      </div>
      {error && <small className="field-error-text">{error}</small>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Confirmed: { bg: "#dcfce7", color: "#15803d" },
    Pending: { bg: "#fef3c7", color: "#b45309" },
    Completed: { bg: "#e0e7ff", color: "#4338ca" },
    Cancelled: { bg: "#fee2e2", color: "#b91c1c" },
    "No-Show": { bg: "#f1f5f9", color: "#475569" },
  };
  const s = map[status] || map.Pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px",
        borderRadius: 99,
        fontSize: 9,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
      }}
    >
      <i style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }}></i>
      {status}
    </span>
  );
}
