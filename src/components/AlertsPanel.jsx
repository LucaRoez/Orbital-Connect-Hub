import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";import './AlertsPanel.css';


export default function AlertsPanel() {
  const [alerts, setAlert] = useState([]);
  useEffect(() => {
      async function fetchAlerts() {
        try {
          const querySnapshot = await getDocs(collection(db, "alerts"));
          const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAlert(data);
        } catch (e) {
          console.error("Error loading Firestore:", e);
        }
      }
  
      fetchAlerts();
    }, []);

  return (
    <div className="alert-container">
      <ul className="alert-card">
        {alerts.map((a) => (
            <li key={a.id} className={`alert-item ${a.severity === 'alta' ? 'danger' :
              a.severity === 'media' ? 'warning' :
              a.severity === 'baja' ? 'success' : 'info'
            }`}>
              {a.title}
            </li>
        ))}
      </ul>
    </div>
  );
}
