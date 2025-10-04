// src/pages/Collision.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// === util: convierte “altitud LEO (km)” a radio del globo en escena ===
// El globo tiene radio ~2.0. Mapear 500–1300 km a 2.05–2.45 da un buen look.
function altitudeToRadius(km) {
  const minKm = 500, maxKm = 1300;
  const minR = 2.05, maxR = 2.45;
  const t = Math.min(1, Math.max(0, (km - minKm) / (maxKm - minKm)));
  return minR + t * (maxR - minR);
}

// === Globo texturizado ===
function Globe() {
  const tex = useLoader(THREE.TextureLoader, "/img/earth_day.jpg");
  const gRef = useRef();
  useFrame((_, delta) => {
    if (gRef.current) gRef.current.rotation.y += delta * 0.04;
  });
  return (
    <group ref={gRef}>
      <mesh>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial map={tex} roughness={1} metalness={0} />
      </mesh>
      {/* atmósfera suave */}
      <mesh>
        <sphereGeometry args={[2.05, 128, 128]} />
        <meshBasicMaterial
          color="#21e6c1"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// === Halos de congestión (zonas de riesgo) ===
function RiskHalos({ zones }) {
  // animación suave de pulso
  const refs = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((m, i) => {
      if (!m) return;
      const pulse = 1 + Math.sin(t * 1.4 + i) * 0.03;
      m.scale.setScalar(pulse);
      m.material.opacity = 0.10 + (Math.sin(t * 2 + i) + 1) * 0.08;
    });
  });

  return (
    <group>
      {zones.map((z, i) => {
        const radius = altitudeToRadius(z.altitude);
        const color =
          z.severity === "Alta" ? "#ff4444" : z.severity === "Media" ? "#ffbb33" : "#44ccff";
        return (
          <mesh
            key={i}
            ref={(el) => (refs.current[i] = el)}
          >
            <sphereGeometry args={[radius, 64, 64]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.18}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.BackSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// === Flota orbitando (satélites + fragmentos) ===
function Swarm({ count, color, radiusRange, speedRange, chaotic = false, size = 0.03 }) {
  // Creamos parámetros de órbita para cada objeto
  const items = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const radius =
        radiusRange[0] + Math.random() * (radiusRange[1] - radiusRange[0]);
      const speed =
        speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
      const incl = Math.random() * Math.PI; // 0..180°
      const phase = Math.random() * Math.PI * 2;
      const wobble = chaotic ? (0.02 + Math.random() * 0.05) : 0.0;
      arr.push({ radius, speed, incl, phase, wobble });
    }
    return arr;
    // eslint-disable-next-line
  }, [count]);

  const meshesRef = useRef([]);

  useFrame((_, delta) => {
    meshesRef.current.forEach((m, i) => {
      const it = items[i];
      if (!m) return;
      it.phase += it.speed * delta;
      // órbita: ángulo principal (phase) y leve precesión/inclinación
      const a = it.phase;
      const inc = it.incl + (it.wobble ? Math.sin(a * 1.7) * it.wobble : 0);
      const x = it.radius * Math.sin(inc) * Math.cos(a);
      const y = it.radius * Math.cos(inc);
      const z = it.radius * Math.sin(inc) * Math.sin(a);
      m.position.set(x, y, z);
    });
  });

  return (
    <group>
      {items.map((_, i) => (
        <mesh key={i} ref={(el) => (meshesRef.current[i] = el)}>
          <sphereGeometry args={[size, 6, 6]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

// === Escena 3D completa ===
function CollisionScene({ zones }) {
  // luces
  const lights = useMemo(
    () => (
      <>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-6, -6, 2]} intensity={0.8} />
      </>
    ),
    []
  );

  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
      {lights}
      <Globe />

      {/* Halos de riesgo */}
      <RiskHalos zones={zones} />

      {/* Satélites (azules) — órbitas más “limpias” */}
      <Swarm
        count={48}
        color="#4cc9ff"
        radiusRange={[altitudeToRadius(520), altitudeToRadius(900)]}
        speedRange={[0.3, 0.6]}
        chaotic={false}
        size={0.035}
      />

      {/* Fragmentos / desechos (rojo/naranja) — órbitas más caóticas */}
      <Swarm
        count={120}
        color="#ff5e57"
        radiusRange={[altitudeToRadius(650), altitudeToRadius(1250)]}
        speedRange={[0.6, 1.1]}
        chaotic={true}
        size={0.028}
      />

      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  );
}

// === Panel de métricas lateral ===
function SidePanel({ data }) {
  return (
    <aside className="collision-panel">
      <h3 className="cp-title">⚙️ Collision Monitor</h3>
      <div className="cp-kpi">
        <span>Total de fragmentos:</span>
        <strong>{data.fragments?.toLocaleString() ?? "—"}</strong>
      </div>
      <div className="cp-kpi">
        <span>Satélites activos:</span>
        <strong>{data.satellites ?? "—"}</strong>
      </div>
      <div className="cp-kpi">
        <span>Promedio densidad LEO:</span>
        <strong>
          {data.risk_zones?.[0]?.density?.toFixed(3) ?? "—"} objetos/km³
        </strong>
      </div>

      <div className="cp-zones">
        <h4>Zonas de riesgo</h4>
        {data.risk_zones?.map((z, i) => (
          <div key={i} className={`cp-zone cp-${z.severity?.toLowerCase()}`}>
            <div>
              <strong>{z.severity}</strong> — {z.altitude} km
            </div>
            <small>densidad: {z.density} obj/km³</small>
          </div>
        ))}
      </div>

      <div className="cp-alerts">
        <h4>Alertas</h4>
        <ul>
          {data.alerts?.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

// === Página principal ===
export default function Collision() {
  const [data, setData] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/data/collision_data.json");
        const json = await res.json();
        if (mounted) setData(json);
      } catch (e) {
        console.error("collision_data.json error:", e);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <div className="collision-page">
      <div className="collision-canvas">
        <CollisionScene zones={data.risk_zones ?? []} />
      </div>
      <SidePanel data={data} />
    </div>
  );
}
