import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  initialWeeks, initialBatches, initialDeliveries, initialReceived, initialSuppliers,
} from "../plantData";

const navItems = [
  ["Overview", "▦", "/plant"],
  ["Demand", "⇄", "/plant/demand"],
  ["Incoming supply", "◷", "/plant/supply"],
  ["Deliveries", "▤", "/plant/deliveries"],
  ["Suppliers", "⌂", "/plant/suppliers"],
];

export default function PlantLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [weeks, setWeeks] = useState(initialWeeks);
  const [batches, setBatches] = useState(initialBatches);
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [received, setReceived] = useState(initialReceived);
  const [suppliers] = useState(initialSuppliers);
  const [toast, setToast] = useState("");

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  const current = pathname.replace(/\/$/, "");
  const activeLabel = (navItems.find(([, , path]) => path === current) || navItems[0])[0];

  const context = {
    weeks, setWeeks, batches, setBatches, deliveries, setDeliveries,
    received, setReceived, suppliers, notify,
  };

  return (
    <div className="dashboard-view">
      <div className="app-shell">
        <aside className="sidebar">
          <a className="brand" href="/plant" onClick={(e) => { e.preventDefault(); navigate("/plant"); }}>
            <span className="brand-mark">🌽</span>
            <span className="brand-name">CornLink<small>SUPPLY. CONNECTED.</small></span>
          </a>
          <div className="workspace-label">WORKSPACE</div>
          <div className="workspace-switch">
            <span className="workspace-avatar">CP</span>
            <span>Cagayan Processing<small>Processing plant</small></span><b>⌄</b>
          </div>
          <div className="nav-label">MENU</div>
          <nav className="main-nav" aria-label="Plant navigation">
            {navItems.map(([label, icon, path]) => (
              <button
                key={label}
                className={current === path ? "nav-item active" : "nav-item"}
                onClick={() => navigate(path)}
              >
                <span className="nav-icon">{icon}</span>{label}
                {label === "Deliveries" && <span className="nav-count">{deliveries.length}</span>}
              </button>
            ))}
          </nav>
          <div className="nav-label tools-label">TOOLS</div>
          <button className="nav-item" onClick={() => notify("Reports are coming soon")}><span className="nav-icon">▥</span>Reports</button>
          <button className="nav-item" onClick={() => notify("Settings are coming soon")}><span className="nav-icon">⚙</span>Settings</button>
          <div className="sidebar-bottom">
            <div className="profile-row">
              <div className="profile-avatar">PM</div>
              <div><strong>Procurement desk</strong><small>Plant manager</small></div>
              <button aria-label="Profile menu" onClick={() => notify("Profile menu")}>•••</button>
            </div>
          </div>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <div className="breadcrumb">Plant <span>/</span> <strong>{activeLabel}</strong></div>
            <div className="topbar-actions">
              <button className="back-to-site" onClick={() => navigate("/")}>← Landing page</button>
              <div className="sync-status"><i></i>All changes saved</div>
              <div className="top-avatar">PM</div>
            </div>
          </header>
          <div className="page-content">
            <Outlet context={context} />
            <footer className="page-footer"><span>© 2026 CornLink · Connecting harvests to opportunity.</span></footer>
          </div>
        </main>

        {toast && <div className="toast-message" role="status"><span>✓</span>{toast}</div>}
      </div>
    </div>
  );
}
