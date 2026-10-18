import {
  availableFor, committedToDemand, daysUntil, farmMatchesDemand, fmt, formatDate,
  getStatus, openDemand, pct, pillClass,
} from "./farmerData";

export default function Overview({ farms, commitments, deliveries, onNavigate }) {
  const totalArea = fmt(farms.reduce((s, f) => s + f.area, 0));
  const expected = fmt(farms.reduce((s, f) => s + f.expectedVolume, 0));
  const committed = fmt(commitments.reduce((s, c) => s + c.volume, 0));
  const upcoming = farms
    .filter((f) => daysUntil(f.harvestDate) >= 0)
    .sort((a, b) => a.harvestDate.localeCompare(b.harvestDate));
  const next = upcoming[0];
  const active = deliveries.filter((d) => d.status !== "Delivered");
  const delayed = active.filter((d) => d.status === "Delayed").length;

  const attention = [];
  openDemand.forEach((d) => {
    const mine = committedToDemand(d.id, commitments);
    const needed = Math.max(d.required - d.covered - mine, 0);
    const available = fmt(
      farms.filter((f) => farmMatchesDemand(f, d).ok).reduce((s, f) => s + availableFor(f, commitments), 0)
    );
    if (needed > 0 && available > 0) {
      attention.push({
        symbol: "⇄", tone: "activity-gold",
        title: `${available} t of yours can help fill ${d.label}`,
        text: `The plant still needs ${needed} t for that period. Commit supply to lock it in.`,
      });
    }
  });
  active.filter((d) => d.status === "Delayed").forEach((d) => {
    attention.push({ symbol: "!", tone: "activity-blue", title: `${d.id} is marked delayed`, text: `${d.volume} t from ${d.farmName}. Update the plant when you have a new time.` });
  });

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">CORNLINK FARMER WORKSPACE</div>
          <h1>Welcome back, Farmer <span aria-hidden="true">🌽</span></h1>
          <p>Manage your farms, plan your harvest, and track your corn supply.</p>
        </div>
        <button type="button" className="primary-button" onClick={() => onNavigate("My Farm Records")}>
          <span>＋</span> Manage my farms
        </button>
      </section>

      <section className="summary-grid" aria-label="Farmer summary">
        <article className="summary-card">
          <div className="summary-top"><span>My registered farms</span><span className="summary-icon green-icon">⌂</span></div>
          <div className="summary-value">{farms.length}</div>
          <div className="summary-foot">{totalArea} hectares in total</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Next harvest</span><span className="summary-icon lime-icon">◷</span></div>
          <div className="summary-value">{next ? <>{fmt(next.expectedVolume)} <small>tons</small></> : "—"}</div>
          <div className="summary-foot">{next ? `${next.name} · ${formatDate(next.harvestDate)}` : "No upcoming harvests"}</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Supply commitments</span><span className="summary-icon gold-icon">⇄</span></div>
          <div className="summary-value">{committed} <small>tons</small></div>
          <div className="summary-foot"><b>{pct(committed, expected)}%</b> of your expected harvest</div>
          <div className="progress-track gold-progress"><i style={{ width: `${Math.min(pct(committed, expected), 100)}%` }} /></div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Deliveries</span><span className="summary-icon blue-icon">▤</span></div>
          <div className="summary-value">{active.length} <small>active</small></div>
          <div className="summary-foot">{delayed ? `${delayed} delayed` : "All on schedule"}</div>
        </article>
      </section>

      {farms.length === 0 ? (
        <section className="panel" style={{ padding: 24 }}>
          <div className="section-kicker">GET STARTED</div>
          <h2 style={{ marginTop: 8 }}>Build your farm profile</h2>
          <p style={{ lineHeight: 1.7 }}>Add your farm details first. CornLink can then organize planting dates, expected harvests, supply commitments, and deliveries.</p>
          <button type="button" className="primary-button" onClick={() => onNavigate("My Farm Records")}>Open My Farm Records <span>→</span></button>
        </section>
      ) : (
        <section className="content-grid">
          <article className="panel forecast-panel">
            <div className="panel-heading">
              <div><div className="section-kicker">YOUR HARVESTS</div><h2>Upcoming harvests</h2></div>
              <button className="select-button" onClick={() => onNavigate("Harvest Planner")}>Open planner <span>→</span></button>
            </div>
            <div className="table-scroll">
              <table>
                <thead><tr><th>FARM</th><th>VARIETY</th><th>HARVEST</th><th>EXPECTED</th><th>STATUS</th></tr></thead>
                <tbody>
                  {upcoming.slice(0, 4).map((f) => (
                    <tr key={f.id}>
                      <td><strong>{f.name}</strong></td>
                      <td>{f.variety}</td>
                      <td>{formatDate(f.harvestDate)}</td>
                      <td><strong className="volume-value">{fmt(f.expectedVolume)} t</strong></td>
                      <td><span className={`status-pill ${pillClass[getStatus(f)]}`}><i />{getStatus(f)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {upcoming.length === 0 && <div className="empty-state">No upcoming harvests. Update a farm's harvest date to see it here.</div>}
            </div>
          </article>

          <article className="panel activity-panel">
            <div className="panel-heading">
              <div><div className="section-kicker">NEEDS ATTENTION</div><h2>For you to act on</h2></div>
            </div>
            <div className="activity-list">
              {attention.length === 0 && <div className="empty-state">You're all caught up.</div>}
              {attention.map((a) => (
                <div className="activity-item" key={a.title}>
                  <div className={`activity-symbol ${a.tone}`}>{a.symbol}</div>
                  <div><p><strong>{a.title}</strong><br />{a.text}</p></div>
                </div>
              ))}
            </div>
            <button className="activity-link" onClick={() => onNavigate("Supply Matching")}>Go to supply matching <span>→</span></button>
          </article>
        </section>
      )}
    </>
  );
}
