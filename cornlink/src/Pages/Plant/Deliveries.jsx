import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Modal from "../Modal";
import { initials, pillClass } from "../plantData";

const MAX_MOISTURE = 14;

export default function Deliveries() {
  const { deliveries, setDeliveries, received, setReceived, suppliers, notify } = useOutletContext();
  const [tab, setTab] = useState("Incoming");
  const [statusFilter, setStatusFilter] = useState("All deliveries");
  const [showSchedule, setShowSchedule] = useState(false);
  const [receiving, setReceiving] = useState(null);

  const activeSuppliers = suppliers.filter((s) => s.status !== "Pending");
  const visible = deliveries.filter((d) => statusFilter === "All deliveries" || d.status === statusFilter);

  function scheduleDelivery(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const when = new Date(form.get("when")).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
    setDeliveries((items) => [
      {
        id: `DL-${1043 + items.length + received.length}`,
        supplier: form.get("supplier"),
        point: form.get("point"),
        volume: Number(form.get("volume")),
        eta: when,
        status: "Scheduled",
      },
      ...items,
    ]);
    setShowSchedule(false);
    notify("Delivery scheduled");
  }

  function receiveDelivery(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const moisture = Number(form.get("moisture"));
    const result = moisture <= MAX_MOISTURE ? "Accepted" : "Rejected";
    setReceived((items) => [
      {
        id: receiving.id,
        supplier: receiving.supplier,
        volume: Number(form.get("volume")),
        moisture,
        result,
        date: "Oct 17, 2026",
      },
      ...items,
    ]);
    setDeliveries((items) => items.filter((d) => d.id !== receiving.id));
    notify(`${receiving.id} recorded as ${result.toLowerCase()}`);
    setReceiving(null);
    setTab("Received");
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">DELIVERIES</div>
          <h1>Delivery coordination</h1>
          <p>Schedule collections, track what is on the way, and record inspection results on arrival.</p>
        </div>
        <button className="primary-button" onClick={() => setShowSchedule(true)}><span>＋</span> Schedule delivery</button>
      </section>

      <section className="panel farms-panel">
        <div className="table-toolbar">
          <button className={tab === "Incoming" ? "primary-button" : "secondary-button"} onClick={() => setTab("Incoming")}>
            Incoming ({deliveries.length})
          </button>
          <button className={tab === "Received" ? "primary-button" : "secondary-button"} onClick={() => setTab("Received")}>
            Received ({received.length})
          </button>
          {tab === "Incoming" && (
            <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All deliveries</option>
              <option>Scheduled</option>
              <option>Arriving</option>
              <option>Delayed</option>
            </select>
          )}
        </div>

        {tab === "Incoming" ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>SUPPLIER</th><th>COLLECTION POINT</th><th>EXPECTED ARRIVAL</th><th>VOLUME</th><th>STATUS</th><th></th></tr>
              </thead>
              <tbody>
                {visible.map((d) => (
                  <tr key={d.id}>
                    <td><div className="farm-cell"><span className="farm-avatar">{initials(d.supplier)}</span><span><strong>{d.supplier}</strong><small>{d.id}</small></span></div></td>
                    <td>{d.point}</td>
                    <td>{d.eta}</td>
                    <td><strong className="volume-value">{d.volume.toFixed(1)} t</strong></td>
                    <td><span className={`status-pill ${pillClass[d.status]}`}><i />{d.status}</span></td>
                    <td><button className="text-button" onClick={() => setReceiving(d)}>Record arrival</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length === 0 && <div className="empty-state">No deliveries match this status. Schedule one to get started.</div>}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>SUPPLIER</th><th>RECEIVED</th><th>VOLUME</th><th>MOISTURE</th><th>RESULT</th></tr>
              </thead>
              <tbody>
                {received.map((r) => (
                  <tr key={r.id}>
                    <td><div className="farm-cell"><span className="farm-avatar">{initials(r.supplier)}</span><span><strong>{r.supplier}</strong><small>{r.id}</small></span></div></td>
                    <td>{r.date}</td>
                    <td><strong className="volume-value">{r.volume.toFixed(1)} t</strong></td>
                    <td>{r.moisture}%</td>
                    <td><span className={`status-pill ${pillClass[r.result]}`}><i />{r.result}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {received.length === 0 && <div className="empty-state">No deliveries received yet.</div>}
          </div>
        )}
      </section>

      {showSchedule && (
        <Modal kicker="DELIVERIES" title="Schedule a delivery" intro="Agree on a collection point and time with a supplier." onClose={() => setShowSchedule(false)}>
          <form onSubmit={scheduleDelivery}>
            <label>Supplier
              <select name="supplier" required>
                {activeSuppliers.map((s) => <option key={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label>Collection point<input name="point" required placeholder="e.g. Cabagan collection point" /></label>
            <div className="form-row">
              <label>Volume (tons)<input name="volume" type="number" min="0.1" step="0.1" required placeholder="0.0" /></label>
              <label>Expected arrival<input name="when" type="datetime-local" required defaultValue="2026-10-21T09:00" /></label>
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowSchedule(false)}>Cancel</button>
              <button type="submit" className="primary-button">Schedule delivery <span>→</span></button>
            </div>
          </form>
        </Modal>
      )}

      {receiving && (
        <Modal kicker="INSPECTION" title={`Record arrival: ${receiving.id}`} intro={`${receiving.supplier} · expected ${receiving.volume} tons. Loads above ${MAX_MOISTURE}% moisture are rejected.`} onClose={() => setReceiving(null)}>
          <form onSubmit={receiveDelivery}>
            <div className="form-row">
              <label>Delivered volume (tons)<input name="volume" type="number" min="0.1" step="0.1" required defaultValue={receiving.volume} /></label>
              <label>Moisture (%)<input name="moisture" type="number" min="1" max="40" step="0.1" required placeholder="0.0" /></label>
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setReceiving(null)}>Cancel</button>
              <button type="submit" className="primary-button">Save inspection <span>→</span></button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
