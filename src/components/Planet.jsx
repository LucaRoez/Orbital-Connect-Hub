// src/components/Planet.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import axios from "axios";

/* ===========================
   Util: lat/lon -> vector 3D
=========================== */
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ===========================
   Punto de evento en el globo
=========================== */
function EventPoint({ position, color = "#ff5555", onClick }) {
  const ref = useRef();
  // pequeño pulso
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.08;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref} position={position} onClick={onClick}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/* ===========================
   Globo con textura realista
=========================== */
function TexturedGlobe({ events, onSelect }) {
  const group = useRef();

  // Cargamos la textura de la Tierra (día)
  const earthMap = useLoader(THREE.TextureLoader, "/img/earth_day.jpg");

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.04; // rotación lenta
  });

  return (
    <group ref={group}>
      {/* Tierra texturizada */}
      <mesh>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial
          map={earthMap}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Atmósfera suave */}
      <mesh>
        <sphereGeometry args={[2.05, 128, 128]} />
        <meshBasicMaterial
          color={"#21e6c1"}
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Eventos */}
      {events.map((ev, i) => (
        <EventPoint
          key={`${ev.source}-${i}`}
          position={latLonToVector3(ev.lat, ev.lon, 2.05)}
          color={ev.color}
          onClick={() => onSelect(ev)}
        />
      ))}
    </group>
  );
}

/* ===========================
   Mapeo de categoría -> imagen/color
=========================== */
const imgMap = {
  Wildfires: "/img/wildfire.jpg",
  "Severe Storms": "/img/storm.jpg",
  Volcanoes: "/img/volcano.jpg",
  Floods: "/img/flood.jpg",
  // GDACS event types (approx mapping)
  WF: "/img/wildfire.jpg",
  TC: "/img/storm.jpg",
  FL: "/img/flood.jpg",
  VO: "/img/volcano.jpg",
};

const colorMap = {
  Wildfires: "#ff4d4d",
  "Severe Storms": "#ffd84d",
  Volcanoes: "#ff7a1a",
  Floods: "#43c6f9",
  WF: "#ff4d4d",
  TC: "#ffd84d",
  FL: "#43c6f9",
  VO: "#ff7a1a",
};

/* ===========================
   Fetched events (EONET + GDACS)
=========================== */
export default function Planet() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [onlyWithImage, setOnlyWithImage] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [eonetRes, gdacsRes] = await Promise.all([
          axios.get("https://eonet.gsfc.nasa.gov/api/v3/events"),
          // GDACS listado básico (si falla, lo ignoramos)
          axios
            .get(
              "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventTypes=WF,TC,FL,VO"
            )
            .catch(() => ({ data: { features: [] } })),
        ]);

        // --- EONET ---
        const eonetEvents = (eonetRes.data?.events || [])
          .map((e) => {
            const g = e.geometry?.[0];
            if (!g || !g.coordinates) return null;
            const [lon, lat] = g.coordinates;
            const cat = e.categories?.[0]?.title || "Event";
            return {
              source: "EONET",
              title: e.title,
              category: cat,
              lat,
              lon,
              link: e.sources?.[0]?.url || "https://eonet.gsfc.nasa.gov",
              image: imgMap[cat] || null,
              color: colorMap[cat] || "#ffaa00",
            };
          })
          .filter(Boolean);

        // --- GDACS ---
        // En muchos casos GDACS devuelve geometry al estilo GeoJSON (features)
        const gdacsFeatures = gdacsRes.data?.features || [];
        const gdacsEvents = gdacsFeatures
          .map((f) => {
            const prop = f.properties || {};
            const geom = f.geometry || {};
            let lat = prop?.lat || (geom.coordinates ? geom.coordinates[1] : null);
            let lon = prop?.lon || (geom.coordinates ? geom.coordinates[0] : null);
            if (lat == null || lon == null) return null;

            // GDACS types: WF (wildfire), FL (flood), TC (tropical cyclone), VO (volcano), EQ (earthquake), etc.
            const type = prop.eventtype || prop.eventType || "Event";
            const title = prop.name || prop.title || type;
            const url = prop?.url || prop?.episodeLink || "https://www.gdacs.org/";

            return {
              source: "GDACS",
              title,
              category: type,
              lat,
              lon,
              link: url,
              image: imgMap[type] || null,
              color: colorMap[type] || "#00ffc8",
            };
          })
          .filter(Boolean);

        // Combinar y filtrar si hace falta
        const combined = [...eonetEvents, ...gdacsEvents];
        setEvents(onlyWithImage ? combined.filter((e) => !!e.image) : combined);
      } catch (err) {
        console.error("Error trayendo eventos:", err);
      }
    })();
  }, [onlyWithImage]);

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
    <div>

    <div className="globeWrap" style={{ width: 520, height: 520 }}>
  <Canvas
    camera={{ position: [0, 0, 5.5], fov: 45 }}
    style={{ width: '100%', height: '100%' }}  // fija al contenedor
  >
    {lights}
    <TexturedGlobe events={events} onSelect={setSelected} />
    <OrbitControls enablePan={false} enableZoom={false} />
  </Canvas>
</div>

      {/* Modal del evento */}
      {selected && (
        <div className="event-modal" onClick={() => setSelected(null)}>
          <div className="event-card" onClick={(e) => e.stopPropagation()}>
            {selected.image && <img src={selected.image} alt={selected.title} />}
            <div className="event-body">
              <h2>{selected.title}</h2>
              <p>
                <strong>Fuente:</strong> {selected.source} |{" "}
                <strong>Categoría:</strong> {selected.category}
              </p>
            </div>
            <div className="event-actions">
              <a href={selected.link} target="_blank" rel="noreferrer">
                Ver fuente oficial
              </a>
              <button onClick={() => setSelected(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
