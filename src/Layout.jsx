// src/Layout.jsx
import React from "react";
import { Link, Outlet } from "react-router-dom";
import { FaRocket, FaUserAstronaut } from "react-icons/fa";

export default function Layout() {
  return (
    <div className="app-container">
      {/* 🌌 Header */}
      <header className="header">
        <img src="img/orbitalCeleste.png" className="logo-header" style={{
          height: '60px',
        }} />
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
