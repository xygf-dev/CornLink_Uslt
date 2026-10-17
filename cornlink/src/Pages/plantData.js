export const initialWeeks = [
  { id: 1, label: "Oct 19 – 25", required: 120, expected: 110, committed: 96, variety: "Any variety", moisture: 14 },
  { id: 2, label: "Oct 26 – Nov 1", required: 120, expected: 132, committed: 84, variety: "Any variety", moisture: 14 },
  { id: 3, label: "Nov 2 – 8", required: 150, expected: 118, committed: 70, variety: "Yellow corn", moisture: 14 },
  { id: 4, label: "Nov 9 – 15", required: 150, expected: 96, committed: 40, variety: "Yellow corn", moisture: 14 },
];

export const initialSuppliers = [
  { id: "S-01", name: "Riverside Cooperative", municipality: "Tuguegarao", variety: "Yellow corn", committed: 42, delivered: 38, onTime: 92, status: "Active", contact: "Maria Santos" },
  { id: "S-02", name: "Golden Fields Coop", municipality: "Cabagan", variety: "Yellow corn", committed: 68, delivered: 61, onTime: 88, status: "Active", contact: "Ana Reyes" },
  { id: "S-03", name: "San Isidro Farms", municipality: "Ilagan", variety: "White corn", committed: 27.5, delivered: 20, onTime: 81, status: "Active", contact: "Jose Dela Cruz" },
  { id: "S-04", name: "North Valley Growers", municipality: "Solana", variety: "Yellow corn", committed: 21, delivered: 12, onTime: 64, status: "Needs review", contact: "Ramon Cruz" },
  { id: "S-05", name: "Maligaya Farmers Group", municipality: "Enrile", variety: "White corn", committed: 34.5, delivered: 30, onTime: 90, status: "Active", contact: "Liza Mendoza" },
  { id: "S-06", name: "Bagong Silang Farmers", municipality: "Tuao", variety: "Yellow corn", committed: 0, delivered: 0, onTime: 0, status: "Pending", contact: "Pedro Ramos" },
];

export const initialBatches = [
  { id: "B-301", farm: "Riverside Cooperative", municipality: "Tuguegarao", variety: "Yellow corn", harvest: "Oct 24, 2026", volume: 42, commitment: "Committed" },
  { id: "B-302", farm: "San Isidro Farms", municipality: "Ilagan", variety: "White corn", harvest: "Oct 26, 2026", volume: 27.5, commitment: "Committed" },
  { id: "B-303", farm: "Golden Fields Coop", municipality: "Cabagan", variety: "Yellow corn", harvest: "Oct 28, 2026", volume: 68, commitment: "Committed" },
  { id: "B-304", farm: "North Valley Growers", municipality: "Solana", variety: "Yellow corn", harvest: "Oct 29, 2026", volume: 21, commitment: "Estimated" },
  { id: "B-305", farm: "Maligaya Farmers Group", municipality: "Enrile", variety: "White corn", harvest: "Nov 02, 2026", volume: 34.5, commitment: "Estimated" },
  { id: "B-306", farm: "Bagong Silang Farmers", municipality: "Tuao", variety: "Yellow corn", harvest: "Nov 06, 2026", volume: 29, commitment: "Estimated" },
  { id: "B-307", farm: "Golden Fields Coop", municipality: "Cabagan", variety: "Yellow corn", harvest: "Nov 11, 2026", volume: 40, commitment: "Estimated" },
];

export const initialDeliveries = [
  { id: "DL-1042", supplier: "Riverside Cooperative", point: "Tuguegarao collection point", volume: 18.5, eta: "Today, 2:30 PM", status: "Arriving" },
  { id: "DL-1041", supplier: "Golden Fields Coop", point: "Cabagan collection point", volume: 22, eta: "Today, 4:00 PM", status: "Arriving" },
  { id: "DL-1040", supplier: "San Isidro Farms", point: "Ilagan collection point", volume: 12, eta: "Oct 19, 9:00 AM", status: "Scheduled" },
  { id: "DL-1039", supplier: "North Valley Growers", point: "Solana collection point", volume: 9.8, eta: "Oct 19, 1:00 PM", status: "Delayed" },
  { id: "DL-1038", supplier: "Maligaya Farmers Group", point: "Enrile collection point", volume: 15.4, eta: "Oct 20, 10:30 AM", status: "Scheduled" },
];

export const initialReceived = [
  { id: "DL-1037", supplier: "Riverside Cooperative", volume: 18.5, moisture: 13.2, result: "Accepted", date: "Oct 16, 2026" },
  { id: "DL-1036", supplier: "Maligaya Farmers Group", volume: 11, moisture: 15.1, result: "Rejected", date: "Oct 15, 2026" },
];

export const qualityRules = [
  ["Moisture content", "14% or below"],
  ["Kernel damage", "5% or below"],
  ["Foreign matter", "1% or below"],
  ["Accepted varieties", "Yellow and white corn"],
];

// Maps statuses to the pill styles that already exist in App.css
export const pillClass = {
  Scheduled: "growing", Arriving: "ready-soon", Delayed: "needs-review",
  Committed: "growing", Estimated: "needs-review", Requested: "ready-soon",
  Active: "growing", Pending: "ready-soon", "Needs review": "needs-review",
  Accepted: "growing", Rejected: "needs-review",
};

export const initials = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("");

export function getTotals(weeks) {
  const required = weeks.reduce((s, w) => s + w.required, 0);
  const expected = weeks.reduce((s, w) => s + w.expected, 0);
  const committed = weeks.reduce((s, w) => s + w.committed, 0);
  return { required, expected, committed, gap: Math.max(required - committed, 0) };
}

export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
