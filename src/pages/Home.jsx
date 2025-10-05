// src/pages/Home.jsx
import React from "react";
import { FaRocket, FaRecycle, FaExclamationTriangle, FaChartLine, FaSatellite } from "react-icons/fa";
import Planet from "../components/Planet";
import AlertsPanel from "../components/AlertsPanel";

export default function Home() {
  
return (
  <>
    <section className="contenido">
      {/* Layout central */}
      <div className="flex w-full justify-evenly">
        <div className="planet-wrapper w-1/2 ml-4">
          <Planet />
          <p className="planet-label">LEO Live Monitor</p>
        </div>

        <div className="w-1/2 flex flex-col items-end">
          {/* KPIs */}
          <div className="kpi-container">
            <div className="kpi-card">
              <FaSatellite className="kpi-icon" />
              <span>Active Satellites</span>
              <strong>7.800</strong>
            </div>
            <div className="kpi-card">
              <FaRecycle className="kpi-icon" />
              <span>Orbital Debris</span>
              <strong>36.000</strong>
            </div>
          </div>
          <div className="kpi-container">
            <div className="kpi-card">
              <FaExclamationTriangle className="kpi-icon" />
              <span>Active Alerts</span>
              <strong>12</strong>
            </div>
            <div className="kpi-card">
              <FaChartLine className="kpi-icon" />
              <span>Opportunities</span>
              <strong>8</strong>
            </div>
          </div>
          <div className="alerts-panel">
            <div className="alert-panel">
              <AlertsPanel />
            </div>
          </div>
        </div>
      </div>
    </section>
  </>
);
}
