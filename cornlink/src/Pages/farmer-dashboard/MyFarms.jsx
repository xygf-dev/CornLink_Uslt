import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cornlink-farmer-farms";

const EMPTY_FARM = {
  name: "",
  municipality: "",
  area: "",
  variety: "",
  plantingDate: "",
  harvestDate: "",
  status: "Growing",
};

const styles = `
  .mf-page {
    --mf-green: #1d603a;
    --mf-dark: #173d2b;
    --mf-soft: #edf6e9;
    --mf-border: #e0e9dd;
    --mf-muted: #758579;
    color: #203b2a;
    font-family: Inter, "Segoe UI", Arial, sans-serif;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
  }
  .mf-page * { box-sizing: border-box; }
  .mf-page button, .mf-page input, .mf-page select { font: inherit; }
  .mf-heading {
    display: flex; justify-content: space-between; align-items: flex-end;
    gap: 20px; margin-bottom: 25px;
  }
  .mf-kicker {
    color: #4f8a5a; font-size: 10px; letter-spacing: 1.5px;
    font-weight: 800; margin: 0 0 9px;
  }
  .mf-title { font-size: clamp(25px, 3vw, 33px); line-height: 1.2; margin: 0 0 8px; font-weight: 800; letter-spacing: -.8px; }
  .mf-subtitle { color: var(--mf-muted); font-size: 13px; line-height: 1.6; margin: 0; }
  .mf-primary, .mf-secondary, .mf-danger {
    border-radius: 9px; padding: 11px 15px; font-size: 12px; font-weight: 750;
    cursor: pointer; transition: background .15s, border-color .15s, transform .15s;
  }
  .mf-primary { border: 1px solid var(--mf-green); color: #fff; background: var(--mf-green); }
  .mf-primary:hover { background: #154a2c; transform: translateY(-1px); }
  .mf-secondary { border: 1px solid #d9e5d6; color: #31583b; background: #fff; }
  .mf-secondary:hover { background: #f3f8f0; border-color: #b8d0b4; }
  .mf-danger { border: 1px solid #f0d8d4; color: #a34338; background: #fff; }
  .mf-danger:hover { background: #fff4f2; }
  .mf-overview {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 13px; margin-bottom: 22px;
  }
  .mf-stat {
    background: #fff; border: 1px solid var(--mf-border); border-radius: 13px;
    padding: 16px 18px; min-height: 94px;
  }
  .mf-stat-label { color: var(--mf-muted); font-size: 11px; display: block; margin-bottom: 9px; }
  .mf-stat-value { font-size: 25px; line-height: 1; font-weight: 800; letter-spacing: -.5px; }
  .mf-toolbar {
    display: flex; justify-content: space-between; align-items: center; gap: 14px;
    padding: 14px; background: #fff; border: 1px solid var(--mf-border);
    border-radius: 13px; margin-bottom: 17px;
  }
  .mf-search-wrap { position: relative; flex: 1; max-width: 440px; }
  .mf-search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #7f9082; pointer-events: none; }
  .mf-input {
    width: 100%; min-width: 0; border: 1px solid #dce6d9; border-radius: 9px;
    padding: 11px 12px; color: #23432e; background: #fff; outline: none; font-size: 12px;
  }
  .mf-search { padding-left: 36px; }
  .mf-input:focus { border-color: #73a779; box-shadow: 0 0 0 3px #e5f2e1; }
  .mf-count { color: var(--mf-muted); font-size: 11px; white-space: nowrap; }
  .mf-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .mf-card {
    min-width: 0; background: #fff; border: 1px solid var(--mf-border);
    border-radius: 15px; overflow: hidden; box-shadow: 0 3px 12px rgba(29, 70, 38, .035);
    transition: transform .15s, box-shadow .15s;
  }
  .mf-card:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(29, 70, 38, .08); }
  .mf-card-banner {
    min-height: 83px; padding: 15px 17px; display: flex; align-items: flex-start;
    justify-content: space-between; gap: 10px; background: linear-gradient(115deg, #dcefd4, #f0f7eb);
    border-bottom: 1px solid #e5efe1;
  }
  .mf-corn-icon { width: 42px; height: 42px; display: grid; place-items: center; background: #fff9; border-radius: 12px; font-size: 23px; }
  .mf-badge { display: inline-flex; align-items: center; justify-content: center; border-radius: 30px; padding: 6px 9px; font-size: 10px; font-weight: 800; background: #e5f4e1; color: #347044; }
  .mf-badge.ready { background: #fff1d5; color: #8b6418; }
  .mf-badge.harvested { background: #e8edf9; color: #455c9b; }
  .mf-badge.preparing { background: #f0e9fc; color: #7753a4; }
  .mf-card-content { padding: 17px 17px 14px; }
  .mf-farm-name { font-size: 16px; line-height: 1.35; font-weight: 800; margin: 0 0 6px; overflow-wrap: anywhere; }
  .mf-location { color: var(--mf-muted); font-size: 11px; margin-bottom: 16px; }
  .mf-details { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 10px; padding-top: 14px; border-top: 1px solid #edf1eb; }
  .mf-detail-label { display: block; color: #8b998d; font-size: 9px; font-weight: 800; letter-spacing: .5px; margin-bottom: 5px; }
  .mf-detail-value { display: block; color: #31553a; font-size: 11px; font-weight: 700; overflow-wrap: anywhere; }
  .mf-card-actions { display: flex; gap: 8px; padding: 0 17px 17px; }
  .mf-card-actions button { flex: 1; padding: 9px 10px; }
  .mf-empty {
    background: #fff; border: 1px dashed #c9dcc5; border-radius: 15px;
    padding: 42px 20px; text-align: center;
  }
  .mf-empty-icon { font-size: 34px; margin-bottom: 11px; }
  .mf-empty h2 { margin: 0 0 7px; font-size: 16px; font-weight: 800; }
  .mf-empty p { color: var(--mf-muted); font-size: 12px; margin: 0 auto 17px; line-height: 1.6; max-width: 380px; }
  .mf-form-panel { background: #fff; border: 1px solid var(--mf-border); border-radius: 15px; padding: 21px; margin-bottom: 20px; }
  .mf-form-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 17px; }
  .mf-form-header h2 { font-size: 17px; margin: 0; font-weight: 800; }
  .mf-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .mf-field label { display: block; font-size: 11px; font-weight: 750; color: #4d6753; margin-bottom: 7px; }
  .mf-form-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 17px; }
  @media (max-width: 1100px) { .mf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 700px) {
    .mf-heading { align-items: flex-start; flex-direction: column; }
    .mf-overview { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .mf-stat { padding: 12px; }
    .mf-stat-value { font-size: 21px; }
    .mf-grid { grid-template-columns: 1fr; }
    .mf-toolbar { align-items: stretch; flex-direction: column; }
    .mf-search-wrap { max-width: none; }
  }
  @media (max-width: 430px) {
    .mf-overview { grid-template-columns: 1fr; }
    .mf-form-grid { grid-template-columns: 1fr; }
  }
`;

function readFarms() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusClass(status) {
  if (status === "Ready to harvest") return "ready";
  if (status === "Harvested") return "harvested";
  if (status === "Preparing land") return "preparing";
  return "";
}

export default function MyFarms() {
  const [farms, setFarms] = useState(readFarms);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FARM);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(farms));
  }, [farms]);

  const filteredFarms = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return farms;
    return farms.filter((farm) =>
      [farm.name, farm.municipality, farm.variety, farm.status]
        .some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [farms, query]);

  const totalArea = farms.reduce((sum, farm) => sum + (Number(farm.area) || 0), 0);
  const growingCount = farms.filter((farm) => farm.status === "Growing").length;
  const readyCount = farms.filter((farm) => farm.status === "Ready to harvest").length;

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FARM);
    setShowForm(true);
  }

  function openEditForm(farm) {
    setEditingId(farm.id);
    setForm({ ...EMPTY_FARM, ...farm });
    setShowForm(true);
  }

  function saveFarm(event) {
    event.preventDefault();
    if (!form.name.trim()) return;

    const record = {
      ...form,
      id: editingId ?? Date.now().toString(),
      name: form.name.trim(),
      municipality: form.municipality.trim(),
      variety: form.variety.trim(),
      area: form.area === "" ? "" : Number(form.area),
    };

    setFarms((current) =>
      editingId
        ? current.map((farm) => farm.id === editingId ? record : farm)
        : [record, ...current]
    );
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FARM);
  }

  function deleteFarm(id) {
    if (window.confirm("Are you sure you want to delete this farm record?")) {
      setFarms((current) => current.filter((farm) => farm.id !== id));
    }
  }

  return (
    <div className="mf-page">
      <style>{styles}</style>

      <header className="mf-heading">
        <div>
          <p className="mf-kicker">YOUR LAND, YOUR RECORDS</p>
          <h1 className="mf-title">My Farm Records</h1>
          <p className="mf-subtitle">Manage your farm locations, crop varieties, and planting schedules in one place.</p>
        </div>
        <button className="mf-primary" type="button" onClick={openAddForm}>＋ Add farm</button>
      </header>

      <div className="mf-overview">
        <div className="mf-stat"><span className="mf-stat-label">Registered farms</span><strong className="mf-stat-value">{farms.length}</strong></div>
        <div className="mf-stat"><span className="mf-stat-label">Total farm area</span><strong className="mf-stat-value">{totalArea.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 650 }}>ha</span></strong></div>
        <div className="mf-stat"><span className="mf-stat-label">Ready to harvest</span><strong className="mf-stat-value">{readyCount}</strong></div>
      </div>

      {showForm && (
        <form className="mf-form-panel" onSubmit={saveFarm}>
          <div className="mf-form-header">
            <div><p className="mf-kicker">{editingId ? "UPDATE FARM DETAILS" : "NEW FARM RECORD"}</p><h2>{editingId ? "Edit farm" : "Add a farm"}</h2></div>
            <button className="mf-secondary" type="button" onClick={() => setShowForm(false)}>Close</button>
          </div>
          <div className="mf-form-grid">
            <div className="mf-field"><label htmlFor="mf-name">Farm name *</label><input id="mf-name" className="mf-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. North Field" /></div>
            <div className="mf-field"><label htmlFor="mf-location">Municipality / Location</label><input id="mf-location" className="mf-input" value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })} placeholder="Barangay or municipality" /></div>
            <div className="mf-field"><label htmlFor="mf-area">Farm area (hectares)</label><input id="mf-area" className="mf-input" type="number" min="0" step="0.01" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="e.g. 2.5" /></div>
            <div className="mf-field"><label htmlFor="mf-variety">Corn variety</label><input id="mf-variety" className="mf-input" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} placeholder="e.g. Yellow corn" /></div>
            <div className="mf-field"><label htmlFor="mf-planting">Planting date</label><input id="mf-planting" className="mf-input" type="date" value={form.plantingDate} onChange={(e) => setForm({ ...form, plantingDate: e.target.value })} /></div>
            <div className="mf-field"><label htmlFor="mf-harvest">Expected harvest date</label><input id="mf-harvest" className="mf-input" type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })} /></div>
            <div className="mf-field"><label htmlFor="mf-status">Current status</label><select id="mf-status" className="mf-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Growing</option><option>Ready to harvest</option><option>Harvested</option><option>Preparing land</option></select></div>
          </div>
          <div className="mf-form-actions">
            <button className="mf-secondary" type="button" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
            <button className="mf-primary" type="submit">{editingId ? "Save changes" : "Save farm"}</button>
          </div>
        </form>
      )}

      <div className="mf-toolbar">
        <div className="mf-search-wrap"><span className="mf-search-icon">⌕</span><input className="mf-input mf-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by farm, location, variety, or status..." aria-label="Search farms" /></div>
        <span className="mf-count">Showing {filteredFarms.length} of {farms.length} farm{farms.length === 1 ? "" : "s"}</span>
      </div>

      {filteredFarms.length === 0 ? (
        <div className="mf-empty">
          <div className="mf-empty-icon">{farms.length ? "🔎" : "🌱"}</div>
          <h2>{farms.length ? "No matching farms" : "Start with your first farm"}</h2>
          <p>{farms.length ? "Try a different search term to find a farm record." : "Add your farm details to organize crop varieties, field sizes, and harvest dates."}</p>
          {!farms.length && <button className="mf-primary" type="button" onClick={openAddForm}>＋ Add your first farm</button>}
        </div>
      ) : (
        <div className="mf-grid">
          {filteredFarms.map((farm) => (
            <article className="mf-card" key={farm.id}>
              <div className="mf-card-banner">
                <span className="mf-corn-icon">🌽</span>
                <span className={`mf-badge ${statusClass(farm.status)}`}>{farm.status || "Growing"}</span>
              </div>
              <div className="mf-card-content">
                <h2 className="mf-farm-name">{farm.name}</h2>
                <div className="mf-location">⌖ {farm.municipality || "Location not specified"}</div>
                <div className="mf-details">
                  <div><span className="mf-detail-label">FARM AREA</span><span className="mf-detail-value">{farm.area !== "" && farm.area != null ? `${farm.area} ha` : "Not set"}</span></div>
                  <div><span className="mf-detail-label">CORN VARIETY</span><span className="mf-detail-value">{farm.variety || "Not set"}</span></div>
                  <div><span className="mf-detail-label">PLANTING DATE</span><span className="mf-detail-value">{formatDate(farm.plantingDate)}</span></div>
                  <div><span className="mf-detail-label">HARVEST DATE</span><span className="mf-detail-value">{formatDate(farm.harvestDate)}</span></div>
                </div>
              </div>
              <div className="mf-card-actions">
                <button className="mf-secondary" type="button" onClick={() => openEditForm(farm)}>Edit</button>
                <button className="mf-danger" type="button" onClick={() => deleteFarm(farm.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
