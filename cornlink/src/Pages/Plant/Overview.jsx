import { useNavigate, useOutletContext } from "react-router-dom";
import { getTotals, pct } from "../plantData";

export default function Overview() {
  const navigate = useNavigate();
  const { weeks, deliveries } = useOutletContext();
  const totals = getTotals(weeks);
  const maxValue = Math.max(1, ...weeks.map((w) => Math.max(w.required, w.expected, w.committed)));
  const arrivingToday = deliveries.filter((d) => d.eta.startsWith("Today"));

  const alerts = [
    ...weeks
      .filter((w) => pct(w.committed, w.required) < 60)
      .map((w) => ({ symbol: "⇄", tone: "activity-gold", title: `${w.label} is only ${pct(w.committed, w.required)}% committed`, text: `${w.required - w.committed} tons still need commitments.`, to: "/plant/supply" })),
    ...deliveries
      .filter((d) => d.status === "Delayed")
      .map((d) => ({ symbol: "!", tone: "activity-blue", title: `${d.supplier} delivery is delayed`, text: `${d.volume} tons expected ${d.eta}.`, to: "/plant/deliveries" })),
  ];

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">SATURDAY, OCTOBER 17, 2026</div>
          <h1>Procurement overview</h1>
          <p>See how expected supply and farmer commitments line up with what your plant needs.</p>
        </div>
        <button className="primary-button" onClick={() => navigate("/plant/demand")}><span>＋</span> Post requirement</button>
      </section>

      <section className="summary-grid" aria-label="Procurement summary">
        <article className="summary-card">
          <div className="summary-top"><span>Plant requirement</span><span className="summary-icon green-icon">▦</span></div>
          <div className="summary-value">{totals.required} <small>tons</small></div>
          <div className="summary-foot">Next {weeks.length} weeks</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Expected supply</span><span className="summary-icon lime-icon">◷</span></div>
          <div className="summary-value">{totals.expected} <small>tons</small></div>
          <div className="summary-foot"><b>{pct(totals.expected, totals.required)}%</b> of requirement</div>
          <div className="progress-track"><i style={{ width: `${Math.min(pct(totals.expected, totals.required), 100)}%` }} /></div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Committed supply</span><span className="summary-icon gold-icon">⇄</span></div>
          <div className="summary-value">{totals.committed} <small>tons</small></div>
          <div className="summary-foot"><b>{pct(totals.committed, totals.required)}%</b> of requirement</div>
          <div className="progress-track gold-progress"><i style={{ width: `${Math.min(pct(totals.committed, totals.required), 100)}%` }} /></div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Arriving today</span><span className="summary-icon blue-icon">▤</span></div>
          <div className="summary-value">{arrivingToday.length} <small>deliveries</small></div>
          <div className="summary-foot">{arrivingToday.reduce((s, d) => s + d.volume, 0).toFixed(1)} tons expected</div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel forecast-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">SUPPLY AND DEMAND</div><h2>Weekly outlook</h2></div>
            <button className="select-button" onClick={() => navigate("/plant/demand")}>Manage demand <span>→</span></button>
          </div>
          <div className="chart-legend">
            <span><i className="legend-expected" />Expected harvest</span>
            <span><i className="legend-committed" />Committed</span>
          </div>
          <div className="chart-wrap">
            <div className="y-axis">
              {[1, 0.75, 0.5, 0.25].map((f) => <span key={f}>{Math.round(maxValue * f)} t</span>)}
              <span>0</span>
            </div>
            <div className="chart-area">
              <div className="chart-gridlines"><i /><i /><i /><i /><i /></div>
              <div className="chart-columns">
                {weeks.map((w, index) => (
                  <div className="chart-group" key={w.id}>
                    <div className="bar-pair">
                      <i className="bar expected-bar" style={{ height: `${(w.expected / maxValue) * 100}%` }} />
                      <i className="bar committed-bar" style={{ height: `${(w.committed / maxValue) * 100}%` }} />
                    </div>
                    <span>{`Wk ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-caption">
            <span><b>{totals.gap} t</b> still uncovered by commitments</span>
            <span className="caption-note">Estimates are not commitments</span>
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">NEEDS ATTENTION</div><h2>Alerts</h2></div>
          </div>
          <div className="activity-list">
            {alerts.length === 0 && <div className="empty-state">Nothing needs attention right now.</div>}
            {alerts.map((a) => (
              <div className="activity-item" key={a.title}>
                <div className={`activity-symbol ${a.tone}`}>{a.symbol}</div>
                <div><p><strong>{a.title}</strong><br />{a.text}</p></div>
              </div>
            ))}
          </div>
          <button className="activity-link" onClick={() => navigate("/plant/deliveries")}>Go to deliveries <span>→</span></button>
        </article>
      </section>
    </>
  );
}
