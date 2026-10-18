import { useState } from "react";
import Modal from "../Modal";
import {
  TODAY, availableFor, committedToDemand, farmMatchesDemand, fmt, formatDate, openDemand, pct, toIso,
} from "./farmerData";

function CommitModal({ demand, options, needed, onClose, onSubmit }) {
  const [farmId, setFarmId] = useState(options[0].farm.id);
  const selected = options.find((o) => o.farm.id === farmId);
  const max = fmt(Math.min(selected.available, needed));
  const [volume, setVolume] = useState(max);

  function changeFarm(id) {
    const next = options.find((o) => o.farm.id === id);
    setFarmId(id);
    setVolume(fmt(Math.min(next.available, needed)));
  }

  return (
    <Modal
      kicker="SUPPLY MATCHING"
      title={`Commit supply: ${demand.label}`}
      intro={`The plant needs ${fmt(needed)} more tons (${demand.variety.toLowerCase()}, moisture ${demand.moisture}% or below).`}
      onClose={onClose}
    >
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ farmId, volume: Number(volume) }); }}>
        <label>Which farm?
          <select value={farmId} onChange={(e) => changeFarm(e.target.value)}>
            {options.map((o) => (
              <option key={o.farm.id} value={o.farm.id}>
                {o.farm.name} · {o.available} t available · harvest {formatDate(o.farm.harvestDate)}
              </option>
            ))}
          </select>
        </label>
        <label>Volume to commit (tons, up to {max})
          <input type="number" min="0.1" max={max} step="0.1" required value={volume} onChange={(e) => setVolume(e.target.value)} />
        </label>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">Commit supply <span>→</span></button>
        </div>
      </form>
    </Modal>
  );
}

export default function SupplyMatching({ farms, commitments, setCommitments, deliveries, notify }) {
  const [active, setActive] = useState(null);

  const rows = openDemand.map((d) => {
    const mine = committedToDemand(d.id, commitments);
    const covered = d.covered + mine;
    const needed = Math.max(d.required - covered, 0);
    const options = farms
      .map((farm) => ({ farm, available: availableFor(farm, commitments) }))
      .filter((o) => farmMatchesDemand(o.farm, d).ok && o.available > 0);
    const canSupply = fmt(options.reduce((s, o) => s + o.available, 0));
    return { ...d, mine, covered, needed, options, canSupply };
  });

  const unmatched = farms
    .filter((f) => !openDemand.some((d) => farmMatchesDemand(f, d).ok))
    .map((f) => {
      const window = openDemand.find((d) => f.harvestDate >= d.start && f.harvestDate <= d.end);
      const reason = window
        ? `The plant needs ${window.variety.toLowerCase()} for ${window.label}, and this farm grows ${f.variety.toLowerCase()}.`
        : `No open requirement covers its harvest date (${formatDate(f.harvestDate)}).`;
      return { farm: f, reason };
    });

  function commit({ farmId, volume }) {
    setCommitments((items) => [
      ...items,
      { id: `CM-${String(Date.now()).slice(-5)}`, farmId, demandId: active.id, volume, date: toIso(TODAY) },
    ]);
    notify(`Committed ${fmt(volume)} t to ${active.label}`);
    setActive(null);
  }

  function withdraw(c) {
    if (deliveries.some((d) => d.commitmentId === c.id)) {
      notify("Cancel this commitment's scheduled pickups before withdrawing it");
      return;
    }
    setCommitments((items) => items.filter((x) => x.id !== c.id));
    notify("Commitment withdrawn");
  }

  const activeRow = active && rows.find((r) => r.id === active.id);

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">SUPPLY MATCHING</div>
          <h1>Match your corn to demand</h1>
          <p>See what the plant needs and commit supply from farms that fit the period and variety.</p>
        </div>
      </section>

      <section className="panel farms-panel">
        <div className="farms-heading">
          <div><div className="section-kicker">WHAT THE PLANT NEEDS</div><h2>Open requirements <span className="table-count">{rows.length}</span></h2></div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>PERIOD</th><th>NEEDED</th><th>VARIETY</th><th>MAX MOISTURE</th><th>PLANT COVERAGE</th><th>YOU CAN SUPPLY</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.label}</strong></td>
                  <td>{r.required} t</td>
                  <td>{r.variety}</td>
                  <td>{r.moisture}%</td>
                  <td>
                    <div className="progress-track gold-progress"><i style={{ width: `${Math.min(pct(r.covered, r.required), 100)}%` }} /></div>
                    <small>{pct(r.covered, r.required)}% committed · {fmt(r.needed)} t open</small>
                  </td>
                  <td><strong className="volume-value">{r.canSupply} t</strong></td>
                  <td>
                    {r.needed <= 0 ? <small>Fully covered</small>
                      : r.options.length === 0 ? <small>No matching farm</small>
                      : <button className="text-button" onClick={() => setActive(r)}>Commit supply</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel forecast-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">YOUR PROMISES</div><h2>My commitments <span className="table-count">{commitments.length}</span></h2></div>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>FARM</th><th>PERIOD</th><th>VOLUME</th><th>COMMITTED ON</th><th></th></tr></thead>
              <tbody>
                {commitments.map((c) => {
                  const farm = farms.find((f) => f.id === c.farmId);
                  const demand = openDemand.find((d) => d.id === c.demandId);
                  return (
                    <tr key={c.id}>
                      <td><strong>{farm ? farm.name : "Removed farm"}</strong></td>
                      <td>{demand ? demand.label : "—"}</td>
                      <td><strong className="volume-value">{fmt(c.volume)} t</strong></td>
                      <td>{formatDate(c.date)}</td>
                      <td><button className="text-button" onClick={() => withdraw(c)}>Withdraw</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {commitments.length === 0 && <div className="empty-state">You haven't committed any supply yet.</div>}
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">NO MATCH YET</div><h2>Farms without a fit</h2></div>
          </div>
          <div className="activity-list">
            {unmatched.length === 0 && <div className="empty-state">Every farm matches at least one requirement.</div>}
            {unmatched.map(({ farm, reason }) => (
              <div className="activity-item" key={farm.id}>
                <div className="activity-symbol activity-gold">!</div>
                <div><p><strong>{farm.name}</strong><br />{reason}</p></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {activeRow && (
        <CommitModal
          demand={activeRow}
          options={activeRow.options}
          needed={activeRow.needed}
          onClose={() => setActive(null)}
          onSubmit={commit}
        />
      )}
    </>
  );
}
