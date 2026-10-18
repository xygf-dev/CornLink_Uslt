import { LIMITS, fmt, pct, pillClass } from "./farmerData";

const over = { color: "#c4553b", fontWeight: 700 };

function Metric({ value, limit }) {
  const isOver = value > limit;
  return (
    <span style={isOver ? over : undefined}>
      {value}%{isOver ? " ▲" : ""}
    </span>
  );
}

export default function QualityRecords({ deliveries }) {
  const inspected = deliveries.filter((d) => d.inspection);
  const accepted = inspected.filter((d) => d.inspection.result === "Accepted");
  const avg = (key) =>
    inspected.length ? fmt(inspected.reduce((s, d) => s + d.inspection[key], 0) / inspected.length) : 0;
  const moistureRejections = inspected.filter((d) => d.inspection.moisture > LIMITS.moisture).length;

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">QUALITY RECORDS</div>
          <h1>Your inspection results</h1>
          <p>Every delivery is checked on arrival. Use these results to see how your corn compares with plant limits.</p>
        </div>
      </section>

      <section className="summary-grid" aria-label="Quality summary">
        <article className="summary-card">
          <div className="summary-top"><span>Inspections</span><span className="summary-icon green-icon">✓</span></div>
          <div className="summary-value">{inspected.length}</div>
          <div className="summary-foot">Deliveries inspected</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Acceptance rate</span><span className="summary-icon lime-icon">↗</span></div>
          <div className="summary-value">{pct(accepted.length, inspected.length)}<small>%</small></div>
          <div className="summary-foot">{accepted.length} of {inspected.length} accepted</div>
          <div className="progress-track"><i style={{ width: `${pct(accepted.length, inspected.length)}%` }} /></div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Average moisture</span><span className="summary-icon gold-icon">◷</span></div>
          <div className="summary-value">{avg("moisture")}<small>%</small></div>
          <div className="summary-foot">Plant limit is {LIMITS.moisture}%</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Average kernel damage</span><span className="summary-icon blue-icon">▦</span></div>
          <div className="summary-value">{avg("damage")}<small>%</small></div>
          <div className="summary-foot">Plant limit is {LIMITS.damage}%</div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel forecast-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">PLAN VS. ACTUAL</div><h2>Inspection history</h2></div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>DELIVERY</th><th>DATE</th><th>VOLUME</th><th>MOISTURE</th><th>KERNEL DAMAGE</th><th>FOREIGN MATTER</th><th>RESULT</th></tr>
              </thead>
              <tbody>
                {inspected.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.farmName}</strong><br /><small>{d.id}</small></td>
                    <td>{d.when}</td>
                    <td>{fmt(d.volume)} t</td>
                    <td><Metric value={d.inspection.moisture} limit={LIMITS.moisture} /></td>
                    <td><Metric value={d.inspection.damage} limit={LIMITS.damage} /></td>
                    <td><Metric value={d.inspection.foreign} limit={LIMITS.foreign} /></td>
                    <td><span className={`status-pill ${pillClass[d.inspection.result]}`}><i />{d.inspection.result}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inspected.length === 0 && <div className="empty-state">No inspection results yet. They appear here after the plant checks your first delivery.</div>}
          </div>
          <div className="chart-caption">
            <span>▲ marks a reading above the plant limit</span>
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">PLANT LIMITS</div><h2>What passes</h2></div>
          </div>
          <div className="activity-list">
            <div className="activity-item"><div className="activity-symbol activity-green">✓</div><div><p><strong>Moisture</strong><br />{LIMITS.moisture}% or below</p></div></div>
            <div className="activity-item"><div className="activity-symbol activity-green">✓</div><div><p><strong>Kernel damage</strong><br />{LIMITS.damage}% or below</p></div></div>
            <div className="activity-item"><div className="activity-symbol activity-green">✓</div><div><p><strong>Foreign matter</strong><br />{LIMITS.foreign}% or below</p></div></div>
            {moistureRejections > 0 && (
              <div className="activity-item">
                <div className="activity-symbol activity-gold">!</div>
                <div><p><strong>Watch your moisture</strong><br />{moistureRejections} of your deliveries went over the {LIMITS.moisture}% limit. Drying the corn a little longer before loading can prevent rejections.</p></div>
              </div>
            )}
          </div>
        </article>
      </section>
    </>
  );
}
