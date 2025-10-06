// src/components/Planet.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import axios from "axios";
import Modal from "./Modal";
import { Link } from "react-router-dom";

/* ===========================
   lat/lon -> vector 3D
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
   Puntos de eventos (EONET/GDACS)
=========================== */
function EventPoint({ position, color = "#ff5555", onClick }) {
  const ref = useRef();
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
   Puntos de oportunidades (AZUL)
=========================== */
function OpportunityPoint({ position, onClick }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.3;
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} position={position} onClick={onClick}>
      {/* tamaño más grande para que se vean bien */}
      <sphereGeometry args={[0.12, 16, 16]} />
      {/* OJO: meshBasicMaterial no soporta emissive; usamos color + blending */}
      <meshBasicMaterial
        color={"#00d4ff"}
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ===========================
   Globo con textura realista
=========================== */
function TexturedGlobe({ events, opportunities, onSelectEvent, onSelectOpp }) {
  const group = useRef();
  const earthMap = useLoader(THREE.TextureLoader, "/img/earth_day.jpg");

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.03; // rotación suave
  });

  return (
    <group ref={group}>
      {/* Tierra */}
      <mesh>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial map={earthMap} roughness={1} metalness={0} />
      </mesh>

      {/* Atmósfera */}
      <mesh>
        <sphereGeometry args={[2.05, 128, 128]} />
        <meshBasicMaterial
          color={"#21e6c1"}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Eventos (rojo/amarillo) */}
      {events.map((ev, i) => (
        <EventPoint
          key={`ev-${i}`}
          position={latLonToVector3(ev.lat, ev.lon, 2.05)}
          color={ev.color}
          onClick={() => onSelectEvent(ev)}
        />
      ))}

      {/* Oportunidades (azul) */}
      {opportunities.map((opp, i) => (
        <OpportunityPoint
          key={`opp-${i}`}
          position={latLonToVector3(opp.lat, opp.lon, 2.15)} // un poco por encima de la superficie
          onClick={() => onSelectOpp(opp)}
        />
      ))}
    </group>
  );
}

/* ===========================
   Mapeos de imagen / color
=========================== */
const imgMap = {
  Wildfires: "/img/wildfire.jpg",
  "Severe Storms": "/img/storm.jpg",
  Volcanoes: "/img/volcano.jpg",
  Floods: "/img/flood.jpg",
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
   Componente principal
=========================== */
export default function Planet() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [allOpps, setAllOpps] = useState([]);
  const [visibleOpps, setVisibleOpps] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState(null);

  const [onlyWithImage, setOnlyWithImage] = useState(true);

  // CARGA EONET + GDACS (igual que antes)
  useEffect(() => {
    (async () => {
      try {
        const [eonetRes, gdacsRes] = await Promise.all([
          axios.get("https://eonet.gsfc.nasa.gov/api/v3/events"),
          axios
            .get(
              "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventTypes=WF,TC,FL,VO"
            )
            .catch(() => ({ data: { features: [] } })),
        ]);

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

        const gdacsFeatures = gdacsRes.data?.features || [];
        const gdacsEvents = gdacsFeatures
          .map((f) => {
            const prop = f.properties || {};
            const geom = f.geometry || {};
            let lat = prop?.lat || (geom.coordinates ? geom.coordinates[1] : null);
            let lon = prop?.lon || (geom.coordinates ? geom.coordinates[0] : null);
            if (lat == null || lon == null) return null;
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

        const combined = [...eonetEvents, ...gdacsEvents];
        setEvents(onlyWithImage ? combined.filter((e) => !!e.image) : combined);
      } catch (err) {
        console.error("Error trayendo eventos:", err);
      }
    })();
  }, [onlyWithImage]);

  // CARGA de oportunidades desde /public/data/opportunities.json
  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const querySnapshot = await getDocs(collection(db, "opportunities"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllOpps(data);
      } catch (e) {
        console.error("Error cargando Firestore:", e);
      }
    }

    fetchOpportunities();
  }, []);

  // Spawner de oportunidades: cada 2.5s agrega una nueva y se queda
  useEffect(() => {
    if (allOpps.length === 0) return;
    const id = setInterval(() => {
      const base = allOpps[Math.floor(Math.random() * allOpps.length)];
      // si faltaran coords en el JSON, generamos aleatorias válidas
      const lat = typeof base.lat === "number" ? base.lat : Math.random() * 180 - 90;
      const lon = typeof base.lon === "number" ? base.lon : Math.random() * 360 - 180;
      setVisibleOpps((prev) =>
        prev.length > 30 ? [...prev.slice(1), { ...base, lat, lon }] : [...prev, { ...base, lat, lon }]
      );
    }, 2500);
    return () => clearInterval(id);
  }, [allOpps]);

  const lights = useMemo(
    () => (
      <>
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-6, -6, 2]} intensity={1} />
      </>
    ),
    []
  );

  return (
    <div className="globeWrap" style={{ width: 520, height: 520 }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        {lights}
        <TexturedGlobe
          events={events}
          opportunities={visibleOpps}
          onSelectEvent={setSelectedEvent}
          onSelectOpp={($event) => {setSelectedOpp($event); console.log($event)}}
        />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>

      {/* Modal evento (EONET/GDACS) */}
      {selectedEvent && (
        <div className="event-modal" onClick={() => setSelectedEvent(null)}>
          <div className="event-card" onClick={(e) => e.stopPropagation()}>
            {selectedEvent.image && (
              <img src={selectedEvent.image} alt={selectedEvent.title} />
            )}
            <div className="event-body">
              <h2>{selectedEvent.title}</h2>
              <p>
                <strong>Source:</strong> {selectedEvent.source} |{" "}
                <strong>Category:</strong> {selectedEvent.category}
              </p>
            </div>
            <div className="event-actions">
              <a href={selectedEvent.link} target="_blank" rel="noreferrer">
                See official source
              </a>
              <button onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

       {/* Modal del evento */}
       {selectedOpp && (
        <Modal
          title={selectedOpp.title}
          width={70}
          body={
            <div className="flex flex-col">
              <div className="flex gap-4">
                <div>
                  <img
                    src={selectedOpp.image}
                    alt={selectedOpp.title}
                    style={{ width: 290, height: 290, objectFit: "cover", borderRadius: "8px" }}
                  />

                  <p>
                    <Link to={`/marketplace?openSatelite=1`}>View Satellite</Link>
                  </p>
                </div>
                <div className="no-margin-p descripcion-oportunity">
                  <h1>{selectedOpp.title}</h1>
                  <p><strong>Risk:</strong> {selectedOpp.riskLevel}</p>
                  <p><strong>Type:</strong> {selectedOpp.type}</p>
                  <p><strong>Category:</strong> {selectedOpp.category}</p>
                  <p><strong>Description:</strong> {selectedOpp.description}</p>
                  <p>
                    <strong>Potential Value:</strong> {selectedOpp.potentialValue}{" "}
                    {selectedOpp.currency}
                  </p>
                  <p>
                    <strong>Partner:</strong> {selectedOpp.partner}
                  </p>
                </div>
              </div>
              <div>
              </div>
            </div>
          }

          onClose={() => setSelectedOpp(null)}
        />
      )}
      </div>
  );
}
