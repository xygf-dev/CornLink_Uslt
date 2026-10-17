import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home"
import Farmer from "./Pages/Farmer";
// import Dashboard from "./pages/Dashboard";
// import Farmers from "./pages/Farmers";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/farmer" element={<Farmer />} />
    </Routes>
  );
}
