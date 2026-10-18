import { useState } from "react";
import Modal from "../Modal";
import { COLLECTION_POINTS, fmt, openDemand, pillClass, splitContributions } from "./coopData";

function RequestModal({ options, onClose, onSubmit }) {
  const [commitmentId, setCommitmentId] = useState(options[0].c.id);
  const selected = options.find((o) => o.c.id === commitmentId);
  const [volume, setVolume] = useState(selected.remaining);

  function changeCommitment(id) {
    setCommitmentId(id);
    setVolume(options.find((o) => o.c.id === id).remaining);
  }

  return (
    <Modal
      kicker="DELIVERIES"
      title="Schedule a consolidated pickup"
      intro="Combine members' corn into one load and tell the plant where and when it can be collected."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onSubmit({
            option: selected,
            volume: Number(volume),
            point: f.get("point"),
            vehicle: f.get("vehicle"),
            when: f.get("when"),
          });
        }}
      >
        <label>Commitment
          <select value={commitmentId} onChange={(e) => changeCommitment(e.target.value)}>
            {options.map((o) => (
              <option key={o.c.id} value={o.c.id}>{o.period} · {o.remaining} t unscheduled</option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label>Volume (tons, up to {selected.remaining})
            <input type="number" min="0.1" max={selected.remaining} step="0.1" required value={volume} onChange={(e) => setVolume(e.target.value)} />
          </label>
          <label>Pickup date and time
            <input name="when" type="datetime-local" required defaultValue="2026-10-28T08:00" />
          </label>
        </div>
        <div className="form-row">
          <label>Collection point
            <input name="point" list="collection-points" required defaultValue={COLLECTION_POINTS[0]} />
            <datalist id="collection-points">{COLLECTION_POINTS.map((p) => <option key={p} value={p} />)}</datalist>
          </label>
          <label>Vehicle or hauler<input name="vehicle" required defaultValue="Coop truck" placeholder="e.g. Hired truck" /></label>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">Schedule pickup <span>→</span></button>
        </div>
      </form>
    </Modal>
  );
}

export default function Deliveries({ deliveries, setDeliveries, commitments, notify }) {
  const [tab, setTab] = useState("Upcoming");
  const [showRequest, setShowRequest] = useState(false);

  const upcoming = deliveries.filter((d) => d.status !== "Delivered");
  const history = deliveries.filter((d) => d.status === "Delivered");

  const options = commitments
    .map((c) => {
      const scheduled = deliveries.filter((d) => d.commitmentId === c.id).reduce((s, d) => s + d.volume, 0);
      const demand = openDemand.find((d) => d.id === c.demandId);
      return { c, remaining: fmt(c.total - scheduled), period: demand ? demand.label : "—" };
    })
    .filter((o) => o.remaining > 0);

  function schedule({ option, volume, point, vehicle, when }) {
    const whenText = new Date(when).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    setDeliveries((items) => [
      {
        id: `CD-${String(Date.now()).slice(-5)}`,
        commitmentId: option.c.id,
        period: option.period,
        volume,
        point,
        vehicle,
        when: whenText,
        status: "Scheduled",
        contributors: splitContributions(option.c, volume),
        inspection: null,
      },
      ...items,
    ]);
    setShowRequest(false);
    notify("Pickup scheduled");
  }

  function setStatus(id, status, message) {
    setDeliveries((items) => items.map((d) => (d.id === id ? { ...d, status } : d)));
    notify(message);
  }

  function cancelPickup(d) {
    if (!window.confirm(`Cancel pickup ${d.id}?`)) return;
    setDeliveries((items) => items.filter((x) => x.id !== d.id));
    notify(`${d.id} cancelled`);
  }

  const inTransit = upcoming.filter((d) => d.status === "In transit").length;
  const deliveredTons = fmt(history.reduce((s, d) => s + d.volume, 0));
  const unscheduledTons = fmt(options.reduce((s, o) => s + o.remaining, 0));

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">DELIVERIES</div>
          <h1>Consolidated deliveries</h1>
          <p>Gather members' corn at a collection point and send it to the plant as one load.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => (options.length ? setShowRequest(true) : notify("All committed volume already has a pickup. Pool more supply to schedule another."))}
        >
          <span>＋</span> Schedule pickup
        </button>
      </section>

      <section className="summary-grid" aria-label="Delivery summary">
        <article className="summary-card">
          <div className="summary-top"><span>Active deliveries</span><span className="summary-icon blue-icon">▤</span></div>
          <div className="summary-value">{upcoming.length}</div>
          <div className="summary-foot">{inTransit} in transit</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Awaiting a pickup</span><span className="summary-icon gold-icon">⇄</span></div>
          <div className="summary-value">{unscheduledTons} <small>tons</small></div>
          <div className="summary-foot">Committed but not yet scheduled</div>
        </article>
        <article className="summary-card">
          <div className="summary-top"><span>Delivered so far</span><span className="summary-icon green-icon">✓</span></div>
          <div className="summary-value">{deliveredTons} <small>tons</small></div>
          <div className="summary-foot">{history.length} inspected loads</div>
        </article>
      </section>

      <section className="panel farms-panel">
        <div className="table-toolbar">
          <button className={tab === "Upcoming" ? "primary-button" : "secondary-button"} onClick={() => setTab("Upcoming")}>Upcoming ({upcoming.length})</button>
          <button className={tab === "History" ? "primary-button" : "secondary-button"} onClick={() => setTab("History")}>History ({history.length})</button>
        </div>

        {tab === "Upcoming" ? (
          <div className="table-scroll">
            <table>
              <thead><tr><th>LOAD</th><th>PERIOD</th><th>COLLECTION POINT</th><th>PICKUP</th><th>VOLUME</th><th>STATUS</th><th></th></tr></thead>
              <tbody>
                {upcoming.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.id}</strong><br /><small>{d.contributors.length} plot{d.contributors.length === 1 ? "" : "s"} · {d.vehicle}</small></td>
                    <td>{d.period}</td>
                    <td>{d.point}</td>
                    <td>{d.when}</td>
                    <td><strong className="volume-value">{fmt(d.volume)} t</strong></td>
                    <td><span className={`status-pill ${pillClass[d.status]}`}><i />{d.status}</span></td>
                    <td>
                      {d.status === "Scheduled" && <button className="text-button" onClick={() => setStatus(d.id, "In transit", `${d.id} marked as loaded and on its way`)}>Mark loaded</button>}
                      {d.status === "Delayed" && <button className="text-button" onClick={() => setStatus(d.id, "Scheduled", `${d.id} is back on schedule`)}>Back on schedule</button>}
                      {d.status !== "Delayed" && <>{" "}<button className="text-button" onClick={() => setStatus(d.id, "Delayed", `${d.id} reported as delayed`)}>Report delay</button></>}
                      {d.status === "Scheduled" && <>{" "}<button className="text-button" onClick={() => cancelPickup(d)}>Cancel</button></>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {upcoming.length === 0 && <div className="empty-state">No active deliveries. Schedule a pickup for one of your commitments.</div>}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead><tr><th>LOAD</th><th>DATE</th><th>VOLUME</th><th>RESULT</th><th>NOTE</th></tr></thead>
              <tbody>
                {history.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.id}</strong><br /><small>{d.contributors.length} plot{d.contributors.length === 1 ? "" : "s"} · {d.point}</small></td>
                    <td>{d.when}</td>
                    <td><strong className="volume-value">{fmt(d.volume)} t</strong></td>
                    <td>{d.inspection && <span className={`status-pill ${pillClass[d.inspection.result]}`}><i />{d.inspection.result}</span>}</td>
                    <td>{d.inspection ? d.inspection.note : "Awaiting inspection"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 && <div className="empty-state">No completed deliveries yet.</div>}
          </div>
        )}
      </section>

      {showRequest && options.length > 0 && (
        <RequestModal options={options} onClose={() => setShowRequest(false)} onSubmit={schedule} />
      )}
    </>
  );
}
