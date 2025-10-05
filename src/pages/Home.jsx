// src/pages/Home.jsx
import React, { useEffect } from "react";
import { FaRocket, FaRecycle, FaExclamationTriangle, FaChartLine, FaSatellite } from "react-icons/fa";
import Planet from "../components/Planet";

export default function Home() {
  
return (
    <>
      <section className="contenido"><div>
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
                <span>Satélites Activos</span>
                <strong>7.800</strong>
              </div>
              <div className="kpi-card">
                <FaRecycle className="kpi-icon" />
                <span>Basura Orbital</span>
                <strong>36.000</strong>
              </div>
            </div>
            <div className="kpi-container">
              <div className="kpi-card">
                <FaExclamationTriangle className="kpi-icon" />
                <span>Alertas Activas</span>
                <strong>12</strong>
              </div>
              <div className="kpi-card">
                <FaChartLine className="kpi-icon" />
                <span>Oportunidades</span>
                <strong>8</strong>
              </div>
            </div>
            <div className="alerts-panel">
              <div className="alert-card danger">
                <FaExclamationTriangle className="alert-icon" />
                <p>Colisión detectada en órbita 600km (&lt;48h)</p>
              </div>
              <div className="alert-card warning">
                <FaRocket className="alert-icon" />
                <p>Congestión en órbita 700km (1200 objetos)</p>
              </div>
              <div className="alert-card info">
                <FaRecycle className="alert-icon" />
                <p>Nueva normativa de mitigación (ESA Copernicus)</p>
              </div>
              <div className="alert-card success">
                <FaChartLine className="alert-icon" />
                <p>Oportunidad: datos Sentinel disponibles</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
