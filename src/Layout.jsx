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
          <Link to="/insurance">Insurance</Link>
        </nav>
      </header>

      {/* Contenido dinámico */}
      <main>
        <Outlet />
      </main>

      {/* 🧑‍🚀 Footer */}
      <footer>
        <p><FaUserAstronaut style={{ marginRight : ".5rem" }} />
        
      Developed by the Orbital Connect Team for the 
      <strong> NASA Space Apps Challenge 2025</strong>.</p>  
      <p>This is a non-commercial prototype created for educational and research purposes.
    </p>
   

    <h4>Data & Resources</h4>
    <ul>
      <li>
        <a href="https://eonet.gsfc.nasa.gov/" target="_blank">
          NASA EONET – Earth Observatory Natural Event Tracker
        </a>
      </li>
      <li>
        <a href="https://orbitaldebris.jsc.nasa.gov/" target="_blank">
          NASA ODPO – Orbital Debris Program Office
        </a>
      </li>
      <li>
        <a href="https://worldview.earthdata.nasa.gov/" target="_blank">
          NASA Worldview – Earth Observation Data
        </a>
      </li>
      <li>
        <a href="https://dataspace.copernicus.eu/" target="_blank">
          ESA Copernicus – Earth Observation Data
        </a>
      </li>
      <li>
        <a href="https://earthexplorer.usgs.gov/" target="_blank">
          USGS EarthExplorer – Satellite Imagery Archive
        </a>
      </li>
      <li>
        <a href="https://www.gdacs.org/" target="_blank">
          GDACS – Global Disaster Alert and Coordination System
        </a>
      </li>
    </ul>

    <hr class="footer-line" />

    <h4>Technology Stack</h4>
    <p>
      React + Three.js (React Three Fiber) | Firebase | Google Cloud |  
      CSS Glassmorphism | Miro | GitHub
    </p>

    <hr class="footer-line" />

    <p class="disclaimer">
      This project uses open data provided by NASA’s Earth Science Division and
      the NASA Orbital Debris Program Office (ODPO).  
      <br />
      NASA does not endorse this project or any commercial activity associated with it.
    </p>
      </footer>
    </div>
  );
}
