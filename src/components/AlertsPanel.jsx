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
          console.error("Error cargando Firestore:", e);
        }
      }
  
      fetchAlerts();
    }, []);

  return (
    <div className="alerts-panel">
      {alerts.map((a) => (
        <ul key={a.id} className={`alert-card ${a.severity === 'alta' ? 'danger' : 'media' ? 'warning' :
          'baja' ? 'success' : 'info'
        }`}>
          <li key={a.id} className="alert-icon">
            {a.title}
          </li>
        </ul>
      ))}
    </div>
  );
}
