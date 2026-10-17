import React, { useEffect, useMemo, useState } from "react";

const FARMS_STORAGE_KEY = "cornlink-farmer-farms";
const SUPPLY_STORAGE_KEY = "cornlink-farmer-supply-commitments";

const styles = {
  page: { display: "grid", gap: 20, color: "#183b2b" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 },
  kicker: { color: "#668272", fontSize: 11, fontWeight: 800, letterSpacing: "1.5px", marginBottom: 8 },
  title: { margin: 0, fontSize: 28, color: "#173d2c" },
  subtitle: { margin: "8px 0 0", color: "#718078", lineHeight: 1.6 },
  panel: { background: "#fff", border: "1px solid #e2e9e3", borderRadius: 12, padding: 20, boxShadow: "0 3px 12px rgba(25,59,42,.03)" },
  stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 14 },
  stat: { background: "#fff", border: "1px solid #e4eae5", borderRadius: 12, padding: 18 },
  label: { color: "#758278", fontSize: 12 },
  value: { color: "#183b2b", fontSize: 25, fontWeight: 800, marginTop: 8 },
  input: { boxSizing: "border-box", width: "100%", border: "1px solid #d7e1d9", borderRadius: 7, padding: "10px 11px", font: "inherit", background: "#fff", color: "#203d2e" },
  button: { border: 0, borderRadius: 8, padding: "10px 14px", background: "#194b35", color: "#fff", fontWeight: 700, cursor: "pointer" },
  secondary: { border: "1px solid #d9e3dc", borderRadius: 7, padding: "8px 11px", background: "#fff", color: "#24513a", fontWeight: 650, cursor: "pointer" },
  danger: { border: "1px solid #f0d5d1", borderRadius: 7, padding: "7px 10px", background: "#fff", color: "#a43b30", fontWeight: 650, cursor: "pointer" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", minWidth: 680, borderCollapse: "collapse", textAlign: "left" },
  th: { background: "#f5f8f5", color: "#718078", fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", padding: 12, borderBottom: "1px solid #e5ebe6" },
  td: { padding: 13, borderBottom: "1px solid #edf1ed", fontSize: 13, color: "#42574a", verticalAlign: "top" },
  badge: { display: "inline-block", padding: "5px 9px", borderRadius: 20, background: "#e8f4eb", color: "#247243", fontSize: 11, fontWeight: 750 },
  empty: { textAlign: "center", padding: 28, color: "#718078" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 },
  formLabel: { display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: "#46594d" },
};

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function SupplyMatching() {
  const [farms, setFarms] = useState(readArray(FARMS_STORAGE_KEY));
  const [commitments, setCommitments] = useState(() => readArray(SUPPLY_STORAGE_KEY));
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    farmId: "",
    buyer: "",
    quantity: "",
    unit: "metric tons",
    targetDate: "",
    notes: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem(SUPPLY_STORAGE_KEY, JSON.stringify(commitments));
    } catch {
      setNotice("Your browser could not save the supply commitments.");
    }
  }, [commitments]);

  useEffect(() => {
    const refreshFarms = () => setFarms(readArray(FARMS_STORAGE_KEY));
    window.addEventListener("focus", refreshFarms);
    window.addEventListener("storage", refreshFarms);
    return () => {
      window.removeEventListener("focus", refreshFarms);
      window.removeEventListener("storage", refreshFarms);
    };
  }, []);

  const filteredCommitments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return commitments.filter((item) =>
      String(item.buyer || "").toLowerCase().includes(query) ||
      String(item.farmName || "").toLowerCase().includes(query) ||
      String(item.status || "").toLowerCase().includes(query)
    );
  }, [commitments, search]);

  const confirmedCount = commitments.filter((item) => item.status === "Confirmed").length;
  const totalQuantity = commitments.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  function openForm() {
    setForm({
      farmId: farms[0]?.id || "",
      buyer: "",
      quantity: "",
      unit: "metric tons",
      targetDate: "",
      notes: "",
    });
    setFormError("");
    setShowForm(true);
  }

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!farms.length) {
      setFormError("Register a farm in My Farm Records before creating a supply commitment.");
      return;
    }
    if (!form.farmId || !form.buyer.trim() || !form.quantity || Number(form.quantity) <= 0 || !form.targetDate) {
      setFormError("Complete all required fields and enter a quantity greater than zero.");
      return;
    }

    const farm = farms.find((item) => String(item.id) === String(form.farmId));
    const newCommitment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      farmId: form.farmId,
      farmName: farm?.name || "Farm record",
      municipality: farm?.municipality || "",
      buyer: form.buyer.trim(),
      quantity: Number(form.quantity),
      unit: form.unit,
      targetDate: form.targetDate,
      notes: form.notes.trim(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setCommitments((current) => [newCommitment, ...current]);
    setShowForm(false);
    setNotice("Supply request saved as Pending. This is a local preview, not a confirmed buyer match.");
  }

  function updateStatus(id, status) {
    setCommitments((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    setNotice(`Commitment status updated to ${status}.`);
  }

  function deleteCommitment(item) {
    if (!window.confirm(`Delete the supply request for "${item.buyer}"?`)) return;
    setCommitments((current) => current.filter((record) => record.id !== item.id));
    setNotice("Supply request deleted.");
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>FARMER WORKSPACE</div>
          <h1 style={styles.title}>Supply Matching</h1>
          <p style={styles.subtitle}>Organize your planned corn supply and track requests you create for potential buyers or cooperatives.</p>
        </div>
        <button type="button" style={styles.button} onClick={openForm}>＋ New supply request</button>
      </header>

      <section style={styles.stats} aria-label="Supply summary">
        <article style={styles.stat}>
          <div style={styles.label}>Supply requests</div>
          <div style={styles.value}>{commitments.length}</div>
        </article>
        <article style={styles.stat}>
          <div style={styles.label}>Pending requests</div>
          <div style={styles.value}>{commitments.filter((item) => item.status === "Pending").length}</div>
        </article>
        <article style={styles.stat}>
          <div style={styles.label}>Confirmed commitments</div>
          <div style={styles.value}>{confirmedCount}</div>
        </article>
        <article style={styles.stat}>
          <div style={styles.label}>Total requested quantity</div>
          <div style={styles.value}>{totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div style={styles.label}>Mixed units may be present</div>
        </article>
      </section>

      <section style={styles.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>My supply requests</h2>
            <p style={{ margin: "5px 0 0", color: "#7b877f", fontSize: 12 }}>Requests are saved locally for this prototype.</p>
          </div>
          <input
            type="search"
            aria-label="Search supply requests"
            style={{ ...styles.input, width: 250 }}
            placeholder="Search buyer, farm, or status"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {filteredCommitments.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>🌽</div>
            <h3 style={{ margin: "0 0 8px", color: "#234a35" }}>
              {commitments.length ? "No matching supply requests" : "No supply requests yet"}
            </h3>
            <p style={{ maxWidth: 480, margin: "0 auto 16px", lineHeight: 1.6 }}>
              Create a request to record the farm, intended buyer, quantity, and target date. A real buyer-matching service will require a backend and registered buyers.
            </p>
            {!commitments.length && (
              <button type="button" style={styles.button} onClick={openForm}>Create first request</button>
            )}
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Farm</th>
                  <th style={styles.th}>Buyer / cooperative</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Target date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommitments.map((item) => (
                  <tr key={item.id}>
                    <td style={{ ...styles.td, color: "#234a35", fontWeight: 750 }}>
                      {item.farmName}
                      <div style={{ fontSize: 11, color: "#7b877f", marginTop: 4 }}>{item.municipality}</div>
                    </td>
                    <td style={styles.td}>
                      {item.buyer}
                      {item.notes && <div style={{ color: "#7b877f", fontSize: 11, marginTop: 4 }}>{item.notes}</div>}
                    </td>
                    <td style={styles.td}>{item.quantity} {item.unit}</td>
                    <td style={styles.td}>{item.targetDate}</td>
                    <td style={styles.td}><span style={styles.badge}>{item.status}</span></td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {item.status === "Pending" && (
                          <button type="button" style={styles.secondary} onClick={() => updateStatus(item.id, "Confirmed")}>Mark confirmed</button>
                        )}
                        {item.status !== "Cancelled" && (
                          <button type="button" style={styles.secondary} onClick={() => updateStatus(item.id, "Cancelled")}>Cancel</button>
                        )}
                        <button type="button" style={styles.danger} onClick={() => deleteCommitment(item)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {notice && (
        <div role="status" style={{ color: "#245f3b", background: "#eaf5ed", borderRadius: 8, padding: "11px 14px" }}>
          {notice}
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message" style={{ float: "right", border: 0, background: "transparent", cursor: "pointer" }}>×</button>
        </div>
      )}

      {showForm && (
        <div
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}
          style={{ position: "fixed", inset: 0, background: "rgba(13,32,22,.48)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 9999 }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="supply-form-title" style={{ background: "#fff", borderRadius: 14, padding: 24, width: "min(640px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div>
                <div style={styles.kicker}>SUPPLY REQUEST</div>
                <h2 id="supply-form-title" style={{ margin: 0 }}>Create supply request</h2>
              </div>
              <button type="button" style={styles.secondary} onClick={() => setShowForm(false)}>Close</button>
            </div>

            {!farms.length && (
              <p role="alert" style={{ color: "#a43b30", background: "#fff1ef", padding: 12, borderRadius: 8 }}>
                You need to register a farm in My Farm Records before creating a supply request.
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <label style={styles.formLabel}>
                  Farm *
                  <select name="farmId" style={styles.input} value={form.farmId} onChange={updateForm} required disabled={!farms.length}>
                    <option value="">Select a farm</option>
                    {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name} — {farm.municipality}</option>)}
                  </select>
                </label>
                <label style={styles.formLabel}>
                  Buyer / cooperative name *
                  <input name="buyer" style={styles.input} value={form.buyer} onChange={updateForm} required placeholder="Enter intended buyer" />
                </label>
                <label style={styles.formLabel}>
                  Quantity *
                  <input name="quantity" type="number" min="0.01" step="0.01" style={styles.input} value={form.quantity} onChange={updateForm} required placeholder="e.g. 5" />
                </label>
                <label style={styles.formLabel}>
                  Unit *
                  <select name="unit" style={styles.input} value={form.unit} onChange={updateForm}>
                    <option>metric tons</option>
                    <option>kilograms</option>
                    <option>sacks</option>
                  </select>
                </label>
                <label style={styles.formLabel}>
                  Target supply date *
                  <input name="targetDate" type="date" style={styles.input} value={form.targetDate} onChange={updateForm} required />
                </label>
                <label style={styles.formLabel}>
                  Notes (optional)
                  <input name="notes" style={styles.input} value={form.notes} onChange={updateForm} maxLength={200} placeholder="Moisture, delivery, or other notes" />
                </label>
              </div>

              {formError && <p role="alert" style={{ color: "#a43b30", fontSize: 13, marginTop: 12 }}>{formError}</p>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
                <button type="button" style={styles.secondary} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={styles.button}>Save request</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
