import React, { useEffect, useMemo, useState } from "react";

const QUALITY_KEY = "cornlink-farmer-quality-records";
const FARM_KEY = "cornlink-farmer-farms";
const EMPTY_FORM = { farmName: "", inspectionDate: "", grade: "Pending inspection", moisture: "", inspector: "", notes: "" };

const styles = `
  .mq-page{--mq-green:#1d603a;--mq-border:#e0e9dd;--mq-muted:#758579;color:#203b2a;font-family:Inter,"Segoe UI",Arial,sans-serif;width:100%;max-width:1400px;margin:0 auto}
  .mq-page *{box-sizing:border-box}.mq-page button,.mq-page input,.mq-page select,.mq-page textarea{font:inherit}
  .mq-header{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin-bottom:23px}.mq-kicker{color:#4f8a5a;font-size:10px;letter-spacing:1.5px;font-weight:800;margin:0 0 9px}.mq-title{font-size:clamp(25px,3vw,33px);line-height:1.2;margin:0 0 8px;font-weight:800;letter-spacing:-.8px}.mq-subtitle{font-size:13px;line-height:1.6;color:var(--mq-muted);margin:0}
  .mq-primary,.mq-secondary,.mq-danger{border-radius:9px;padding:11px 14px;font-size:12px;font-weight:750;cursor:pointer;transition:.15s}.mq-primary{border:1px solid var(--mq-green);background:var(--mq-green);color:#fff}.mq-primary:hover{background:#154a2c}.mq-secondary{border:1px solid #d9e5d6;background:#fff;color:#31583b}.mq-secondary:hover{background:#f3f8f0}.mq-danger{border:1px solid #f0d8d4;background:#fff;color:#a34338}
  .mq-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin-bottom:20px}.mq-stat{background:#fff;border:1px solid var(--mq-border);border-radius:13px;padding:16px 18px}.mq-stat-label{display:block;color:var(--mq-muted);font-size:11px;margin-bottom:9px}.mq-stat-value{font-size:25px;font-weight:800;line-height:1}
  .mq-form{background:#fff;border:1px solid var(--mq-border);border-radius:15px;padding:20px;margin-bottom:19px}.mq-form-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:17px}.mq-form-head h2{font-size:17px;margin:0;font-weight:800}.mq-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.mq-field label{display:block;font-size:11px;font-weight:750;color:#4d6753;margin-bottom:7px}.mq-input{width:100%;min-width:0;border:1px solid #dce6d9;border-radius:9px;padding:11px 12px;color:#23432e;background:#fff;outline:none;font-size:12px}.mq-input:focus{border-color:#73a779;box-shadow:0 0 0 3px #e5f2e1}.mq-form-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:16px}
  .mq-toolbar{display:flex;justify-content:space-between;align-items:center;gap:13px;padding:13px;background:#fff;border:1px solid var(--mq-border);border-radius:13px;margin-bottom:17px}.mq-search{max-width:420px}.mq-count{font-size:11px;color:var(--mq-muted);white-space:nowrap}
  .mq-layout{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(240px,.6fr);gap:17px;align-items:start}.mq-records{display:grid;gap:12px}.mq-record{display:grid;grid-template-columns:51px minmax(0,1fr) auto;gap:14px;align-items:center;background:#fff;border:1px solid var(--mq-border);border-radius:14px;padding:16px}.mq-symbol{width:49px;height:49px;border-radius:13px;background:#eaf5e5;display:grid;place-items:center;font-size:23px}.mq-record h2{font-size:14px;margin:0 0 6px;font-weight:800;overflow-wrap:anywhere}.mq-record p{font-size:10px;color:#7e8d80;margin:0;line-height:1.7;overflow-wrap:anywhere}.mq-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:30px;padding:6px 9px;font-size:10px;font-weight:800;background:#e5f4e1;color:#347044;white-space:nowrap}.mq-badge.pending{background:#fff1d5;color:#8b6418}.mq-badge.review{background:#fbe8e5;color:#a34338}
  .mq-quality-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:11px}.mq-quality-chip{background:#f4f8f1;border-radius:8px;padding:9px}.mq-quality-chip span{display:block;font-size:9px;color:#819083;margin-bottom:4px}.mq-quality-chip strong{font-size:11px;color:#31553a}
  .mq-side{background:#eaf4e5;border:1px solid #dfebd8;border-radius:15px;padding:21px}.mq-side-icon{font-size:27px}.mq-side .mq-kicker{margin-top:13px}.mq-side h2{font-size:18px;line-height:1.35;margin:0 0 9px;font-weight:800}.mq-side p{font-size:11px;line-height:1.75;color:#627a66;margin:0 0 13px}.mq-side-note{background:#fff9;border-radius:10px;padding:12px;font-size:10px;line-height:1.65;color:#56715a}
  .mq-empty{background:#fff;border:1px dashed #c9dcc5;border-radius:15px;padding:40px 20px;text-align:center}.mq-empty-icon{font-size:34px;margin-bottom:10px}.mq-empty h2{font-size:16px;margin:0 0 7px}.mq-empty p{font-size:12px;color:var(--mq-muted);line-height:1.6;margin:0 auto 16px;max-width:390px}.mq-delete{margin-top:10px}
  @media(max-width:950px){.mq-layout{grid-template-columns:1fr}}@media(max-width:650px){.mq-header{align-items:flex-start;flex-direction:column}.mq-stats{gap:8px}.mq-stat{padding:12px}.mq-stat-value{font-size:21px}.mq-form-grid{grid-template-columns:1fr}.mq-toolbar{align-items:stretch;flex-direction:column}.mq-search{max-width:none}.mq-record{grid-template-columns:42px minmax(0,1fr)}.mq-symbol{width:40px;height:40px}.mq-record>.mq-badge{grid-column:2;justify-self:start}}
`;

function readArray(key) {
  try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
function badgeClass(grade) {
  if (grade === "Passed") return "";
  if (grade === "Needs review") return "review";
  return "pending";
}

export default function QualityRecords() {
  const [farms] = useState(() => readArray(FARM_KEY));
  const [records, setRecords] = useState(() => readArray(QUALITY_KEY));
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { localStorage.setItem(QUALITY_KEY, JSON.stringify(records)); }, [records]);

  const filtered = useMemo(() => records.filter((record) => {
    const matchesQuery = [record.farmName, record.grade, record.inspector, record.notes].some((value) => String(value || "").toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (filter === "All" || record.grade === filter);
  }), [records, query, filter]);

  const passed = records.filter((record) => record.grade === "Passed").length;
  const pending = records.filter((record) => record.grade === "Pending inspection").length;
  const review = records.filter((record) => record.grade === "Needs review").length;

  function submit(event) {
    event.preventDefault();
    const record = { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setRecords((current) => [record, ...current]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function removeRecord(id) {
    if (window.confirm("Delete this quality record?")) setRecords((current) => current.filter((record) => record.id !== id));
  }

  return (
    <div className="mq-page">
      <style>{styles}</style>
      <header className="mq-header">
        <div><p className="mq-kicker">QUALITY AND INSPECTION</p><h1 className="mq-title">Quality Records</h1><p className="mq-subtitle">Record inspection results, moisture readings, and follow-up notes for your corn batches.</p></div>
        <button className="mq-primary" type="button" onClick={() => setShowForm((value) => !value)}>＋ Add quality record</button>
      </header>

      <div className="mq-stats">
        <div className="mq-stat"><span className="mq-stat-label">Total records</span><strong className="mq-stat-value">{records.length}</strong></div>
        <div className="mq-stat"><span className="mq-stat-label">Passed</span><strong className="mq-stat-value">{passed}</strong></div>
        <div className="mq-stat"><span className="mq-stat-label">Needs attention</span><strong className="mq-stat-value">{pending + review}</strong></div>
      </div>

      {showForm && <form className="mq-form" onSubmit={submit}>
        <div className="mq-form-head"><div><p className="mq-kicker">INSPECTION DETAILS</p><h2>Add quality record</h2></div><button className="mq-secondary" type="button" onClick={() => setShowForm(false)}>Close</button></div>
        <div className="mq-form-grid">
          <div className="mq-field"><label htmlFor="mq-farm">Farm / batch name *</label><input id="mq-farm" list="mq-farm-options" className="mq-input" required value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} placeholder="Enter farm or batch name" /><datalist id="mq-farm-options">{farms.map((farm) => <option key={farm.id} value={farm.name} />)}</datalist></div>
          <div className="mq-field"><label htmlFor="mq-date">Inspection date *</label><input id="mq-date" className="mq-input" type="date" required value={form.inspectionDate} onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })} /></div>
          <div className="mq-field"><label htmlFor="mq-grade">Inspection result</label><select id="mq-grade" className="mq-input" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}><option>Pending inspection</option><option>Passed</option><option>Needs review</option></select></div>
          <div className="mq-field"><label htmlFor="mq-moisture">Moisture reading (%)</label><input id="mq-moisture" className="mq-input" type="number" min="0" max="100" step="0.1" value={form.moisture} onChange={(e) => setForm({ ...form, moisture: e.target.value })} placeholder="e.g. 14.0" /></div>
          <div className="mq-field"><label htmlFor="mq-inspector">Inspector / agency</label><input id="mq-inspector" className="mq-input" value={form.inspector} onChange={(e) => setForm({ ...form, inspector: e.target.value })} placeholder="Inspector or organization" /></div>
          <div className="mq-field"><label htmlFor="mq-notes">Notes / remarks</label><input id="mq-notes" className="mq-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Remarks or required follow-up" /></div>
        </div>
        <div className="mq-form-actions"><button className="mq-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="mq-primary" type="submit">Save quality record</button></div>
      </form>}

      <div className="mq-toolbar">
        <input className="mq-input mq-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search farm, inspector, result, or notes..." aria-label="Search quality records" />
        <select className="mq-input" style={{ maxWidth: 190 }} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter quality records"><option>All</option><option>Passed</option><option>Pending inspection</option><option>Needs review</option></select>
        <span className="mq-count">{filtered.length} record{filtered.length === 1 ? "" : "s"}</span>
      </div>

      <div className="mq-layout">
        <div className="mq-records">
          {filtered.length === 0 ? <div className="mq-empty"><div className="mq-empty-icon">🧪</div><h2>{records.length ? "No matching quality records" : "No quality records yet"}</h2><p>{records.length ? "Try another search term or result filter." : "Add a record after a quality check to keep inspection information organized."}</p>{records.length === 0 && <button className="mq-primary" type="button" onClick={() => setShowForm(true)}>＋ Add first record</button>}</div> :
            filtered.map((record) => <article className="mq-record" key={record.id}>
              <div className="mq-symbol">{record.grade === "Passed" ? "✓" : record.grade === "Needs review" ? "!" : "◷"}</div>
              <div><h2>{record.farmName}</h2><p>Inspection date: {record.inspectionDate || "Not set"} · Inspector: {record.inspector || "Not specified"}</p><div className="mq-quality-grid"><div className="mq-quality-chip"><span>MOISTURE READING</span><strong>{record.moisture !== "" && record.moisture != null ? `${record.moisture}%` : "Not recorded"}</strong></div><div className="mq-quality-chip"><span>INSPECTION NOTES</span><strong>{record.notes || "No remarks"}</strong></div></div><button className="mq-danger mq-delete" type="button" onClick={() => removeRecord(record.id)}>Delete record</button></div>
              <span className={`mq-badge ${badgeClass(record.grade)}`}>{record.grade || "Pending inspection"}</span>
            </article>)}
        </div>
        <aside className="mq-side"><span className="mq-side-icon">🧪</span><p className="mq-kicker">QUALITY CHECK REMINDER</p><h2>Keep each batch traceable</h2><p>Record the batch or farm name, inspection date, moisture reading, inspector, and any remarks so information can be reviewed later.</p><div className="mq-side-note"><strong>Important:</strong> These entries are user-maintained tracking records. They do not replace official laboratory results, food safety clearance, or inspection certificates.</div></aside>
      </div>
    </div>
  );
}
