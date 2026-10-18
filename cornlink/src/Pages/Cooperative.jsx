import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Overview from "./cooperative-dashboard/Overview";
import Members from "./cooperative-dashboard/Members";
import FarmRecords from "./cooperative-dashboard/FarmRecords";
import SupplyPool from "./cooperative-dashboard/SupplyPool";
import SupplyMatching from "./cooperative-dashboard/SupplyMatching";
import Deliveries from "./cooperative-dashboard/Deliveries";
import QualityRecords from "./cooperative-dashboard/QualityRecords";
import {
  COOP, initialMembers, initialPlots, initialCommitments, initialDeliveries,
} from "./cooperative-dashboard/coopData";

const navigationItems = [
  { label: "Overview", icon: "▦" },
  { label: "Members", icon: "☺" },
  { label: "Farm Records", icon: "⌂" },
  { label: "Supply Pool", icon: "◷" },
  { label: "Supply Matching", icon: "⇄" },
  { label: "Deliveries", icon: "▤" },
  { label: "Quality Records", icon: "✓" },
];

export default function Cooperative() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("Overview");
  const [toast, setToast] = useState("");

  // Shared data: every page reads and updates the same members, plots, commitments and deliveries
  const [members, setMembers] = useState(initialMembers);
  const [plots, setPlots] = useState(initialPlots);
  const [commitments, setCommitments] = useState(initialCommitments);
  const [deliveries, setDeliveries] = useState(initialDeliveries);

  const notify = (message) => {
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
      case "Members":
        return <Members members={members} setMembers={setMembers} plots={plots} commitments={commitments} notify={notify} />;
      case "Farm Records":
        return <FarmRecords members={members} plots={plots} setPlots={setPlots} commitments={commitments} notify={notify} />;
      case "Supply Pool":
        return <SupplyPool members={members} plots={plots} setPlots={setPlots} commitments={commitments} notify={notify} />;
      case "Supply Matching":
        return (
          <SupplyMatching
            members={members}
            plots={plots}
            commitments={commitments}
            setCommitments={setCommitments}
            deliveries={deliveries}
            notify={notify}
          />
        );
      case "Deliveries":
        return <Deliveries deliveries={deliveries} setDeliveries={setDeliveries} commitments={commitments} notify={notify} />;
      case "Quality Records":
        return <QualityRecords members={members} plots={plots} deliveries={deliveries} />;
      default:
        return (
          <Overview
            members={members}
            plots={plots}
            commitments={commitments}
            deliveries={deliveries}
            onNavigate={selectPage}
          />
        );
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
            aria-label="Go to cooperative overview"
          >
            <span className="brand-mark" aria-hidden="true">🌽</span>
            <span className="brand-name">
              CornLink<small>COOPERATIVE WORKSPACE</small>
            </span>
          </button>

          <div className="workspace-label">WORKSPACE</div>
          <div className="workspace-switch">
            <span className="workspace-avatar">GF</span>
            <span>{COOP.name}<small>Cooperative</small></span>
            <b aria-hidden="true">⌄</b>
          </div>

          <div className="nav-label">MY COOPERATIVE</div>
          <nav className="main-nav" aria-label="Cooperative navigation">
            {navigationItems.map(({ label, icon }) => (
              <button
                type="button"
                key={label}
                className={activePage === label ? "nav-item active" : "nav-item"}
                onClick={() => selectPage(label)}
              >
                <span className="nav-icon" aria-hidden="true">{icon}</span>
                {label}
                {label === "Deliveries" && activeDeliveries > 0 && <span className="nav-count">{activeDeliveries}</span>}
              </button>
            ))}
          </nav>

          <div className="nav-label tools-label">ACCOUNT</div>
          <button type="button" className="nav-item" onClick={() => notify("Settings will be added later.")}>
            <span className="nav-icon" aria-hidden="true">⚙</span> Settings
          </button>

          <div className="sidebar-bottom">
            <div className="help-card">
              <div className="help-icon">?</div>
              <strong>Need a hand?</strong>
              <p>Get help managing your members and supply.</p>
              <button type="button" onClick={() => notify("Help and support will be added later.")}>
                Help center <span>↗</span>
              </button>
            </div>
            <div className="profile-row">
              <div className="profile-avatar">AR</div>
              <div><strong>{COOP.officer}</strong><small>Coop administrator</small></div>
              <button type="button" aria-label="Account options" onClick={() => notify("Account options will be added later.")}>
                •••
              </button>
            </div>
          </div>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <div className="breadcrumb">
              Cooperative <span>/</span> <strong>{activePage}</strong>
            </div>
            <div className="topbar-actions">
              <button type="button" className="back-to-site" onClick={() => navigate("/")}>
                ← Landing page
              </button>
              <div className="sync-status"><i />Local preview</div>
              <div className="top-avatar">AR</div>
            </div>
          </header>

          <div className="page-content">
            {renderPage()}
            <footer className="page-footer">
              <span>© 2026 CornLink · Connecting harvests to opportunity.</span>
              <span>Cooperative workspace</span>
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
