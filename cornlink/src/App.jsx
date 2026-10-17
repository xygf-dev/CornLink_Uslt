import { Routes, Route, Link } from "react-router-dom";
import Home from "./Pages/Home";
import PlantLayout from "./Pages/Plant/PlantLayout";
import Overview from "./Pages/Plant/Overview";
import Demand from "./Pages/Plant/Demand";
import Supply from "./Pages/Plant/Supply";
import Deliveries from "./Pages/Plant/Deliveries";
import Suppliers from "./Pages/Plant/Suppliers";

function ComingSoon({ name }) {
  return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <h1>{name} module</h1>
      <p>Coming soon.</p>
      <Link to="/">← Back to home</Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/plant" element={<PlantLayout />}>
        <Route index element={<Overview />} />
        <Route path="demand" element={<Demand />} />
        <Route path="supply" element={<Supply />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="suppliers" element={<Suppliers />} />
      </Route>

      <Route path="/farmer" element={<ComingSoon name="Farmer" />} />
      <Route path="/cooperative" element={<ComingSoon name="Cooperative" />} />
    </Routes>
  );
}