import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function Home() {
  const navigate = useNavigate();
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
          <a className="nav-cta" href="/dashboard" onClick={e => { e.preventDefault(); setMenuOpen(false); navigate("/farmer"); }}>Farmer <span>↗</span></a>
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
