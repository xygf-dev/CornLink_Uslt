import { useState } from "react";
import { LIMITS, fmt, memberName, pct, pillClass } from "./coopData";

const over = { color: "#c4553b", fontWeight: 700 };

function Metric({ value, limit }) {
  const isOver = value > limit;
  return <span style={isOver ? over : undefined}>{value}%{isOver ? " ▲" : ""}</span>;
}

export default function QualityRecords({ members, plots, deliveries }) {
  const [selectedId, setSelectedId] = useState(null);

  const inspected = deliveries.filter((d) => d.inspection);
  const accepted = inspected.filter((d) => d.inspection.result === "Accepted");
  const avg = (key) =>
    inspected.length ? fmt(inspected.reduce((s, d) => s + d.inspection[key], 0) / inspected.length) : 0;
  const moistureRejections = inspected.filter((d) => d.inspection.moisture > LIMITS.moisture).length;
  const selected = inspected.find((d) => d.id === selectedId);

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">QUALITY RECORDS</div>
          <h1>Inspection results</h1>
          <p>Every load is checked on arrival. See how your cooperative's corn compares with plant limits, and which members were in each load.</p>
        </div>
      </section>

      <section className="summary-grid" aria-label="Quality summary">
        <article className="summary-card">
          <div className="summary-top"><span>Inspections</span><span className="summary-icon green-icon">✓</span></div>
          <div className="summary-value">{inspected.length}</div>
          <div className="summary-foot">Loads inspected</div>
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
                <tr><th>LOAD</th><th>DATE</th><th>VOLUME</th><th>MOISTURE</th><th>KERNEL DAMAGE</th><th>FOREIGN MATTER</th><th>RESULT</th><th></th></tr>
              </thead>
              <tbody>
                {inspected.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.id}</strong><br /><small>{d.point}</small></td>
                    <td>{d.when}</td>
                    <td>{fmt(d.volume)} t</td>
                    <td><Metric value={d.inspection.moisture} limit={LIMITS.moisture} /></td>
                    <td><Metric value={d.inspection.damage} limit={LIMITS.damage} /></td>
                    <td><Metric value={d.inspection.foreign} limit={LIMITS.foreign} /></td>
                    <td><span className={`status-pill ${pillClass[d.inspection.result]}`}><i />{d.inspection.result}</span></td>
                    <td><button className="text-button" onClick={() => setSelectedId(d.id === selectedId ? null : d.id)}>{d.id === selectedId ? "Hide members" : "Who was in it"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inspected.length === 0 && <div className="empty-state">No inspection results yet. They appear here after the plant checks your first load.</div>}
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
                <div><p><strong>Check moisture before loading</strong><br />{moistureRejections} of your loads went over the {LIMITS.moisture}% limit. Because members' corn is mixed in one load, one wet batch can fail the whole load. A quick moisture check at the collection point can catch it.</p></div>
              </div>
            )}
          </div>
        </article>
      </section>

      {selected && (
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">TRACEABILITY</div><h2>{selected.id}: who was in this load</h2></div>
          </div>
          <div className="activity-list">
            {selected.contributors.map((c) => {
              const plot = plots.find((p) => p.id === c.plotId);
              return (
                <div className="activity-item" key={c.plotId}>
                  <div className="activity-symbol activity-lime">⌂</div>
                  <div><p><strong>{plot ? memberName(plot.memberId, members) : "Unknown member"}</strong><br />{plot ? plot.name : c.plotId} · {fmt(c.volume)} t</p></div>
                </div>
              );
            })}
            <div className="activity-item">
              <div className={`activity-symbol ${selected.inspection.result === "Accepted" ? "activity-green" : "activity-gold"}`}>{selected.inspection.result === "Accepted" ? "✓" : "!"}</div>
              <div><p><strong>{selected.inspection.result}</strong><br />{selected.inspection.note} The result applies to the whole load.</p></div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
