import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Modal from "../Modal";
import { qualityRules, pct } from "../plantData";

export default function Demand() {
  const { weeks, setWeeks, notify } = useOutletContext();
  const [showModal, setShowModal] = useState(false);

  function addRequirement(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setWeeks((items) => [
      ...items,
      {
        id: Date.now(),
        label: form.get("label"),
        required: Number(form.get("required")),
        expected: 0,
        committed: 0,
        variety: form.get("variety"),
        moisture: Number(form.get("moisture")),
      },
    ]);
    setShowModal(false);
    notify("Requirement posted to the supply network");
  }

  function removeRequirement(week) {
    setWeeks((items) => items.filter((w) => w.id !== week.id));
    notify(`Removed requirement for ${week.label}`);
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">DEMAND</div>
          <h1>Plant requirements</h1>
          <p>Tell farmers and cooperatives how much corn you need, when, and to what standard.</p>
        </div>
        <button className="primary-button" onClick={() => setShowModal(true)}><span>＋</span> Post requirement</button>
      </section>

      <section className="content-grid">
        <article className="panel forecast-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">WEEKLY REQUIREMENTS</div><h2>What you need</h2></div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>DELIVERY PERIOD</th><th>REQUIRED</th><th>VARIETY</th><th>MAX MOISTURE</th><th>COMMITTED</th><th></th></tr>
              </thead>
              <tbody>
                {weeks.map((w) => (
                  <tr key={w.id}>
                    <td><strong>{w.label}</strong></td>
                    <td><strong className="volume-value">{w.required} t</strong></td>
                    <td>{w.variety}</td>
                    <td>{w.moisture}%</td>
                    <td>
                      <div className="progress-track gold-progress"><i style={{ width: `${Math.min(pct(w.committed, w.required), 100)}%` }} /></div>
                      <small>{w.committed} t · {pct(w.committed, w.required)}%</small>
                    </td>
                    <td><button className="text-button" onClick={() => removeRequirement(w)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {weeks.length === 0 && <div className="empty-state">No requirements posted yet. Post one so farmers know what you need.</div>}
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">WHAT YOU ACCEPT</div><h2>Quality requirements</h2></div>
          </div>
          <div className="activity-list">
            {qualityRules.map(([name, value]) => (
              <div className="activity-item" key={name}>
                <div className="activity-symbol activity-green">✓</div>
                <div><p><strong>{name}</strong><br />{value}</p></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {showModal && (
        <Modal kicker="DEMAND" title="Post a requirement" intro="This goes to every farmer and cooperative in your network." onClose={() => setShowModal(false)}>
          <form onSubmit={addRequirement}>
            <label>Delivery period<input name="label" required placeholder="e.g. Nov 16 – 22" /></label>
            <div className="form-row">
              <label>Required volume (tons)<input name="required" type="number" min="1" step="1" required placeholder="0" /></label>
              <label>Max moisture (%)<input name="moisture" type="number" min="1" max="30" step="0.1" required defaultValue="14" /></label>
            </div>
            <label>Corn variety
              <select name="variety">
                <option>Any variety</option>
                <option>Yellow corn</option>
                <option>White corn</option>
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="primary-button">Post requirement <span>→</span></button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
