import React, { useEffect, useMemo, useState } from "react";

const SUPPLY_KEY = "cornlink-farmer-supply-commitments";
const FARM_KEY = "cornlink-farmer-farms";
const QUALITY_KEY = "cornlink-farmer-quality-records";

const EMPTY_SUPPLY = {
  farmId: "",
  variety: "Yellow corn",
  quantity: "",
  unit: "Metric tons",
  availableDate: "",
  municipality: "",
  quality: "Not yet inspected",
  askingPrice: "",
  buyerName: "",
  notes: "",
};

const EMPTY_BUYER = {
  buyerName: "",
  variety: "Yellow corn",
  quantity: "",
  unit: "Metric tons",
  deliveryDate: "",
  municipality: "",
  minimumQuality: "Any / to be confirmed",
  offeredPrice: "",
  notes: "",
};

const css = `
.sm-page{--sm-green:#1d603a;--sm-dark:#153d29;--sm-soft:#eaf4e5;--sm-border:#e0e9dd;--sm-muted:#77867a;color:#203b2a;font-family:Inter,"Segoe UI",Arial,sans-serif;width:100%;max-width:1400px;margin:0 auto}
.sm-page *{box-sizing:border-box}.sm-page button,.sm-page input,.sm-page select,.sm-page textarea{font:inherit}
.sm-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:22px}.sm-kicker{color:#4f8a5a;font-size:10px;letter-spacing:1.5px;font-weight:800;margin:0 0 9px}.sm-title{font-size:clamp(25px,3vw,33px);line-height:1.2;margin:0 0 8px;font-weight:800;letter-spacing:-.8px}.sm-subtitle{font-size:13px;line-height:1.6;color:var(--sm-muted);margin:0}
.sm-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;padding:11px 14px;font-size:12px;font-weight:750;cursor:pointer;transition:.15s}.sm-primary{border:1px solid var(--sm-green);background:var(--sm-green);color:#fff}.sm-primary:hover{background:var(--sm-dark);transform:translateY(-1px)}.sm-secondary{border:1px solid #d9e5d6;background:#fff;color:#31583b}.sm-secondary:hover{background:#f3f8f0}.sm-danger{border:1px solid #f0d8d4;background:#fff;color:#a34338}.sm-danger:hover{background:#fff4f2}
.sm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:19px}.sm-stat{background:#fff;border:1px solid var(--sm-border);border-radius:13px;padding:15px 17px;min-width:0}.sm-stat-label{display:block;color:var(--sm-muted);font-size:11px;margin-bottom:9px}.sm-stat-value{font-size:25px;line-height:1;font-weight:800;letter-spacing:-.5px}.sm-stat-foot{margin-top:8px;color:#8b978e;font-size:9px}
.sm-tabs{display:flex;gap:5px;padding:5px;background:#e9f0e6;border-radius:11px;width:fit-content;max-width:100%;overflow-x:auto;margin-bottom:17px}.sm-tab{flex:0 0 auto;border:0;border-radius:8px;padding:10px 15px;background:transparent;color:#627563;font-size:11px;font-weight:750;cursor:pointer}.sm-tab.active{background:#fff;color:#1d603a;box-shadow:0 2px 6px #173d2b0d}
.sm-panel{background:#fff;border:1px solid var(--sm-border);border-radius:15px;min-width:0;overflow:hidden}.sm-panel-head{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:19px 20px;border-bottom:1px solid #edf1eb}.sm-panel-head h2{font-size:16px;margin:0 0 5px;font-weight:800}.sm-panel-head p{font-size:11px;color:var(--sm-muted);margin:0;line-height:1.5}.sm-panel-body{padding:18px 20px 20px}
.sm-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:15px}.sm-search{max-width:410px}.sm-input{width:100%;min-width:0;border:1px solid #dce6d9;border-radius:9px;padding:10px 12px;color:#23432e;background:#fff;outline:none;font-size:12px}.sm-input:focus{border-color:#73a779;box-shadow:0 0 0 3px #e5f2e1}.sm-count{font-size:10px;color:var(--sm-muted);white-space:nowrap}
.sm-offer-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.sm-offer{border:1px solid var(--sm-border);border-radius:13px;overflow:hidden;min-width:0;background:#fff}.sm-offer-banner{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:13px 15px;background:linear-gradient(110deg,#e7f3df,#f6f9f2);border-bottom:1px solid #e7efe3}.sm-corn-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:#fff;font-size:20px}.sm-offer-body{padding:16px}.sm-offer h3{font-size:15px;margin:0 0 6px;font-weight:800;overflow-wrap:anywhere}.sm-meta{font-size:10px;color:var(--sm-muted);line-height:1.6}.sm-quantity{font-size:27px;font-weight:850;letter-spacing:-.7px;color:#1e5936;margin:15px 0 4px}.sm-unit{font-size:11px;font-weight:700;letter-spacing:0;color:#6d806f}.sm-tags{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.sm-tag{display:inline-flex;align-items:center;border-radius:6px;padding:5px 7px;background:#f0f5ed;color:#57745b;font-size:9px;font-weight:750}.sm-price{font-size:11px;color:#355d3d;font-weight:800}.sm-offer-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:15px}.sm-offer-actions .sm-button{padding:8px 10px;font-size:10px}
.sm-badge{display:inline-flex;align-items:center;border-radius:30px;padding:6px 9px;font-size:9px;font-weight:800;background:#e6f3e1;color:#347044;white-space:nowrap}.sm-badge.pending{background:#fff1d5;color:#8b6418}.sm-badge.cancelled{background:#fbe8e5;color:#a34338}.sm-badge.accepted{background:#e8efff;color:#385c9d}.sm-badge.fulfilled{background:#e4f4e7;color:#2b7940}
.sm-match-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,.36fr);gap:15px;align-items:start}.sm-match-list{display:grid;gap:11px}.sm-match{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:16px;border:1px solid var(--sm-border);border-radius:12px;background:#fff}.sm-match h3{font-size:13px;margin:0 0 6px}.sm-match p{font-size:10px;color:var(--sm-muted);line-height:1.6;margin:0}.sm-match-side{min-width:110px;text-align:right}.sm-match-percent{font-size:21px;font-weight:850;color:#2c7142}.sm-match-side small{display:block;font-size:9px;color:var(--sm-muted);margin-top:3px}.sm-match-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.sm-note-panel{padding:18px;border-radius:13px;border:1px solid #dce9d5;background:#edf6e8}.sm-note-panel h3{font-size:15px;margin:10px 0 7px}.sm-note-panel p{font-size:11px;color:#637b66;line-height:1.7;margin:0}.sm-note-panel ul{padding-left:17px;margin:12px 0 0;color:#4f6d54;font-size:10px;line-height:1.9}
.sm-table-wrap{overflow-x:auto}.sm-table{width:100%;border-collapse:collapse;min-width:690px}.sm-table th{text-align:left;padding:11px 12px;background:#f7faf5;color:#819083;font-size:9px;letter-spacing:.6px}.sm-table td{padding:13px 12px;border-top:1px solid #edf1eb;font-size:11px;color:#3c5942;vertical-align:middle}.sm-table td strong{display:block;color:#23432e;margin-bottom:3px}.sm-table td small{color:#8a968b;font-size:9px}.sm-table-actions{display:flex;gap:6px;flex-wrap:wrap}.sm-table-actions button{padding:7px 9px;font-size:10px}
.sm-form-backdrop{position:fixed;z-index:1000;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:#102a1dcc;backdrop-filter:blur(4px);overflow-y:auto}.sm-modal{width:min(740px,100%);max-height:calc(100vh - 40px);overflow:auto;border:1px solid #e0e9dd;border-radius:17px;background:#fff;box-shadow:0 24px 80px #071c1080}.sm-modal-head{display:flex;justify-content:space-between;gap:15px;align-items:flex-start;padding:22px 24px;background:linear-gradient(120deg,#eff7e9,#fff);border-bottom:1px solid #e8efe5}.sm-modal-head h2{font-size:20px;margin:0 0 6px}.sm-modal-head p{font-size:11px;line-height:1.5;color:var(--sm-muted);margin:0}.sm-modal-body{padding:22px 24px}.sm-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.sm-field label{display:block;margin-bottom:7px;font-size:11px;font-weight:750;color:#4d6753}.sm-field textarea{min-height:75px;resize:vertical}.sm-field.full{grid-column:1/-1}.sm-form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:17px;border-top:1px solid #edf1eb}.sm-error{margin-top:12px;color:#a34338;font-size:11px}
.sm-empty{padding:36px 18px;text-align:center;border:1px dashed #c9dcc5;border-radius:12px;background:#fbfdf9}.sm-empty-icon{font-size:32px;margin-bottom:9px}.sm-empty h3{font-size:15px;margin:0 0 7px}.sm-empty p{max-width:420px;margin:0 auto 14px;color:var(--sm-muted);font-size:11px;line-height:1.7}
@media(max-width:1050px){.sm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.sm-match-layout{grid-template-columns:1fr}}@media(max-width:760px){.sm-head{align-items:flex-start;flex-direction:column}.sm-offer-grid{grid-template-columns:1fr}.sm-toolbar{align-items:stretch;flex-direction:column}.sm-search{max-width:none}.sm-panel-head{align-items:flex-start;flex-direction:column}.sm-match{grid-template-columns:1fr}.sm-match-side{text-align:left}.sm-form-backdrop{padding:10px;align-items:flex-start}.sm-modal{max-height:calc(100vh - 20px)}.sm-modal-head,.sm-modal-body{padding:17px}.sm-form-grid{grid-template-columns:1fr}.sm-field.full{grid-column:auto}}
`;

function readArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function badgeClass(status) {
  if (["Accepted", "Matched"].includes(status)) return "accepted";
  if (["Fulfilled", "Completed"].includes(status)) return "fulfilled";
  if (["Cancelled", "Rejected"].includes(status)) return "cancelled";
  return "pending";
}
function normalize(value) {
  return String(value || "").trim().toLowerCase();
}
function getQuantity(item) {
  const n = Number(item.quantity);
  return Number.isFinite(n) ? n : 0;
}
function getUnit(item) {
  return item.unit || "Metric tons";
}
function sameUnit(a, b) {
  return getUnit(a) === getUnit(b);
}
function getPotentialMatches(supplies, buyers) {
  const matches = [];
  for (const supply of supplies) {
    for (const buyer of buyers) {
      if (supply.status === "Cancelled" || buyer.status === "Cancelled" || buyer.status === "Rejected") continue;
      const varietyMatches = normalize(supply.variety) === normalize(buyer.variety);
      const unitMatches = sameUnit(supply, buyer);
      const locationMatches = !supply.municipality || !buyer.municipality || normalize(supply.municipality) === normalize(buyer.municipality);
      const datesMatch = !supply.availableDate || !buyer.deliveryDate || supply.availableDate <= buyer.deliveryDate;
      if (!varietyMatches || !unitMatches || !locationMatches || !datesMatch) continue;
      const qty = Math.min(getQuantity(supply), getQuantity(buyer));
      if (qty <= 0) continue;
      const reasons = [];
      reasons.push("Same variety");
      reasons.push("Compatible unit");
      if (locationMatches) reasons.push("Location compatible");
      if (datesMatch) reasons.push("Date compatible");
      matches.push({ supply, buyer, quantity: qty, reasons });
    }
  }
  return matches;
}

export default function SupplyMatching() {
  const [supplies, setSupplies] = useState(() => readArray(SUPPLY_KEY));
  const [buyerRequests, setBuyerRequests] = useState(() => readArray("cornlink-buyer-requirements"));
  const [farms] = useState(() => readArray(FARM_KEY));
  const [activeTab, setActiveTab] = useState("matches");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("supply");
  const [supplyForm, setSupplyForm] = useState(EMPTY_SUPPLY);
  const [buyerForm, setBuyerForm] = useState(EMPTY_BUYER);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { saveArray(SUPPLY_KEY, supplies); }, [supplies]);
  useEffect(() => { saveArray("cornlink-buyer-requirements", buyerRequests); }, [buyerRequests]);

  const matches = useMemo(() => getPotentialMatches(supplies, buyerRequests), [supplies, buyerRequests]);
  const filteredSupplies = useMemo(() => supplies.filter((item) =>
    [item.farmName, item.buyerName, item.variety, item.municipality, item.status]
      .some((value) => normalize(value).includes(normalize(query)))
  ), [supplies, query]);
  const filteredBuyers = useMemo(() => buyerRequests.filter((item) =>
    [item.buyerName, item.variety, item.municipality, item.status]
      .some((value) => normalize(value).includes(normalize(query)))
  ), [buyerRequests, query]);

  const pendingCount = supplies.filter((item) => !["Accepted", "Matched", "Fulfilled", "Cancelled"].includes(item.status)).length;
  const acceptedCount = supplies.filter((item) => ["Accepted", "Matched"].includes(item.status)).length;
  const totalQuantity = supplies.filter((item) => item.status !== "Cancelled").reduce((sum, item) => sum + getQuantity(item), 0);

  function openSupplyForm() {
    setFormType("supply");
    setSupplyForm({ ...EMPTY_SUPPLY, farmId: farms[0] ? String(farms[0].id) : "" });
    setError("");
    setShowForm(true);
  }
  function openBuyerForm() {
    setFormType("buyer");
    setBuyerForm(EMPTY_BUYER);
    setError("");
    setShowForm(true);
  }
  function closeForm() { setShowForm(false); setError(""); }

  function submitForm(event) {
    event.preventDefault();
    if (formType === "supply") {
      const quantity = Number(supplyForm.quantity);
      if (!supplyForm.quantity || !Number.isFinite(quantity) || quantity <= 0) {
        setError("Enter a quantity greater than zero.");
        return;
      }
      const farm = farms.find((item) => String(item.id) === String(supplyForm.farmId));
      const record = {
        ...supplyForm,
        id: Date.now().toString(),
        farmName: farm?.name || "Unlinked farm",
        municipality: supplyForm.municipality.trim() || farm?.municipality || "",
        quantity,
        askingPrice: supplyForm.askingPrice === "" ? "" : Number(supplyForm.askingPrice),
        status: "Available",
        createdAt: new Date().toISOString(),
      };
      setSupplies((current) => [record, ...current]);
    } else {
      const quantity = Number(buyerForm.quantity);
      if (!buyerForm.buyerName.trim()) { setError("Enter a buyer or cooperative name."); return; }
      if (!buyerForm.quantity || !Number.isFinite(quantity) || quantity <= 0) { setError("Enter a required quantity greater than zero."); return; }
      const record = {
        ...buyerForm,
        id: Date.now().toString(),
        buyerName: buyerForm.buyerName.trim(),
        municipality: buyerForm.municipality.trim(),
        quantity,
        offeredPrice: buyerForm.offeredPrice === "" ? "" : Number(buyerForm.offeredPrice),
        status: "Open",
        createdAt: new Date().toISOString(),
      };
      setBuyerRequests((current) => [record, ...current]);
    }
    closeForm();
  }

  function updateSupplyStatus(id, status) {
    setSupplies((current) => current.map((item) => String(item.id) === String(id) ? { ...item, status } : item));
  }
  function updateBuyerStatus(id, status) {
    setBuyerRequests((current) => current.map((item) => String(item.id) === String(id) ? { ...item, status } : item));
  }
  function commitMatch(match) {
    const currentSupply = supplies.find((item) => String(item.id) === String(match.supply.id));
    if (!currentSupply) return;
    if (["Accepted", "Matched", "Fulfilled", "Cancelled"].includes(currentSupply.status)) {
      window.alert("This supply is already committed or unavailable.");
      return;
    }
    updateSupplyStatus(match.supply.id, "Matched");
    updateBuyerStatus(match.buyer.id, "Matched");
    window.alert(`Potential match recorded for ${match.quantity} ${getUnit(match.supply)}. This is a local prototype; coordinate and confirm the agreement with the buyer.`);
  }
  function deleteSupply(id) {
    if (window.confirm("Delete this supply listing?")) setSupplies((current) => current.filter((item) => String(item.id) !== String(id)));
  }
  function deleteBuyer(id) {
    if (window.confirm("Delete this buyer requirement?")) setBuyerRequests((current) => current.filter((item) => String(item.id) !== String(id)));
  }

  return (
    <div className="sm-page">
      <style>{css}</style>
      <header className="sm-head">
        <div>
          <p className="sm-kicker">FARM SUPPLY & BUYER DEMAND</p>
          <h1 className="sm-title">Supply Matching</h1>
          <p className="sm-subtitle">Compare available corn supply with buyer requirements and manage potential commitments.</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button className="sm-button sm-secondary" type="button" onClick={openBuyerForm}>＋ Add buyer requirement</button>
          <button className="sm-button sm-primary" type="button" onClick={openSupplyForm}>＋ List my supply</button>
        </div>
      </header>

      <div className="sm-stats">
        <div className="sm-stat"><span className="sm-stat-label">Supply listings</span><strong className="sm-stat-value">{supplies.length}</strong><div className="sm-stat-foot">Corn offered by this farmer</div></div>
        <div className="sm-stat"><span className="sm-stat-label">Buyer requirements</span><strong className="sm-stat-value">{buyerRequests.length}</strong><div className="sm-stat-foot">Requirements entered in this browser</div></div>
        <div className="sm-stat"><span className="sm-stat-label">Potential matches</span><strong className="sm-stat-value">{matches.length}</strong><div className="sm-stat-foot">Rule-based compatibility checks</div></div>
        <div className="sm-stat"><span className="sm-stat-label">Listed quantity</span><strong className="sm-stat-value">{totalQuantity.toLocaleString()} <span style={{ fontSize: 11 }}>t</span></strong><div className="sm-stat-foot">Sum of non-cancelled listings</div></div>
      </div>

      <div className="sm-tabs" role="tablist" aria-label="Supply matching sections">
        <button type="button" role="tab" aria-selected={activeTab === "matches"} className={`sm-tab ${activeTab === "matches" ? "active" : ""}`} onClick={() => setActiveTab("matches")}>Potential matches ({matches.length})</button>
        <button type="button" role="tab" aria-selected={activeTab === "supply"} className={`sm-tab ${activeTab === "supply" ? "active" : ""}`} onClick={() => setActiveTab("supply")}>My available supply ({supplies.length})</button>
        <button type="button" role="tab" aria-selected={activeTab === "buyers"} className={`sm-tab ${activeTab === "buyers" ? "active" : ""}`} onClick={() => setActiveTab("buyers")}>Buyer requirements ({buyerRequests.length})</button>
      </div>

      <section className="sm-panel">
        <div className="sm-panel-head">
          <div>
            <h2>{activeTab === "matches" ? "Potential supply matches" : activeTab === "supply" ? "My available supply" : "Buyer requirements"}</h2>
            <p>{activeTab === "matches" ? "Listings are compared by corn variety, unit, location, and date. Matches are suggestions, not confirmed sales." : activeTab === "supply" ? "List the quantity you expect to make available for a buyer." : "Enter requirements to test potential matches in this local prototype."}</p>
          </div>
          <span className="sm-count">{activeTab === "matches" ? matches.length : activeTab === "supply" ? filteredSupplies.length : filteredBuyers.length} item(s)</span>
        </div>
        <div className="sm-panel-body">
          <div className="sm-toolbar">
            <input className="sm-input sm-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search farm, buyer, variety, or location..." aria-label="Search supply matching" />
            <span className="sm-count">Local prototype data</span>
          </div>

          {activeTab === "matches" && (
            matches.length === 0 ? <div className="sm-empty"><div className="sm-empty-icon">🔎</div><h3>No potential matches yet</h3><p>Add a supply listing and a buyer requirement with compatible corn variety, units, location, and dates. Buyer requirements created here are local examples, not real buyer accounts.</p><button className="sm-button sm-primary" type="button" onClick={openSupplyForm}>＋ List my supply</button> <button className="sm-button sm-secondary" type="button" onClick={openBuyerForm}>＋ Add buyer requirement</button></div> :
              <div className="sm-match-layout">
                <div className="sm-match-list">
                  {matches.filter((match) => [match.supply.farmName, match.buyer.buyerName, match.supply.variety, match.supply.municipality].some((value) => normalize(value).includes(normalize(query)))).map((match) => (
                    <article className="sm-match" key={`${match.supply.id}-${match.buyer.id}`}>
                      <div>
                        <h3>{match.buyer.buyerName} <span className="sm-badge pending">Potential match</span></h3>
                        <p>{match.supply.farmName} · {match.supply.municipality || "Location not specified"} · {match.supply.variety}</p>
                        <p>Buyer needs {getQuantity(match.buyer)} {getUnit(match.buyer)}; this listing can contribute up to {match.quantity} {getUnit(match.supply)}.</p>
                        <div className="sm-tags">{match.reasons.map((reason) => <span className="sm-tag" key={reason}>✓ {reason}</span>)}</div>
                        <div className="sm-match-actions"><button className="sm-button sm-primary" type="button" onClick={() => commitMatch(match)}>Record potential commitment</button></div>
                      </div>
                      <div className="sm-match-side"><div className="sm-match-percent">{Math.round(match.quantity / Math.max(getQuantity(match.buyer), 1) * 100)}%</div><small>of buyer quantity</small></div>
                    </article>
                  ))}
                </div>
                <aside className="sm-note-panel"><div style={{ fontSize: 24 }}>🌽</div><h3>How matching works</h3><p>Potential matches are generated when supply and buyer requirements have the same corn variety and unit, compatible dates, and compatible locations when provided.</p><ul><li>Verify actual quantity and availability.</li><li>Confirm quality and pricing with the buyer.</li><li>Record the agreement before scheduling delivery.</li></ul></aside>
              </div>
          )}

          {activeTab === "supply" && (
            filteredSupplies.length === 0 ? <div className="sm-empty"><div className="sm-empty-icon">🌽</div><h3>No supply listings yet</h3><p>List the corn you expect to sell. You can link it to a farm record already saved in My Farm Records.</p><button className="sm-button sm-primary" type="button" onClick={openSupplyForm}>＋ List my supply</button></div> :
              <div className="sm-offer-grid">{filteredSupplies.map((item) => <article className="sm-offer" key={item.id}><div className="sm-offer-banner"><span className="sm-corn-icon">🌽</span><span className={`sm-badge ${badgeClass(item.status)}`}>{item.status || "Available"}</span></div><div className="sm-offer-body"><h3>{item.farmName || "Unlinked farm"}</h3><div className="sm-meta">{item.municipality || "Location not specified"} · Available {item.availableDate || "date not set"}</div><div className="sm-quantity">{getQuantity(item).toLocaleString()} <span className="sm-unit">{getUnit(item)}</span></div><div className="sm-tags"><span className="sm-tag">{item.variety}</span><span className="sm-tag">{item.quality || "Quality not specified"}</span></div><div className="sm-price">{item.askingPrice !== "" && item.askingPrice != null ? `Asking price: ₱${Number(item.askingPrice).toLocaleString()} / ${getUnit(item)}` : "Price: To be discussed"}</div>{item.notes && <p className="sm-meta" style={{ marginTop: 10 }}>{item.notes}</p>}<div className="sm-offer-actions">{item.status === "Available" && <button className="sm-button sm-secondary" type="button" onClick={() => updateSupplyStatus(item.id, "Cancelled")}>Withdraw listing</button>}{item.status === "Matched" && <button className="sm-button sm-secondary" type="button" onClick={() => updateSupplyStatus(item.id, "Available")}>Reopen listing</button>}<button className="sm-button sm-danger" type="button" onClick={() => deleteSupply(item.id)}>Delete</button></div></div></article>)}</div>
          )}

          {activeTab === "buyers" && (
            filteredBuyers.length === 0 ? <div className="sm-empty"><div className="sm-empty-icon">🏢</div><h3>No buyer requirements yet</h3><p>Add a buyer requirement to test the matching workflow. This does not publish it to other users.</p><button className="sm-button sm-primary" type="button" onClick={openBuyerForm}>＋ Add buyer requirement</button></div> :
              <div className="sm-table-wrap"><table className="sm-table"><thead><tr><th>BUYER / COOPERATIVE</th><th>VARIETY</th><th>QUANTITY</th><th>DELIVERY DATE</th><th>LOCATION</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{filteredBuyers.map((item) => <tr key={item.id}><td><strong>{item.buyerName}</strong><small>{item.notes || "No additional details"}</small></td><td>{item.variety}</td><td>{getQuantity(item).toLocaleString()} {getUnit(item)}</td><td>{item.deliveryDate || "Not set"}</td><td>{item.municipality || "Not specified"}</td><td><span className={`sm-badge ${badgeClass(item.status)}`}>{item.status || "Open"}</span></td><td><div className="sm-table-actions">{item.status === "Open" && <button className="sm-button sm-secondary" type="button" onClick={() => updateBuyerStatus(item.id, "Cancelled")}>Close</button>}<button className="sm-button sm-danger" type="button" onClick={() => deleteBuyer(item.id)}>Delete</button></div></td></tr>)}</tbody></table></div>
          )}
        </div>
      </section>

      {showForm && (
        <div className="sm-form-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <section className="sm-modal" role="dialog" aria-modal="true" aria-labelledby="sm-modal-title">
            <header className="sm-modal-head">
              <div><p className="sm-kicker">{formType === "supply" ? "FARMER LISTING" : "BUYER DEMAND"}</p><h2 id="sm-modal-title">{formType === "supply" ? "List available corn supply" : "Add buyer requirement"}</h2><p>{formType === "supply" ? "Describe the corn you expect to offer for sale." : "Enter the corn quantity and delivery conditions a buyer needs."}</p></div>
              <button className="sm-button sm-secondary" type="button" onClick={closeForm} aria-label="Close form">✕</button>
            </header>
            <form className="sm-modal-body" onSubmit={submitForm}>
              {formType === "supply" ? (
                <div className="sm-form-grid">
                  <div className="sm-field full"><label htmlFor="sm-farm">Link to farm record</label><select id="sm-farm" className="sm-input" value={supplyForm.farmId} onChange={(e) => { const farm = farms.find((item) => String(item.id) === e.target.value); setSupplyForm((current) => ({ ...current, farmId: e.target.value, municipality: current.municipality || farm?.municipality || "" })); }}><option value="">Select a farm (optional)</option>{farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}</select></div>
                  <div className="sm-field"><label htmlFor="sm-variety">Corn variety *</label><select id="sm-variety" className="sm-input" required value={supplyForm.variety} onChange={(e) => setSupplyForm({ ...supplyForm, variety: e.target.value })}><option>Yellow corn</option><option>White corn</option><option>Sweet corn</option><option>Native corn</option><option>Other / mixed variety</option></select></div>
                  <div className="sm-field"><label htmlFor="sm-quantity">Available quantity *</label><input id="sm-quantity" className="sm-input" type="number" min="0.01" step="0.01" required value={supplyForm.quantity} onChange={(e) => setSupplyForm({ ...supplyForm, quantity: e.target.value })} placeholder="e.g. 5" /></div>
                  <div className="sm-field"><label htmlFor="sm-unit">Quantity unit</label><select id="sm-unit" className="sm-input" value={supplyForm.unit} onChange={(e) => setSupplyForm({ ...supplyForm, unit: e.target.value })}><option>Metric tons</option><option>Kilograms</option><option>Sacks (50 kg)</option></select></div>
                  <div className="sm-field"><label htmlFor="sm-available">Available from</label><input id="sm-available" className="sm-input" type="date" value={supplyForm.availableDate} onChange={(e) => setSupplyForm({ ...supplyForm, availableDate: e.target.value })} /></div>
                  <div className="sm-field"><label htmlFor="sm-location">Municipality / location</label><input id="sm-location" className="sm-input" value={supplyForm.municipality} onChange={(e) => setSupplyForm({ ...supplyForm, municipality: e.target.value })} placeholder="e.g. Tuguegarao City" /></div>
                  <div className="sm-field"><label htmlFor="sm-quality">Quality status</label><select id="sm-quality" className="sm-input" value={supplyForm.quality} onChange={(e) => setSupplyForm({ ...supplyForm, quality: e.target.value })}><option>Not yet inspected</option><option>Inspection scheduled</option><option>Passed inspection</option><option>Needs review</option></select></div>
                  <div className="sm-field"><label htmlFor="sm-price">Asking price (₱ per selected unit)</label><input id="sm-price" className="sm-input" type="number" min="0" step="0.01" value={supplyForm.askingPrice} onChange={(e) => setSupplyForm({ ...supplyForm, askingPrice: e.target.value })} placeholder="Optional" /></div>
                  <div className="sm-field full"><label htmlFor="sm-notes">Additional details</label><textarea id="sm-notes" className="sm-input" rows="3" value={supplyForm.notes} onChange={(e) => setSupplyForm({ ...supplyForm, notes: e.target.value })} placeholder="Harvest notes, packaging, or collection instructions" /></div>
                </div>
              ) : (
                <div className="sm-form-grid">
                  <div className="sm-field full"><label htmlFor="sm-buyer">Buyer / cooperative name *</label><input id="sm-buyer" className="sm-input" required value={buyerForm.buyerName} onChange={(e) => setBuyerForm({ ...buyerForm, buyerName: e.target.value })} placeholder="Enter buyer or cooperative name" /></div>
                  <div className="sm-field"><label htmlFor="sm-bvariety">Required corn variety *</label><select id="sm-bvariety" className="sm-input" required value={buyerForm.variety} onChange={(e) => setBuyerForm({ ...buyerForm, variety: e.target.value })}><option>Yellow corn</option><option>White corn</option><option>Sweet corn</option><option>Native corn</option><option>Other / mixed variety</option></select></div>
                  <div className="sm-field"><label htmlFor="sm-bquantity">Required quantity *</label><input id="sm-bquantity" className="sm-input" type="number" min="0.01" step="0.01" required value={buyerForm.quantity} onChange={(e) => setBuyerForm({ ...buyerForm, quantity: e.target.value })} placeholder="e.g. 20" /></div>
                  <div className="sm-field"><label htmlFor="sm-bunit">Quantity unit</label><select id="sm-bunit" className="sm-input" value={buyerForm.unit} onChange={(e) => setBuyerForm({ ...buyerForm, unit: e.target.value })}><option>Metric tons</option><option>Kilograms</option><option>Sacks (50 kg)</option></select></div>
                  <div className="sm-field"><label htmlFor="sm-bdate">Required delivery date</label><input id="sm-bdate" className="sm-input" type="date" value={buyerForm.deliveryDate} onChange={(e) => setBuyerForm({ ...buyerForm, deliveryDate: e.target.value })} /></div>
                  <div className="sm-field"><label htmlFor="sm-blocation">Delivery municipality</label><input id="sm-blocation" className="sm-input" value={buyerForm.municipality} onChange={(e) => setBuyerForm({ ...buyerForm, municipality: e.target.value })} placeholder="e.g. Tuguegarao City" /></div>
                  <div className="sm-field"><label htmlFor="sm-bquality">Minimum quality requirement</label><select id="sm-bquality" className="sm-input" value={buyerForm.minimumQuality} onChange={(e) => setBuyerForm({ ...buyerForm, minimumQuality: e.target.value })}><option>Any / to be confirmed</option><option>Passed inspection</option><option>Needs moisture test</option><option>Official quality certificate required</option></select></div>
                  <div className="sm-field"><label htmlFor="sm-bprice">Offered price (₱ per selected unit)</label><input id="sm-bprice" className="sm-input" type="number" min="0" step="0.01" value={buyerForm.offeredPrice} onChange={(e) => setBuyerForm({ ...buyerForm, offeredPrice: e.target.value })} placeholder="Optional" /></div>
                  <div className="sm-field full"><label htmlFor="sm-bnotes">Buyer notes</label><textarea id="sm-bnotes" className="sm-input" rows="3" value={buyerForm.notes} onChange={(e) => setBuyerForm({ ...buyerForm, notes: e.target.value })} placeholder="Quality, packaging, pickup, or payment terms" /></div>
                </div>
              )}
              {error && <div className="sm-error" role="alert">{error}</div>}
              <div className="sm-form-actions"><button className="sm-button sm-secondary" type="button" onClick={closeForm}>Cancel</button><button className="sm-button sm-primary" type="submit">{formType === "supply" ? "Save supply listing" : "Save buyer requirement"}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
