import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cornlink-farmer-farms";

const emptyFarm = {
  name: "",
  municipality: "",
  area: "",
  variety: "Yellow corn",
  plantingDate: "",
  harvestDate: "",
  status: "Growing",
};

const styles = {
  page: { color: "#183b2b", display: "grid", gap: 20 },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    gap: 16, flexWrap: "wrap",
  },
  kicker: {
    color: "#668272", fontSize: 11, fontWeight: 800, letterSpacing: "1.5px",
    marginBottom: 8,
  },
  title: { margin: 0, fontSize: 28, color: "#173d2c" },
  subtitle: { margin: "8px 0 0", color: "#718078", lineHeight: 1.6 },
  button: {
    border: 0, borderRadius: 8, padding: "11px 16px", background: "#194b35",
    color: "#fff", fontWeight: 700, cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #d9e3dc", borderRadius: 7, padding: "8px 11px",
    background: "#fff", color: "#24513a", fontWeight: 650, cursor: "pointer",
  },
  dangerButton: {
    border: "1px solid #f0d5d1", borderRadius: 7, padding: "8px 11px",
    background: "#fff", color: "#a43b30", fontWeight: 650, cursor: "pointer",
  },
  statGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 14,
  },
  stat: {
    background: "#fff", border: "1px solid #e4eae5", borderRadius: 12,
    padding: 18, boxShadow: "0 3px 12px rgba(25, 59, 42, 0.03)",
  },
  statLabel: { color: "#758278", fontSize: 12 },
  statValue: { color: "#183b2b", fontSize: 25, fontWeight: 800, marginTop: 8 },
  panel: {
    background: "#fff", border: "1px solid #e2e9e3", borderRadius: 12,
    padding: 20, boxShadow: "0 3px 12px rgba(25, 59, 42, 0.03)",
  },
  toolbar: {
    display: "flex", gap: 12, justifyContent: "space-between",
    alignItems: "center", flexWrap: "wrap", marginBottom: 16,
  },
  input: {
    width: "100%", boxSizing: "border-box", border: "1px solid #d7e1d9",
    borderRadius: 7, padding: "10px 11px", color: "#203d2e",
    background: "#fff", font: "inherit",
  },
  label: { display: "block", color: "#46594d", fontSize: 12, fontWeight: 700, marginBottom: 6 },
  tableWrap: { overflowX: "auto", width: "100%" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 760, textAlign: "left" },
  th: {
    background: "#f5f8f5", color: "#718078", fontSize: 11, letterSpacing: ".6px",
    textTransform: "uppercase", padding: "12px 10px", borderBottom: "1px solid #e5ebe6",
  },
  td: { padding: "14px 10px", borderBottom: "1px solid #edf1ed", fontSize: 13, color: "#42574a" },
  badge: {
    display: "inline-block", padding: "5px 9px", borderRadius: 20,
    background: "#e8f4eb", color: "#247243", fontSize: 11, fontWeight: 750,
  },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(13, 32, 22, .48)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16, zIndex: 9999,
  },
  modal: {
    background: "#fff", borderRadius: 14, padding: 24, width: "min(640px, 100%)",
    maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)",
  },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 },
  empty: { textAlign: "center", padding: "38px 16px", color: "#718078" },
};

function readSavedFarms() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function MyFarms() {
  const [farms, setFarms] = useState(readSavedFarms);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyFarm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(farms));
    } catch {
      setNotice("Could not save records in this browser.");
   }
  }, [farms]);

  const filteredFarms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return farms.filter((farm) => {
      const matchesSearch =
        farm.name.toLowerCase().includes(query) ||
        farm.municipality.toLowerCase().includes(query) ||
        farm.variety.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || farm.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [farms, search, statusFilter]);

  const totalArea = farms.reduce((sum, farm) => sum + (Number(farm.area) || 0), 0);

  function openAddForm() {
    setEditingId(null);
    setForm({ ...emptyFarm });
    setFormError("");
    setModalOpen(true);
  }

  function openEditForm(farm) {
    setEditingId(farm.id);
    setForm({
      name: farm.name,
      municipality: farm.municipality,
      area: farm.area,
      variety: farm.variety,
      plantingDate: farm.plantingDate,
      harvestDate: farm.harvestDate,
      status: farm.status,
    });
    setFormError("");
    setModalOpen(true);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.municipality.trim() || !form.area ||
        !form.plantingDate || !form.harvestDate) {
      setFormError("Please complete all required fields.");
      return;
    }
    if (Number(form.area) <= 0) {
      setFormError("Farm area must be greater than zero.");
      return;
    }
    if (form.harvestDate < form.plantingDate) {
      setFormError("Expected harvest date must be on or after the planting date.");
      return;
    }

    if (editingId) {
      setFarms((current) => current.map((farm) =>
        farm.id === editingId ? { ...farm, ...form, area: Number(form.area) } : farm
      ));
      setNotice("Farm record updated.");
    } else {
      const newFarm = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...form,
        name: form.name.trim(),
        municipality: form.municipality.trim(),
        area: Number(form.area),
        createdAt: new Date().toISOString(),
      };
      setFarms((current) => [newFarm, ...current]);
      setNotice("Farm registered successfully.");
    }
    setModalOpen(false);
  }

  function deleteFarm(farm) {
    const confirmed = window.confirm(`Delete "${farm.name}"? This cannot be undone.`);
    if (!confirmed) return;
    setFarms((current) => current.filter((item) => item.id !== farm.id));
    setNotice("Farm record deleted.");
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>FARMER WORKSPACE</div>
          <h1 style={styles.title}>My Farm Records</h1>
          <p style={styles.subtitle}>
            Register your farms and keep your planting and harvest information organized.
          </p>
        </div>
        <button type="button" style={styles.button} onClick={openAddForm}>
          ＋ Register a farm
        </button>
      </header>

      <section style={styles.statGrid} aria-label="Farm record summary">
        <article style={styles.stat}>
          <div style={styles.statLabel}>Registered farms</div>
          <div style={styles.statValue}>{farms.length}</div>
        </article>
        <article style={styles.stat}></article>
                <article style={styles.stat}>
          <div style={styles.statLabel}>Total farm area</div>
          <div style={styles.statValue}>{totalArea.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span style={{ fontSize: 13 }}>ha</span></div>
        </article>
        <article style={styles.stat}>
          <div style={styles.statLabel}>Growing crops</div>
          <div style={styles.statValue}>{farms.filter((farm) => farm.status === "Growing").length}</div>
        </article>
      </section>

      <section style={styles.panel}>
        <div style={styles.toolbar}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Registered farms</h2>
            <p style={{ margin: "5px 0 0", color: "#7b877f", fontSize: 12 }}>
              {filteredFarms.length} of {farms.length} farm record(s)
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", minWidth: 260 }}>
            <input
              aria-label="Search farms"
              style={{ ...styles.input, width: 220 }}
              type="search"
              placeholder="Search name, location, variety..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              aria-label="Filter by crop status"
              style={{ ...styles.input, width: 150 }}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              <option>Planned</option>
              <option>Growing</option>
              <option>Harvested</option>
            </select>
          </div>
        </div>

        {filteredFarms.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🌱</div>
            <h3 style={{ color: "#234a35", margin: "0 0 8px" }}>
              {farms.length === 0 ? "No farms registered yet" : "No matching farm records"}
            </h3>
            <p style={{ margin: "0 auto 16px", maxWidth: 420, lineHeight: 1.6 }}>
              {farms.length === 0
                ? "Register your first farm to start tracking planting dates and expected harvests."
                : "Try another search term or change the crop status filter."}
            </p>
            {farms.length === 0 && (
              <button type="button" style={styles.button} onClick={openAddForm}>
                ＋ Register your first farm
              </button>
            )}
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Farm name</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Area</th>
                  <th style={styles.th}>Corn variety</th>
                  <th style={styles.th}>Expected harvest</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarms.map((farm) => (
                  <tr key={farm.id}>
                    <td style={{ ...styles.td, color: "#234a35", fontWeight: 750 }}>{farm.name}</td>
                    <td style={styles.td}>{farm.municipality}</td>
                    <td style={styles.td}>{farm.area} ha</td>
                    <td style={styles.td}>{farm.variety}</td>
                    <td style={styles.td}>{farm.harvestDate}</td>
                    <td style={styles.td}><span style={styles.badge}>{farm.status}</span></td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button type="button" style={styles.secondaryButton} onClick={() => openEditForm(farm)}>Edit</button>
                        <button type="button" style={styles.dangerButton} onClick={() => deleteFarm(farm)}>Delete</button>
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
     {modalOpen && (
        <div style={styles.overlay} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModalOpen(false);
        }}>
          <section style={styles.modal} role="dialog" aria-modal="true" aria-labelledby="farm-form-title">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={styles.kicker}>{editingId ? "UPDATE RECORD" : "NEW FARM RECORD"}</div>
                <h2 id="farm-form-title" style={{ margin: 0, color: "#183b2b" }}>{editingId ? "Edit farm details" : "Register a farm"}</h2>
              </div>
              <button type="button" style={styles.secondaryButton} onClick={() => setModalOpen(false)}>Close</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label} htmlFor="farm-name">Farm name *</label>
                  <input id="farm-name" name="name" style={styles.input} value={form.name} onChange={updateField} required maxLength={100} placeholder="e.g. Riverside Farm" />
                </div>
                <div>
                  <label style={styles.label} htmlFor="farm-municipality">Municipality / City *</label>
                  <input id="farm-municipality" name="municipality" style={styles.input} value={form.municipality} onChange={updateField} required maxLength={100} placeholder="e.g. Tuguegarao City" />
                </div>
                <div>
                  <label style={styles.label} htmlFor="farm-area">Farm area (hectares) *</label>
                  <input id="farm-area" name="area" type="number" min="0.01" step="0.01" style={styles.input} value={form.area} onChange={updateField} required placeholder="e.g. 2.5" />
                </div>
                <div>
                  <label style={styles.label} htmlFor="farm-variety">Corn variety *</label>
                  <select id="farm-variety" name="variety" style={styles.input} value={form.variety} onChange={updateField} required>
                    <option>Yellow corn</option>
                    <option>White corn</option>
                    <option>Sweet corn</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label} htmlFor="farm-planting">Planting date *</label>
                  <input id="farm-planting" name="plantingDate" type="date" style={styles.input} value={form.plantingDate} onChange={updateField} required />
                </div>
                <div>
                  <label style={styles.label} htmlFor="farm-harvest">Expected harvest date *</label>
                  <input id="farm-harvest" name="harvestDate" type="date" min={form.plantingDate || undefined} style={styles.input} value={form.harvestDate} onChange={updateField} required />
                </div>
                <div>
                  <label style={styles.label} htmlFor="farm-status">Crop status</label>
                  <select id="farm-status" name="status" style={styles.input} value={form.status} onChange={updateField}>
                    <option>Planned</option>
                    <option>Growing</option>
                    <option>Harvested</option>
                  </select>
                </div>
              </div>

              {formError && <p role="alert" style={{ color: "#a43b30", fontSize: 13, marginTop: 14 }}>{formError}</p>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                <button type="button" style={styles.secondaryButton} onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" style={styles.button}>{editingId ? "Save changes" : "Register farm"}</button>
              </div>
            </form>
          </section>
        </div>
        )}
    </div>
  );
}