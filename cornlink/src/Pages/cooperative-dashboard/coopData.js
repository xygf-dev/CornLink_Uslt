import { fmt, pillClass as basePill } from "../farmer-dashboard/farmerData";

// Shared helpers and the plant's open requirements come from the farmer module
export {
  TODAY, DAY, toDate, toIso, formatDate, daysUntil, fmt, pct, initials,
  getStatus, LIMITS, openDemand, farmMatchesDemand,
} from "../farmer-dashboard/farmerData";

export const pillClass = { ...basePill, Active: "growing", Inactive: "needs-review" };

export const COOP = { name: "Golden Fields Coop", municipality: "Cabagan", officer: "Ana Reyes" };

export const BARANGAYS = ["Garita", "Casibarag Norte", "Centro"];
export const COLLECTION_POINTS = ["Cabagan Coop Warehouse", "Garita Drying Pad", "Centro Hub"];

// Member farmers. They do NOT have CornLink accounts: the coop officer keeps their records.
export const initialMembers = [
  { id: "M-01", name: "Pedro Ramos", barangay: "Garita", contact: "0917-555-0101", joined: "2024-03-12", status: "Active" },
  { id: "M-02", name: "Elena Bautista", barangay: "Casibarag Norte", contact: "0917-555-0102", joined: "2024-05-02", status: "Active" },
  { id: "M-03", name: "Roberto Agustin", barangay: "Garita", contact: "0917-555-0103", joined: "2023-11-20", status: "Active" },
  { id: "M-04", name: "Lorna Pascual", barangay: "Centro", contact: "0917-555-0104", joined: "2025-01-15", status: "Active" },
  { id: "M-05", name: "Danilo Cabrera", barangay: "Casibarag Norte", contact: "0917-555-0105", joined: "2024-08-09", status: "Active" },
  { id: "M-06", name: "Teresita Alonzo", barangay: "Centro", contact: "0917-555-0106", joined: "2025-02-27", status: "Active" },
  { id: "M-07", name: "Virgilio Tan", barangay: "Garita", contact: "0917-555-0107", joined: "2026-09-30", status: "Active" },
  { id: "M-08", name: "Marcelo Diaz", barangay: "Centro", contact: "", joined: "2023-06-04", status: "Inactive" },
];

// Plots recorded by the officer on behalf of members
export const initialPlots = [
  { id: "P-01", memberId: "M-01", name: "Garita plot A", area: 3.5, variety: "Yellow corn", plantingDate: "2026-07-08", harvestDate: "2026-10-27", expectedVolume: 8 },
  { id: "P-02", memberId: "M-02", name: "Casibarag plot", area: 2, variety: "Yellow corn", plantingDate: "2026-07-12", harvestDate: "2026-10-29", expectedVolume: 4.5 },
  { id: "P-03", memberId: "M-03", name: "Garita plot B", area: 4, variety: "Yellow corn", plantingDate: "2026-07-15", harvestDate: "2026-11-03", expectedVolume: 9 },
  { id: "P-04", memberId: "M-04", name: "Centro plot", area: 1.5, variety: "White corn", plantingDate: "2026-07-20", harvestDate: "2026-11-05", expectedVolume: 3 },
  { id: "P-05", memberId: "M-05", name: "Casibarag upper plot", area: 3, variety: "Yellow corn", plantingDate: "2026-07-25", harvestDate: "2026-11-10", expectedVolume: 6.5 },
  { id: "P-06", memberId: "M-01", name: "Garita plot C", area: 2, variety: "Yellow corn", plantingDate: "2026-07-28", harvestDate: "2026-11-12", expectedVolume: 4 },
  { id: "P-07", memberId: "M-06", name: "Centro lowland", area: 2.5, variety: "Yellow corn", plantingDate: "2026-07-18", harvestDate: "2026-11-04", expectedVolume: 5.5 },
];

// A commitment pools several members' plots against one plant requirement
export const initialCommitments = [
  { id: "CC-001", demandId: "D2", allocations: [{ plotId: "P-01", volume: 6 }, { plotId: "P-02", volume: 3 }], total: 9, date: "2026-10-14" },
];

export const initialDeliveries = [
  { id: "CD-003", commitmentId: "CC-001", period: "Oct 26 – Nov 1", volume: 5, point: "Cabagan Coop Warehouse", vehicle: "Hired truck (Santos Hauling)", when: "Oct 27, 8:00 AM", status: "Scheduled", contributors: [{ plotId: "P-01", volume: 3.3 }, { plotId: "P-02", volume: 1.7 }], inspection: null },
  { id: "CD-002", commitmentId: null, period: "Early harvest batch", volume: 7, point: "Cabagan Coop Warehouse", vehicle: "Hired truck (Santos Hauling)", when: "Oct 12, 9:00 AM", status: "Delivered", contributors: [{ plotId: "P-01", volume: 4 }, { plotId: "P-03", volume: 3 }], inspection: { moisture: 13.8, damage: 3.5, foreign: 0.7, result: "Accepted", note: "Within all plant limits." } },
  { id: "CD-001", commitmentId: null, period: "Early harvest batch", volume: 5.5, point: "Garita Drying Pad", vehicle: "Coop truck", when: "Oct 5, 10:00 AM", status: "Delivered", contributors: [{ plotId: "P-02", volume: 2.5 }, { plotId: "P-07", volume: 3 }], inspection: { moisture: 14.9, damage: 4.2, foreign: 0.9, result: "Rejected", note: "Moisture was above the 14% limit." } },
];

// ---------- Helpers ----------
export const plotsOfMember = (memberId, plots) => plots.filter((p) => p.memberId === memberId);
export const memberOf = (memberId, members) => members.find((m) => m.id === memberId);
export const memberName = (memberId, members) => (memberOf(memberId, members) || {}).name || "Unknown member";

export const committedForPlot = (plotId, commitments) =>
  commitments.reduce((s, c) => s + c.allocations.filter((a) => a.plotId === plotId).reduce((t, a) => t + a.volume, 0), 0);

export const availableForPlot = (plot, commitments) =>
  Math.max(fmt(plot.expectedVolume - committedForPlot(plot.id, commitments)), 0);

export const committedToDemand = (demandId, commitments) =>
  commitments.filter((c) => c.demandId === demandId).reduce((s, c) => s + c.total, 0);

// Splits a delivery's volume across the members behind a commitment, in proportion to their share
export function splitContributions(commitment, volume) {
  let used = 0;
  return commitment.allocations.map((a, i, all) => {
    const v = i === all.length - 1 ? fmt(volume - used) : fmt((volume * a.volume) / commitment.total);
    used = fmt(used + v);
    return { plotId: a.plotId, volume: v };
  });
}
