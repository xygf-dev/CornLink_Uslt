import { useState } from "react";
import Modal from "../Modal";
import {
  committedForPlot, fmt, formatDate, getStatus, initials, memberName, memberOf, pillClass,
} from "./coopData";

export default function FarmRecords({ members, plots, setPlots, commitments, notify }) {
  const [query, setQuery] = useState("");
  const [memberFilter, setMemberFilter] = useState("All members");
  const [editing, setEditing] = useState(null); // null | "new" | a plot
  const [error, setError] = useState("");

  const activeMembers = members.filter((m) => m.status === "Active");
  const visible = plots.filter((p) => {
    const matchesQuery = `${p.name} ${memberName(p.memberId, members)} ${p.variety}`.toLowerCase().includes(query.toLowerCase());
    const matchesMember = memberFilter === "All members" || p.memberId === memberFilter;
    return matchesQuery && matchesMember;
  });
  const totalArea = fmt(plots.reduce((s, p) => s + p.area, 0));
  const expected = fmt(plots.reduce((s, p) => s + p.expectedVolume, 0));
  const yieldPerHa = totalArea ? fmt(expected / totalArea) : 0;
  const draft = editing && editing !== "new" ? editing : null;

  function closeModal() {
    setEditing(null);
    setError("");
  }

  function savePlot(event) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const plantingDate = f.get("plantingDate");
    const harvestDate = f.get("harvestDate");
    if (harvestDate <= plantingDate) {
      setError("The harvest date must be after the planting date.");
      return;
    }
    const record = {
      memberId: f.get("memberId"),
      name: f.get("name").trim(),
      area: Number(f.get("area")),
      variety: f.get("variety"),
      plantingDate,
      harvestDate,
      expectedVolume: Number(f.get("expectedVolume")),
    };
    if (draft) {
      const committed = committedForPlot(draft.id, commitments);
      if (record.expectedVolume < committed) {
        setError(`${fmt(committed)} t from this plot is already committed. Expected volume can't be lower than that.`);
        return;
      }
      setPlots((items) => items.map((p) => (p.id === draft.id ? { ...p, ...record } : p)));
      notify("Plot updated");
    } else {
      setPlots((items) => [{ id: `P-${Date.now().toString().slice(-5)}`, ...record }, ...items]);
      notify("Plot added");
    }
    closeModal();
  }

  function removePlot(p) {
    if (committedForPlot(p.id, commitments) > 0) {
      notify("Withdraw this plot's commitments before removing it");
      return;
    }
    if (!window.confirm(`Remove ${p.name}?`)) return;
    setPlots((items) => items.filter((x) => x.id !== p.id));
    notify(`${p.name} removed`);
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">FARM RECORDS</div>
          <h1>Member farm records</h1>
          <p>Record each member's plots and planting details so the cooperative can forecast its supply.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => (activeMembers.length ? setEditing("new") : notify("Add an active member first"))}
        >
          <span>＋</span> Add plot
        </button>
      </section>

      <section className="summary-grid" aria-label="Farm totals">
        <article className="summary-card">
          <div className="summary-top"><span>Plots recorded</span><span className="summary-icon green-icon">⌂</span></div>
          <div className="summary-value">{plots.length}</div>
          <div className="summary-foot">Across {new Set(plots.map((p) => p.memberId)).size} members</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Total area</span><span className="summary-icon lime-icon">▦</span></div>
          <div className="summary-value">{totalArea} <small>ha</small></div>
          <div className="summary-foot">Planted to corn</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Expected harvest</span><span className="summary-icon gold-icon">◷</span></div>
          <div className="summary-value">{expected} <small>tons</small></div>
          <div className="summary-foot">Pooled from all plots</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Average yield</span><span className="summary-icon blue-icon">↗</span></div>
          <div className="summary-value">{yieldPerHa} <small>t/ha</small></div>
          <div className="summary-foot">Expected volume per hectare</div>
        </article>
      </section>

      <section className="panel farms-panel">
        <div className="farms-heading">
          <div><div className="section-kicker">ALL PLOTS</div><h2>Plots <span className="table-count">{visible.length}</span></h2></div>
        </div>
        <div className="table-toolbar">
          <label className="search-box">
            <span>⌕</span>
            <input type="search" placeholder="Search plot, member or variety..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <select aria-label="Filter by member" value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)}>
            <option>All members</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>PLOT / MEMBER</th><th>AREA</th><th>VARIETY</th><th>PLANTED</th><th>HARVEST</th><th>EXPECTED</th><th>STATUS</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td><div className="farm-cell"><span className="farm-avatar">{initials(p.name)}</span><span><strong>{p.name}</strong><small>{memberName(p.memberId, members)} · Brgy. {(memberOf(p.memberId, members) || {}).barangay}</small></span></div></td>
                  <td>{p.area} ha</td>
                  <td>{p.variety}</td>
                  <td>{formatDate(p.plantingDate)}</td>
                  <td>{formatDate(p.harvestDate)}</td>
                  <td><strong className="volume-value">{fmt(p.expectedVolume)} t</strong></td>
                  <td><span className={`status-pill ${pillClass[getStatus(p)]}`}><i />{getStatus(p)}</span></td>
                  <td>
                    <button className="text-button" onClick={() => setEditing(p)}>Edit</button>{" "}
                    <button className="text-button" onClick={() => removePlot(p)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <div className="empty-state">{plots.length === 0 ? "No plots yet. Add a member's first plot to get started." : "No plots match that search."}</div>}
        </div>
      </section>

      {editing && (
        <Modal
          kicker="FARM RECORDS"
          title={draft ? "Edit plot" : "Add a plot"}
          intro="Estimates are fine. You can update the harvest date and volume as the season goes on."
          onClose={closeModal}
        >
          <form onSubmit={savePlot} key={draft ? draft.id : "new"}>
            <label>Member
              <select name="memberId" required defaultValue={draft?.memberId ?? activeMembers[0]?.id}>
                {(draft ? members : activeMembers).map((m) => <option key={m.id} value={m.id}>{m.name} · Brgy. {m.barangay}</option>)}
              </select>
            </label>
            <label>Plot name<input name="name" required defaultValue={draft?.name} placeholder="e.g. Garita plot A" /></label>
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
              <button type="submit" className="primary-button">{draft ? "Save changes" : "Save plot"} <span>→</span></button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
