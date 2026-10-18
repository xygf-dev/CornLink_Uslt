import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Farmer from "./Pages/Farmer";
import Cooperative from "./Pages/Cooperative";
import PlantLayout from "./Pages/Plant/PlantLayout";
import Overview from "./Pages/Plant/Overview";
import Demand from "./Pages/Plant/Demand";
import Supply from "./Pages/Plant/Supply";
import Deliveries from "./Pages/Plant/Deliveries";
import Suppliers from "./Pages/Plant/Suppliers";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/farmer" element={<Farmer />} />
      <Route path="/cooperative" element={<Cooperative />} />

      <Route path="/plant" element={<PlantLayout />}>
        <Route index element={<Overview />} />
        <Route path="demand" element={<Demand />} />
        <Route path="supply" element={<Supply />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="suppliers" element={<Suppliers />} />
      </Route>
    </Routes>
  );
}