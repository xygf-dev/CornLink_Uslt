import { useState } from "react";
import Modal from "../Modal";
import {
  TODAY, committedFor, daysUntil, fmt, formatDate, getStatus, pillClass, toIso,
} from "./farmerData";

// Eight weeks, starting with the (Monday) week that contains today
const buckets = Array.from({ length: 8 }, (_, i) => {
  const start = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - 5 + i * 7);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return {
    startIso: toIso(start),
    endIso: toIso(end),
    label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
});

function inText(days) {
  if (days < 0) return "Harvested";
  if (days === 0) return "Today";
  return `in ${days} day${days === 1 ? "" : "s"}`;
}

export default function HarvestPlanner({ farms, setFarms, commitments, notify }) {
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  const sorted = [...farms].sort((a, b) => a.harvestDate.localeCompare(b.harvestDate));
  const upcoming = sorted.filter((f) => daysUntil(f.harvestDate) >= 0);
  const next = upcoming[0];
  const next30 = fmt(upcoming.filter((f) => daysUntil(f.harvestDate) <= 30).reduce((s, f) => s + f.expectedVolume, 0));
  const totalExpected = fmt(farms.reduce((s, f) => s + f.expectedVolume, 0));
  const totalCommitted = fmt(farms.reduce((s, f) => s + committedFor(f.id, commitments), 0));

  const weekly = buckets.map((b) => {
    const inWeek = farms.filter((f) => f.harvestDate >= b.startIso && f.harvestDate <= b.endIso);
    return {
      ...b,
      expected: inWeek.reduce((s, f) => s + f.expectedVolume, 0),
      committed: inWeek.reduce((s, f) => s + committedFor(f.id, commitments), 0),
    };
  });
  const maxValue = Math.max(1, ...weekly.map((w) => w.expected));

  function saveForecast(event) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const harvestDate = f.get("harvestDate");
    const expectedVolume = Number(f.get("expectedVolume"));
    const committed = committedFor(updating.id, commitments);
    if (harvestDate <= updating.plantingDate) {
      setError("The harvest date must be after the planting date.");
      return;
    }
    if (expectedVolume < committed) {
      setError(`You have already committed ${fmt(committed)} t from this farm. Withdraw some commitments first.`);
      return;
    }
    setFarms((items) => items.map((x) => (x.id === updating.id ? { ...x, harvestDate, expectedVolume } : x)));
    notify(`Forecast updated for ${updating.name}`);
    setUpdating(null);
    setError("");
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">HARVEST PLANNER</div>
          <h1>Plan your harvest</h1>
          <p>See when each farm will be ready and how much of that corn is already spoken for.</p>
        </div>
      </section>

      <section className="summary-grid" aria-label="Harvest summary">
        <article className="summary-card">
          <div className="summary-top"><span>Next harvest</span><span className="summary-icon lime-icon">◷</span></div>
          <div className="summary-value">{next ? inText(daysUntil(next.harvestDate)) : "—"}</div>
          <div className="summary-foot">{next ? `${next.name} · ${formatDate(next.harvestDate)}` : "Nothing scheduled"}</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Next 30 days</span><span className="summary-icon green-icon">▦</span></div>
          <div className="summary-value">{next30} <small>tons</small></div>
          <div className="summary-foot">Expected from your farms</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Committed</span><span className="summary-icon gold-icon">⇄</span></div>
          <div className="summary-value">{fmt(totalCommitted)} <small>tons</small></div>
          <div className="summary-foot">Promised to the plant</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Still uncommitted</span><span className="summary-icon blue-icon">▤</span></div>
          <div className="summary-value">{fmt(totalExpected - totalCommitted)} <small>tons</small></div>
          <div className="summary-foot">Available to offer</div>
        </article>
      </section>

      <section className="panel forecast-panel">
        <div className="panel-heading">
          <div><div className="section-kicker">WEEK BY WEEK</div><h2>Harvest calendar</h2></div>
        </div>
        <div className="chart-legend">
          <span><i className="legend-expected" />Expected harvest</span>
          <span><i className="legend-committed" />Committed</span>
        </div>
        <div className="chart-wrap">
          <div className="y-axis">
            {[1, 0.75, 0.5, 0.25].map((x) => <span key={x}>{fmt(maxValue * x)} t</span>)}
            <span>0</span>
          </div>
          <div className="chart-area">
            <div className="chart-gridlines"><i /><i /><i /><i /><i /></div>
            <div className="chart-columns">
              {weekly.map((w) => (
                <div className="chart-group" key={w.startIso}>
                  <div className="bar-pair">
                    <i className="bar expected-bar" style={{ height: `${(w.expected / maxValue) * 100}%` }} />
                    <i className="bar committed-bar" style={{ height: `${(w.committed / maxValue) * 100}%` }} />
                  </div>
                  <span>{w.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-caption">
          <span>Weeks start on the date shown</span>
          <span className="caption-note">Estimates are not commitments</span>
        </div>
      </section>

      <section className="panel farms-panel">
        <div className="farms-heading">
          <div><div className="section-kicker">SCHEDULE</div><h2>Harvest schedule <span className="table-count">{sorted.length}</span></h2></div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>FARM</th><th>HARVEST DATE</th><th>TIMING</th><th>EXPECTED</th><th>COMMITTED</th><th>UNCOMMITTED</th><th>STATUS</th><th></th></tr>
            </thead>
            <tbody>
              {sorted.map((f) => {
                const committed = committedFor(f.id, commitments);
                return (
                  <tr key={f.id}>
                    <td><strong>{f.name}</strong><br /><small>{f.variety}</small></td>
                    <td>{formatDate(f.harvestDate)}</td>
                    <td>{inText(daysUntil(f.harvestDate))}</td>
                    <td>{fmt(f.expectedVolume)} t</td>
                    <td>{fmt(committed)} t</td>
                    <td><strong className="volume-value">{fmt(f.expectedVolume - committed)} t</strong></td>
                    <td><span className={`status-pill ${pillClass[getStatus(f)]}`}><i />{getStatus(f)}</span></td>
                    <td><button className="text-button" onClick={() => setUpdating(f)}>Update forecast</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length === 0 && <div className="empty-state">No farms yet. Add one under My Farm Records.</div>}
        </div>
      </section>

      {updating && (
        <Modal
          kicker="HARVEST PLANNER"
          title={`Update forecast: ${updating.name}`}
          intro="Keep your estimate current. The plant plans around what you report here."
          onClose={() => { setUpdating(null); setError(""); }}
        >
          <form onSubmit={saveForecast}>
            <div className="form-row">
              <label>Expected harvest date<input name="harvestDate" type="date" required defaultValue={updating.harvestDate} /></label>
              <label>Expected volume (tons)<input name="expectedVolume" type="number" min="0.1" step="0.1" required defaultValue={updating.expectedVolume} /></label>
            </div>
            {error && <p role="alert" style={{ color: "#c4553b", margin: "4px 0 0" }}>{error}</p>}
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => { setUpdating(null); setError(""); }}>Cancel</button>
              <button type="submit" className="primary-button">Save forecast <span>→</span></button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
