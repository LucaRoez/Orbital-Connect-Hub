import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaRocket,
  FaRecycle,
  FaExclamationTriangle,
  FaChartLine,
  FaSatellite,
} from "react-icons/fa";
import Planet from "../components/Planet";
import AlertsPanel from "../components/AlertsPanel";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";


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
   Página principal (Home)
====================================== */
export default function Home() {
  // resizer desde three.js al DOM
  const globeRef = useRef(null);
  useEffect(() => {
    if (!globeRef.current || !window.ResizeObserver) return;

    const ro = new ResizeObserver(() => {
      window.dispatchEvent(new Event('resize'));
    });

    ro.observe(globeRef.current);
    return () => ro.disconnect();
  }, []);

  const [data, setData] = useState([]);

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "collision_data"));
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (mounted) setData(docs);
      } catch (e) {
        console.error("collision_data Firestore error:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Sumar datos totales desde Firestore
  const totals = data.reduce(
    (acc, curr) => {
      const zones = curr.risk_zones ? Object.values(curr.risk_zones) : [];
      const zoneDensitySum = zones.reduce(
        (sum, z) => sum + (z.density || 0),
        0
      );

      return {
        fragments: acc.fragments + (curr.fragments || 0),
        satellites: acc.satellites + (curr.satellites || 0),
        density: acc.density + zoneDensitySum,
      };
    },
    { fragments: 0, satellites: 0, density: 0 }
  );

  const averageDensity =
    data.length > 0 ? totals.density / data.length : 0;

  return (
    <>
      <section className="Home-container">
        <div className="Home-content flex w-full justify-evenly">
          <div className="planet-wrapper w-1/2 ml-4">
            <Planet />
            <p className="planet-label">LEO Live Monitor</p>
          </div>

          <div className="w-1/2 flex flex-col items-end">
            <div className="kpi-container">
              <div className="kpi-card">
                <FaSatellite className="kpi-icon" />
                <span>Satélites Activos</span>
                <strong>{totals.satellites}</strong>
              </div>
              <div className="kpi-card">
                <FaRecycle className="kpi-icon" />
                <span>Basura Orbital</span>
                <strong>{totals.fragments}</strong>
              </div>
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
              <div className="alert-panel">
                <AlertsPanel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === Globe & Collision Monitor === */}
      <div className="collision-container">
        <div className="globeContainer">
          <Canvas
            camera={{ position: [0, 0, 9], fov: 40 }}
            style={{
              width: "100%",
              background: "transparent",
              borderRadius: "50%"
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

        <div className="collision-panel">
          <h3>⚙️ Collision Monitor</h3>
          <p>
            Total de fragmentos: <strong>{totals.fragments}</strong>
          </p>
          <p>
            Satélites activos: <strong>{totals.satellites}</strong>
          </p>
          <p>
            Promedio densidad LEO:{" "}
            <strong>{averageDensity.toFixed(3)} objetos/km³</strong>
          </p>

          <h4>Zonas de riesgo</h4>
          <ul>
            <li>Alta — 750 km — 0.023 obj/km³</li>
            <li>Media — 900 km — 0.015 obj/km³</li>
            <li>Baja — 1200 km — 0.006 obj/km³</li>
          </ul>
        </div>
      </div>
    </>
  );
}
