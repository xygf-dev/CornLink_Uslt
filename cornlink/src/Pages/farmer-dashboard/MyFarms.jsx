import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cornlink-farmer-farms";

const EMPTY_FARM = {
  name: "",
  municipality: "",
  barangay: "",
  area: "",
  variety: "Yellow corn",
  plantingDate: "",
  harvestDate: "",
  status: "Growing",
  notes: "",
};

const css = `
.mf-page{--green:#1d603a;--green-dark:#16472c;--green-soft:#edf6e9;--border:#e0e9dd;--muted:#758579;color:#203b2a;font-family:Inter,"Segoe UI",Arial,sans-serif;width:100%;max-width:1400px;margin:0 auto}
.mf-page *{box-sizing:border-box}.mf-page button,.mf-page input,.mf-page select,.mf-page textarea{font:inherit}
.mf-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:24px}.mf-kicker{color:#4f8a5a;font-size:10px;letter-spacing:1.5px;font-weight:800;margin:0 0 9px}.mf-title{font-size:clamp(25px,3vw,33px);line-height:1.2;margin:0 0 8px;font-weight:800;letter-spacing:-.8px}.mf-subtitle{color:var(--muted);font-size:13px;line-height:1.6;margin:0}
.mf-primary,.mf-secondary,.mf-danger{display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;padding:11px 15px;font-size:12px;font-weight:750;cursor:pointer;transition:background .15s,border-color .15s,transform .15s}.mf-primary{border:1px solid var(--green);color:#fff;background:var(--green)}.mf-primary:hover{background:var(--green-dark);transform:translateY(-1px)}.mf-secondary{border:1px solid #d9e5d6;color:#31583b;background:#fff}.mf-secondary:hover{background:#f3f8f0;border-color:#b8d0b4}.mf-danger{border:1px solid #f0d8d4;color:#a34338;background:#fff}.mf-danger:hover{background:#fff4f2}
.mf-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin-bottom:20px}.mf-stat{background:#fff;border:1px solid var(--border);border-radius:13px;padding:16px 18px;min-height:90px}.mf-stat-label{display:block;color:var(--muted);font-size:11px;margin-bottom:9px}.mf-stat-value{font-size:25px;line-height:1;font-weight:800;letter-spacing:-.5px}
.mf-toolbar{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:13px;background:#fff;border:1px solid var(--border);border-radius:13px;margin-bottom:17px}.mf-search-wrap{position:relative;flex:1;max-width:470px}.mf-search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#7f9082;pointer-events:none}.mf-input{width:100%;min-width:0;border:1px solid #dce6d9;border-radius:9px;padding:11px 12px;color:#23432e;background:#fff;outline:none;font-size:12px}.mf-search{padding-left:36px}.mf-input:focus{border-color:#73a779;box-shadow:0 0 0 3px #e5f2e1}.mf-count{color:var(--muted);font-size:11px;white-space:nowrap}
.mf-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.mf-card{min-width:0;background:#fff;border:1px solid var(--border);border-radius:15px;overflow:hidden;box-shadow:0 3px 12px #1d46260a;transition:transform .15s,box-shadow .15s}.mf-card:hover{transform:translateY(-2px);box-shadow:0 8px 22px #1d462614}.mf-banner{min-height:80px;padding:15px 17px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;background:linear-gradient(115deg,#dcefd4,#f0f7eb);border-bottom:1px solid #e5efe1}.mf-corn{width:42px;height:42px;display:grid;place-items:center;background:#ffffffa8;border-radius:12px;font-size:23px}.mf-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:30px;padding:6px 9px;font-size:10px;font-weight:800;background:#e5f4e1;color:#347044}.mf-badge.ready{background:#fff1d5;color:#8b6418}.mf-badge.harvested{background:#e8edf9;color:#455c9b}.mf-badge.preparing{background:#f0e9fc;color:#7753a4}.mf-card-body{padding:17px}.mf-farm-name{font-size:16px;line-height:1.35;font-weight:800;margin:0 0 6px;overflow-wrap:anywhere}.mf-location{color:var(--muted);font-size:11px;margin-bottom:16px}.mf-details{display:grid;grid-template-columns:1fr 1fr;gap:14px 10px;padding-top:14px;border-top:1px solid #edf1eb}.mf-dlabel{display:block;color:#8b998d;font-size:9px;font-weight:800;letter-spacing:.5px;margin-bottom:5px}.mf-dvalue{display:block;color:#31553a;font-size:11px;font-weight:700;overflow-wrap:anywhere}.mf-notes{margin-top:13px;padding:10px 11px;background:#f7faf5;border-radius:8px;color:#708072;font-size:10px;line-height:1.5;overflow-wrap:anywhere}.mf-card-actions{display:flex;gap:8px;padding:0 17px 17px}.mf-card-actions button{flex:1;padding:9px 10px}
.mf-empty{background:#fff;border:1px dashed #c9dcc5;border-radius:15px;padding:42px 20px;text-align:center}.mf-empty-icon{font-size:34px;margin-bottom:11px}.mf-empty h2{margin:0 0 7px;font-size:16px;font-weight:800}.mf-empty p{color:var(--muted);font-size:12px;margin:0 auto 17px;line-height:1.6;max-width:380px}
/* Modal */
.mf-modal-backdrop{position:fixed;z-index:1000;inset:0;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(14,35,24,.58);backdrop-filter:blur(4px);overflow-y:auto;animation:mfFadeIn .16s ease}
.mf-modal{position:relative;width:min(720px,100%);max-height:calc(100vh - 44px);overflow:auto;background:#fff;border:1px solid #e4ebe1;border-radius:19px;box-shadow:0 24px 80px #081c1080;animation:mfModalIn .2s ease}
.mf-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:24px 26px 20px;background:linear-gradient(120deg,#f1f8ed,#fff);border-bottom:1px solid #e8efe5}.mf-modal-heading{display:flex;gap:13px;align-items:flex-start}.mf-modal-icon{display:grid;flex:0 0 46px;width:46px;height:46px;place-items:center;border-radius:13px;background:#dfeeda;font-size:24px}.mf-modal-head h2{margin:0 0 6px;font-size:21px;letter-spacing:-.5px;color:#183d29}.mf-modal-head p{margin:0;color:#7a897c;font-size:11px;line-height:1.5}.mf-close{display:grid;flex:0 0 32px;width:32px;height:32px;place-items:center;border:1px solid #dfe8dc;border-radius:9px;background:#fff;color:#55705a;font-size:19px;cursor:pointer}.mf-close:hover{background:#edf6e9}
.mf-modal-body{padding:23px 26px 25px}.mf-section-title{display:flex;align-items:center;gap:8px;margin:0 0 14px;color:#31563b;font-size:11px;font-weight:850;letter-spacing:.7px;text-transform:uppercase}.mf-section-title:before{content:"";width:4px;height:15px;border-radius:4px;background:#72a96d}.mf-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px 14px}.mf-field label{display:flex;align-items:center;gap:4px;margin-bottom:7px;color:#4d6753;font-size:11px;font-weight:750}.mf-required{color:#c45c4b}.mf-help{display:block;margin-top:5px;color:#94a095;font-size:10px;line-height:1.4}.mf-field textarea{resize:vertical;min-height:76px}.mf-modal-divider{height:1px;background:#edf1eb;margin:22px 0}.mf-modal-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:23px;padding-top:18px;border-top:1px solid #edf1eb}.mf-footer-note{max-width:230px;color:#879488;font-size:10px;line-height:1.5}.mf-footer-actions{display:flex;justify-content:flex-end;gap:9px}.mf-form-error{padding:10px 12px;margin-top:13px;border:1px solid #f1d4d0;border-radius:8px;background:#fff4f2;color:#9f4238;font-size:11px}
@keyframes mfFadeIn{from{opacity:0}to{opacity:1}}@keyframes mfModalIn{from{opacity:0;transform:translateY(8px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}
@media(max-width:1050px){.mf-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:680px){.mf-head{align-items:flex-start;flex-direction:column}.mf-stats{gap:8px}.mf-stat{padding:12px}.mf-stat-value{font-size:21px}.mf-grid{grid-template-columns:1fr}.mf-toolbar{align-items:stretch;flex-direction:column}.mf-search-wrap{max-width:none}.mf-modal-backdrop{padding:10px;align-items:flex-start}.mf-modal{max-height:calc(100vh - 20px);border-radius:14px}.mf-modal-head{padding:18px}.mf-modal-body{padding:18px}.mf-modal-head h2{font-size:18px}.mf-form-grid{grid-template-columns:1fr}.mf-modal-footer{align-items:stretch;flex-direction:column}.mf-footer-note{max-width:none}.mf-footer-actions{width:100%}.mf-footer-actions button{flex:1}}
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
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FARM);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(farms));
  }, [farms]);

  useEffect(() => {
    if (!showModal) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(event) {
      if (event.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [showModal]);

  const filteredFarms = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return farms;
    return farms.filter((farm) =>
      [farm.name, farm.municipality, farm.barangay, farm.variety, farm.status]
        .some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [farms, query]);

  const totalArea = farms.reduce((sum, farm) => sum + (Number(farm.area) || 0), 0);
  const readyCount = farms.filter((farm) => farm.status === "Ready to harvest").length;

  function openAddModal() {
    setEditingId(null);
    setForm(EMPTY_FARM);
    setError("");
    setShowModal(true);
  }

  function openEditModal(farm) {
    setEditingId(farm.id);
    setForm({ ...EMPTY_FARM, ...farm, barangay: farm.barangay || "" });
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setError("");
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function saveFarm(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter a farm name before saving.");
      return;
    }
    if (form.area !== "" && (Number(form.area) <= 0 || Number.isNaN(Number(form.area)))) {
      setError("Farm area must be greater than zero.");
      return;
    }
    if (form.plantingDate && form.harvestDate && form.harvestDate < form.plantingDate) {
      setError("Expected harvest date cannot be earlier than the planting date.");
      return;
    }

    const record = {
      ...form,
      id: editingId ?? Date.now().toString(),
      name: form.name.trim(),
      municipality: form.municipality.trim(),
      barangay: form.barangay.trim(),
      variety: form.variety.trim(),
      notes: form.notes.trim(),
      area: form.area === "" ? "" : Number(form.area),
    };

    setFarms((current) =>
      editingId
        ? current.map((farm) => String(farm.id) === String(editingId) ? record : farm)
        : [record, ...current]
    );
    closeModal();
    setForm(EMPTY_FARM);
  }

  function deleteFarm(id) {
    if (window.confirm("Are you sure you want to delete this farm record?")) {
      setFarms((current) => current.filter((farm) => String(farm.id) !== String(id)));
    }
  }

  return (
    <div className="mf-page">
      <style>{css}</style>

      <header className="mf-head">
        <div>
          <p className="mf-kicker">YOUR LAND, YOUR RECORDS</p>
          <h1 className="mf-title">My Farm Records</h1>
          <p className="mf-subtitle">Keep your farm locations, crop varieties, and planting schedules organized in one place.</p>
        </div>
        <button className="mf-primary" type="button" onClick={openAddModal}>＋ Add new farm</button>
      </header>

      <div className="mf-stats">
        <div className="mf-stat"><span className="mf-stat-label">Registered farms</span><strong className="mf-stat-value">{farms.length}</strong></div>
        <div className="mf-stat"><span className="mf-stat-label">Total farm area</span><strong className="mf-stat-value">{totalArea.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 650 }}>ha</span></strong></div>
        <div className="mf-stat"><span className="mf-stat-label">Ready to harvest</span><strong className="mf-stat-value">{readyCount}</strong></div>
      </div>

      <div className="mf-toolbar">
        <div className="mf-search-wrap"><span className="mf-search-icon">⌕</span><input className="mf-input mf-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by farm, location, variety, or status..." aria-label="Search farms" /></div>
        <span className="mf-count">Showing {filteredFarms.length} of {farms.length} farm{farms.length === 1 ? "" : "s"}</span>
      </div>

      {filteredFarms.length === 0 ? (
        <div className="mf-empty">
          <div className="mf-empty-icon">{farms.length ? "🔎" : "🌱"}</div>
          <h2>{farms.length ? "No matching farms" : "Start with your first farm"}</h2>
          <p>{farms.length ? "Try a different search term to find a farm record." : "Add your farm details to begin organizing field sizes, corn varieties, and harvest dates."}</p>
          {!farms.length && <button className="mf-primary" type="button" onClick={openAddModal}>＋ Add your first farm</button>}
        </div>
      ) : (
        <div className="mf-grid">
          {filteredFarms.map((farm) => (
            <article className="mf-card" key={farm.id}>
              <div className="mf-banner">
                <span className="mf-corn">🌽</span>
                <span className={`mf-badge ${statusClass(farm.status)}`}>{farm.status || "Growing"}</span>
              </div>
              <div className="mf-card-body">
                <h2 className="mf-farm-name">{farm.name}</h2>
                <div className="mf-location">⌖ {[farm.barangay, farm.municipality].filter(Boolean).join(", ") || "Location not specified"}</div>
                <div className="mf-details">
                  <div><span className="mf-dlabel">FARM AREA</span><span className="mf-dvalue">{farm.area !== "" && farm.area != null ? `${farm.area} ha` : "Not set"}</span></div>
                  <div><span className="mf-dlabel">CORN VARIETY</span><span className="mf-dvalue">{farm.variety || "Not set"}</span></div>
                  <div><span className="mf-dlabel">PLANTING DATE</span><span className="mf-dvalue">{formatDate(farm.plantingDate)}</span></div>
                  <div><span className="mf-dlabel">EXPECTED HARVEST</span><span className="mf-dvalue">{formatDate(farm.harvestDate)}</span></div>
                </div>
                {farm.notes && <div className="mf-notes">{farm.notes}</div>}
              </div>
              <div className="mf-card-actions">
                <button className="mf-secondary" type="button" onClick={() => openEditModal(farm)}>Edit details</button>
                <button className="mf-danger" type="button" onClick={() => deleteFarm(farm.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="mf-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className="mf-modal" role="dialog" aria-modal="true" aria-labelledby="mf-modal-title">
            <div className="mf-modal-head">
              <div className="mf-modal-heading">
                <div className="mf-modal-icon">🌽</div>
                <div>
                  <p className="mf-kicker">{editingId ? "UPDATE YOUR FARM PROFILE" : "NEW FARM REGISTRATION"}</p>
                  <h2 id="mf-modal-title">{editingId ? "Edit farm details" : "Add a new farm"}</h2>
                  <p>Enter your farm information so you can plan planting and harvest activities.</p>
                </div>
              </div>
              <button className="mf-close" type="button" onClick={closeModal} aria-label="Close dialog">×</button>
            </div>

            <form className="mf-modal-body" onSubmit={saveFarm}>
              <h3 className="mf-section-title">Farm information</h3>
              <div className="mf-form-grid">
                <div className="mf-field">
                  <label htmlFor="mf-name">Farm name <span className="mf-required">*</span></label>
                  <input id="mf-name" className="mf-input" required autoFocus value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. North Field Farm" />
                  <span className="mf-help">Choose a name you can easily recognize.</span>
                </div>
                <div className="mf-field">
                  <label htmlFor="mf-area">Farm area (hectares) <span className="mf-required">*</span></label>
                  <input id="mf-area" className="mf-input" type="number" min="0.01" step="0.01" required value={form.area} onChange={(e) => updateField("area", e.target.value)} placeholder="e.g. 2.50" />
                  <span className="mf-help">Enter the total area used for this farm.</span>
                </div>
                <div className="mf-field">
                  <label htmlFor="mf-municipality">Municipality / City <span className="mf-required">*</span></label>
                  <input id="mf-municipality" className="mf-input" required value={form.municipality} onChange={(e) => updateField("municipality", e.target.value)} placeholder="e.g. Tuguegarao City" />
                </div>
                <div className="mf-field">
                  <label htmlFor="mf-barangay">Barangay / Sitio</label>
                  <input id="mf-barangay" className="mf-input" value={form.barangay} onChange={(e) => updateField("barangay", e.target.value)} placeholder="Enter barangay or sitio" />
                </div>
                <div className="mf-field">
                  <label htmlFor="mf-variety">Corn variety</label>
                  <select id="mf-variety" className="mf-input" value={form.variety} onChange={(e) => updateField("variety", e.target.value)}>
                    <option>Yellow corn</option><option>White corn</option><option>Sweet corn</option><option>Native corn</option><option>Other / mixed variety</option>
                  </select>
                </div>
                <div className="mf-field">
                  <label htmlFor="mf-status">Current crop status</label>
                  <select id="mf-status" className="mf-input" value={form.status} onChange={(e) => updateField("status", e.target.value)}>
                    <option>Preparing land</option><option>Growing</option><option>Ready to harvest</option><option>Harvested</option>
                  </select>
                </div>
              </div>

              <div className="mf-modal-divider" />
              <h3 className="mf-section-title">Planting schedule</h3>
              <div className="mf-form-grid">
                <div className="mf-field">
                  <label htmlFor="mf-planting">Planting date</label>
                  <input id="mf-planting" className="mf-input" type="date" value={form.plantingDate} onChange={(e) => updateField("plantingDate", e.target.value)} />
                  <span className="mf-help">When was the crop planted?</span>
                </div>
                <div className="mf-field">
                  <label htmlFor="mf-harvest">Expected harvest date</label>
                  <input id="mf-harvest" className="mf-input" type="date" min={form.plantingDate || undefined} value={form.harvestDate} onChange={(e) => updateField("harvestDate", e.target.value)} />
                  <span className="mf-help">Used by the Harvest Planner.</span>
                </div>
                <div className="mf-field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="mf-notes">Additional notes <span style={{ color: "#94a095", fontWeight: 500 }}>(optional)</span></label>
                  <textarea id="mf-notes" className="mf-input" rows="3" value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Soil conditions, irrigation details, field notes, or other useful information..." />
                </div>
              </div>

              {error && <div className="mf-form-error" role="alert">{error}</div>}

              <div className="mf-modal-footer">
                <div className="mf-footer-note"><span className="mf-required">*</span> Required fields. Your farm record is saved in this browser.</div>
                <div className="mf-footer-actions">
                  <button className="mf-secondary" type="button" onClick={closeModal}>Cancel</button>
                  <button className="mf-primary" type="submit">{editingId ? "Save changes" : "Save farm record"}</button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
