import React, { useEffect, useMemo, useState } from "react";

const FARMS_STORAGE_KEY = "cornlink-farmer-farms";
const DELIVERIES_STORAGE_KEY = "cornlink-farmer-deliveries";
const SUPPLY_STORAGE_KEY = "cornlink-farmer-supply-commitments";

const emptyDelivery = {
  farmId: "",
  destination: "",
  quantity: "",
  unit: "metric tons",
  scheduledDate: "",
  vehicle: "",
  notes: "",
  status: "Scheduled",
};

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
  table: { width: "100%", minWidth: 850, borderCollapse: "collapse", textAlign: "left" },
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

export default function MyDeliveries() {
  const [farms, setFarms] = useState(() => readArray(FARMS_STORAGE_KEY));
  const [deliveries, setDeliveries] = useState(() => readArray(DELIVERIES_STORAGE_KEY));
  const [supplyRequests, setSupplyRequests] = useState(() => readArray(SUPPLY_STORAGE_KEY));
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyDelivery);

  useEffect(() => {
    try {
      localStorage.setItem(DELIVERIES_STORAGE_KEY, JSON.stringify(deliveries));
    } catch {
      setNotice("Your browser could not save delivery records.");
    }
  }, [deliveries]);

  useEffect(() => {
    const refresh = () => {
      setFarms(readArray(FARMS_STORAGE_KEY));
      setSupplyRequests(readArray(SUPPLY_STORAGE_KEY));
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filteredDeliveries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return deliveries.filter((delivery) => {
      const matchesQuery =
        String(delivery.farmName || "").toLowerCase().includes(query) ||
        String(delivery.destination || "").toLowerCase().includes(query) ||
        String(delivery.status || "").toLowerCase().includes(query);
      return matchesQuery && (statusFilter === "All" || delivery.status === statusFilter);
    });
  }, [deliveries, search, statusFilter]);

  const deliveredCount = deliveries.filter((item) => item.status === "Delivered").length;
  const scheduledCount = deliveries.filter((item) => item.status === "Scheduled").length;
  const totalQuantity = deliveries
    .filter((item) => item.status !== "Cancelled")
    .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  function openForm() {
    setForm({
      ...emptyDelivery,
      farmId: farms[0]?.id ? String(farms[0].id) : "",
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
      setFormError("Register a farm in My Farm Records before scheduling a delivery.");
      return;
    }
    if (!form.farmId || !form.destination.trim() || !form.quantity || Number(form.quantity) <= 0 || !form.scheduledDate) {
      setFormError("Complete the required fields and enter a quantity greater than zero.");
      return;
    }

    const farm = farms.find((item) => String(item.id) === String(form.farmId));
    const delivery = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      farmId: form.farmId,
      farmName: farm?.name || "Farm record",
      municipality: farm?.municipality || "",
      destination: form.destination.trim(),
      quantity: Number(form.quantity),
      unit: form.unit,
      scheduledDate: form.scheduledDate,
      vehicle: form.vehicle.trim(),
      notes: form.notes.trim(),
      status: "Scheduled",
      createdAt: new Date().toISOString(),
    };

    setDeliveries((current) => [delivery, ...current]);
    setShowForm(false);
    setNotice("Delivery schedule saved in this browser.");
  }

  function updateStatus(id, status) {
    setDeliveries((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    setNotice(`Delivery status updated to ${status}.`);
  }

  function deleteDelivery(delivery) {
    if (!window.confirm(`Delete the delivery record for "${delivery.farmName}"?`)) return;
    setDeliveries((current) => current.filter((item) => item.id !== delivery.id));
    setNotice("Delivery record deleted.");
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>FARMER WORKSPACE</div>
          <h1 style={styles.title}>My Deliveries</h1>
          <p style={styles.subtitle}>Schedule corn deliveries and keep track of their progress from planned to delivered.</p>
        </div>
        <button type="button" style={styles.button} onClick={openForm}>＋ Schedule delivery</button>
      </header>

      <section style={styles.stats} aria-label="Delivery summary">
        <article style={styles.stat}>
          <div style={styles.label}>Total delivery records</div>
          <div style={styles.value}>{deliveries.length}</div>
        </article>
        <article style={styles.stat}>
          <div style={styles.label}>Scheduled</div>
          <div style={styles.value}>{scheduledCount}</div>
        </article>
        <article style={styles.stat}>
          <div style={styles.label}>Delivered</div>
          <div style={styles.value}>{deliveredCount}</div>
        </article>
        <article style={styles.stat}>
          <div style={styles.label}>Quantity not cancelled</div>
          <div style={styles.value}>{totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div style={styles.label}>Multiple units may be present</div>
        </article>
      </section>

      <section style={styles.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Delivery schedule</h2>
            <p style={{ margin: "5px 0 0", color: "#7b877f", fontSize: 12 }}>
              {supplyRequests.length} supply request(s) available in your local preview.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="search"
              aria-label="Search deliveries"
              style={{ ...styles.input, width: 220 }}
              placeholder="Search farm, destination, status"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select aria-label="Filter delivery status" style={{ ...styles.input, width: 160 }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option>All</option>
              <option>Scheduled</option>
              <option>In Transit</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {filteredDeliveries.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>🚚</div>
            <h3 style={{ margin: "0 0 8px", color: "#234a35" }}>
              {deliveries.length ? "No matching deliveries" : "No deliveries scheduled yet"}
            </h3>
            <p style={{ maxWidth: 480, margin: "0 auto 16px", lineHeight: 1.6 }}>
              {deliveries.length
                ? "Try another search term or status filter."
                : "Register a farm first, then schedule a delivery with its destination, quantity, and date."}
            </p>
            {!deliveries.length && (
              <button type="button" style={styles.button} onClick={openForm}>Schedule your first delivery</button>
            )}
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Farm</th>
                  <th style={styles.th}>Destination</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Scheduled date</th>
                  <th style={styles.th}>Vehicle / reference</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id}>
                    <td style={{ ...styles.td, color: "#234a35", fontWeight: 750 }}>
                      {delivery.farmName}
                      <div style={{ fontSize: 11, color: "#7b877f", marginTop: 4 }}>{delivery.municipality}</div>
                    </td>
                    <td style={styles.td}>
                      {delivery.destination}
                      {delivery.notes && <div style={{ fontSize: 11, color: "#7b877f", marginTop: 4 }}>{delivery.notes}</div>}
                    </td>
                    <td style={styles.td}>{delivery.quantity} {delivery.unit}</td>
                    <td style={styles.td}>{delivery.scheduledDate}</td>
                    <td style={styles.td}>{delivery.vehicle || "—"}</td>
                    <td style={styles.td}><span style={styles.badge}>{delivery.status}</span></td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {delivery.status === "Scheduled" && (
                          <button type="button" style={styles.secondary} onClick={() => updateStatus(delivery.id, "In Transit")}>Start transit</button>
                        )}
                        {delivery.status === "In Transit" && (
                          <button type="button" style={styles.secondary} onClick={() => updateStatus(delivery.id, "Delivered")}>Mark delivered</button>
                        )}
                        {delivery.status !== "Delivered" && delivery.status !== "Cancelled" && (
                          <button type="button" style={styles.danger} onClick={() => updateStatus(delivery.id, "Cancelled")}>Cancel</button>
                        )}
                        <button type="button" style={styles.danger} onClick={() => deleteDelivery(delivery)}>Delete</button>
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
          <section role="dialog" aria-modal="true" aria-labelledby="delivery-form-title" style={{ background: "#fff", borderRadius: 14, padding: 24, width: "min(640px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div>
                <div style={styles.kicker}>DELIVERY RECORD</div>
                <h2 id="delivery-form-title" style={{ margin: 0 }}>Schedule a delivery</h2>
              </div>
              <button type="button" style={styles.secondary} onClick={() => setShowForm(false)}>Close</button>
            </div>

            {!farms.length && (
              <p role="alert" style={{ color: "#a43b30", background: "#fff1ef", padding: 12, borderRadius: 8 }}>
                Register a farm in My Farm Records before scheduling a delivery.
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
                  Delivery destination *
                  <input name="destination" style={styles.input} value={form.destination} onChange={updateForm} required placeholder="Buyer, cooperative, or receiving plant" />
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
                  Scheduled delivery date *
                  <input name="scheduledDate" type="date" style={styles.input} value={form.scheduledDate} onChange={updateForm} required />
                </label>
                <label style={styles.formLabel}>
                  Vehicle / reference
                  <input name="vehicle" style={styles.input} value={form.vehicle} onChange={updateForm} maxLength={100} placeholder="Optional vehicle or reference" />
                </label>
                <label style={styles.formLabel}>
                  Notes (optional)
                  <input name="notes" style={styles.input} value={form.notes} onChange={updateForm} maxLength={200} placeholder="Additional delivery instructions" />
                </label>
              </div>

              {formError && <p role="alert" style={{ color: "#a43b30", fontSize: 13, marginTop: 12 }}>{formError}</p>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
                <button type="button" style={styles.secondary} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={styles.button}>Save delivery</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
