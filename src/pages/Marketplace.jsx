import React, { useEffect, useState } from "react";
import "./Marketplace.css";


export default function Marketplace() {
  const [offers, setOffers] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function loadOffers() {
      try {
        const res = await fetch("/data/offers.json"); // ✅ así se accede a public/data/offers.json
        const data = await res.json();
        setOffers(data);
      } catch (err) {
        console.error("Error cargando offers.json:", err);
      }
    }
    loadOffers();
  }, []);


  return (

    <div className="marketplace">
      <h2 className="marketplace-title">🌌 Marketplace Orbital</h2>

      <div className="offers-grid">
        {offers.map((offer) => (
          <div key={offer.id} className="offer-card">
            <img src={offer.image} alt={offer.title} className="offer-image" />
            <div className="offer-body">
              <h3>{offer.title}</h3>
              <p className="provider">{offer.provider}</p>
              <p className="category">{offer.serviceType}</p>
              <p className="price">💲 {offer.priceUsd?.toLocaleString()} USD</p>
              {offer.greenSeal && <span className="green-seal">♻️ Eco</span>}
            </div>
            <button className="offer-btn" onClick={() => setSelected(offer)}>
              Más info
            </button>
          </div>
        ))}
      </div>

      {/* Modal de detalle */}
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected.image}
              alt={selected.title}
              className="modal-img"
            />
            <h2>{selected.title}</h2>
            <p className="provider">{selected.provider}</p>
            <p>{selected.description}</p>
            <p className="price">
              💲 {selected.priceUsd?.toLocaleString()} USD
            </p>
            <p>
              <strong>Ventana:</strong> {selected.window}
            </p>
            <p>
              <strong>Órbita:</strong> {selected.orbit.class} —{" "}
              {selected.orbit.altitudeKm} km
            </p>
            <a href={selected.contact} className="contact-link">
              Contactar proveedor
            </a>
            <button className="close-btn" onClick={() => setSelected(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
