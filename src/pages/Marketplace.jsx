import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Marketplace.css";


export default function Marketplace() {
  const [offers, setOffers] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {  
    async function fetchOffers() {
      const querySnapshot = await getDocs(collection(db, "offers"));
      const offersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOffers(offersList);
    }
    fetchOffers();
  }, []);

  function setOffer(offer) {
    setSelected(offer);
    console.log(offer);
  }

  return (

    <div className="marketplace">
      <div className="offers-grid">
        {offers.map((offer) => (
          <div key={offer.id} className="offer-card">
            <img src={offer.image} alt={offer.title} className="offer-image" />
            <div className="offer-body">
              <h3>{offer.title}</h3>
              <p className="provider">{offer.provider}</p>
              <p className="category">{offer.category}</p>
              <p className="price">💲 {offer.price?.toLocaleString()} USD</p>
              {offer.ecoCredentials && <span className="green-seal">♻️ Eco</span>}
            </div>
            <button className="offer-btn" onClick={() => setOffer(offer)}>
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
              💲 {selected.price?.toLocaleString()} USD
            </p>
            <p>
              <strong>Ventana:</strong>
                <em>activo desde</em> {selected.window.from.toDate().toLocaleString()}
                <em>finalizado en</em> {selected.window.to.toDate().toLocaleString()}
            </p>
            <p>
              <strong>Órbita:</strong> {selected.orbit?.class} —{" "}
              {selected.orbit?.altitudeKm} km
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
