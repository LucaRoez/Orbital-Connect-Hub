// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./Layout.jsx";
import Home from "./pages/Home.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import CollisionMonitor from "./pages/Collision.jsx";
import InsurancePanel from "./pages/Insurance.jsx";

function App() {
  
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/collision" element={<CollisionMonitor />} />
        <Route path="/insurance" element={<InsurancePanel />} />
      </Route>
    </Routes>
  );
}

export default App;
