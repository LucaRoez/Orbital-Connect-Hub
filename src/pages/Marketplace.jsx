import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Marketplace.css";
import Modal from "../components/Modal";


export default function Marketplace() {
  const [offers, setOffers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {  
    async function fetchOffers() {
      const querySnapshot = await getDocs(collection(db, "offers"));
      const offersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOffers(offersList);
    }
    fetchOffers();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 80; // mayor factor horizontal
      const y = (e.clientY / window.innerHeight - 0.5) * 80; // factor vertical
      setParallax({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);


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
            <button className="offer-btn" onClick={() => setSelected(offer)}>
              More Info
            </button>
          </div>
        ))}
      </div>

      {/* Modal de detalle */}
      {selected && (
        <Modal
          title={selected.title}
          width={50}
          body={
            <div className="" onClick={(e) => e.stopPropagation()}>
              <div
                className="satelite-img"
                style={{
                  backgroundImage: `url(${selected.image})`,
                  backgroundPosition: `${50 + parallax.x}% ${50 + parallax.y}%`,
                }}
              ></div>

              <h2>{selected.title}</h2>
              <p className="provider">{selected.provider}</p>
              <p>{selected.description}</p>
              <p className="price">
                💲 {selected.price?.toLocaleString()} USD
              </p>
              <p>
                <strong>Window: </strong>
                  <em>Active since</em> {selected.window.from.toDate().toLocaleString()}
                  <em> Completed on</em> {selected.window.to.toDate().toLocaleString()}
              </p>
              <p>
                <strong>Orbit:</strong> {selected.orbit?.class} —{" "}
                {selected.orbit?.altitudeKm} km
              </p>
              <div className="flex gap-8 w-full justify-between">
                <a href={selected.contact} className="contact-link" >
                  Contact Provider
                </a>
                <a href={selected.contact} className="contact-link" >
                  Secure
                </a>
              </div>
            </div>
          }
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
