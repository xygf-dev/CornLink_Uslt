import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { initials, pct, pillClass } from "../plantData";

export default function Suppliers() {
  const { suppliers, deliveries, received, notify } = useOutletContext();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All suppliers");
  const [selectedId, setSelectedId] = useState(null);

  const visible = suppliers.filter((s) => {
    const matchesQuery = `${s.name} ${s.municipality} ${s.contact}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All suppliers" || s.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const selected = suppliers.find((s) => s.id === selectedId);
  const history = selected
    ? [
        ...deliveries.filter((d) => d.supplier === selected.name).map((d) => ({ id: d.id, text: `${d.volume} t · ${d.eta}`, status: d.status })),
        ...received.filter((r) => r.supplier === selected.name).map((r) => ({ id: r.id, text: `${r.volume} t · ${r.moisture}% moisture · ${r.date}`, status: r.result })),
      ]
    : [];

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">SUPPLIERS</div>
          <h1>Your supplier network</h1>
          <p>Cooperatives and farmer groups that supply your plant, with their delivery track record.</p>
        </div>
      </section>

      <section className="panel farms-panel">
        <div className="farms-heading">
          <div>
            <div className="section-kicker">NETWORK</div>
            <h2>Suppliers <span className="table-count">{visible.length}</span></h2>
          </div>
        </div>
        <div className="table-toolbar">
          <label className="search-box">
            <span>⌕</span>
            <input type="search" placeholder="Search supplier, municipality or contact..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All suppliers</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Needs review</option>
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>SUPPLIER</th><th>MUNICIPALITY</th><th>VARIETY</th><th>COMMITTED</th><th>DELIVERED</th><th>ON-TIME</th><th>STATUS</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.id}>
                  <td><div className="farm-cell"><span className="farm-avatar">{initials(s.name)}</span><span><strong>{s.name}</strong><small>{s.contact}</small></span></div></td>
                  <td>{s.municipality}</td>
                  <td>{s.variety}</td>
                  <td>{s.committed} t</td>
                  <td>
                    <strong className="volume-value">{s.delivered} t</strong>
                    <small> {pct(s.delivered, s.committed)}%</small>
                  </td>
                  <td>{s.onTime ? `${s.onTime}%` : "No history"}</td>
                  <td><span className={`status-pill ${pillClass[s.status]}`}><i />{s.status}</span></td>
                  <td><button className="text-button" onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}>{s.id === selectedId ? "Hide" : "View"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <div className="empty-state">No suppliers match that search. Try a different name or status.</div>}
        </div>
      </section>

      {selected && (
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">SUPPLIER DETAILS</div><h2>{selected.name}</h2></div>
            <button className="select-button" onClick={() => notify(`Message sent to ${selected.contact}`)}>Message {selected.contact.split(" ")[0]}</button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-symbol activity-green">⌂</div>
              <div><p><strong>{selected.municipality}</strong><br />{selected.variety} · {selected.committed} tons committed this season</p></div>
            </div>
            {history.length === 0 && <div className="empty-state">No deliveries from this supplier yet.</div>}
            {history.map((h) => (
              <div className="activity-item" key={h.id}>
                <div className="activity-symbol activity-blue">▤</div>
                <div><p><strong>{h.id} · {h.status}</strong><br />{h.text}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
