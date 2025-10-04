import React, { useEffect, useState, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import "./Collision.css";

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function MovingSatellite({ position, color, onClick }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * 0.2;
      ref.current.position.x += Math.sin(t) * 0.0015;
      ref.current.position.y += Math.cos(t) * 0.0015;
    }
  });

  return (
    <mesh ref={ref} position={position} onClick={onClick}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function DebrisPoint({ position, color }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.03, 6, 6]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function HoloGlobe({ satellites, debris, onSatelliteClick }) {
  const group = useRef();
  const earthMap = useLoader(THREE.TextureLoader, "/img/earth_day.jpg");

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.03;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial map={earthMap} roughness={1} metalness={0} />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.05, 128, 128]} />
        <meshBasicMaterial color="#21e6c1" transparent opacity={0.05} />
      </mesh>

      {satellites.map((s, i) => (
        <MovingSatellite
          key={`sat-${i}`}
          position={latLonToVector3(s.lat, s.lon, 2.1)}
          color="#00aaff"
          onClick={() => onSatelliteClick(s)}
        />
      ))}

      {debris.map((d, i) => (
        <DebrisPoint
          key={`deb-${i}`}
          position={latLonToVector3(
            (Math.random() - 0.5) * 180,
            (Math.random() - 0.5) * 180,
            2.1
          )}
          color={d.color}
        />
      ))}
    </group>
  );
}

export default function CollisionMonitor() {
  const [satellites, setSatellites] = useState([]);
  const [debris, setDebris] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/data/satellites.json").then((r) => r.json()),
      fetch("/data/ordem_flux.json").then((r) => r.json()),
      fetch("/data/opportunities.json").then((r) => r.json()),
    ]).then(([sats, ordem, opps]) => {
      setSatellites(sats);
      setOpportunities(opps);

      const debrisSet = ordem.flatMap((layer) =>
        Array.from({ length: Math.floor(layer.flux * 5000) }).map(() => ({
          altitude: layer.altitude_km,
          risk: layer.risk_level,
          color:
            layer.risk_level === "low"
              ? "#00ff99"
              : layer.risk_level === "medium"
              ? "#ffff00"
              : layer.risk_level === "high"
              ? "#ff6600"
              : "#ff0000",
        }))
      );
      setDebris(debrisSet);
    });
  }, []);

  // 🔹 Asocia un satélite a la oportunidad más cercana por coordenadas
  const handleSatelliteClick = (sat) => {
    let nearest = null;
    let minDist = Infinity;

    opportunities.forEach((opp) => {
      const dist = Math.hypot(opp.lat - sat.lat, opp.lon - sat.lon);
      if (dist < minDist) {
        minDist = dist;
        nearest = opp;
      }
    });

    if (nearest) setSelectedOpp(nearest);
  };

  const totalDebris = debris.length;
  const highRisk = debris.filter((d) => d.risk === "high" || d.risk === "critical").length;

  return (
    <div className="collision-container">
      <div className="collision-3d">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[5, 5, 5]} intensity={1.2} />
          <HoloGlobe
            satellites={satellites}
            debris={debris}
            onSatelliteClick={handleSatelliteClick}
          />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      <aside className="collision-panel">
        <h3>🛰️ Collision Monitor</h3>
        <p>Total de fragmentos: <strong>{totalDebris}</strong></p>
        <p>Zona de riesgo alto: <strong>{highRisk}</strong></p>
        <p>Satélites activos: <strong>{satellites.length}</strong></p>
        <p>Promedio de densidad LEO: <strong>0.023 objetos/km³</strong></p>
        <div className="alerts">
          <p className="alert high">⚠️ Congestión detectada en 750 km</p>
          <p className="alert medium">🛰️ Satélite Starlink-3042 fuera de trayectoria nominal</p>
          <p className="alert low">📡 Actividad estable en corredor polar</p>
        </div>
      </aside>

      {/* 🔵 Modal de oportunidad */}
      {selectedOpp && (
        <div className="modal" onClick={() => setSelectedOpp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedOpp.image} alt={selectedOpp.title} className="modal-img" />
            <h2>{selectedOpp.title}</h2>
            <p><strong>Categoría:</strong> {selectedOpp.category}</p>
            <p>{selectedOpp.description}</p>
            <p>
              💰 <strong>Valor potencial:</strong> {selectedOpp.potentialValue}{" "}
              {selectedOpp.currency}
            </p>
            <p>
              🧭 <strong>Riesgo:</strong> {selectedOpp.riskLevel}
            </p>
            <p>
              🤝 <strong>Partner:</strong> {selectedOpp.partner}
            </p>
            <a href={selectedOpp.contact} className="contact-link">Contactar</a>
            <button className="close-btn" onClick={() => setSelectedOpp(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
