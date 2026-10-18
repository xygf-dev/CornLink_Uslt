import {
  availableForPlot, committedToDemand, daysUntil, farmMatchesDemand, fmt, formatDate,
  getStatus, memberName, openDemand, pct, pillClass, plotsOfMember,
} from "./coopData";

export default function Overview({ members, plots, commitments, deliveries, onNavigate }) {
  const activeMembers = members.filter((m) => m.status === "Active").length;
  const totalArea = fmt(plots.reduce((s, p) => s + p.area, 0));
  const expected = fmt(plots.reduce((s, p) => s + p.expectedVolume, 0));
  const committed = fmt(commitments.reduce((s, c) => s + c.total, 0));
  const upcoming = plots
    .filter((p) => daysUntil(p.harvestDate) >= 0)
    .sort((a, b) => a.harvestDate.localeCompare(b.harvestDate));
  const active = deliveries.filter((d) => d.status !== "Delivered");
  const delayed = active.filter((d) => d.status === "Delayed");

  const attention = [];
  openDemand.forEach((d) => {
    const needed = Math.max(d.required - d.covered - committedToDemand(d.id, commitments), 0);
    const available = fmt(
      plots.filter((p) => farmMatchesDemand(p, d).ok).reduce((s, p) => s + availableForPlot(p, commitments), 0)
    );
    if (needed > 0 && available > 0) {
      attention.push({
        symbol: "⇄", tone: "activity-gold",
        title: `Your members can supply ${available} t for ${d.label}`,
        text: `The plant still needs ${fmt(needed)} t for that period. Pool your members' corn to fill it.`,
      });
    }
  });
  members
    .filter((m) => m.status === "Active" && plotsOfMember(m.id, plots).length === 0)
    .forEach((m) => {
      attention.push({ symbol: "＋", tone: "activity-green", title: `${m.name} has no farm records yet`, text: "Add their plot so their corn can be counted in your supply." });
    });
  delayed.forEach((d) => {
    attention.push({ symbol: "!", tone: "activity-blue", title: `${d.id} is marked delayed`, text: `${d.volume} t for ${d.period}. Update the plant with a new time.` });
  });

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">COOPERATIVE WORKSPACE</div>
          <h1>Good morning, Ana <span aria-hidden="true">☀</span></h1>
          <p>Your members' corn, pooled into one supply you can commit to the plant.</p>
        </div>
        <button type="button" className="primary-button" onClick={() => onNavigate("Members")}>
          <span>＋</span> Manage members
        </button>
      </section>

      <section className="summary-grid" aria-label="Cooperative summary">
        <article className="summary-card">
          <div className="summary-top"><span>Active members</span><span className="summary-icon green-icon">⌂</span></div>
          <div className="summary-value">{activeMembers} <small>of {members.length}</small></div>
          <div className="summary-foot">{plots.length} plots · {totalArea} hectares</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Pooled supply</span><span className="summary-icon lime-icon">◷</span></div>
          <div className="summary-value">{expected} <small>tons</small></div>
          <div className="summary-foot">{upcoming[0] ? `First harvest ${formatDate(upcoming[0].harvestDate)}` : "No upcoming harvests"}</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Committed to the plant</span><span className="summary-icon gold-icon">⇄</span></div>
          <div className="summary-value">{committed} <small>tons</small></div>
          <div className="summary-foot"><b>{pct(committed, expected)}%</b> of pooled supply</div>
          <div className="progress-track gold-progress"><i style={{ width: `${Math.min(pct(committed, expected), 100)}%` }} /></div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Deliveries</span><span className="summary-icon blue-icon">▤</span></div>
          <div className="summary-value">{active.length} <small>active</small></div>
          <div className="summary-foot">{delayed.length ? `${delayed.length} delayed` : "All on schedule"}</div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel forecast-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">MEMBER HARVESTS</div><h2>Upcoming harvests</h2></div>
            <button className="select-button" onClick={() => onNavigate("Supply Pool")}>Open supply pool <span>→</span></button>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>PLOT / MEMBER</th><th>VARIETY</th><th>HARVEST</th><th>EXPECTED</th><th>STATUS</th></tr></thead>
              <tbody>
                {upcoming.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong><br /><small>{memberName(p.memberId, members)}</small></td>
                    <td>{p.variety}</td>
                    <td>{formatDate(p.harvestDate)}</td>
                    <td><strong className="volume-value">{fmt(p.expectedVolume)} t</strong></td>
                    <td><span className={`status-pill ${pillClass[getStatus(p)]}`}><i />{getStatus(p)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {upcoming.length === 0 && <div className="empty-state">No upcoming harvests. Add member plots to see them here.</div>}
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
    </>
  );
}
