import React, { useState } from "react";
import "./farmer.css";
import MyFarms from "./farmer-dashboard/MyFarms";

const navigationItems = [
  { label: "Overview", icon: "▦" },
  { label: "My Farm Records", icon: "⌂" },
  { label: "Harvest Planner", icon: "◷" },
  { label: "Supply Matching", icon: "⇄" },
  { label: "My Deliveries", icon: "▤" },
  { label: "Quality Records", icon: "✓" },
];

function ComingSoon({ title }) {
  return (
    <section className="panel" style={{ padding: 28 }}>
      <div className="section-kicker">FARMER WORKSPACE</div>
      <h2 style={{ marginTop: 8 }}>{title}</h2>
      <p style={{ color: "#79857a", lineHeight: 1.7 }}>
        This section will be built one feature at a time. We will start with My
        Farm Records, where you can register and manage your own farms.
      </p>
    </section>
  );
}

function Overview({ onNavigate }) {
  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">CORNLINK FARMER WORKSPACE</div>
          <h1>
            Welcome back, Farmer <span aria-hidden="true">🌽</span>
          </h1>
          <p>Manage your farms, plan your harvest, and track your corn supply.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => onNavigate("My Farm Records")}
        >
          <span>＋</span> Manage my farms
        </button>
      </section>

      <section className="summary-grid" aria-label="Farmer summary">
        <article className="summary-card">
          <div className="summary-top">
            <span>My registered farms</span>
            <span className="summary-icon green-icon">⌂</span>
          </div>
          <div className="summary-value">—</div>
          <div className="summary-foot">Your farm records will appear here</div>
        </article>
        <article className="summary-card">
          <div className="summary-top">
            <span>Upcoming harvest</span>
            <span className="summary-icon lime-icon">◷</span>
          </div>
          <div className="summary-value">—</div>
          <div className="summary-foot">Based on your planting records</div>
        </article>
        <article className="summary-card">
          <div className="summary-top">
            <span>Supply commitments</span>
            <span className="summary-icon gold-icon">⇄</span>
          </div>
          <div className="summary-value">—</div>
          <div className="summary-foot">Confirmed supply commitments</div>
        </article>
        <article className="summary-card">
          <div className="summary-top">
            <span>Deliveries</span>
            <span className="summary-icon blue-icon">▤</span>
          </div>
          <div className="summary-value">—</div>
          <div className="summary-foot">Your delivery status at a glance</div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel" style={{ padding: 24 }}>
          <div className="section-kicker">GET STARTED</div>
          <h2 style={{ marginTop: 8 }}>Build your farm profile</h2>
          <p style={{ color: "#79857a", lineHeight: 1.7 }}>
            Add your farm details first. CornLink can then help you organize
            planting dates, expected harvests, supply commitments, and deliveries.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => onNavigate("My Farm Records")}
          >
            Open My Farm Records <span>→</span>
          </button>
        </article>

        <article className="panel activity-panel" style={{ padding: 24 }}>
        <div className="section-kicker">NEXT STEPS</div>
        <h2 style={{ marginTop: 8 }}>Your workflow</h2>
        <ol style={{ color: "#79857a", lineHeight: 2, paddingLeft: 20 }}>
            <li>Register your farm and planting details.</li>
            <li>Update your expected harvest date and volume.</li>
            <li>Review supply matches and delivery updates.</li>
            <li>View verified quality results when available.</li>
          </ol>
        </article>
      </section>
    </>
  );
}

export default function Farmer({ onBack }) {
  const [activePage, setActivePage] = useState("Overview");
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const selectPage = (label) => {
    setActivePage(label);
    if (label !== "Overview" && label !== "My Farm Records") {
      showToast(`${label} will be added in a future step.`);
    } else {
      setToast("");
    }
  };

  return (
    <div className="dashboard-view">
      <div className="app-shell">
        <aside className="sidebar">
          <button
            type="button"
            className="brand"
            onClick={() => selectPage("Overview")}
            aria-label="Go to farmer dashboard overview"
          >
            <span className="brand-mark" aria-hidden="true">🌽</span>
            <span className="brand-name">
              CornLink<small>FARMER WORKSPACE</small>
            </span>
          </button>

          <div className="workspace-label">WORKSPACE</div>
          <div className="workspace-switch">
            <span className="workspace-avatar">F</span>
            <span>Farmer Account<small>Farm management</small></span>
            <b aria-hidden="true">⌄</b>
          </div>

          <div className="nav-label">MY CORNLINK</div>
          <nav className="main-nav" aria-label="Farmer dashboard navigation">
            {navigationItems.map(({ label, icon }) => (
              <button
                type="button"
                key={label}
                className={activePage === label ? "nav-item active" : "nav-item"}
                onClick={() => selectPage(label)}
              >
                <span className="nav-icon" aria-hidden="true">{icon}</span>
                {label}
              </button>
            ))}
          </nav>

          <div className="nav-label tools-label">ACCOUNT</div>
          <button
            type="button"
            className="nav-item"
            onClick={() => showToast("Account settings will be added later.")}
          >
            <span className="nav-icon" aria-hidden="true">⚙</span> Settings
          </button>

          <div className="sidebar-bottom">
            <div className="help-card">
              <div className="help-icon">?</div>
              <strong>Need a hand?</strong>
              <p>Get help using your CornLink farmer workspace.</p>
              <button
                type="button"
                onClick={() => showToast("Help and support will be added later.")}
              >
                Help center <span>↗</span>
              </button>
            </div>
            <div className="profile-row">
              <div className="profile-avatar">F</div>
              <div><strong>Farmer Account</strong><small>Farmer</small></div>
              <button
                type="button"
                aria-label="Account options"
                onClick={() => showToast("Account options will be added later.")}
              >
                •••
              </button>
            </div>
          </div>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <div className="breadcrumb">
              Workspace <span>/</span> <strong>{activePage}</strong>
            </div>
            <div className="topbar-actions">
              {onBack && (
                <button type="button" className="back-to-site" onClick={onBack}>
                  ← Landing page
                </button>
              )}
              <div className="sync-status"><i />Local preview</div>
              <button
                type="button"
                className="icon-button notification-button"
                aria-label="Notifications"
                onClick={() => showToast("You have no new notifications.")}
              >
                ♧
              </button>
              <div className="top-avatar">F</div>
            </div>
          </header>

        <div className="page-content">
            {activePage === "Overview" ? (
  <Overview onNavigate={selectPage} />
) : activePage === "My Farm Records" ? (
  <MyFarms />
) : (
  <ComingSoon title={activePage} />
)}
            <footer className="page-footer">
                <span>© 2026 CornLink · Connecting harvests to opportunity.</span>
                <span>Farmer workspace</span>
            </footer>
            </div>
        </main>
        </div>
        {toast && (
        <div className="toast-message" role="status">
            <span>✓</span>{toast}
            </div>
        )}
    </div>
    );

}
