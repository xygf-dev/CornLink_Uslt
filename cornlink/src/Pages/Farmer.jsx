import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./farmer.css";
import Overview from "./farmer-dashboard/Overview";
import MyFarms from "./farmer-dashboard/MyFarms";
import HarvestPlanner from "./farmer-dashboard/HarvestPlanner";
import SupplyMatching from "./farmer-dashboard/SupplyMatching";
import MyDeliveries from "./farmer-dashboard/MyDeliveries";
import QualityRecords from "./farmer-dashboard/QualityRecords";
import {
  initialFarms, initialCommitments, initialDeliveries,
} from "./farmer-dashboard/farmerData";

const navigationItems = [
  { label: "Overview", icon: "▦" },
  { label: "My Farm Records", icon: "⌂" },
  { label: "Harvest Planner", icon: "◷" },
  { label: "Supply Matching", icon: "⇄" },
  { label: "My Deliveries", icon: "▤" },
  { label: "Quality Records", icon: "✓" },
];

export default function Farmer() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("Overview");
  const [toast, setToast] = useState("");

  // Shared data: every page reads and updates the same farms, commitments and deliveries
  const [farms, setFarms] = useState(initialFarms);
  const [commitments, setCommitments] = useState(initialCommitments);
  const [deliveries, setDeliveries] = useState(initialDeliveries);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const selectPage = (label) => {
    setActivePage(label);
    setToast("");
  };

  const activeDeliveries = deliveries.filter((d) => d.status !== "Delivered").length;

  function renderPage() {
    switch (activePage) {
      case "My Farm Records":
        return <MyFarms farms={farms} setFarms={setFarms} commitments={commitments} notify={showToast} />;
      case "Harvest Planner":
        return <HarvestPlanner farms={farms} setFarms={setFarms} commitments={commitments} notify={showToast} />;
      case "Supply Matching":
        return (
          <SupplyMatching
            farms={farms}
            commitments={commitments}
            setCommitments={setCommitments}
            deliveries={deliveries}
            notify={showToast}
          />
        );
      case "My Deliveries":
        return (
          <MyDeliveries
            deliveries={deliveries}
            setDeliveries={setDeliveries}
            commitments={commitments}
            farms={farms}
            notify={showToast}
          />
        );
      case "Quality Records":
        return <QualityRecords deliveries={deliveries} />;
      default:
        return <Overview farms={farms} commitments={commitments} deliveries={deliveries} onNavigate={selectPage} />;
    }
  }

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
                {label === "My Deliveries" && activeDeliveries > 0 && <span className="nav-count">{activeDeliveries}</span>}
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
              <button type="button" onClick={() => showToast("Help and support will be added later.")}>
                Help center <span>↗</span>
              </button>
            </div>
            <div className="profile-row">
              <div className="profile-avatar">F</div>
              <div><strong>Farmer Account</strong><small>Farmer</small></div>
              <button type="button" aria-label="Account options" onClick={() => showToast("Account options will be added later.")}>
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
              <button type="button" className="back-to-site" onClick={() => navigate("/")}>
                ← Landing page
              </button>
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
            {renderPage()}
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
