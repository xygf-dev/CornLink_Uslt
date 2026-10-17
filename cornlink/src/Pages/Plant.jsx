import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Plant from "./Pages/Plant";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/plant" element={<Plant />} />
    </Routes>
  );
}