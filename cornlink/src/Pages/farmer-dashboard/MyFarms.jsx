import { useState } from "react";
import Modal from "../Modal";
import { committedFor, fmt, formatDate, getStatus, initials, pillClass } from "./farmerData";

export default function MyFarms({ farms, setFarms, commitments, notify }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | a farm object
  const [error, setError] = useState("");

  const visible = farms.filter((f) =>
    `${f.name} ${f.location} ${f.variety}`.toLowerCase().includes(query.toLowerCase())
  );
  const totalArea = fmt(farms.reduce((s, f) => s + f.area, 0));
  const expected = fmt(farms.reduce((s, f) => s + f.expectedVolume, 0));
  const yieldPerHa = totalArea ? fmt(expected / totalArea) : 0;
  const draft = editing && editing !== "new" ? editing : null;

  function closeModal() {
    setEditing(null);
    setError("");
  }

  function saveFarm(event) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const plantingDate = f.get("plantingDate");
    const harvestDate = f.get("harvestDate");
    if (harvestDate <= plantingDate) {
      setError("The harvest date must be after the planting date.");
      return;
    }
    const record = {
      name: f.get("name").trim(),
      location: f.get("location").trim(),
      area: Number(f.get("area")),
      variety: f.get("variety"),
      plantingDate,
      harvestDate,
      expectedVolume: Number(f.get("expectedVolume")),
    };
    if (draft) {
      const committed = committedFor(draft.id, commitments);
      if (record.expectedVolume < committed) {
        setError(`You have already committed ${fmt(committed)} t from this farm. Expected volume can't be lower than that.`);
        return;
      }
      setFarms((items) => items.map((x) => (x.id === draft.id ? { ...x, ...record } : x)));
      notify("Farm record updated");
    } else {
      setFarms((items) => [{ id: `F-${Date.now().toString().slice(-5)}`, ...record }, ...items]);
      notify("Farm record added");
    }
    closeModal();
  }

  function removeFarm(farm) {
    if (committedFor(farm.id, commitments) > 0) {
      notify("Withdraw this farm's supply commitments before removing it");
      return;
    }
    if (!window.confirm(`Remove ${farm.name}?`)) return;
    setFarms((items) => items.filter((x) => x.id !== farm.id));
    notify(`${farm.name} removed`);
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">MY FARM RECORDS</div>
          <h1>My farms</h1>
          <p>Register each plot with its planting details so CornLink can forecast your harvest.</p>
        </div>
        <button className="primary-button" onClick={() => setEditing("new")}><span>＋</span> Add farm</button>
      </section>

      <section className="summary-grid" aria-label="Farm totals">
        <article className="summary-card">
          <div className="summary-top"><span>Registered farms</span><span className="summary-icon green-icon">⌂</span></div>
          <div className="summary-value">{farms.length}</div>
          <div className="summary-foot">Plots on your account</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Total area</span><span className="summary-icon lime-icon">▦</span></div>
          <div className="summary-value">{totalArea} <small>ha</small></div>
          <div className="summary-foot">Planted to corn</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Expected harvest</span><span className="summary-icon gold-icon">◷</span></div>
          <div className="summary-value">{expected} <small>tons</small></div>
          <div className="summary-foot">Across all farms</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Average yield</span><span className="summary-icon blue-icon">↗</span></div>
          <div className="summary-value">{yieldPerHa} <small>t/ha</small></div>
          <div className="summary-foot">Expected volume per hectare</div>
        </article>
      </section>

      <section className="panel farms-panel">
        <div className="farms-heading">
          <div><div className="section-kicker">YOUR PLOTS</div><h2>Farm records <span className="table-count">{visible.length}</span></h2></div>
        </div>
        <div className="table-toolbar">
          <label className="search-box">
            <span>⌕</span>
            <input type="search" placeholder="Search by name, location or variety..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>FARM</th><th>AREA</th><th>VARIETY</th><th>PLANTED</th><th>HARVEST</th><th>EXPECTED</th><th>STATUS</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((f) => (
                <tr key={f.id}>
                  <td><div className="farm-cell"><span className="farm-avatar">{initials(f.name)}</span><span><strong>{f.name}</strong><small>{f.location}</small></span></div></td>
                  <td>{f.area} ha</td>
                  <td>{f.variety}</td>
                  <td>{formatDate(f.plantingDate)}</td>
                  <td>{formatDate(f.harvestDate)}</td>
                  <td><strong className="volume-value">{fmt(f.expectedVolume)} t</strong></td>
                  <td><span className={`status-pill ${pillClass[getStatus(f)]}`}><i />{getStatus(f)}</span></td>
                  <td>
                    <button className="text-button" onClick={() => setEditing(f)}>Edit</button>{" "}
                    <button className="text-button" onClick={() => removeFarm(f)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div className="empty-state">
              {farms.length === 0 ? "No farms yet. Add your first plot to get started." : "No farms match that search."}
            </div>
          )}
        </div>
      </section>

      {editing && (
        <Modal
          kicker="FARM RECORDS"
          title={draft ? "Edit farm record" : "Add a farm"}
          intro="Estimates are fine. You can update the harvest date and volume as the season goes on."
          onClose={closeModal}
        >
          <form onSubmit={saveFarm} key={draft ? draft.id : "new"}>
            <label>Farm or plot name<input name="name" required defaultValue={draft?.name} placeholder="e.g. North Field" /></label>
            <label>Location<input name="location" required defaultValue={draft?.location} placeholder="Barangay, municipality" /></label>
            <div className="form-row">
              <label>Area (hectares)<input name="area" type="number" min="0.1" step="0.1" required defaultValue={draft?.area} placeholder="0.0" /></label>
              <label>Corn variety
                <select name="variety" defaultValue={draft?.variety ?? "Yellow corn"}>
                  <option>Yellow corn</option>
                  <option>White corn</option>
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>Planting date<input name="plantingDate" type="date" required defaultValue={draft?.plantingDate ?? "2026-07-15"} /></label>
              <label>Expected harvest date<input name="harvestDate" type="date" required defaultValue={draft?.harvestDate ?? "2026-11-15"} /></label>
            </div>
            <label>Expected volume (tons)<input name="expectedVolume" type="number" min="0.1" step="0.1" required defaultValue={draft?.expectedVolume} placeholder="0.0" /></label>
            {error && <p role="alert" style={{ color: "#c4553b", margin: "4px 0 0" }}>{error}</p>}
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={closeModal}>Cancel</button>
              <button type="submit" className="primary-button">{draft ? "Save changes" : "Save farm"} <span>→</span></button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
