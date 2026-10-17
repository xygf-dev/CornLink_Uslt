import React, { useMemo, useState } from "react";
import "./index.js";
import "./App.css";

const features = [
  { icon: "🌱", title: "Harvest Forecasting", text: "Keep track of planting schedules and expected harvest dates to build a clearer picture of future corn availability." },
  { icon: "🤝", title: "Supply Clustering", text: "Coordinate nearby farmers and cooperatives into supply groups that are easier to collect and transport." },
  { icon: "📊", title: "Supply & Demand Dashboard", text: "Compare plant requirements with estimated supply, confirmed commitments, and actual deliveries." },
  { icon: "🚚", title: "Delivery Coordination", text: "Organize collection points, transport assignments, delivery schedules, and delivery status in one place." },
];

const steps = [
  ["01", "Record farm details", "Farmers or assisting cooperative officers record planted area, corn variety, planting date, and expected harvest."],
  ["02", "Forecast available supply", "CornLink organizes farm estimates by municipality and harvest period."],
  ["03", "Match supply with demand", "Compare expected and committed volumes with the plant's quantity, timing, and quality requirements."],
  ["04", "Coordinate and track deliveries", "Agree on collection and delivery schedules, then record delivered quantities and inspection results."],
];

function LandingPage({ onOpenDashboard }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setNotice("Thanks for your interest! This concept page is a prototype; connect a backend to collect submissions.");
  }

  return (
    <div className="site-shell">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="CornLink home">
          <span className="brand-mark">🌽</span>
          <span>Corn<span className="brand-light">Link</span><small>SUPPLY. CONNECTED.</small></span>
        </a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? "✕" : "☰"}</button>
        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#stakeholders" onClick={() => setMenuOpen(false)}>Who it's for</a>
          <a className="nav-cta" href="#dashboard" onClick={e => { e.preventDefault(); setMenuOpen(false); onOpenDashboard(); }}>Explore CornLink <span>↗</span></a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-bg-shape shape-one"></div>
          <div className="hero-bg-shape shape-two"></div>
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot"></span> A smarter corn supply chain</div>
            <h1>From harvest<br />to <em>opportunity.</em></h1>
            <p className="hero-subtitle">Bringing farmers, cooperatives, and corn processors together to plan harvests, coordinate supply, and move corn with greater confidence.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#platform">Discover the platform <span>→</span></a>
              <a className="button button-quiet" href="#how-it-works"><span className="play-icon">▶</span> See how it works</a>
            </div>
            <div className="hero-note"><span className="note-icon">✳</span><span>Built around local collaboration.<br /><strong>Designed for agricultural communities.</strong></span></div>
          </div>
          <div className="hero-visual">
            <div className="sun-disc"></div>
            <div className="field field-back"></div><div className="field field-mid"></div><div className="field field-front"></div>
            <div className="corn-stalk stalk-one"><i></i><b></b><span></span></div>
            <div className="corn-stalk stalk-two"><i></i><b></b><span></span></div>
            <div className="corn-stalk stalk-three"><i></i><b></b><span></span></div>
            <div className="floating-card supply-card">
              <div className="mini-card-top"><span className="mini-icon">↗</span><span>SUPPLY OVERVIEW</span><span className="live-dot"></span></div>
              <div className="supply-number">Harvest outlook</div>
              <div className="supply-caption">Estimates by harvest period</div>
              <div className="bar-chart"><i style={{height:"36%"}}></i><i style={{height:"54%"}}></i><i style={{height:"45%"}}></i><i style={{height:"72%"}}></i><i style={{height:"63%"}}></i><i style={{height:"88%"}}></i><i style={{height:"76%"}}></i></div>
              <div className="chart-labels"><span>Wk 1</span><span>Wk 2</span><span>Wk 3</span><span>Wk 4</span></div>
              <div className="card-divider"></div>
              <div className="legend-row"><span><i className="legend-green"></i> Forecast supply</span><b>Illustrative</b></div>
            </div>
            <div className="floating-card delivery-card"><span className="delivery-check">✓</span><div><strong>Delivery coordination</strong><small>Plan. Confirm. Deliver.</small></div><span className="delivery-arrow">↗</span></div>
            <div className="hero-stamp"><span>GROWING</span><strong>TOGETHER</strong><small>FIELD TO FACILITY</small></div>
          </div>
          <div className="hero-bottomline"><span>AGRICULTURE × TECHNOLOGY</span><span>PLANNING FOR A STRONGER HARVEST <b>↘</b></span></div>
        </section>

        <section className="trust-strip" id="stakeholders">
          <p>ONE CONNECTED NETWORK</p>
          <div><span>🌾 Farmers</span><span>◈ Cooperatives</span><span>⌂ Agricultural offices</span><span>⇄ Logistics providers</span><span>▦ Processing plants</span></div>
        </section>

        <section className="section platform-section" id="platform">
          <div className="section-heading">
            <div><span className="section-kicker">THE CORNLINK PLATFORM</span><h2>Less guesswork.<br /><em>Better coordination.</em></h2></div>
            <p>When supply information is scattered, procurement becomes harder to plan. CornLink brings key records and coordination into one shared view.</p>
          </div>
          <div className="feature-grid">
            {features.map((feature, index) => <article className="feature-card" key={feature.title}>
              <div className="feature-number">0{index + 1}</div><div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3><p>{feature.text}</p><a href="#how-it-works" aria-label={`Learn about ${feature.title}`}>Explore feature <span>↗</span></a>
            </article>)}
          </div>
        </section>

        <section className="workflow-section" id="how-it-works">
          <div className="workflow-intro"><span className="section-kicker light-kicker">HOW IT WORKS</span><h2>One harvest.<br /><em>Many moving parts.</em></h2><p>CornLink helps stakeholders coordinate the journey from farm records to plant delivery—while keeping estimates separate from confirmed commitments.</p><a className="button button-light" href="#contact">Start a conversation <span>→</span></a></div>
          <div className="workflow-steps">{steps.map(([number, title, text]) => <div className="workflow-step" key={number}><div className="step-number">{number}</div><div><h3>{title}</h3><p>{text}</p></div><span className="step-arrow">↗</span></div>)}</div>
          <div className="workflow-decoration">C<span>↗</span>L</div>
        </section>

        <section className="section impact-section">
          <div className="impact-image"><div className="image-overlay"></div><div className="image-label"><span>FIELD TO FACILITY</span><strong>Every harvest<br />has a destination.</strong></div><div className="round-seal">GROW<br />LOCAL <span>✳</span></div></div>
          <div className="impact-copy"><span className="section-kicker">BUILT FOR REAL-WORLD AGRICULTURE</span><h2>Technology that<br /><em>works together.</em></h2><p>CornLink is designed to support existing agricultural relationships—not replace them. Cooperative officers and agricultural personnel can help maintain records for farmers with limited internet access or digital experience.</p><ul><li><span>✓</span> Farm and harvest information in one place</li><li><span>✓</span> Clear view of expected and committed supply</li><li><span>✓</span> Coordinated collection and delivery schedules</li><li><span>✓</span> Records to compare forecasts with actual results</li></ul><a className="text-link" href="#contact">Explore the CornLink concept <span>→</span></a></div>
        </section>

        <section className="cta-section" id="contact">
          <div className="cta-pattern"></div><div className="cta-content"><span className="section-kicker light-kicker">LET'S GROW THE CONNECTION</span><h2>Stronger coordination.<br /><em>More predictable supply.</em></h2><p>Help shape a more connected corn supply chain. Start a conversation about the needs of farmers, cooperatives, and processing plants in your area.</p>
          <form className="interest-form" onSubmit={handleSubmit}><label className="sr-only" htmlFor="email">Email address</label><input id="email" type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} required /><button type="submit">I'm interested <span>→</span></button></form>{notice && <p className="form-notice" role="status">{notice}</p>}
          <small className="prototype-note">Concept prototype · Form submissions are not stored or sent.</small></div>
          <div className="cta-corn">🌽</div>
        </section>
      </main>

      <footer className="footer"><a className="brand footer-brand" href="#home"><span className="brand-mark">🌽</span><span>Corn<span className="brand-light">Link</span><small>SUPPLY. CONNECTED.</small></span></a><p>Connecting harvests to opportunity.</p><div className="footer-links"><a href="#platform">Platform</a><a href="#how-it-works">How it works</a><a href="#contact">Contact</a></div><div className="copyright">© {new Date().getFullYear()} CornLink · Concept project</div></footer>
    </div>
  );
}

const initialFarms = [
  { id: "CL-2408", farm: "Riverside Cooperative", grower: "Maria Santos", area: "18.5 ha", variety: "Yellow corn", harvest: "Oct 24, 2026", volume: "42.0 t", status: "Ready soon" },
  { id: "CL-2407", farm: "San Isidro Farms", grower: "Jose Dela Cruz", area: "12.0 ha", variety: "White corn", harvest: "Oct 26, 2026", volume: "27.5 t", status: "Growing" },
  { id: "CL-2406", farm: "Golden Fields Coop", grower: "Ana Reyes", area: "31.2 ha", variety: "Yellow corn", harvest: "Oct 28, 2026", volume: "68.0 t", status: "Growing" },
  { id: "CL-2405", farm: "North Valley Growers", grower: "Ramon Cruz", area: "9.8 ha", variety: "Yellow corn", harvest: "Oct 29, 2026", volume: "21.0 t", status: "Needs review" },
  { id: "CL-2404", farm: "Maligaya Farmers Group", grower: "Liza Mendoza", area: "15.4 ha", variety: "White corn", harvest: "Nov 02, 2026", volume: "34.5 t", status: "Growing" },
];

const navItems = [
  ["Overview", "▦"], ["Farm records", "⌂"], ["Harvest forecasts", "◷"],
  ["Supply matching", "⇄"], ["Deliveries", "▤"],
];

function Dashboard({ onBack }) {
  const [farms, setFarms] = useState(initialFarms);
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All farms");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");

  const filteredFarms = useMemo(() => farms.filter((farm) => {
    const matchesQuery = `${farm.farm} ${farm.grower} ${farm.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All farms" || farm.status === statusFilter;
    return matchesQuery && matchesStatus;
  }), [farms, query, statusFilter]);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function addFarm(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newFarm = {
      id: `CL-${2409 + farms.length - initialFarms.length}`,
      farm: form.get("farm"), grower: form.get("grower"), area: `${form.get("area")} ha`,
      variety: form.get("variety"), harvest: form.get("harvest"), volume: `${form.get("volume")} t`, status: "Growing",
    };
    setFarms((items) => [newFarm, ...items]);
    setShowModal(false);
    setQuery("");
    setStatusFilter("All farms");
    notify("Farm record added successfully");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setActive("Overview")}>
          <span className="brand-mark">🌽</span><span className="brand-name">CornLink<small>SUPPLY. CONNECTED.</small></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-switch"><span className="workspace-avatar">GC</span><span>Golden Corn Coop<small>Cooperative</small></span><b>⌄</b></div>
        <div className="nav-label">MENU</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(([label, icon]) => <button key={label} className={active === label ? "nav-item active" : "nav-item"} onClick={() => { setActive(label); if (label !== "Overview") notify(`${label} view selected`); }}><span className="nav-icon">{icon}</span>{label}{label === "Deliveries" && <span className="nav-count">3</span>}</button>)}
        </nav>
        <div className="nav-label tools-label">TOOLS</div>
        <button className="nav-item" onClick={() => notify("Reports are coming soon") }><span className="nav-icon">▥</span>Reports</button>
        <button className="nav-item" onClick={() => notify("Settings are coming soon") }><span className="nav-icon">⚙</span>Settings</button>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">?</div><strong>Need a hand?</strong><p>Our team can help you get started.</p><button onClick={() => notify("Support team contact details are coming soon")}>Visit help center <span>↗</span></button></div><div className="profile-row"><div className="profile-avatar">MS</div><div><strong>Maria Santos</strong><small>Coop administrator</small></div><button aria-label="Profile menu" onClick={() => notify("Profile menu")}>•••</button></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{active}</strong></div><div className="topbar-actions"><button className="back-to-site" onClick={onBack}>← Landing page</button><div className="sync-status"><i></i>All changes saved</div><button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify("You’re all caught up")}>♧<i></i></button><div className="top-avatar">MS</div></div></header>
        <div className="page-content">
          <section className="welcome-row"><div><div className="date-label">SATURDAY, OCTOBER 17, 2026</div><h1>Good morning, Maria <span>☀</span></h1><p>Here’s what’s happening across your supply network today.</p></div><button className="primary-button" onClick={() => setShowModal(true)}><span>＋</span> Add farm record</button></section>

          <section className="summary-grid" aria-label="Supply summary">
            <article className="summary-card"><div className="summary-top"><span>Total farms</span><span className="summary-icon green-icon">⌂</span></div><div className="summary-value">128 <span className="trend positive">↗ 12%</span></div><div className="summary-foot">Compared to last month</div><div className="sparkline spark-green"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
            <article className="summary-card"><div className="summary-top"><span>Expected this month</span><span className="summary-icon lime-icon">◷</span></div><div className="summary-value">486 <small>tons</small></div><div className="summary-foot"><b>72%</b> of monthly target</div><div className="progress-track"><i style={{width:"72%"}}/></div></article>
            <article className="summary-card"><div className="summary-top"><span>Committed supply</span><span className="summary-icon gold-icon">⇄</span></div><div className="summary-value">312 <small>tons</small></div><div className="summary-foot"><b>64%</b> of expected harvest</div><div className="progress-track gold-progress"><i style={{width:"64%"}}/></div></article>
            <article className="summary-card"><div className="summary-top"><span>Deliveries in progress</span><span className="summary-icon blue-icon">▤</span></div><div className="summary-value">8 <span className="trend neutral">3 arriving today</span></div><div className="summary-foot">Across 4 collection points</div><div className="delivery-dots"><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
          </section>

          <section className="content-grid">
            <article className="panel forecast-panel"><div className="panel-heading"><div><div className="section-kicker">SUPPLY OVERVIEW</div><h2>Harvest outlook</h2></div><button className="select-button" onClick={() => notify("Showing October 2026")}>October 2026 <span>⌄</span></button></div><div className="chart-legend"><span><i className="legend-expected"/>Expected harvest</span><span><i className="legend-committed"/>Committed</span></div><div className="chart-wrap"><div className="y-axis"><span>200 t</span><span>150 t</span><span>100 t</span><span>50 t</span><span>0</span></div><div className="chart-area"><div className="chart-gridlines"><i/><i/><i/><i/><i/></div><div className="chart-columns">{[[52,28],[66,36],[44,27],[78,51],[60,42],[88,57],[69,46],[95,64],[74,49],[86,58],[63,40],[80,55]].map(([expected,committed], index) => <div className="chart-group" key={index}><div className="bar-pair"><i className="bar expected-bar" style={{height:`${expected}%`}}/><i className="bar committed-bar" style={{height:`${committed}%`}}/></div><span>{["W1","W2","W3","W4"][index % 4]}</span></div>)}</div></div></div><div className="chart-caption"><span><b>486 t</b> forecast this month</span><span className="caption-note">Updated today, 9:41 AM</span></div></article>

            <article className="panel activity-panel"><div className="panel-heading"><div><div className="section-kicker">STAY IN THE LOOP</div><h2>Recent activity</h2></div><button className="more-button" aria-label="More activity options" onClick={() => notify("Showing recent activity")}>•••</button></div><div className="activity-list"><div className="activity-item"><div className="activity-symbol activity-green">✓</div><div><p><strong>Harvest confirmed</strong><br/>Riverside Cooperative confirmed 42 tons for October.</p><small>12 minutes ago <span>·</span> Harvest</small></div></div><div className="activity-item"><div className="activity-symbol activity-gold">⇄</div><div><p><strong>New supply match</strong><br/>Golden Fields matched with North Plant demand.</p><small>1 hour ago <span>·</span> Matching</small></div></div><div className="activity-item"><div className="activity-symbol activity-blue">▤</div><div><p><strong>Delivery completed</strong><br/>18.5 tons delivered to Cagayan Processing.</p><small>3 hours ago <span>·</span> Delivery</small></div></div><div className="activity-item"><div className="activity-symbol activity-lime">＋</div><div><p><strong>Farm record added</strong><br/>San Isidro Farms added a new planting record.</p><small>Yesterday <span>·</span> Farm records</small></div></div></div><button className="activity-link" onClick={() => notify("Activity history is up to date")}>View all activity <span>→</span></button></article>
          </section>

          <section className="panel farms-panel"><div className="farms-heading"><div><div className="section-kicker">YOUR NETWORK</div><h2>Upcoming harvests <span className="table-count">{farms.length}</span></h2></div><button className="text-button" onClick={() => {setActive("Farm records"); notify("Farm records view selected");}}>View all farms <span>→</span></button></div><div className="table-toolbar"><label className="search-box"><span>⌕</span><input type="search" placeholder="Search farms or growers..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All farms</option><option>Growing</option><option>Ready soon</option><option>Needs review</option></select><button className="filter-button" onClick={() => notify("Filters are up to date")}>☷ <span>Filter</span></button></div><div className="table-scroll"><table><thead><tr><th>FARM / GROWER</th><th>VARIETY</th><th>HARVEST DATE</th><th>EST. VOLUME</th><th>STATUS</th><th></th></tr></thead><tbody>{filteredFarms.map((farm) => <tr key={farm.id}><td><div className="farm-cell"><span className="farm-avatar">{farm.farm.split(" ").map((word) => word[0]).slice(0,2).join("")}</span><span><strong>{farm.farm}</strong><small>{farm.grower} · {farm.area}</small></span></div></td><td>{farm.variety}</td><td>{farm.harvest}</td><td><strong className="volume-value">{farm.volume}</strong></td><td><span className={`status-pill ${farm.status.toLowerCase().replace(" ","-")}`}><i/>{farm.status}</span></td><td><button className="row-menu" aria-label={`Options for ${farm.farm}`} onClick={() => notify(`${farm.farm} record selected`)}>•••</button></td></tr>)}</tbody></table>{filteredFarms.length === 0 && <div className="empty-state">No farms match that search. Try a different name or status.</div>}</div><div className="table-footer"><span>Showing <strong>{filteredFarms.length}</strong> of <strong>{farms.length}</strong> farms</span><div><button disabled>←</button><button className="page-current">1</button><button onClick={() => notify("You’re viewing the latest farm records")}>2</button><button onClick={() => notify("You’re viewing the latest farm records")}>3</button><span>…</span><button onClick={() => notify("You’re viewing the latest farm records")}>12</button><button onClick={() => notify("You’re viewing the latest farm records")}>→</button></div></div></section>
          <footer className="page-footer"><span>© 2026 CornLink · Connecting harvests to opportunity.</span><span>Need help? <button onClick={() => notify("Support team contact details are coming soon")}>Contact support</button></span></footer>
        </div>
      </main>

      {showModal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {if (event.target === event.currentTarget) setShowModal(false);}}><section className="record-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="section-kicker">FARM RECORDS</div><h2 id="modal-title">Add a farm record</h2></div><button className="close-button" aria-label="Close" onClick={() => setShowModal(false)}>×</button></div><p className="modal-intro">Add a farm and its upcoming harvest to your cooperative network.</p><form onSubmit={addFarm}><label>Farm or cooperative name<input name="farm" required placeholder="e.g. Mabuhay Farmers Group" /></label><label>Grower name<input name="grower" required placeholder="Enter grower name" /></label><div className="form-row"><label>Farm area (hectares)<input name="area" type="number" min="0.1" step="0.1" required placeholder="0.0" /></label><label>Estimated volume (tons)<input name="volume" type="number" min="0.1" step="0.1" required placeholder="0.0" /></label></div><div className="form-row"><label>Corn variety<select name="variety"><option>Yellow corn</option><option>White corn</option></select></label><label>Expected harvest date<input name="harvest" type="date" required defaultValue="2026-11-05" /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="primary-button">Save farm record <span>→</span></button></div></form></section></div>}
      {toast && <div className="toast-message" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}


export default function App() {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  return dashboardOpen
    ? <div className="dashboard-view"><Dashboard onBack={() => setDashboardOpen(false)} /></div>
    : <LandingPage onOpenDashboard={() => setDashboardOpen(true)} />;
}
