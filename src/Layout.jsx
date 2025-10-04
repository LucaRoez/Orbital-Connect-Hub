// src/Layout.jsx
import React from "react";
import { Link, Outlet } from "react-router-dom";
import { FaRocket, FaUserAstronaut } from "react-icons/fa";

export default function Layout() {
  return (
    <div className="app-container">
      {/* 🌌 Header */}
      <header className="header">
        <h1><FaRocket /> ORBITAL CONNECT HUB</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/collision">Collision Monitor</Link>
          <Link to="/insurance">Insurance Panel</Link>
        </nav>
      </header>

      {/* Contenido dinámico */}
      <main>
        <Outlet />
      </main>

      {/* 🧑‍🚀 Footer */}
      <footer>
        <p><FaUserAstronaut /> Proyecto desarrollado para NASA Space Apps Challenge</p>
      </footer>
    </div>
  );
}
