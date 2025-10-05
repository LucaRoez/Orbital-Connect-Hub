// src/pages/CollisionMonitor.jsx
import React, { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import "./collision.css";

/* ======================================
   Util: Conversión Lat/Lon a Vector 3D
====================================== */
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ======================================
   Componente Satélite / Fragmento
====================================== */
function Satellite({ position, color }) {
  const ref = useRef();
  const axis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const speed = useMemo(() => 0.001 + Math.random() * 0.0015, []);

  useFrame(() => {
    if (ref.current) {
      ref.current.position.applyAxisAngle(axis, speed);
      ref.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

/* ======================================
   Globo con atmósfera, debris y flashes
====================================== */
function CollisionGlobe() {
  const group = useRef();
  const texture = useMemo(
    () => new THREE.TextureLoader().load("/img/earth_day.jpg"),
    []
  );

  // Generar mezcla de satélites y fragmentos
  const satellites = useMemo(() => {
    const satArray = [];
    const totalObjects = 400;
    for (let i = 0; i < totalObjects; i++) {
      const lat = Math.random() * 180 - 90;
      const lon = Math.random() * 360 - 180;
      const radius = 3 + Math.random() * 0.35;
      const isDebris = Math.random() > 0.75;
      const color = isDebris ? "#ff4444" : "#33c9ff";
      satArray.push({
        position: latLonToVector3(lat, lon, radius),
        color,
      });
    }
    return satArray;
  }, []);

  // Efectos de colisión simulados
  const [flashes, setFlashes] = useState([]);
  useEffect(() => {
    const interval = setInterval(() => {
      setFlashes((prev) => [
        ...prev,
        {
          id: Date.now(),
          pos: latLonToVector3(
            Math.random() * 180 - 90,
            Math.random() * 360 - 180,
            3.1
          ),
        },
      ]);
      setTimeout(() => {
        setFlashes((prev) => prev.slice(1));
      }, 1200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.015;
  });

  return (
    <group ref={group}>
      {/* Tierra base */}
      <mesh>
        <sphereGeometry args={[3, 128, 128]} />
        <meshStandardMaterial map={texture} roughness={1} metalness={0} />
      </mesh>

      {/* Halo atmosférico */}
      <mesh>
        <sphereGeometry args={[3.12, 128, 128]} />
        <meshBasicMaterial
          color={"#1ea7ff"}
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Bandas orbitales */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.3, 3.35, 128]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.15} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[3.5, 3.55, 128]} />
        <meshBasicMaterial color="#ff5555" transparent opacity={0.12} />
      </mesh>

      {/* Satélites y fragmentos */}
      {satellites.map((s, i) => (
        <Satellite key={i} position={s.position} color={s.color} />
      ))}

      {/* Flashes de colisión */}
      {flashes.map((f) => (
        <mesh key={f.id} position={f.pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#ffff66" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ======================================
   Collision Monitor principal
====================================== */
export default function CollisionMonitor() {
  const lights = useMemo(
    () => (
      <>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} />
        <pointLight position={[-6, -6, 2]} intensity={0.8} />
      </>
    ),
    []
  );

  const mockData = {
    fragments: 380,
    activeSatellites: 42,
    density: 0.023,
  };

  return (
    <div className="collision-container">
      {/* PANEL DE INFORMACIÓN */}
      <div className="collision-panel">
        <h3>⚙️ Collision Monitor</h3>
        <p>
          Total de fragmentos: <strong>{mockData.fragments}</strong>
        </p>
        <p>
          Satélites activos: <strong>{mockData.activeSatellites}</strong>
        </p>
        <p>
          Promedio densidad LEO:{" "}
          <strong>{mockData.density} objetos/km³</strong>
        </p>

        <h4>Zonas de riesgo</h4>
        <ul>
          <li>Alta — 750 km — 0.023 obj/km³</li>
          <li>Media — 900 km — 0.015 obj/km³</li>
          <li>Baja — 1200 km — 0.006 obj/km³</li>
        </ul>

        <div className="alert red">
          ⚠️ Congestión detectada en órbita 700 km
        </div>
        <div className="alert yellow">
          🛰 Satélite fuera de trayectoria nominal
        </div>
        <div className="alert blue">
          🌌 Actividad elevada en corredor polar
        </div>

        <hr style={{ margin: "12px 0", opacity: 0.2 }} />

        {/* LEYENDA VISUAL */}
        <div style={{ fontSize: "0.85rem", lineHeight: "1.4em" }}>
          <p>🔵 Satélite activo</p>
          <p>🔴 Fragmento de desecho orbital</p>
          <p>🟡 Zona de congestión orbital</p>
          <p>✨ Colisión simulada detectada</p>
        </div>
      </div>

      {/* GLOBO 3D */}
      <div className="globeContainer">
        <Canvas
          camera={{ position: [0, 0, 9], fov: 40 }}
          style={{
            width: "100%",
            height: "100%",
            background: "transparent",
            borderRadius: "50%",
          }}
        >
          {lights}
          <CollisionGlobe />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={0.25}
          />
        </Canvas>
      </div>
    </div>
  );
}
