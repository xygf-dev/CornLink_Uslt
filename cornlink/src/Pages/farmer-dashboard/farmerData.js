// ---------- Dates (all local time, so no timezone surprises) ----------
export const DAY = 86400000;
export const TODAY = new Date(2026, 9, 17); // Oct 17, 2026

export const toDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const toIso = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const formatDate = (iso) =>
  toDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const daysUntil = (iso) => Math.round((toDate(iso) - TODAY) / DAY);

// ---------- Small helpers ----------
export const fmt = (v) => Number(Number(v).toFixed(1));
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
export const initials = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("");

export function getStatus(farm) {
  const d = daysUntil(farm.harvestDate);
  if (d < 0) return "Harvested";
  if (d <= 14) return "Ready soon";
  return "Growing";
}

// Maps statuses to pill styles that already exist in your CSS
export const pillClass = {
  Growing: "growing", "Ready soon": "ready-soon", Harvested: "growing",
  Scheduled: "growing", "In transit": "ready-soon", Delayed: "needs-review", Delivered: "growing",
  Accepted: "growing", Rejected: "needs-review",
};

// Plant quality limits
export const LIMITS = { moisture: 14, damage: 5, foreign: 1 };

// ---------- Sample data ----------
export const initialFarms = [
  { id: "F-01", name: "San Isidro - Plot A", location: "Brgy. San Isidro, Ilagan", area: 8, variety: "White corn", plantingDate: "2026-07-01", harvestDate: "2026-10-26", expectedVolume: 18 },
  { id: "F-02", name: "San Isidro - Plot B", location: "Brgy. San Isidro, Ilagan", area: 4, variety: "White corn", plantingDate: "2026-07-20", harvestDate: "2026-11-09", expectedVolume: 9.5 },
  { id: "F-03", name: "Upper Ridge Plot", location: "Brgy. Upper Ridge, Ilagan", area: 5, variety: "Yellow corn", plantingDate: "2026-07-10", harvestDate: "2026-11-04", expectedVolume: 12 },
];

// What the plant has asked for. These mirror the plant's Demand page.
export const openDemand = [
  { id: "D1", label: "Oct 19 – 25", start: "2026-10-19", end: "2026-10-25", required: 120, covered: 96, variety: "Any variety", moisture: 14 },
  { id: "D2", label: "Oct 26 – Nov 1", start: "2026-10-26", end: "2026-11-01", required: 120, covered: 84, variety: "Any variety", moisture: 14 },
  { id: "D3", label: "Nov 2 – 8", start: "2026-11-02", end: "2026-11-08", required: 150, covered: 70, variety: "Yellow corn", moisture: 14 },
  { id: "D4", label: "Nov 9 – 15", start: "2026-11-09", end: "2026-11-15", required: 150, covered: 40, variety: "Yellow corn", moisture: 14 },
];

export const initialCommitments = [
  { id: "CM-001", farmId: "F-01", demandId: "D2", volume: 10, date: "2026-10-14" },
];

export const initialDeliveries = [
  { id: "DL-F-003", commitmentId: "CM-001", farmName: "San Isidro - Plot A", period: "Oct 26 – Nov 1", volume: 6, point: "Ilagan collection point", when: "Oct 26, 9:00 AM", status: "Scheduled", inspection: null },
  { id: "DL-F-002", commitmentId: null, farmName: "San Isidro - Plot A", period: "Early harvest batch", volume: 4.5, point: "Ilagan collection point", when: "Oct 12, 10:00 AM", status: "Delivered", inspection: { moisture: 15.2, damage: 4, foreign: 0.8, result: "Rejected", note: "Moisture was above the 14% limit." } },
  { id: "DL-F-001", commitmentId: null, farmName: "San Isidro - Plot A", period: "Early harvest batch", volume: 6, point: "Ilagan collection point", when: "Oct 3, 9:00 AM", status: "Delivered", inspection: { moisture: 13.4, damage: 3.1, foreign: 0.6, result: "Accepted", note: "Within all plant limits." } },
];

// ---------- Matching logic ----------
export const committedFor = (farmId, commitments) =>
  commitments.filter((c) => c.farmId === farmId).reduce((s, c) => s + c.volume, 0);

export const availableFor = (farm, commitments) =>
  Math.max(fmt(farm.expectedVolume - committedFor(farm.id, commitments)), 0);

export const committedToDemand = (demandId, commitments) =>
  commitments.filter((c) => c.demandId === demandId).reduce((s, c) => s + c.volume, 0);

export function farmMatchesDemand(farm, demand) {
  const varietyOk = demand.variety === "Any variety" || demand.variety === farm.variety;
  const inWindow = farm.harvestDate >= demand.start && farm.harvestDate <= demand.end;
  return { varietyOk, inWindow, ok: varietyOk && inWindow };
}
