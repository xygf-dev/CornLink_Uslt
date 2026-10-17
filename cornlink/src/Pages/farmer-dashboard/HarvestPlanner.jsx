import React, { useEffect, useMemo, useState } from "react";

const FARMS_STORAGE_KEY = "cornlink-farmer-farms";

const styles = {
  page: { display: "grid", gap: 20, color: "#183b2b" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    flexWrap: "wrap", gap: 16,
  },
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
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", minWidth: 700, borderCollapse: "collapse", textAlign: "left" },
  th: { background: "#f5f8f5", color: "#718078", fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", padding: 12, borderBottom: "1px solid #e5ebe6" },
  td: { padding: 13, borderBottom: "1px solid #edf1ed", fontSize: 13, color: "#42574a", verticalAlign: "top" },
  badge: { display: "inline-block", padding: "5px 9px", borderRadius: 20, background: "#e8f4eb", color: "#247243", fontSize: 11, fontWeight: 750 },
  empty: { textAlign: "center", padding: 28, color: "#718078" },
};

function loadFarms() {
  try {
    const value = JSON.parse(localStorage.getItem(FARMS_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function formatDate(dateString) {
  if (!dateString) return "Not set";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function HarvestPlanner() {
  const [farms, setFarms] = useState(loadFarms);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [refreshNotice, setRefreshNotice] = useState("");

  // Refresh farm data when the user returns to this tab after editing My Farm Records.
  useEffect(() => {
    const refresh = () => setFarms(loadFarms());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const plannedFarms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return farms
      .filter((farm) => {
        const matchesSearch =
          String(farm.name || "").toLowerCase().includes(query) ||
          String(farm.municipality || "").toLowerCase().includes(query);
        const days = daysUntil(farm.harvestDate);
        const matchesPeriod =
          period === "all" ||
          (period === "30" && days !== null && days >= 0 && days <= 30) ||
          (period === "90" && days !== null && days >= 0 && days <= 90) ||
          (period === "overdue" && days !== null && days < 0 && farm.status !== "Harvested");
        return matchesSearch && matchesPeriod;
      })
      .sort((a, b) => String(a.harvestDate || "9999").localeCompare(String(b.harvestDate || "9999")));
  }, [farms, search, period]);

  const upcomingCount = farms.filter((farm) => {
    const days = daysUntil(farm.harvestDate);
    return days !== null && days >= 0 && days <= 30 && farm.status !== "Harvested";
  }).length;

  const overdueCount = farms.filter((farm) => {
    const days = daysUntil(farm.harvestDate);
    return days !== null && days < 0 && farm.status !== "Harvested";
  }).length;

  const harvestCompletedCount = farms.filter((farm) => farm.status === "Harvested").length;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>FARMER WORKSPACE</div>
          <h1 style={styles.title}>Harvest Planner</h1>
          <p style={styles.subtitle}>
            Review expected harvest dates from your registered farm records and plan ahead.
          </p>
        </div>
        <button type="button" style={styles.secondary} onClick={() => {
          setFarms(loadFarms());
          setRefreshNotice("Harvest information refreshed from My Farm Records.");
        }}>
          ↻ Refresh records
        </button>
      </header>

      <section style={styles.stats} aria-label="Harvest summary">
        <article style={styles.stat}>
          <div style={styles.label}>Registered farms</div>
          <div style={styles.value}>{farms.length}</div>
        </article>
        <article style={styles.stat}>
          <div style={styles.label}>Harvests in the next 30 days</div>
          <div style={styles.value}>{upcomingCount}</div>
        </article>
        <article style={styles.stat}>
          <div style={styles.label}>Past expected harvest</div>
          <div style={styles.value}>{overdueCount}</div>
        </article>
        <article style={styles.stat}>
          <div style={styles.label}>Marked harvested</div>
          <div style={styles.value}>{harvestCompletedCount}</div>
        </article>
      </section>

      <section style={styles.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Harvest schedule</h2>
            <p style={{ color: "#7b877f", fontSize: 12, margin: "5px 0 0" }}>
              Based on the planting and expected harvest dates saved in My Farm Records.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              aria-label="Search harvest schedule"
              style={{ ...styles.input, width: 220 }}
              type="search"
              placeholder="Search farm or municipality"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select aria-label="Filter harvest dates" style={{ ...styles.input, width: 190 }} value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="all">All harvest dates</option>
              <option value="30">Within 30 days</option>
              <option value="90">Within 90 days</option>
              <option value="overdue">Past expected date</option>
            </select>
          </div>
        </div>

        {refreshNotice && (
          <div role="status" style={{ marginBottom: 14, padding: 10, borderRadius: 7, background: "#eaf5ed", color: "#245f3b", fontSize: 13 }}>
            {refreshNotice}
          </div>
        )}

        {plannedFarms.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>🌽</div>
            <h3 style={{ margin: "0 0 8px", color: "#234a35" }}>
              {farms.length === 0 ? "No farm records yet" : "No harvests match your filters"}
            </h3>
            <p style={{ margin: "0 auto", maxWidth: 480, lineHeight: 1.6 }}>
              {farms.length === 0
                ? "Register a farm in My Farm Records and enter its expected harvest date. It will appear here automatically."
                : "Try another search term or select a different harvest date filter."}
            </p>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Farm</th>
                  <th style={styles.th}>Municipality</th>
                  <th style={styles.th}>Corn variety</th>
                  <th style={styles.th}>Planting date</th>
                  <th style={styles.th}>Expected harvest</th>
                  <th style={styles.th}>Time remaining</th>
                  <th style={styles.th}>Crop status</th>
                </tr>
              </thead>
              <tbody>
                {plannedFarms.map((farm) => {
                  const days = daysUntil(farm.harvestDate);
                  let remaining = "Date not set";
                  if (days !== null) {
                    if (farm.status === "Harvested") remaining = "Completed";
                    else if (days < 0) remaining = `${Math.abs(days)} day(s) overdue`;
                    else if (days === 0) remaining = "Expected today";
                    else remaining = `${days} day(s) left`;
                  }
                  return (
                    <tr key={farm.id}>
                      <td style={{ ...styles.td, color: "#234a35", fontWeight: 750 }}>{farm.name || "Unnamed farm"}</td>
                      <td style={styles.td}>{farm.municipality || "—"}</td>
                      <td style={styles.td}>{farm.variety || "—"}</td>
                      <td style={styles.td}>{formatDate(farm.plantingDate)}</td>
                      <td style={styles.td}>{formatDate(farm.harvestDate)}</td>
                      <td style={styles.td}>{remaining}</td>
                      <td style={styles.td}><span style={styles.badge}>{farm.status || "Not set"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p style={{ color: "#7b877f", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
        Note: Harvest dates are estimates based on the records entered by the farmer. Update the farm record when the schedule changes or the crop has been harvested.
      </p>
    </div>
  );
}
