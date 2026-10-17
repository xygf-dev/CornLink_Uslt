import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { initials, pct, pillClass } from "../plantData";

export default function Supply() {
  const { batches, setBatches, notify } = useOutletContext();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All supply");

  const byMunicipality = useMemo(() => {
    const groups = {};
    batches.forEach((b) => {
      groups[b.municipality] ??= { total: 0, committed: 0 };
      groups[b.municipality].total += b.volume;
      if (b.commitment === "Committed") groups[b.municipality].committed += b.volume;
    });
    return Object.entries(groups);
  }, [batches]);

  const visible = batches.filter((b) => {
    const matchesQuery = `${b.farm} ${b.municipality}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All supply" || b.commitment === filter;
    return matchesQuery && matchesFilter;
  });

  const totalExpected = batches.reduce((s, b) => s + b.volume, 0);
  const totalCommitted = batches.filter((b) => b.commitment === "Committed").reduce((s, b) => s + b.volume, 0);

  function requestCommitment(batch) {
    setBatches((items) => items.map((b) => (b.id === batch.id ? { ...b, commitment: "Requested" } : b)));
    notify(`Commitment requested from ${batch.farm}`);
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">INCOMING SUPPLY</div>
          <h1>Harvest forecast</h1>
          <p>Expected harvests from your network. Only committed volumes are safe to plan around.</p>
        </div>
      </section>

      <section className="summary-grid" aria-label="Supply by municipality">
        <article className="summary-card">
          <div className="summary-top"><span>All municipalities</span><span className="summary-icon green-icon">◷</span></div>
          <div className="summary-value">{totalExpected.toFixed(1)} <small>tons</small></div>
          <div className="summary-foot"><b>{pct(totalCommitted, totalExpected)}%</b> committed</div>
          <div className="progress-track"><i style={{ width: `${pct(totalCommitted, totalExpected)}%` }} /></div>
        </article>
        {byMunicipality.slice(0, 3).map(([name, g]) => (
          <article className="summary-card" key={name}>
            <div className="summary-top"><span>{name}</span><span className="summary-icon lime-icon">⌂</span></div>
            <div className="summary-value">{g.total.toFixed(1)} <small>tons</small></div>
            <div className="summary-foot"><b>{pct(g.committed, g.total)}%</b> committed</div>
            <div className="progress-track gold-progress"><i style={{ width: `${pct(g.committed, g.total)}%` }} /></div>
          </article>
        ))}
      </section>

      <section className="panel farms-panel">
        <div className="farms-heading">
          <div>
            <div className="section-kicker">HARVEST BATCHES</div>
            <h2>Expected harvests <span className="table-count">{visible.length}</span></h2>
          </div>
        </div>
        <div className="table-toolbar">
          <label className="search-box">
            <span>⌕</span>
            <input type="search" placeholder="Search farm or municipality..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <select aria-label="Filter by commitment" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All supply</option>
            <option>Committed</option>
            <option>Estimated</option>
            <option>Requested</option>
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>FARM</th><th>MUNICIPALITY</th><th>VARIETY</th><th>HARVEST DATE</th><th>VOLUME</th><th>STATUS</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((b) => (
                <tr key={b.id}>
                  <td><div className="farm-cell"><span className="farm-avatar">{initials(b.farm)}</span><span><strong>{b.farm}</strong><small>{b.id}</small></span></div></td>
                  <td>{b.municipality}</td>
                  <td>{b.variety}</td>
                  <td>{b.harvest}</td>
                  <td><strong className="volume-value">{b.volume.toFixed(1)} t</strong></td>
                  <td><span className={`status-pill ${pillClass[b.commitment]}`}><i />{b.commitment}</span></td>
                  <td>
                    {b.commitment === "Estimated" && (
                      <button className="text-button" onClick={() => requestCommitment(b)}>Request commitment</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <div className="empty-state">No harvests match that search. Try a different name or status.</div>}
        </div>
      </section>
    </>
  );
}
