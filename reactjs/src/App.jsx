import { useEffect, useState } from "react";

function Icon({ name, size = 18 }) {
  const paths = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    "chevron-left": <path d="m15 18-6-6 6-6"/>,
    "chevron-right": <path d="m9 18 6-6-6-6"/>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8.5 7 10 4.2-1.5 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    x: <path d="m6 6 12 12M18 6 6 18"/>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M16 11a4 4 0 0 0 0-8M22 21v-2a4 4 0 0 0-3-3.7"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    filter: <path d="M4 6h16M7 12h10M10 18h4"/>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    note: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></>,
    activity: <path d="M3 12h4l2-7 4 14 2-7h6"/>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
  };
  return <svg aria-hidden="true" className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Brand({ inverse = false }) {
  return <div className={`brand ${inverse ? "brand-inverse" : ""}`}>
    <span className="brand-mark"><span></span><span></span></span>
    <span className="brand-name">Medistra</span>
  </div>;
}

function PublicHeader({ screen, navigate, signedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (next) => { setMenuOpen(false); navigate(next); };
  return <header className="public-header">
    <div className="public-header-inner">
      <button className="brand-button" onClick={() => go("home")}><Brand /></button>
      <nav className={`public-nav ${menuOpen ? "open" : ""}`} aria-label="Primary navigation">
        <button className={screen === "specialties" || screen === "specialtyDetail" ? "active" : ""} onClick={() => go("specialties")}>Specialties</button>
        <button className={screen === "doctors" || screen === "doctorDetail" ? "active" : ""} onClick={() => go("doctors")}>Doctors</button>
        <button className={screen === "services" ? "active" : ""} onClick={() => go("services")}>Services & fees</button>
        <button className={screen === "booking" ? "active" : ""} onClick={() => go("booking")}>Book appointment</button>
        <button className={screen === "lookup" ? "active" : ""} onClick={() => go("lookup")}>Manage booking</button>
        <button onClick={() => go("staffLogin")}>Staff portal</button>
        <button className="mobile-nav-auth" onClick={() => go(signedIn ? "portal" : "login")}>{signedIn ? "My account" : "Sign in"}</button>
      </nav>
      <button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "x" : "menu"} /></button>
      <div className="header-account">
        <span className="header-help"><span>Need help?</span><strong>028 7300 2268</strong></span>
        {signedIn ? <button className="account-button" onClick={() => navigate("portal")}><span className="avatar teal small">NA</span><span>Minh Anh</span><Icon name="chevron-right" size={14}/></button> : <><button className="btn text" onClick={() => navigate("login")}>Sign in</button><button className="btn primary header-signup" onClick={() => navigate("register")}>Create account</button></>}
      </div>
    </div>
  </header>;
}

const doctors = [
  { initials: "LT", name: "Dr. Linh Tran", specialty: "General Medicine", meta: "12 yrs experience", color: "coral" },
  { initials: "AM", name: "Dr. An Minh", specialty: "Cardiology", meta: "9 yrs experience", color: "teal" },
  { initials: "NK", name: "Dr. Ngoc Khanh", specialty: "Dermatology", meta: "14 yrs experience", color: "sand" },
];

function Stepper({ step }) {
  const labels = ["Doctor", "Schedule & Slot", "Patient Info", "Complete"];
  return <div className="stepper" aria-label={`Step ${step} of 4`}>
    {labels.map((label, i) => <div className={`step ${i + 1 < step ? "done" : ""} ${i + 1 === step ? "current" : ""}`} key={label}>
      <span className="step-dot">{i + 1 < step ? <Icon name="check" size={14} /> : i + 1}</span>
      <span className="step-label">{label}</span>
      {i < labels.length - 1 && <span className="step-line" />}
    </div>)}
  </div>;
}

const specialties = [
  { name: "General Medicine", slug: "general-medicine", icon: "activity", description: "Primary care, health screening, and treatment for common conditions.", doctors: 8 },
  { name: "Cardiology", slug: "cardiology", icon: "activity", description: "Diagnosis and treatment of heart and cardiovascular conditions.", doctors: 5 },
  { name: "Dermatology", slug: "dermatology", icon: "shield", description: "Medical and cosmetic care for skin, hair, and nail conditions.", doctors: 6 },
  { name: "Pediatrics", slug: "pediatrics", icon: "users", description: "Complete health care for infants, children, and adolescents.", doctors: 7 },
  { name: "Orthopedics", slug: "orthopedics", icon: "activity", description: "Care for bones, joints, muscles, and sports-related injuries.", doctors: 4 },
  { name: "ENT", slug: "ent", icon: "user", description: "Specialist care for ear, nose, throat, and related conditions.", doctors: 4 },
];

const publicDoctors = [
  { ...doctors[0], degree: "MD, University of Medicine HCMC", languages: "Vietnamese, English", next: "Today · 14:30", price: "450,000 VND" },
  { ...doctors[1], degree: "MD, PhD, Hanoi Medical University", languages: "Vietnamese, English", next: "Tomorrow · 09:00", price: "650,000 VND" },
  { ...doctors[2], degree: "MD, University of Medicine HCMC", languages: "Vietnamese, French", next: "Today · 16:00", price: "550,000 VND" },
  { initials: "PH", name: "Dr. Phuong Ha", specialty: "Pediatrics", meta: "11 yrs experience", color: "teal", degree: "MD, Hue University of Medicine", languages: "Vietnamese, English", next: "Tomorrow · 10:30", price: "450,000 VND" },
];

function CatalogScreen({ page, navigate }) {
  const [query, setQuery] = useState("");
  if (page === "home") return <main className="home-page">
    <section className="home-hero"><div className="home-hero-inner"><div className="hero-copy"><p className="eyebrow">Trusted clinical care</p><h1>Healthcare appointments,<br/>without the waiting.</h1><p>Find the right specialist, see real-time availability, and book your visit in just a few minutes.</p><div className="hero-actions"><button className="btn primary" onClick={() => navigate("booking")}>Book an appointment <Icon name="chevron-right" size={16}/></button><button className="btn secondary" onClick={() => navigate("doctors")}>Find a doctor</button></div><div className="hero-trust"><span><Icon name="shield" size={16}/>Verified clinicians</span><span><Icon name="clock" size={16}/>Instant confirmation</span><span><Icon name="phone" size={16}/>Patient support</span></div></div><div className="hero-photo"><img src="https://images.unsplash.com/photo-1758691461513-88a0aef72160?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=920" alt="Doctor in a modern clinic"/><div className="photo-caption"><span className="avatar teal small">LT</span><div><strong>Care from qualified specialists</strong><small>Over 30 clinicians across 6 specialties</small></div></div></div></div></section>
    <section className="quick-search"><div><span className="search-label">FIND CARE</span><button onClick={() => navigate("specialties")}><Icon name="activity"/><span><small>Specialty</small><strong>Choose a specialty</strong></span><Icon name="chevron-right" size={15}/></button><button onClick={() => navigate("doctors")}><Icon name="user"/><span><small>Doctor</small><strong>Search by name</strong></span><Icon name="chevron-right" size={15}/></button><button onClick={() => navigate("booking")}><Icon name="calendar"/><span><small>Appointment date</small><strong>Choose a date</strong></span><Icon name="chevron-right" size={15}/></button><button className="quick-submit" onClick={() => navigate("booking")}><Icon name="search"/>Search availability</button></div></section>
    <section className="home-section"><div className="section-heading"><div><p className="eyebrow">Medical specialties</p><h2>Care for every stage of life</h2><p>Access experienced clinicians across our core medical specialties.</p></div><button onClick={() => navigate("specialties")}>View all specialties <Icon name="chevron-right" size={15}/></button></div><div className="specialty-grid">{specialties.slice(0,4).map(s => <button className="specialty-card" key={s.slug} onClick={() => navigate("specialtyDetail")}><span><Icon name={s.icon}/></span><strong>{s.name}</strong><p>{s.description}</p><small>{s.doctors} doctors available <Icon name="chevron-right" size={13}/></small></button>)}</div></section>
    <section className="home-process"><div className="section-heading centered"><div><p className="eyebrow">Simple and transparent</p><h2>Book your visit in three steps</h2></div></div><div className="process-grid"><div><span>01</span><Icon name="search"/><h3>Find your clinician</h3><p>Search by specialty, doctor, or the care you need.</p></div><div><span>02</span><Icon name="calendar"/><h3>Choose a time</h3><p>Select from real-time appointment availability.</p></div><div><span>03</span><Icon name="check"/><h3>Get confirmation</h3><p>Receive your booking code instantly and manage online.</p></div></div></section>
  </main>;

  if (page === "specialties" || page === "services") return <main className="catalog-page"><div className="catalog-hero"><div><p className="eyebrow">Clinical expertise</p><h1>{page === "services" ? "Services and pricing" : "Medical specialties"}</h1><p>{page === "services" ? "Clear pricing and appointment durations, with no online payment required." : "Find specialized care from qualified, experienced clinicians."}</p></div><div className="catalog-search"><Icon name="search"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={`Search ${page}...`}/></div></div>
    {page === "specialties" ? <div className="specialties-full">{specialties.filter(s => s.name.toLowerCase().includes(query.toLowerCase())).map(s => <article key={s.slug}><span><Icon name={s.icon}/></span><div><h2>{s.name}</h2><p>{s.description}</p><small>{s.doctors} specialist doctors</small></div><button className="btn secondary" onClick={() => navigate("specialtyDetail")}>View specialty <Icon name="chevron-right" size={14}/></button></article>)}</div> :
    <div className="services-table-card"><table><thead><tr><th>SERVICE</th><th>SPECIALTY</th><th>DURATION</th><th>PRICE</th><th></th></tr></thead><tbody>{[["General consultation","General Medicine","30 min","450,000 VND"],["Cardiology consultation","Cardiology","45 min","650,000 VND"],["ECG assessment","Cardiology","30 min","350,000 VND"],["Skin consultation","Dermatology","30 min","550,000 VND"],["Pediatric consultation","Pediatrics","30 min","450,000 VND"]].map(r => <tr key={r[0]}>{r.map((c,i) => <td key={c}><strong className={i===3 ? "tabular":""}>{c}</strong></td>)}<td><button className="btn primary compact" onClick={() => navigate("booking")}>Book</button></td></tr>)}</tbody></table></div>}
  </main>;

  if (page === "specialtyDetail") return <main className="catalog-page"><div className="detail-breadcrumb"><button onClick={() => navigate("specialties")}>Specialties</button><Icon name="chevron-right" size={13}/><span>General Medicine</span></div><section className="specialty-detail-head"><span><Icon name="activity" size={30}/></span><div><p className="eyebrow">Medical specialty</p><h1>General Medicine</h1><p>Comprehensive primary care for adults, from preventive health screening to the diagnosis and management of common medical conditions.</p><div><small><Icon name="users" size={14}/>8 doctors</small><small><Icon name="clock" size={14}/>Appointments from 30 min</small><small className="price">From 450,000 VND</small></div></div><button className="btn primary" onClick={() => navigate("booking")}>Book this specialty</button></section><div className="detail-layout"><section><div className="content-block"><h2>How we can help</h2><p>Our general medicine team provides your first point of clinical contact and coordinates specialist referrals when needed.</p><ul><li>Routine health checks and preventive screening</li><li>Common illness diagnosis and treatment</li><li>Chronic condition monitoring</li><li>Health advice and specialist referrals</li></ul></div><div className="section-heading compact-heading"><div><h2>Available doctors</h2><p>Choose a clinician and view their next available appointment.</p></div></div><div className="doctor-list-public">{publicDoctors.slice(0,2).map(d => <DoctorPublicCard doctor={d} navigate={navigate} key={d.name}/>)}</div></section><aside className="help-card"><Icon name="phone"/><h3>Not sure who to book?</h3><p>Our patient services team can help you choose the right clinician.</p><strong>028 7300 2268</strong><small>Mon–Sat, 07:00–20:00</small></aside></div></main>;

  if (page === "doctorDetail") { const d = publicDoctors[0]; return <main className="catalog-page"><div className="detail-breadcrumb"><button onClick={() => navigate("doctors")}>Doctors</button><Icon name="chevron-right" size={13}/><span>{d.name}</span></div><section className="doctor-profile-head"><span className="avatar coral profile-avatar">LT</span><div><p className="eyebrow">General Medicine</p><h1>{d.name}</h1><p>{d.degree}</p><div><span><Icon name="shield" size={15}/>Verified medical license</span><span><Icon name="activity" size={15}/>{d.meta}</span><span><Icon name="mail" size={15}/>{d.languages}</span></div></div><aside><small>CONSULTATION FEE</small><strong className="price">{d.price}</strong><span>Next available: <b>{d.next}</b></span><button className="btn primary" onClick={() => navigate("booking")}>Book appointment</button></aside></section><div className="detail-layout doctor-detail-layout"><section><div className="content-block"><h2>About Dr. Linh Tran</h2><p>Dr. Tran is an experienced general medicine physician focused on thoughtful, evidence-based primary care. She works closely with patients to understand their concerns and create clear, practical care plans.</p></div><div className="content-block"><h2>Clinical expertise</h2><div className="expertise-tags"><span>Preventive medicine</span><span>Health screening</span><span>Chronic disease</span><span>Adult primary care</span></div></div><div className="content-block"><h2>Services</h2><div className="doctor-services"><div><span><strong>General consultation</strong><small>30 minutes</small></span><b className="price">450,000 VND</b></div><div><span><strong>Annual health review</strong><small>45 minutes</small></span><b className="price">600,000 VND</b></div></div></div></section><aside className="availability-card"><h3>Next availability</h3><p>Wednesday, 14 May</p>{["09:30","10:30","14:00","15:30"].map(t => <button key={t} onClick={() => navigate("booking")}>{t}<Icon name="chevron-right" size={13}/></button>)}<button className="view-calendar" onClick={() => navigate("booking")}>View full calendar</button></aside></div></main>; }

  return <main className="catalog-page"><div className="catalog-hero"><div><p className="eyebrow">Our clinical team</p><h1>Find a doctor</h1><p>Search by name or filter by medical specialty and availability.</p></div><div className="catalog-search"><Icon name="search"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search doctor by name..."/></div></div><div className="doctor-filters"><button className="active">All specialties</button>{specialties.slice(0,5).map(s => <button key={s.slug}>{s.name}</button>)}<button><Icon name="filter" size={14}/>More filters</button></div><div className="doctors-grid-public">{publicDoctors.filter(d => d.name.toLowerCase().includes(query.toLowerCase())).map(d => <DoctorPublicCard doctor={d} navigate={navigate} key={d.name}/>)}</div></main>;
}

function DoctorPublicCard({ doctor, navigate }) {
  return <article className="doctor-public-card"><div className="doctor-public-top"><span className={`avatar ${doctor.color}`}>{doctor.initials}</span><div><span>{doctor.specialty}</span><h2>{doctor.name}</h2><p>{doctor.degree}</p></div><button aria-label="View doctor" onClick={() => navigate("doctorDetail")}><Icon name="chevron-right"/></button></div><div className="doctor-public-meta"><span><Icon name="activity" size={14}/>{doctor.meta}</span><span><Icon name="mail" size={14}/>{doctor.languages}</span></div><div className="doctor-public-bottom"><div><small>NEXT AVAILABLE</small><strong>{doctor.next}</strong></div><div><small>FROM</small><strong className="price">{doctor.price}</strong></div><button className="btn primary" onClick={() => navigate("booking")}>Book</button></div></article>;
}

function BookingScreen() {
  const [step, setStep] = useState(2);
  const [selectedDoctor, setSelectedDoctor] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState("09:30");
  const [copied, setCopied] = useState(false);
  const [slotConflict, setSlotConflict] = useState(false);
  const morning = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  const afternoon = ["13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
  const booked = ["08:30", "10:00", "14:30", "16:00"];
  const days = Array.from({ length: 35 }, (_, i) => i < 3 ? null : i - 2);

  const SlotGroup = ({ title, slots }) => <div className="slot-group">
    <div className="slot-heading"><span>{title}</span><small>{slots.filter(s => !booked.includes(s)).length} available</small></div>
    <div className="slot-grid">{slots.map(slot => <button key={slot} disabled={booked.includes(slot)} className={`slot ${selectedSlot === slot ? "selected" : ""}`} onClick={() => setSelectedSlot(slot)}>{slot}</button>)}</div>
  </div>;

  const body = () => {
    if (step === 1) return <div className="doctor-step">
      <div className="section-intro"><p className="eyebrow">Step 1 of 4</p><h1>Choose your doctor</h1><p>Select a clinician based on their specialty and availability.</p></div>
      <div className="doctor-list">{doctors.map((doc, i) => <button key={doc.name} className={`doctor-card ${selectedDoctor === i ? "selected" : ""}`} onClick={() => setSelectedDoctor(i)}>
        <span className={`avatar ${doc.color}`}>{doc.initials}</span><span className="doctor-copy"><strong>{doc.name}</strong><span>{doc.specialty}</span><small>{doc.meta}</small></span>
        <span className="radio">{selectedDoctor === i && <span />}</span>
      </button>)}</div>
      <div className="booking-actions"><span></span><button className="btn primary" onClick={() => setStep(2)}>Continue to schedule <Icon name="chevron-right" size={16}/></button></div>
    </div>;

    if (step === 2) return <>
      <div className="section-intro"><p className="eyebrow">Step 2 of 4</p><h1>Choose a date and time</h1><p>All times shown in Indochina Time (ICT).</p></div>
      <div className="schedule-layout">
        <section className="calendar-card">
          <div className="calendar-head"><button aria-label="Previous month"><Icon name="chevron-left" size={17}/></button><strong>May 2025</strong><button aria-label="Next month"><Icon name="chevron-right" size={17}/></button></div>
          <div className="weekdays">{["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d => <span key={d}>{d}</span>)}</div>
          <div className="calendar-grid">{days.map((day, i) => day ? <button key={i} className={`${day === 14 ? "selected" : ""} ${day < 10 ? "muted" : ""}`}>{day}</button> : <span key={i} />)}</div>
          <div className="calendar-note"><span className="tiny-dot"></span>Selected date <strong>Wed, May 14</strong></div>
        </section>
        <section className="slots-card">
          <div className="selected-date"><div><Icon name="calendar" /><span><small>SELECTED DATE</small><strong>Wednesday, May 14</strong></span></div><span className="timezone">ICT (UTC+7)</span></div>
          <SlotGroup title="Morning" slots={morning} />
          <SlotGroup title="Afternoon" slots={afternoon} />
          <div className="slot-legend"><span><i className="available"></i>Available</span><span><i className="chosen"></i>Selected</span><span><i className="booked"></i>Booked</span></div>
        </section>
      </div>
      <div className="booking-actions"><button className="btn text" onClick={() => setStep(1)}><Icon name="chevron-left" size={16}/> Back</button><div className="action-summary"><span>Wed, May 14 at <b>{selectedSlot}</b></span><button className="btn primary" onClick={() => selectedSlot === "08:00" ? setSlotConflict(true) : setStep(3)}>Continue <Icon name="chevron-right" size={16}/></button></div></div>
      {slotConflict && <div className="modal-backdrop"><section className="modal conflict-modal"><div className="modal-head"><div><h2>This slot was just booked</h2><p>Another patient completed their booking before you.</p></div><button onClick={() => setSlotConflict(false)}><Icon name="x"/></button></div><div className="conflict-message"><span><Icon name="clock"/></span><div><strong>08:00 is no longer available</strong><p>Your other selections have been saved. Please choose another available time.</p></div></div><div className="modal-actions"><button className="btn primary" onClick={() => { setSelectedSlot("09:30"); setSlotConflict(false); }}>Choose 09:30 instead</button></div></section></div>}
    </>;

    if (step === 3) return <>
      <div className="section-intro"><p className="eyebrow">Step 3 of 4</p><h1>Patient information</h1><p>Please enter the patient's details exactly as they appear on ID.</p></div>
      <div className="form-layout">
        <form className="patient-form" onSubmit={(e) => { e.preventDefault(); setStep(4); }}>
          <label className="field full"><span>Full name <b>*</b></span><input required defaultValue="Nguyen Minh Anh" /></label>
          <label className="field"><span>Phone number <b>*</b></span><div className="phone-field"><span>+84</span><input required defaultValue="912 345 678" /></div></label>
          <label className="field"><span>Email address <b>*</b></span><input required type="email" defaultValue="minhanh@email.com" /></label>
          <label className="field full"><span>Service <b>*</b></span><select defaultValue="consult"><option value="consult">General consultation — 450,000 VND</option><option>Follow-up appointment — 300,000 VND</option></select></label>
          <label className="field full"><span>Notes for your doctor <em>Optional</em></span><textarea placeholder="Briefly describe your symptoms or reason for visiting" rows={4} /></label>
          <label className="consent full"><input type="checkbox" defaultChecked /><span>I agree to the <u>privacy policy</u> and consent to the processing of my health information.</span></label>
          <div className="form-actions full"><button type="button" className="btn text" onClick={() => setStep(2)}><Icon name="chevron-left" size={16}/> Back</button><button className="btn primary">Confirm booking <Icon name="check" size={16}/></button></div>
        </form>
        <aside className="booking-summary"><h3>Booking summary</h3><div className="summary-doctor"><span className="avatar coral">LT</span><span><strong>Dr. Linh Tran</strong><small>General Medicine</small></span></div><dl><div><dt><Icon name="calendar" size={16}/>Date</dt><dd>Wed, May 14, 2025</dd></div><div><dt><Icon name="clock" size={16}/>Time</dt><dd>{selectedSlot} ICT</dd></div><div><dt>Service fee</dt><dd className="price">450,000 VND</dd></div></dl><p><Icon name="shield" size={17}/> Your information is encrypted and kept private.</p></aside>
      </div>
    </>;

    return <div className="success-wrap">
      <div className="success-icon"><Icon name="check" size={30}/></div>
      <p className="eyebrow">Booking confirmed</p><h1>Your appointment is scheduled</h1><p>We've sent a confirmation to <strong>minhanh@email.com</strong></p>
      <section className="receipt">
        <div className="receipt-head"><span>BOOKING CODE</span><button onClick={() => { navigator.clipboard?.writeText("MED-8492-AX"); setCopied(true); }}><Icon name={copied ? "check" : "copy"} size={16}/>{copied ? "Copied" : "Copy"}</button></div>
        <div className="booking-code">MED-8492-AX</div>
        <div className="receipt-divider"><span/><i/><span/></div>
        <div className="receipt-details">
          <div><span>DOCTOR</span><strong>Dr. Linh Tran</strong><small>General Medicine</small></div>
          <div><span>DATE & TIME</span><strong>Wed, May 14, 2025</strong><small>{selectedSlot}–{selectedSlot === "09:30" ? "10:00" : "10:30"} ICT</small></div>
          <div><span>PATIENT</span><strong>Nguyen Minh Anh</strong><small>+84 912 345 678</small></div>
          <div><span>SERVICE FEE</span><strong className="price">450,000 VND</strong><small>Pay at the clinic</small></div>
        </div>
      </section>
      <div className="policy"><Icon name="clock"/><div><strong>Cancellation policy</strong><p>Cancel or reschedule at least 4 hours before your appointment to avoid a cancellation fee.</p></div></div>
      <div className="success-actions"><button className="btn secondary" onClick={() => window.print()}>Print receipt</button><button className="btn primary" onClick={() => setStep(1)}>Book another appointment</button></div>
    </div>;
  };

  return <main className="booking-page"><div className="booking-container"><Stepper step={step}/>{body()}</div></main>;
}

function StatusPill({ status }) {
  return <span className={`status ${status.toLowerCase().replace("-", "")}`}><i></i>{status}</span>;
}

function LookupScreen({ navigate }) {
  const [found, setFound] = useState(false);
  const [modal, setModal] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  return <main className="lookup-page">
    <div className="lookup-hero"><p className="eyebrow">Appointment services</p><h1>Manage your booking</h1><p>Find, review, or cancel an existing appointment.</p></div>
    <div className="lookup-shell">
      <section className="lookup-card"><div className="lookup-card-head"><span className="outline-icon"><Icon name="search"/></span><div><h2>Find your appointment</h2><p>Enter the details from your confirmation message.</p></div></div>
        <form onSubmit={e => { e.preventDefault(); setFound(true); }}>
          <label className="field"><span>Booking code</span><input className="mono" defaultValue="MED-8492-AX" placeholder="e.g. MED-8492-AX"/></label>
          <label className="field"><span>Phone number</span><div className="phone-field"><span>+84</span><input defaultValue="912 345 678"/></div></label>
          <button className="btn primary wide"><Icon name="search" size={16}/>Find appointment</button>
        </form>
        <p className="secure-note"><Icon name="shield" size={15}/> Your booking details are securely protected.</p>
      </section>
      {found && <section className="found-card">
        <div className="found-head"><div><span className="micro-label">APPOINTMENT FOUND</span><h2>Wednesday, May 14</h2></div><StatusPill status={cancelled ? "Cancelled" : "Confirmed"}/></div>
        <div className="found-body"><div className="found-doctor"><span className="avatar coral">LT</span><div><strong>Dr. Linh Tran</strong><span>General Medicine</span><small>District 3 Medical Center</small></div></div>
          <div className="appointment-facts"><div><Icon name="clock"/><span><small>TIME</small><strong>09:30–10:00 ICT</strong></span></div><div><Icon name="user"/><span><small>PATIENT</small><strong>Nguyen Minh Anh</strong></span></div><div><Icon name="clipboard"/><span><small>BOOKING CODE</small><strong className="mono">MED-8492-AX</strong></span></div></div>
        </div>
        {!cancelled && <div className="found-actions"><button className="btn text" onClick={() => navigate("appointmentDetail")}>View full details <Icon name="chevron-right" size={14}/></button><button className="btn danger-outline" onClick={() => setModal(true)}>Cancel booking</button></div>}
        {cancelled && <div className="cancelled-message">This appointment has been cancelled. A confirmation was sent to your email.</div>}
      </section>}
    </div>
    <div className="lookup-help"><span>Can't find your appointment?</span><strong>Call 028 7300 2268</strong><i></i><strong>support@medistra.vn</strong></div>
    {modal && <div className="modal-backdrop" onMouseDown={() => setModal(false)}><section className="modal" role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}>
      <div className="modal-head"><div><h2>Cancel this booking?</h2><p>This action cannot be undone.</p></div><button aria-label="Close" onClick={() => setModal(false)}><Icon name="x"/></button></div>
      <div className="modal-appointment"><span className="date-tile"><b>14</b><small>MAY</small></span><div><strong>Dr. Linh Tran</strong><span>Wednesday, May 14 at 09:30</span></div></div>
      <label className="field"><span>Reason for cancellation <b>*</b></span><select defaultValue=""><option value="" disabled>Select a reason</option><option>Schedule conflict</option><option>Feeling better</option><option>Booked another provider</option><option>Other</option></select></label>
      <label className="field"><span>Additional details <em>Optional</em></span><textarea rows={3} placeholder="Let us know anything else" /></label>
      <div className="modal-warning">You may be charged a fee when cancelling less than 4 hours before your appointment.</div>
      <div className="modal-actions"><button className="btn secondary" onClick={() => setModal(false)}>Keep appointment</button><button className="btn danger" onClick={() => { setCancelled(true); setModal(false); }}>Yes, cancel booking</button></div>
    </section></div>}
  </main>;
}

function AppointmentDetailScreen({ navigate }) {
  const [modal, setModal] = useState(false);
  return <main className="appointment-detail-page"><div className="detail-breadcrumb"><button onClick={() => navigate("lookup")}>Manage booking</button><Icon name="chevron-right" size={13}/><span>MED-8492-AX</span></div><div className="appointment-detail-title"><div><p className="eyebrow">Appointment details</p><h1>Wednesday, May 14</h1><p>Booking created on 12 May 2025 at 14:22.</p></div><StatusPill status="Confirmed"/></div><div className="appointment-detail-grid"><section className="appointment-main-card"><div className="appointment-doctor-large"><span className="avatar coral profile-avatar">LT</span><div><small>GENERAL MEDICINE</small><h2>Dr. Linh Tran</h2><p>District 3 Medical Center</p></div></div><div className="appointment-info-grid"><div><span><Icon name="calendar"/></span><div><small>DATE</small><strong>Wednesday, May 14, 2025</strong></div></div><div><span><Icon name="clock"/></span><div><small>TIME</small><strong className="tabular">09:30–10:00 ICT</strong></div></div><div><span><Icon name="note"/></span><div><small>SERVICE</small><strong>General consultation</strong></div></div><div><span><Icon name="user"/></span><div><small>PATIENT</small><strong>Nguyen Minh Anh</strong></div></div></div><div className="appointment-note"><strong>Patient note</strong><p>Recurring headaches for the past week, mostly in the afternoon.</p></div></section><aside><section className="booking-code-card"><small>BOOKING CODE</small><strong className="mono">MED-8492-AX</strong><button><Icon name="copy" size={15}/>Copy code</button></section><section className="payment-card"><div><span>Consultation fee</span><strong className="price">450,000 VND</strong></div><p>Payment is collected at the clinic after your visit.</p></section><section className="detail-help"><h3>Need assistance?</h3><p>Call our patient services team.</p><strong>028 7300 2268</strong></section></aside></div><div className="appointment-detail-actions"><button className="btn secondary" onClick={() => window.print()}>Print appointment</button><button className="btn danger-outline" onClick={() => setModal(true)}>Cancel booking</button></div>{modal && <div className="modal-backdrop"><section className="modal"><div className="modal-head"><div><h2>Cancel this appointment?</h2><p>Please tell us why you need to cancel.</p></div><button onClick={() => setModal(false)}><Icon name="x"/></button></div><label className="field"><span>Reason</span><select><option>Schedule conflict</option><option>Feeling better</option><option>Other</option></select></label><div className="modal-warning">Cancellation is allowed until 07:30 on the appointment date.</div><div className="modal-actions"><button className="btn secondary" onClick={() => setModal(false)}>Keep appointment</button><button className="btn danger" onClick={() => setModal(false)}>Cancel appointment</button></div></section></div>}</main>;
}

function AuthScreen({ mode, navigate, onAuthenticated, staff = false }) {
  const [sent, setSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    if (mode === "forgot") setSent(true);
    else onAuthenticated();
  };
  const content = {
    login: staff ? { eyebrow: "Clinical workspace", title: "Staff sign in", description: "Use your authorized clinic account to continue." } : { eyebrow: "Patient portal", title: "Welcome back", description: "Sign in to manage appointments and your health profile." },
    register: { eyebrow: "Create patient account", title: "Get started with Medistra", description: "One secure account for all your appointments." },
    forgot: { eyebrow: "Account recovery", title: "Reset your password", description: "We'll email you a secure link to create a new password." },
  }[mode];

  return <main className="auth-page">
    <section className="auth-aside">
      <div><p className="eyebrow">Care made simpler</p><h1>Your healthcare,<br/>organized in one place.</h1><p>Book trusted clinicians, receive timely reminders, and manage your appointments securely.</p></div>
      <ul><li><span><Icon name="calendar"/></span><div><strong>Book in minutes</strong><small>See real-time clinician availability.</small></div></li><li><span><Icon name="shield"/></span><div><strong>Private and secure</strong><small>Your personal data stays protected.</small></div></li><li><span><Icon name="activity"/></span><div><strong>Stay informed</strong><small>Track every appointment in one place.</small></div></li></ul>
      <div className="auth-quote"><p>“A clear, reliable booking experience for our patients and clinical teams.”</p><span>MEDISTRA PATIENT SERVICES</span></div>
    </section>
    <section className="auth-main">
      <div className="auth-card">
        <div className="auth-title"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p>{content.description}</p></div>
        {sent ? <div className="email-sent"><span><Icon name="mail" size={25}/></span><h2>Check your email</h2><p>We sent a password reset link to <strong>minhanh@email.com</strong>. The link expires in 30 minutes.</p><button className="btn primary wide" onClick={() => navigate("login")}>Return to sign in</button><button className="btn text" onClick={() => setSent(false)}>Didn't receive it? Send again</button></div> :
        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && <><label className="field"><span>Full name</span><div className="input-icon"><Icon name="user" size={16}/><input required placeholder="Your full name"/></div></label><label className="field"><span>Phone number</span><div className="phone-field"><span>+84</span><input required placeholder="912 345 678"/></div></label></>}
          <label className="field"><span>Email address</span><div className="input-icon"><Icon name="mail" size={16}/><input required type="email" defaultValue={mode === "login" ? staff ? "manager@medistra.vn" : "minhanh@email.com" : ""} placeholder="name@example.com"/></div></label>
          {mode !== "forgot" && <label className="field"><span>Password {mode === "login" && !staff && <button type="button" className="field-link" onClick={() => navigate("forgot")}>Forgot password?</button>}</span><div className="input-icon"><Icon name="lock" size={16}/><input required type={showPassword ? "text" : "password"} defaultValue={mode === "login" ? "medistra123" : ""} placeholder={mode === "register" ? "At least 8 characters" : "Your password"}/><button type="button" className="password-toggle" aria-label="Show password" onClick={() => setShowPassword(!showPassword)}><Icon name="eye" size={16}/></button></div></label>}
          {mode === "register" && <><div className="password-rules"><span className="valid"><Icon name="check" size={12}/>8+ characters</span><span className="valid"><Icon name="check" size={12}/>One number</span><span><Icon name="check" size={12}/>One uppercase letter</span></div><label className="consent"><input type="checkbox" required/><span>I agree to the <u>Terms of Service</u> and <u>Privacy Policy</u>.</span></label></>}
          {mode === "login" && <label className="remember"><span><input type="checkbox" defaultChecked/> Keep me signed in</span><small>Only use on a private device</small></label>}
          <button className="btn primary wide auth-submit">{mode === "login" ? "Sign in securely" : mode === "register" ? "Create my account" : "Send reset link"}<Icon name="chevron-right" size={15}/></button>
        </form>}
        {!staff && !sent && mode !== "forgot" && <p className="auth-switch">{mode === "login" ? "New to Medistra?" : "Already have an account?"}<button onClick={() => navigate(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create an account" : "Sign in"}</button></p>}
        {mode === "forgot" && !sent && <p className="auth-switch"><button onClick={() => navigate("login")}><Icon name="chevron-left" size={14}/>Back to sign in</button></p>}
        <div className="auth-security"><Icon name="shield" size={14}/>Protected by medical-grade data security</div>
      </div>
    </section>
  </main>;
}

const appointments = [
  { code: "MED-8492-AX", patient: "Nguyen Minh Anh", phone: "0912 345 678", doctor: "Dr. Linh Tran", specialty: "General Medicine", date: "14 May 2025", time: "09:30", status: "Confirmed" },
  { code: "MED-2841-QP", patient: "Tran Thi Thanh", phone: "0903 882 105", doctor: "Dr. An Minh", specialty: "Cardiology", date: "14 May 2025", time: "10:00", status: "Pending" },
  { code: "MED-7730-KL", patient: "Le Hoang Nam", phone: "0988 402 912", doctor: "Dr. Ngoc Khanh", specialty: "Dermatology", date: "14 May 2025", time: "10:30", status: "Confirmed" },
  { code: "MED-1598-JT", patient: "Pham Thu Huong", phone: "0918 555 203", doctor: "Dr. Linh Tran", specialty: "General Medicine", date: "14 May 2025", time: "11:00", status: "No-Show" },
  { code: "MED-6412-BN", patient: "Vo Quang Huy", phone: "0907 310 884", doctor: "Dr. An Minh", specialty: "Cardiology", date: "14 May 2025", time: "13:30", status: "Pending" },
  { code: "MED-3387-WC", patient: "Do Mai Lan", phone: "0932 728 410", doctor: "Dr. Ngoc Khanh", specialty: "Dermatology", date: "14 May 2025", time: "14:00", status: "Completed" },
];

function PatientPortal({ active, navigate, onLogout }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [saved, setSaved] = useState(false);
  return <div className="patient-shell">
    <aside className={`patient-sidebar ${mobileNav ? "open" : ""}`}>
      <div className="patient-side-head"><button onClick={() => navigate("booking")}><Brand/></button><button className="patient-side-close" onClick={() => setMobileNav(false)}><Icon name="x"/></button></div>
      <nav><span>MY HEALTH</span><button className={active === "dashboard" ? "active" : ""} onClick={() => navigate("portal")}><Icon name="home"/>Overview</button><button onClick={() => navigate("booking")}><Icon name="plus"/>Book appointment</button><button><Icon name="calendar"/>Appointments<i>2</i></button><span>ACCOUNT</span><button className={active === "profile" ? "active" : ""} onClick={() => navigate("profile")}><Icon name="user"/>Personal details</button><button className={active === "security" ? "active" : ""} onClick={() => navigate("security")}><Icon name="settings"/>Security</button></nav>
      <div className="patient-support"><span><Icon name="phone"/></span><div><strong>Need assistance?</strong><small>028 7300 2268</small><small>Mon–Sat, 07:00–20:00</small></div></div>
      <button className="patient-logout" onClick={onLogout}><Icon name="logout"/>Sign out</button>
    </aside>
    <main className="patient-main">
      <header className="patient-topbar"><button className="patient-menu" onClick={() => setMobileNav(true)}><Icon name="menu"/></button><div><span>Patient portal</span><strong>{active === "dashboard" ? "Overview" : active === "profile" ? "Personal details" : "Security"}</strong></div><button className="notification"><Icon name="activity"/><i/></button><button className="account-button"><span className="avatar teal small">NA</span><span>Minh Anh</span><Icon name="chevron-right" size={14}/></button></header>
      {active === "dashboard" ? <div className="patient-content">
        <section className="welcome-row"><div><p className="eyebrow">Wednesday, 14 May</p><h1>Good morning, Minh Anh</h1><p>Here's an overview of your upcoming care.</p></div><button className="btn primary" onClick={() => navigate("booking")}><Icon name="plus" size={16}/>Book appointment</button></section>
        <section className="next-appointment">
          <div className="next-label"><span>NEXT APPOINTMENT</span><StatusPill status="Confirmed"/></div>
          <div className="next-body"><div className="next-date"><strong>14</strong><span>MAY</span><small>WEDNESDAY</small></div><div className="next-doctor"><span className="avatar coral">LT</span><div><h2>Dr. Linh Tran</h2><p>General Medicine · District 3 Medical Center</p><span><Icon name="clock" size={16}/>09:30–10:00 ICT</span></div></div><div className="next-code"><small>BOOKING CODE</small><strong className="mono">MED-8492-AX</strong><button><Icon name="copy" size={14}/>Copy</button></div></div>
          <div className="next-actions"><span><Icon name="clock" size={14}/>Starts in 2 hours 15 minutes</span><div><button className="btn secondary">View details</button><button className="btn danger-outline" onClick={() => setCancelModal(true)}>Cancel</button></div></div>
        </section>
        <div className="portal-grid">
          <section className="portal-card"><div className="portal-card-head"><div><h2>Appointment history</h2><p>Your recent visits and bookings.</p></div><button>View all <Icon name="chevron-right" size={14}/></button></div>
            <div className="history-list"><div><span className="history-icon"><Icon name="calendar"/></span><div><strong>Dr. Ngoc Khanh</strong><small>Dermatology · 28 Apr 2025, 14:00</small></div><StatusPill status="Completed"/></div><div><span className="history-icon"><Icon name="calendar"/></span><div><strong>Dr. An Minh</strong><small>Cardiology · 12 Mar 2025, 10:30</small></div><StatusPill status="Completed"/></div><div><span className="history-icon"><Icon name="calendar"/></span><div><strong>Dr. Linh Tran</strong><small>General Medicine · 03 Feb 2025, 09:00</small></div><StatusPill status="Cancelled"/></div></div>
          </section>
          <aside className="portal-card quick-book"><div className="portal-card-head"><div><h2>Quick booking</h2><p>Book with a recent doctor.</p></div></div>{doctors.slice(0,2).map(d => <button key={d.name} onClick={() => navigate("booking")}><span className={`avatar ${d.color}`}>{d.initials}</span><span><strong>{d.name}</strong><small>{d.specialty}</small></span><Icon name="chevron-right" size={15}/></button>)}<button className="find-doctor" onClick={() => navigate("booking")}>Find another doctor</button></aside>
        </div>
        <section className="portal-tip"><Icon name="shield"/><div><strong>Prepare for your appointment</strong><p>Arrive 10 minutes early and bring your ID, insurance card, and current medication list.</p></div><button>Read patient guide <Icon name="chevron-right" size={14}/></button></section>
      </div> : active === "profile" ? <div className="patient-content profile-content">
        <section className="welcome-row"><div><p className="eyebrow">Account settings</p><h1>Personal details</h1><p>Keep your contact and health information up to date.</p></div></section>
        {saved && <div className="saved-banner"><Icon name="check"/>Your changes have been saved successfully.</div>}
        <form className="profile-form" onSubmit={e => { e.preventDefault(); setSaved(true); }}>
          <div className="profile-section-head"><div><h2>Basic information</h2><p>Used to identify you when managing care.</p></div><span className="avatar teal">NA</span></div>
          <div className="profile-fields"><label className="field"><span>Full name</span><input defaultValue="Nguyen Minh Anh"/></label><label className="field"><span>Date of birth</span><input type="date" defaultValue="1993-08-24"/></label><label className="field"><span>Gender</span><select defaultValue="female"><option value="female">Female</option><option>Male</option><option>Prefer not to say</option></select></label><label className="field"><span>National ID</span><input defaultValue="079193002841"/></label></div>
          <div className="profile-divider"/><div className="profile-section-head"><div><h2>Contact details</h2><p>We'll use these details for confirmations and reminders.</p></div></div>
          <div className="profile-fields"><label className="field"><span>Phone number</span><div className="phone-field"><span>+84</span><input defaultValue="912 345 678"/></div></label><label className="field"><span>Email address</span><input type="email" defaultValue="minhanh@email.com"/></label><label className="field field-wide"><span>Home address</span><input defaultValue="28 Vo Van Tan, Ward 6, District 3, Ho Chi Minh City"/></label></div>
          <div className="profile-divider"/><div className="profile-section-head"><div><h2>Emergency contact</h2><p>Someone we may contact in urgent situations.</p></div></div>
          <div className="profile-fields"><label className="field"><span>Contact name</span><input defaultValue="Nguyen Van Thanh"/></label><label className="field"><span>Relationship</span><select defaultValue="parent"><option value="parent">Parent</option><option>Spouse</option><option>Sibling</option></select></label><label className="field"><span>Phone number</span><input defaultValue="0903 456 221"/></label></div>
          <div className="profile-actions"><button type="button" className="btn secondary">Discard changes</button><button className="btn primary">Save changes</button></div>
        </form>
      </div> : <div className="patient-content profile-content"><section className="welcome-row"><div><p className="eyebrow">Account settings</p><h1>Security</h1><p>Manage your password, verified contact details, and active sessions.</p></div></section><div className="security-stack"><section className="security-card"><div className="security-card-head"><span><Icon name="lock"/></span><div><h2>Password</h2><p>Last changed 3 months ago</p></div><button className="btn secondary compact">Change password</button></div><div className="security-detail"><span>Password strength</span><strong>Strong</strong><i><b/></i></div></section><section className="security-card"><div className="security-card-head"><span><Icon name="mail"/></span><div><h2>Email verification</h2><p>Used for appointment confirmations and account recovery.</p></div><StatusPill status="Confirmed"/></div><div className="verified-row"><strong>minhanh@email.com</strong><span><Icon name="check" size={13}/>Verified</span></div></section><section className="security-card"><div className="security-card-head"><span><Icon name="shield"/></span><div><h2>Active sessions</h2><p>Devices currently signed in to your account.</p></div><button className="btn danger-outline compact">Sign out all others</button></div><div className="session-row"><span className="outline-icon"><Icon name="home"/></span><div><strong>Chrome on macOS</strong><small>Ho Chi Minh City · Current session</small></div><span className="status confirmed"><i/>Active now</span></div><div className="session-row"><span className="outline-icon"><Icon name="phone"/></span><div><strong>Safari on iPhone</strong><small>Ho Chi Minh City · 12 May, 21:04</small></div><button>Revoke</button></div></section><section className="security-card danger-zone"><div><div><h2>Deactivate account</h2><p>Your future bookings must be cancelled before deactivation.</p></div><button className="btn danger-outline">Deactivate account</button></div></section></div></div>}
    </main>
    {cancelModal && <div className="modal-backdrop"><section className="modal"><div className="modal-head"><div><h2>Cancel this booking?</h2><p>Wednesday, May 14 at 09:30 with Dr. Linh Tran</p></div><button onClick={() => setCancelModal(false)}><Icon name="x"/></button></div><label className="field"><span>Reason for cancellation</span><select><option>Schedule conflict</option><option>Feeling better</option><option>Other</option></select></label><div className="modal-warning">Cancel at least 4 hours before your visit to avoid a late cancellation fee.</div><div className="modal-actions"><button className="btn secondary" onClick={() => setCancelModal(false)}>Keep appointment</button><button className="btn danger">Cancel appointment</button></div></section></div>}
  </div>;
}

function AdminManagement({ page, navigate, onLogout }) {
  const [sideOpen, setSideOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [toast, setToast] = useState(false);
  const titles = { dashboard: ["Dashboard", "Clinic performance and today's operational overview."], doctors: ["Doctors", "Manage clinician profiles, specialties, and availability."], specialties: ["Specialties", "Manage clinical departments and public visibility."], services: ["Services", "Configure appointment services, duration, and pricing."], schedules: ["Working schedules", "Set recurring hours, slot duration, and schedule exceptions."], staff: ["Staff accounts", "Manage workspace access, roles, and account status."], audit: ["Audit log", "Review administrative actions and sensitive data changes."] };
  const nav = (target) => { setSideOpen(false); navigate(target); };
  const SideNav = () => <aside className={`sidebar ${sideOpen ? "open" : ""}`}><div className="sidebar-brand"><Brand inverse/><button onClick={() => setSideOpen(false)}><Icon name="x"/></button></div><div className="workspace-label">WORKSPACE</div><nav><button className={page === "dashboard" ? "active" : ""} onClick={() => nav("adminDashboard")}><Icon name="grid"/>Overview</button><button onClick={() => nav("admin")}><Icon name="calendar"/>Appointments<span>12</span></button><button className={page === "doctors" ? "active" : ""} onClick={() => nav("adminDoctors")}><Icon name="clipboard"/>Doctors</button></nav><div className="workspace-label lower">MANAGEMENT</div><nav><button className={page === "specialties" ? "active" : ""} onClick={() => nav("adminSpecialties")}><Icon name="activity"/>Specialties</button><button className={page === "services" ? "active" : ""} onClick={() => nav("adminServices")}><Icon name="note"/>Services</button><button className={page === "schedules" ? "active" : ""} onClick={() => nav("adminSchedules")}><Icon name="clock"/>Schedules</button><button className={page === "staff" ? "active" : ""} onClick={() => nav("adminStaff")}><Icon name="users"/>Staff accounts</button><button className={page === "audit" ? "active" : ""} onClick={() => nav("adminAudit")}><Icon name="shield"/>Audit log</button></nav><div className="sidebar-user"><span className="avatar teal small">HN</span><div><strong>Ha Nguyen</strong><small>Clinic Manager</small></div><button aria-label="Log out" onClick={onLogout}><Icon name="logout"/></button></div></aside>;
  return <div className="admin-shell"><SideNav/><main className="admin-main"><header className="admin-topbar"><button className="admin-menu" onClick={() => setSideOpen(true)}><Icon name="menu"/></button><div className="breadcrumb"><span>Workspace</span><i>/</i><strong>{titles[page][0]}</strong></div><div className="admin-top-actions"><button className="icon-button"><Icon name="search"/></button><span className="top-date"><Icon name="calendar" size={16}/>Wednesday, 14 May 2025</span><span className="avatar teal small">HN</span></div></header><div className="admin-content">
    {page === "dashboard" ? <><div className="page-title-row"><div><h1>Good morning, Ha</h1><p>{titles[page][1]}</p></div><button className="btn secondary"><Icon name="calendar" size={15}/>14–20 May 2025</button></div><div className="kpi-grid"><div className="kpi"><span className="kpi-icon neutral"><Icon name="calendar"/></span><div><small>APPOINTMENTS TODAY</small><strong>24</strong><p><b>+12%</b> from yesterday</p></div></div><div className="kpi"><span className="kpi-icon green"><Icon name="check"/></span><div><small>COMPLETED</small><strong>11</strong><p>46% completion rate</p></div></div><div className="kpi"><span className="kpi-icon amber"><Icon name="clock"/></span><div><small>AWAITING ACTION</small><strong>5</strong><p>Needs confirmation</p></div></div><div className="kpi"><span className="kpi-icon slate"><Icon name="users"/></span><div><small>ACTIVE DOCTORS</small><strong>18</strong><p>Across 6 specialties</p></div></div></div><div className="dashboard-grid"><section className="admin-panel"><div className="panel-head"><div><h2>Appointments this week</h2><p>Monday to Sunday · Asia/Ho_Chi_Minh</p></div><span className="status confirmed"><i/>108 total</span></div><div className="bar-chart">{[["MON",62],["TUE",78],["WED",92],["THU",70],["FRI",82],["SAT",48],["SUN",24]].map(([d,v]) => <div key={d}><span style={{height:`${v}%`}}/><b>{d}</b></div>)}</div></section><section className="admin-panel"><div className="panel-head"><div><h2>Appointment status</h2><p>Current week breakdown</p></div></div><div className="status-breakdown">{[["Confirmed","52","green"],["Completed","31","teal"],["Pending","14","amber"],["Cancelled","8","rose"],["No-show","3","slate"]].map(x => <div key={x[0]}><i className={x[2]}/><span>{x[0]}</span><strong>{x[1]}</strong></div>)}</div></section></div><section className="admin-panel today-panel"><div className="panel-head"><div><h2>Next appointments</h2><p>Upcoming visits requiring attention.</p></div><button onClick={() => navigate("admin")}>View schedule <Icon name="chevron-right" size={14}/></button></div><div className="mini-appointments">{appointments.slice(0,4).map(a => <div key={a.code}><strong className="tabular">{a.time}</strong><span className="avatar coral small">{a.patient.split(" ").map(x=>x[0]).slice(-2).join("")}</span><div><b>{a.patient}</b><small>{a.doctor} · {a.specialty}</small></div><StatusPill status={a.status}/></div>)}</div></section></> :
    <><div className="page-title-row"><div><h1>{titles[page][0]}</h1><p>{titles[page][1]}</p></div>{page !== "audit" && <button className="btn primary" onClick={() => setDialog(true)}><Icon name="plus" size={16}/>Add {page === "specialties" ? "specialty" : page === "schedules" ? "schedule" : page === "staff" ? "staff member" : page.slice(0,-1)}</button>}</div>{page === "schedules" ? <ScheduleAdmin/> : page === "staff" ? <StaffAdmin/> : page === "audit" ? <AuditAdmin/> : <CatalogAdmin page={page}/>}</>}
  </div></main>{dialog && <EntityDialog page={page} close={() => setDialog(false)} save={() => { setDialog(false); setToast(true); setTimeout(() => setToast(false), 2500); }}/>} {toast && <div className="toast-success"><span><Icon name="check" size={15}/></span><div><strong>Changes saved</strong><small>The new record is now available.</small></div><button onClick={() => setToast(false)}><Icon name="x" size={14}/></button></div>}</div>;
}

function CatalogAdmin({ page }) {
  const rows = page === "doctors" ? [["Dr. Linh Tran","General Medicine","MD-10284","Active"],["Dr. An Minh","Cardiology","MD-08421","Active"],["Dr. Ngoc Khanh","Dermatology","MD-11409","Active"],["Dr. Phuong Ha","Pediatrics","MD-09217","Inactive"]] : page === "specialties" ? specialties.slice(0,5).map(s => [s.name,`${s.doctors} doctors`,s.slug,"Active"]) : [["General consultation","General Medicine","450,000 VND","Active"],["Cardiology consultation","Cardiology","650,000 VND","Active"],["ECG assessment","Cardiology","350,000 VND","Active"],["Skin consultation","Dermatology","550,000 VND","Inactive"]];
  return <section className="table-card management-table"><div className="table-toolbar"><div className="table-title"><h2>All {page}</h2><span>{rows.length} records</span></div><div className="table-tools"><div className="search-box"><Icon name="search" size={16}/><input placeholder={`Search ${page}`}/></div><button className="btn secondary compact"><Icon name="filter" size={15}/>Filter</button></div></div><div className="table-scroll"><table><thead><tr><th><input type="checkbox"/></th><th>{page === "doctors" ? "DOCTOR" : page === "specialties" ? "SPECIALTY" : "SERVICE"}</th><th>{page === "doctors" ? "SPECIALTY" : page === "specialties" ? "ASSIGNMENT" : "SPECIALTY"}</th><th>{page === "doctors" ? "LICENSE" : page === "specialties" ? "SLUG" : "PRICE"}</th><th>STATUS</th><th>UPDATED</th><th></th></tr></thead><tbody>{rows.map((r,i) => <tr key={r[0]}><td><input type="checkbox"/></td><td><strong>{r[0]}</strong>{page === "doctors" && <small>{i%2 ? "an.minh@medistra.vn" : "clinician@medistra.vn"}</small>}</td><td><strong>{r[1]}</strong></td><td><strong className={page === "services" ? "tabular":""}>{r[2]}</strong></td><td><span className={`status ${r[3] === "Active" ? "confirmed" : "noshow"}`}><i/>{r[3]}</span></td><td><small>14 May 2025</small></td><td><button className="more-button"><Icon name="more"/></button></td></tr>)}</tbody></table></div><div className="table-footer"><span>Showing 1–{rows.length} of {rows.length}</span><div><button disabled><Icon name="chevron-left" size={15}/></button><button className="active">1</button><button disabled><Icon name="chevron-right" size={15}/></button></div></div></section>;
}

function StaffAdmin() {
  return <section className="table-card management-table"><div className="table-toolbar"><div className="table-title"><h2>Workspace users</h2><span>5 accounts</span></div><div className="table-tools"><div className="search-box"><Icon name="search" size={16}/><input placeholder="Search staff"/></div><button className="btn secondary compact"><Icon name="filter" size={15}/>Role</button></div></div><div className="table-scroll"><table><thead><tr><th><input type="checkbox"/></th><th>STAFF MEMBER</th><th>ROLE</th><th>STATUS</th><th>LAST ACTIVE</th><th>CREATED</th><th></th></tr></thead><tbody>{[["Ha Nguyen","ha.nguyen@medistra.vn","Admin","Active","Now"],["Minh Chau","minh.chau@medistra.vn","Staff","Active","12 min ago"],["Lan Pham","lan.pham@medistra.vn","Staff","Active","Yesterday"],["Tuan Le","tuan.le@medistra.vn","Staff","Inactive","08 May"]].map((r,i)=><tr key={r[1]}><td><input type="checkbox"/></td><td><div className="staff-cell"><span className="avatar teal small">{r[0].split(" ").map(x=>x[0]).join("")}</span><span><strong>{r[0]}</strong><small>{r[1]}</small></span></div></td><td><span className={`role-badge ${r[2].toLowerCase()}`}>{r[2]}</span></td><td><span className={`status ${r[3]==="Active" ? "confirmed":"noshow"}`}><i/>{r[3]}</span></td><td><strong>{r[4]}</strong></td><td><small>{i+2} May 2025</small></td><td><button className="more-button"><Icon name="more"/></button></td></tr>)}</tbody></table></div><div className="table-footer"><span>Showing 1–4 of 5</span><div><button className="active">1</button><button>2</button></div></div></section>;
}

function AuditAdmin() {
  return <><div className="audit-filters"><div className="search-box"><Icon name="search" size={15}/><input placeholder="Search action, user, or entity"/></div><button className="btn secondary compact">All actions <Icon name="chevron-right" size={13}/></button><button className="btn secondary compact">All users <Icon name="chevron-right" size={13}/></button><button className="btn secondary compact"><Icon name="calendar" size={14}/>Last 7 days</button></div><section className="audit-list">{[["Appointment status changed","Ha Nguyen","MED-8492-AX","Pending → Confirmed","14 May, 08:45","green"],["Service price updated","Ha Nguyen","General consultation","400,000 → 450,000 VND","13 May, 16:20","amber"],["Doctor profile updated","Minh Chau","Dr. Linh Tran","Specialty and biography changed","13 May, 14:12","teal"],["Staff account deactivated","Ha Nguyen","Tuan Le","Account status: Inactive","12 May, 17:05","rose"],["Schedule exception created","Lan Pham","Dr. An Minh","19 May · Day off","12 May, 10:32","slate"]].map(x=><article key={x[0]}><span className={`audit-icon ${x[5]}`}><Icon name={x[5]==="rose" ? "users" : x[5]==="amber" ? "edit" : "activity"}/></span><div><h3>{x[0]}</h3><p><strong>{x[1]}</strong> · {x[2]}</p><small>{x[3]}</small></div><time>{x[4]}</time><button><Icon name="chevron-right" size={14}/></button></article>)}</section></>;
}

function ScheduleAdmin() {
  return <div className="schedule-admin"><aside className="doctor-selector"><div className="search-box"><Icon name="search" size={15}/><input placeholder="Search doctors"/></div>{publicDoctors.map((d,i) => <button className={i===0 ? "active" : ""} key={d.name}><span className={`avatar ${d.color} small`}>{d.initials}</span><span><strong>{d.name}</strong><small>{d.specialty}</small></span><Icon name="chevron-right" size={14}/></button>)}</aside><section className="schedule-editor"><div className="schedule-editor-head"><div><h2>Dr. Linh Tran</h2><p>Recurring weekly schedule · Effective from 01 Jan 2025</p></div><button className="btn secondary compact"><Icon name="edit" size={14}/>Edit schedule</button></div><div className="week-schedule">{[["Monday","08:00–11:30","13:30–17:00"],["Tuesday","08:00–11:30","13:30–17:00"],["Wednesday","08:00–11:30","13:30–17:00"],["Thursday","08:00–11:30","—"],["Friday","08:00–11:30","13:30–16:00"],["Saturday","08:00–12:00","—"],["Sunday","Day off","—"]].map((r,i) => <div key={r[0]} className={i===6 ? "off":""}><strong>{r[0]}</strong><span>{r[1]}</span><span>{r[2]}</span><small>30 min slots</small><button><Icon name="more"/></button></div>)}</div><div className="exceptions-head"><div><h3>Schedule exceptions</h3><p>Days off and custom working hours.</p></div><button className="btn secondary compact"><Icon name="plus" size={13}/>Add exception</button></div><div className="exceptions-list"><div><span className="date-tile"><b>19</b><small>MAY</small></span><div><strong>Day off</strong><small>Personal leave</small></div><span className="status cancelled"><i/>Day off</span><button><Icon name="more"/></button></div><div><span className="date-tile"><b>24</b><small>MAY</small></span><div><strong>Custom hours</strong><small>08:00–11:00 only</small></div><span className="status pending"><i/>Modified</span><button><Icon name="more"/></button></div></div></section></div>;
}

function EntityDialog({ page, close, save }) {
  const label = page === "schedules" ? "working schedule" : page === "staff" ? "staff member" : page === "specialties" ? "specialty" : page.slice(0,-1);
  return <div className="modal-backdrop" onMouseDown={close}><section className="modal entity-modal" onMouseDown={e => e.stopPropagation()}><div className="modal-head"><div><h2>Add {label}</h2><p>Complete the information below. Required fields are marked.</p></div><button onClick={close}><Icon name="x"/></button></div><div className="entity-form">
    {page === "staff" ? <><label className="field"><span>Full name <b>*</b></span><input placeholder="Staff full name"/></label><label className="field"><span>Email <b>*</b></span><input type="email" placeholder="name@medistra.vn"/></label><label className="field"><span>Role</span><select><option>Staff</option><option>Admin</option></select></label><label className="field"><span>Phone</span><input placeholder="+84 912 345 678"/></label><div className="permission-box full"><strong>Staff permissions</strong><span><Icon name="check" size={13}/>View and process appointments</span><span><Icon name="check" size={13}/>View clinic statistics</span><span><Icon name="x" size={13}/>Cannot manage administrator accounts</span></div></> : page === "doctors" ? <><label className="field"><span>Full name <b>*</b></span><input placeholder="Doctor full name"/></label><label className="field"><span>Medical title</span><input placeholder="MD, PhD"/></label><label className="field"><span>License number <b>*</b></span><input placeholder="MD-00000"/></label><label className="field"><span>Specialty <b>*</b></span><select><option>General Medicine</option><option>Cardiology</option></select></label><label className="field"><span>Email</span><input type="email" placeholder="doctor@medistra.vn"/></label><label className="field"><span>Phone</span><input placeholder="+84"/></label><label className="field full"><span>Professional biography</span><textarea rows={3} placeholder="Education, experience, and clinical focus"/></label></> : page === "schedules" ? <><label className="field"><span>Doctor <b>*</b></span><select><option>Dr. Linh Tran</option><option>Dr. An Minh</option></select></label><label className="field"><span>Day of week</span><select><option>Monday</option><option>Tuesday</option></select></label><label className="field"><span>Start time</span><input type="time" defaultValue="08:00"/></label><label className="field"><span>End time</span><input type="time" defaultValue="11:30"/></label><label className="field"><span>Slot duration</span><select><option>30 minutes</option><option>45 minutes</option></select></label><div className="validation-note"><Icon name="shield" size={14}/>Overlapping schedules will be rejected.</div></> : <><label className="field"><span>Name <b>*</b></span><input placeholder="Enter a name"/></label><label className="field"><span>Status</span><select><option>Active</option><option>Inactive</option></select></label><label className="field full"><span>Description</span><textarea rows={3} placeholder="Internal and public description"/></label>{page === "services" && <><label className="field"><span>Specialty</span><select><option>General Medicine</option><option>Cardiology</option></select></label><label className="field"><span>Duration</span><select><option>30 minutes</option><option>45 minutes</option></select></label><label className="field"><span>Price (VND)</span><input placeholder="450,000"/></label></>}</>}
  </div><div className="modal-actions"><button className="btn secondary" onClick={close}>Cancel</button><button className="btn primary" onClick={save}>Save {label}</button></div></section></div>;
}

function AdminScreen({ navigate, onLogout, page = "appointments" }) {
  if (page !== "appointments") return <AdminManagement page={page} navigate={navigate} onLogout={onLogout}/>;
  const [drawer, setDrawer] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);
  return <div className="admin-shell">
    <aside className={`sidebar ${sideOpen ? "open" : ""}`}><div className="sidebar-brand"><Brand inverse/><button onClick={() => setSideOpen(false)}><Icon name="x"/></button></div>
      <div className="workspace-label">WORKSPACE</div><nav>
        <button onClick={() => navigate("adminDashboard")}><Icon name="grid"/>Overview</button><button className="active"><Icon name="calendar"/>Appointments<span>12</span></button><button><Icon name="users"/>Patients</button><button onClick={() => navigate("adminDoctors")}><Icon name="clipboard"/>Doctors</button>
      </nav><div className="workspace-label lower">MANAGEMENT</div><nav><button onClick={() => navigate("adminSpecialties")}><Icon name="activity"/>Specialties</button><button onClick={() => navigate("adminServices")}><Icon name="note"/>Services</button><button onClick={() => navigate("adminSchedules")}><Icon name="clock"/>Schedules</button><button onClick={() => navigate("adminStaff")}><Icon name="users"/>Staff accounts</button><button onClick={() => navigate("adminAudit")}><Icon name="shield"/>Audit log</button></nav>
      <div className="sidebar-user"><span className="avatar teal small">HN</span><div><strong>Ha Nguyen</strong><small>Clinic Manager</small></div><button aria-label="Log out" onClick={onLogout}><Icon name="logout"/></button></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><button className="admin-menu" onClick={() => setSideOpen(true)}><Icon name="menu"/></button><div className="breadcrumb"><span>Workspace</span><i>/</i><strong>Appointments</strong></div><div className="admin-top-actions"><button className="icon-button"><Icon name="search"/></button><span className="top-date"><Icon name="calendar" size={16}/>Wednesday, 14 May 2025</span><span className="avatar teal small">HN</span></div></header>
      <div className="admin-content">
        <div className="page-title-row"><div><h1>Appointments</h1><p>Manage today's patient schedule and bookings.</p></div><button className="btn primary"><Icon name="plus" size={16}/>New appointment</button></div>
        <div className="kpi-grid">
          <div className="kpi"><span className="kpi-icon neutral"><Icon name="calendar"/></span><div><small>TOTAL TODAY</small><strong>24</strong><p><b>+12%</b> from yesterday</p></div></div>
          <div className="kpi"><span className="kpi-icon amber"><Icon name="clock"/></span><div><small>PENDING</small><strong>5</strong><p>Needs confirmation</p></div></div>
          <div className="kpi"><span className="kpi-icon green"><Icon name="check"/></span><div><small>CONFIRMED</small><strong>16</strong><p>66% of total</p></div></div>
          <div className="kpi"><span className="kpi-icon slate"><Icon name="user"/></span><div><small>NO-SHOW</small><strong>3</strong><p>12.5% no-show rate</p></div></div>
        </div>
        <section className="table-card">
          <div className="table-toolbar"><div className="table-title"><h2>Today's schedule</h2><span>24 appointments</span></div><div className="table-tools"><div className="search-box"><Icon name="search" size={16}/><input placeholder="Search patient or code"/></div><button className="btn secondary compact"><Icon name="filter" size={15}/>Filter</button><button className="btn secondary compact">All doctors <Icon name="chevron-right" size={14}/></button></div></div>
          <div className="table-tabs"><button className="active">All <span>24</span></button><button>Pending <span>5</span></button><button>Confirmed <span>16</span></button><button>Completed <span>6</span></button></div>
          <div className="table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Select all"/></th><th>BOOKING CODE</th><th>PATIENT</th><th>DOCTOR / SPECIALTY</th><th>DATE & SLOT</th><th>STATUS</th><th>QUICK ACTIONS</th><th></th></tr></thead>
            <tbody>{appointments.map((a, i) => <tr key={a.code} onClick={() => setDrawer(a)}><td onClick={e => e.stopPropagation()}><input type="checkbox" aria-label={`Select ${a.patient}`}/></td><td><strong className="mono code">{a.code}</strong></td><td><strong>{a.patient}</strong><small>{a.phone}</small></td><td><strong>{a.doctor}</strong><small>{a.specialty}</small></td><td><strong className="tabular">{a.time}</strong><small>{a.date}</small></td><td><StatusPill status={a.status}/></td><td onClick={e => e.stopPropagation()}><div className="quick-actions">{a.status === "Pending" && <button className="quick confirm">Confirm</button>}{a.status === "Confirmed" && <button className="quick">Complete</button>}{(a.status === "Pending" || a.status === "Confirmed") && <button className="quick cancel">Cancel</button>}{(a.status === "Completed" || a.status === "No-Show") && <span>—</span>}</div></td><td><button className="more-button" aria-label="More actions"><Icon name="more"/></button></td></tr>)}</tbody>
          </table></div>
          <div className="table-footer"><span>Showing 1–6 of 24</span><div><button disabled><Icon name="chevron-left" size={15}/></button><button className="active">1</button><button>2</button><button>3</button><button>4</button><button><Icon name="chevron-right" size={15}/></button></div></div>
        </section>
      </div>
    </main>
    {drawer && <><div className="drawer-backdrop" onClick={() => setDrawer(null)}/><aside className="drawer">
      <div className="drawer-head"><div><span className="micro-label">APPOINTMENT DETAILS</span><h2>{drawer.code}</h2></div><button onClick={() => setDrawer(null)}><Icon name="x"/></button></div>
      <div className="drawer-status"><StatusPill status={drawer.status}/><span>Created 12 May, 14:22</span></div>
      <div className="drawer-patient"><span className="avatar coral">NA</span><div><h3>{drawer.patient}</h3><p><Icon name="phone" size={14}/>{drawer.phone}</p><p><Icon name="mail" size={14}/>minhanh@email.com</p></div></div>
      <div className="drawer-section"><h3>Appointment</h3><div className="detail-grid"><div><span>DOCTOR</span><strong>{drawer.doctor}</strong></div><div><span>SERVICE</span><strong>General consultation</strong></div><div><span>DATE</span><strong>{drawer.date}</strong></div><div><span>TIME</span><strong className="tabular">{drawer.time}–10:00</strong></div></div></div>
      <div className="drawer-section"><div className="section-title-line"><h3>Activity</h3><button>View all</button></div><div className="timeline"><div><i className="green"/><span><strong>Booking confirmed</strong><small>Ha Nguyen · 13 May, 08:45</small></span></div><div><i/><span><strong>Confirmation SMS sent</strong><small>System · 13 May, 08:45</small></span></div><div><i/><span><strong>Appointment created</strong><small>Patient portal · 12 May, 14:22</small></span></div></div></div>
      <div className="drawer-section notes"><div className="section-title-line"><h3>Staff notes</h3><span>Internal only</span></div><textarea rows={4} defaultValue="Patient requested a Vietnamese-speaking clinician. First visit to the clinic."/><button className="btn secondary compact">Save note</button></div>
      <div className="drawer-footer"><button className="btn danger-outline">Cancel appointment</button><button className="btn primary">Mark complete</button></div>
    </aside></>}
  </div>;
}

export default function App() {
  const pathToScreen = () => {
    if (location.pathname === "/admin/login") return "staffLogin";
    if (location.pathname === "/admin/dashboard") return "adminDashboard";
    if (location.pathname === "/admin/doctors") return "adminDoctors";
    if (location.pathname === "/admin/specialties") return "adminSpecialties";
    if (location.pathname === "/admin/services") return "adminServices";
    if (location.pathname === "/admin/schedules") return "adminSchedules";
    if (location.pathname === "/admin/staff") return "adminStaff";
    if (location.pathname === "/admin/audit-log") return "adminAudit";
    if (location.pathname.startsWith("/admin")) return "admin";
    if (location.pathname === "/specialties/general-medicine") return "specialtyDetail";
    if (location.pathname === "/specialties") return "specialties";
    if (location.pathname === "/doctors/linh-tran") return "doctorDetail";
    if (location.pathname === "/doctors") return "doctors";
    if (location.pathname === "/services") return "services";
    if (location.pathname === "/appointments/MED-8492-AX") return "appointmentDetail";
    if (location.pathname === "/appointments/lookup") return "lookup";
    if (location.pathname === "/login") return "login";
    if (location.pathname === "/register") return "register";
    if (location.pathname === "/forgot-password") return "forgot";
    if (location.pathname === "/account/profile") return "profile";
    if (location.pathname === "/account/security") return "security";
    if (location.pathname.startsWith("/account")) return "portal";
    if (location.pathname === "/booking") return "booking";
    return "home";
  };
  const [screen, setScreen] = useState(pathToScreen);
  const [signedIn, setSignedIn] = useState(() => localStorage.getItem("medistra-auth") === "true");
  const [staffSignedIn, setStaffSignedIn] = useState(() => localStorage.getItem("medistra-staff-auth") === "true");
  const navigate = (next) => {
    const paths = { home: "/", specialties: "/specialties", specialtyDetail: "/specialties/general-medicine", doctors: "/doctors", doctorDetail: "/doctors/linh-tran", services: "/services", admin: "/admin/appointments", adminDashboard: "/admin/dashboard", adminDoctors: "/admin/doctors", adminSpecialties: "/admin/specialties", adminServices: "/admin/services", adminSchedules: "/admin/schedules", adminStaff: "/admin/staff", adminAudit: "/admin/audit-log", staffLogin: "/admin/login", lookup: "/appointments/lookup", appointmentDetail: "/appointments/MED-8492-AX", booking: "/booking", login: "/login", register: "/register", forgot: "/forgot-password", portal: "/account", profile: "/account/profile", security: "/account/security" };
    const path = paths[next];
    history.pushState({}, "", path); setScreen(next); window.scrollTo(0, 0);
  };
  const authenticate = () => { localStorage.setItem("medistra-auth", "true"); setSignedIn(true); navigate("portal"); };
  const authenticateStaff = () => { localStorage.setItem("medistra-staff-auth", "true"); setStaffSignedIn(true); navigate("admin"); };
  const logout = () => { localStorage.removeItem("medistra-auth"); setSignedIn(false); navigate("login"); };
  const logoutStaff = () => { localStorage.removeItem("medistra-staff-auth"); setStaffSignedIn(false); navigate("staffLogin"); };
  useEffect(() => { const handler = () => setScreen(pathToScreen()); addEventListener("popstate", handler); return () => removeEventListener("popstate", handler); }, []);
  const adminPages = { admin: "appointments", adminDashboard: "dashboard", adminDoctors: "doctors", adminSpecialties: "specialties", adminServices: "services", adminSchedules: "schedules", adminStaff: "staff", adminAudit: "audit" };
  if (adminPages[screen]) return staffSignedIn ? <AdminScreen page={adminPages[screen]} navigate={navigate} onLogout={logoutStaff}/> : <AuthScreen mode="login" staff navigate={navigate} onAuthenticated={authenticateStaff}/>;
  if (screen === "portal" || screen === "profile" || screen === "security") return signedIn ? <PatientPortal active={screen === "profile" ? "profile" : screen === "security" ? "security" : "dashboard"} navigate={navigate} onLogout={logout}/> : <AuthScreen mode="login" navigate={navigate} onAuthenticated={authenticate}/>;
  const catalogPages = ["home","specialties","specialtyDetail","doctors","doctorDetail","services"];
  const page = catalogPages.includes(screen) ? <CatalogScreen page={screen} navigate={navigate}/> : screen === "lookup" ? <LookupScreen navigate={navigate}/> : screen === "appointmentDetail" ? <AppointmentDetailScreen navigate={navigate}/> : screen === "staffLogin" ? <AuthScreen mode="login" staff navigate={navigate} onAuthenticated={authenticateStaff}/> : screen === "login" || screen === "register" || screen === "forgot" ? <AuthScreen mode={screen} navigate={navigate} onAuthenticated={authenticate}/> : <BookingScreen/>;
  return <><PublicHeader screen={screen} navigate={navigate} signedIn={signedIn}/>{page}<footer className="public-footer"><span>© 2025 Medistra Health</span><div><button>Privacy</button><button>Terms</button><button>Contact</button></div></footer></>;
}
