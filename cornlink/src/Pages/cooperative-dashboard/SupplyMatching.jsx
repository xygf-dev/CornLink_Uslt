import { useState } from "react";
import Modal from "../Modal";
import {
  TODAY, availableForPlot, committedToDemand, farmMatchesDemand, fmt, formatDate,
  memberName, openDemand, pct, toIso,
} from "./coopData";

function AllocateModal({ demand, options, needed, members, onClose, onSubmit }) {
  const [values, setValues] = useState({});

  const total = fmt(options.reduce((s, o) => s + (Number(values[o.plot.id]) || 0), 0));
  const tooMuch = total > needed;

  function setValue(id, value) {
    setValues((v) => ({ ...v, [id]: value }));
  }

  function autoFill() {
    let left = needed;
    const next = {};
    [...options]
      .sort((a, b) => a.plot.harvestDate.localeCompare(b.plot.harvestDate))
      .forEach((o) => {
        const take = fmt(Math.min(o.available, left));
        if (take > 0) next[o.plot.id] = take;
        left = fmt(left - take);
      });
    setValues(next);
  }

  function submit(event) {
    event.preventDefault();
    const allocations = options
      .map((o) => ({ plotId: o.plot.id, volume: fmt(Number(values[o.plot.id]) || 0) }))
      .filter((a) => a.volume > 0);
    onSubmit(allocations);
  }

  return (
    <Modal
      kicker="SUPPLY MATCHING"
      title={`Pool supply: ${demand.label}`}
      intro={`The plant needs ${fmt(needed)} more tons (${demand.variety.toLowerCase()}, moisture ${demand.moisture}% or below). Choose how much each member plot contributes.`}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        {options.map((o) => (
          <label key={o.plot.id}>
            {memberName(o.plot.memberId, members)} · {o.plot.name} (harvest {formatDate(o.plot.harvestDate)}, up to {o.available} t)
            <input
              type="number"
              min="0"
              max={o.available}
              step="0.1"
              placeholder="0.0"
              value={values[o.plot.id] ?? ""}
              onChange={(e) => setValue(o.plot.id, e.target.value)}
            />
          </label>
        ))}
        <p style={{ margin: "8px 0 0" }}>
          <strong>{total} t</strong> selected of {fmt(needed)} t needed
          {tooMuch && <span role="alert" style={{ color: "#c4553b" }}> · More than the plant still needs</span>}
        </p>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={autoFill}>Fill automatically</button>
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button" disabled={total <= 0 || tooMuch}>Commit pooled supply <span>→</span></button>
        </div>
      </form>
    </Modal>
  );
}

export default function SupplyMatching({ members, plots, commitments, setCommitments, deliveries, notify }) {
  const [active, setActive] = useState(null);

  const rows = openDemand.map((d) => {
    const mine = committedToDemand(d.id, commitments);
    const covered = d.covered + mine;
    const needed = Math.max(d.required - covered, 0);
    const options = plots
      .map((plot) => ({ plot, available: availableForPlot(plot, commitments) }))
      .filter((o) => farmMatchesDemand(o.plot, d).ok && o.available > 0);
    const canSupply = fmt(options.reduce((s, o) => s + o.available, 0));
    return { ...d, mine, covered, needed, options, canSupply };
  });

  const unmatched = plots
    .filter((p) => !openDemand.some((d) => farmMatchesDemand(p, d).ok))
    .map((p) => {
      const window = openDemand.find((d) => p.harvestDate >= d.start && p.harvestDate <= d.end);
      const reason = window
        ? `The plant needs ${window.variety.toLowerCase()} for ${window.label}, and this plot is ${p.variety.toLowerCase()}.`
        : `No open requirement covers its harvest date (${formatDate(p.harvestDate)}).`;
      return { plot: p, reason };
    });

  function commit(allocations) {
    const total = fmt(allocations.reduce((s, a) => s + a.volume, 0));
    setCommitments((items) => [
      ...items,
      { id: `CC-${String(Date.now()).slice(-5)}`, demandId: active.id, allocations, total, date: toIso(TODAY) },
    ]);
    notify(`Committed ${total} t from ${allocations.length} plot${allocations.length === 1 ? "" : "s"} to ${active.label}`);
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
          <h1>Match pooled corn to demand</h1>
          <p>One commitment can combine many members' plots. Together they can fill a requirement that none could fill alone.</p>
        </div>
      </section>

      <section className="panel farms-panel">
        <div className="farms-heading">
          <div><div className="section-kicker">WHAT THE PLANT NEEDS</div><h2>Open requirements <span className="table-count">{rows.length}</span></h2></div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>PERIOD</th><th>NEEDED</th><th>VARIETY</th><th>MAX MOISTURE</th><th>PLANT COVERAGE</th><th>YOUR POOL CAN SUPPLY</th><th></th></tr>
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
                  <td><strong className="volume-value">{r.canSupply} t</strong><br /><small>{r.options.length} matching plot{r.options.length === 1 ? "" : "s"}</small></td>
                  <td>
                    {r.needed <= 0 ? <small>Fully covered</small>
                      : r.options.length === 0 ? <small>No matching plot</small>
                      : <button className="text-button" onClick={() => setActive(r)}>Pool supply</button>}
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
            <div><div className="section-kicker">YOUR PROMISES</div><h2>Cooperative commitments <span className="table-count">{commitments.length}</span></h2></div>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>PERIOD</th><th>TOTAL</th><th>FROM</th><th>COMMITTED ON</th><th></th></tr></thead>
              <tbody>
                {commitments.map((c) => {
                  const demand = openDemand.find((d) => d.id === c.demandId);
                  const names = [...new Set(c.allocations.map((a) => memberName((plots.find((p) => p.id === a.plotId) || {}).memberId, members)))];
                  return (
                    <tr key={c.id}>
                      <td><strong>{demand ? demand.label : "—"}</strong><br /><small>{c.id}</small></td>
                      <td><strong className="volume-value">{fmt(c.total)} t</strong></td>
                      <td>{names.length} member{names.length === 1 ? "" : "s"}<br /><small>{names.join(", ")}</small></td>
                      <td>{formatDate(c.date)}</td>
                      <td><button className="text-button" onClick={() => withdraw(c)}>Withdraw</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {commitments.length === 0 && <div className="empty-state">No commitments yet. Pool supply against a requirement above.</div>}
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">NO MATCH YET</div><h2>Plots without a fit</h2></div>
          </div>
          <div className="activity-list">
            {unmatched.length === 0 && <div className="empty-state">Every plot matches at least one requirement.</div>}
            {unmatched.map(({ plot, reason }) => (
              <div className="activity-item" key={plot.id}>
                <div className="activity-symbol activity-gold">!</div>
                <div><p><strong>{plot.name}</strong> · {memberName(plot.memberId, members)}<br />{reason}</p></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {activeRow && (
        <AllocateModal
          demand={activeRow}
          options={activeRow.options}
          needed={activeRow.needed}
          members={members}
          onClose={() => setActive(null)}
          onSubmit={commit}
        />
      )}
    </>
  );
}
