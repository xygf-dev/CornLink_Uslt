import { useState } from "react";
import Modal from "../Modal";
import {
  TODAY, committedForPlot, daysUntil, fmt, formatDate, getStatus, memberName, memberOf, pillClass, toIso,
} from "./coopData";

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

export default function SupplyPool({ members, plots, setPlots, commitments, notify }) {
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  const sorted = [...plots].sort((a, b) => a.harvestDate.localeCompare(b.harvestDate));
  const upcoming = sorted.filter((p) => daysUntil(p.harvestDate) >= 0);
  const next30 = fmt(upcoming.filter((p) => daysUntil(p.harvestDate) <= 30).reduce((s, p) => s + p.expectedVolume, 0));
  const totalExpected = fmt(plots.reduce((s, p) => s + p.expectedVolume, 0));
  const totalCommitted = fmt(plots.reduce((s, p) => s + committedForPlot(p.id, commitments), 0));

  const weekly = buckets.map((b) => {
    const inWeek = plots.filter((p) => p.harvestDate >= b.startIso && p.harvestDate <= b.endIso);
    return {
      ...b,
      expected: inWeek.reduce((s, p) => s + p.expectedVolume, 0),
      committed: inWeek.reduce((s, p) => s + committedForPlot(p.id, commitments), 0),
    };
  });
  const maxValue = Math.max(1, ...weekly.map((w) => w.expected));

  // Supply clusters: plots grouped by the member's barangay
  const groups = {};
  plots.forEach((p) => {
    const barangay = (memberOf(p.memberId, members) || {}).barangay || "Unassigned";
    groups[barangay] ??= { barangay, memberIds: new Set(), plots: 0, expected: 0, committed: 0, firstHarvest: p.harvestDate };
    const g = groups[barangay];
    g.memberIds.add(p.memberId);
    g.plots += 1;
    g.expected += p.expectedVolume;
    g.committed += committedForPlot(p.id, commitments);
    if (p.harvestDate < g.firstHarvest) g.firstHarvest = p.harvestDate;
  });
  const clusters = Object.values(groups).sort((a, b) => b.expected - a.expected);

  const byVariety = ["Yellow corn", "White corn"].map((v) => ({
    variety: v,
    tons: fmt(plots.filter((p) => p.variety === v).reduce((s, p) => s + p.expectedVolume, 0)),
  }));

  function saveForecast(event) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const harvestDate = f.get("harvestDate");
    const expectedVolume = Number(f.get("expectedVolume"));
    const committed = committedForPlot(updating.id, commitments);
    if (harvestDate <= updating.plantingDate) {
      setError("The harvest date must be after the planting date.");
      return;
    }
    if (expectedVolume < committed) {
      setError(`${fmt(committed)} t from this plot is already committed. Withdraw some commitments first.`);
      return;
    }
    setPlots((items) => items.map((p) => (p.id === updating.id ? { ...p, harvestDate, expectedVolume } : p)));
    notify(`Forecast updated for ${updating.name}`);
    setUpdating(null);
    setError("");
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">SUPPLY POOL</div>
          <h1>Pooled harvest forecast</h1>
          <p>All member harvests combined, grouped into clusters that are easier to collect and transport.</p>
        </div>
      </section>

      <section className="summary-grid" aria-label="Pool summary">
        <article className="summary-card">
          <div className="summary-top"><span>Pooled supply</span><span className="summary-icon green-icon">▦</span></div>
          <div className="summary-value">{totalExpected} <small>tons</small></div>
          <div className="summary-foot">From {plots.length} member plots</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Next 30 days</span><span className="summary-icon lime-icon">◷</span></div>
          <div className="summary-value">{next30} <small>tons</small></div>
          <div className="summary-foot">Expected to be harvested</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Committed</span><span className="summary-icon gold-icon">⇄</span></div>
          <div className="summary-value">{fmt(totalCommitted)} <small>tons</small></div>
          <div className="summary-foot">Promised to the plant</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Still uncommitted</span><span className="summary-icon blue-icon">▤</span></div>
          <div className="summary-value">{fmt(totalExpected - totalCommitted)} <small>tons</small></div>
          <div className="summary-foot">{byVariety.map((v) => `${v.tons} t ${v.variety.split(" ")[0].toLowerCase()}`).join(" · ")} expected</div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel forecast-panel">
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
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">SUPPLY CLUSTERS</div><h2>By barangay</h2></div>
          </div>
          <div className="activity-list">
            {clusters.length === 0 && <div className="empty-state">No plots yet.</div>}
            {clusters.map((g) => (
              <div className="activity-item" key={g.barangay}>
                <div className="activity-symbol activity-green">⌂</div>
                <div>
                  <p>
                    <strong>Brgy. {g.barangay}</strong><br />
                    {fmt(g.expected)} t from {g.memberIds.size} member{g.memberIds.size === 1 ? "" : "s"} · {fmt(g.committed)} t committed<br />
                    First harvest {formatDate(g.firstHarvest)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel farms-panel">
        <div className="farms-heading">
          <div><div className="section-kicker">SCHEDULE</div><h2>Harvest schedule <span className="table-count">{sorted.length}</span></h2></div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>PLOT / MEMBER</th><th>HARVEST DATE</th><th>TIMING</th><th>EXPECTED</th><th>COMMITTED</th><th>UNCOMMITTED</th><th>STATUS</th><th></th></tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const committed = committedForPlot(p.id, commitments);
                return (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong><br /><small>{memberName(p.memberId, members)} · {p.variety}</small></td>
                    <td>{formatDate(p.harvestDate)}</td>
                    <td>{inText(daysUntil(p.harvestDate))}</td>
                    <td>{fmt(p.expectedVolume)} t</td>
                    <td>{fmt(committed)} t</td>
                    <td><strong className="volume-value">{fmt(p.expectedVolume - committed)} t</strong></td>
                    <td><span className={`status-pill ${pillClass[getStatus(p)]}`}><i />{getStatus(p)}</span></td>
                    <td><button className="text-button" onClick={() => setUpdating(p)}>Update forecast</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length === 0 && <div className="empty-state">No plots yet. Add member plots under Farm Records.</div>}
        </div>
      </section>

      {updating && (
        <Modal
          kicker="SUPPLY POOL"
          title={`Update forecast: ${updating.name}`}
          intro={`Update this after checking in with ${memberName(updating.memberId, members)}. The plant plans around what you report.`}
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
