import { useState } from "react";
import Modal from "../Modal";
import {
  BARANGAYS, TODAY, committedForPlot, fmt, formatDate, initials, pillClass, plotsOfMember, toIso,
} from "./coopData";

export default function Members({ members, setMembers, plots, commitments, notify }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All members");
  const [editing, setEditing] = useState(null); // null | "new" | a member
  const [selectedId, setSelectedId] = useState(null);

  const rows = members.map((m) => {
    const mp = plotsOfMember(m.id, plots);
    return {
      ...m,
      plots: mp,
      area: fmt(mp.reduce((s, p) => s + p.area, 0)),
      expected: fmt(mp.reduce((s, p) => s + p.expectedVolume, 0)),
      committed: fmt(mp.reduce((s, p) => s + committedForPlot(p.id, commitments), 0)),
    };
  });
  const visible = rows.filter((m) => {
    const matchesQuery = `${m.name} ${m.barangay}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All members" || m.status === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const selected = rows.find((m) => m.id === selectedId);
  const draft = editing && editing !== "new" ? editing : null;

  function saveMember(event) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const record = {
      name: f.get("name").trim(),
      barangay: f.get("barangay").trim(),
      contact: f.get("contact").trim(),
      status: f.get("status"),
    };
    if (draft) {
      setMembers((items) => items.map((m) => (m.id === draft.id ? { ...m, ...record } : m)));
      notify("Member updated");
    } else {
      setMembers((items) => [{ id: `M-${Date.now().toString().slice(-5)}`, joined: toIso(TODAY), ...record }, ...items]);
      notify("Member added");
    }
    setEditing(null);
  }

  function removeMember(m) {
    if (m.plots.length > 0) {
      notify("Remove or reassign this member's plots first");
      return;
    }
    if (!window.confirm(`Remove ${m.name} from the cooperative?`)) return;
    setMembers((items) => items.filter((x) => x.id !== m.id));
    if (selectedId === m.id) setSelectedId(null);
    notify(`${m.name} removed`);
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">MEMBERS</div>
          <h1>Member farmers</h1>
          <p>Members don't need a CornLink account. You keep their records, and they stay in touch with you as usual.</p>
        </div>
        <button className="primary-button" onClick={() => setEditing("new")}><span>＋</span> Add member</button>
      </section>

      <section className="panel farms-panel">
        <div className="farms-heading">
          <div><div className="section-kicker">YOUR COOPERATIVE</div><h2>Members <span className="table-count">{visible.length}</span></h2></div>
        </div>
        <div className="table-toolbar">
          <label className="search-box">
            <span>⌕</span>
            <input type="search" placeholder="Search by name or barangay..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All members</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>MEMBER</th><th>BARANGAY</th><th>PLOTS</th><th>AREA</th><th>EXPECTED</th><th>COMMITTED</th><th>STATUS</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((m) => (
                <tr key={m.id}>
                  <td><div className="farm-cell"><span className="farm-avatar">{initials(m.name)}</span><span><strong>{m.name}</strong><small>{m.contact || "No contact number"}</small></span></div></td>
                  <td>{m.barangay}</td>
                  <td>{m.plots.length}</td>
                  <td>{m.area} ha</td>
                  <td>{m.expected} t</td>
                  <td><strong className="volume-value">{m.committed} t</strong></td>
                  <td><span className={`status-pill ${pillClass[m.status]}`}><i />{m.status}</span></td>
                  <td>
                    <button className="text-button" onClick={() => setSelectedId(m.id === selectedId ? null : m.id)}>{m.id === selectedId ? "Hide" : "View"}</button>{" "}
                    <button className="text-button" onClick={() => setEditing(m)}>Edit</button>{" "}
                    <button className="text-button" onClick={() => removeMember(m)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <div className="empty-state">No members match that search. Try a different name or status.</div>}
        </div>
      </section>

      {selected && (
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">MEMBER DETAILS</div><h2>{selected.name}</h2></div>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-symbol activity-green">⌂</div>
              <div><p><strong>Brgy. {selected.barangay}</strong><br />Member since {formatDate(selected.joined)}</p></div>
            </div>
            {selected.plots.length === 0 && <div className="empty-state">No plots recorded yet. Add one under Farm Records.</div>}
            {selected.plots.map((p) => (
              <div className="activity-item" key={p.id}>
                <div className="activity-symbol activity-lime">◷</div>
                <div><p><strong>{p.name}</strong><br />{p.variety} · {p.area} ha · harvest {formatDate(p.harvestDate)} · {fmt(p.expectedVolume)} t expected</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {editing && (
        <Modal
          kicker="MEMBERS"
          title={draft ? "Edit member" : "Add a member"}
          intro="You're recording this on the member's behalf. They don't need to sign in."
          onClose={() => setEditing(null)}
        >
          <form onSubmit={saveMember} key={draft ? draft.id : "new"}>
            <label>Full name<input name="name" required defaultValue={draft?.name} placeholder="e.g. Juan dela Cruz" /></label>
            <div className="form-row">
              <label>Barangay
                <input name="barangay" list="barangay-options" required defaultValue={draft?.barangay} placeholder="e.g. Garita" />
                <datalist id="barangay-options">{BARANGAYS.map((b) => <option key={b} value={b} />)}</datalist>
              </label>
              <label>Contact number (optional)<input name="contact" defaultValue={draft?.contact} placeholder="09XX-XXX-XXXX" /></label>
            </div>
            <label>Status
              <select name="status" defaultValue={draft?.status ?? "Active"}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="primary-button">{draft ? "Save changes" : "Add member"} <span>→</span></button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
