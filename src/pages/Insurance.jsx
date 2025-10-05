import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Modal from "../components/Modal";

export default function Insurance() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const openInsurance = searchParams.get("openInsurance"); 

  const [selected, setSelected] = useState(null)
  const [insurance, setInsurance] = useState([
    {
      id: "basic",
      type: "BÁSICO",
      title: "Plan Orbital Básico",
      subtitle: "Protección contra colisiones menores y fallos de subsistemas.",
      features: [
        "Reemplazo parcial de componentes",
        "Soporte de telemetría 24/7",
        "Asistencia en maniobras de emergencia"
      ],
      price: "1,200",
      buttonText: "Hire",
      featured: false,
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21l6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.5 5.5l10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="7" cy="7" r="1.6" fill="currentColor"/>
          <rect x="13.5" y="3.5" width="6" height="4.5" rx="0.8" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        </svg>
      )
    },
    {
      id: "advanced",
      type: "AVANZADO",
      title: "Plan Avanzado — Sentinel",
      subtitle: "Cobertura completa, análisis predictivo y mitigación de riesgos orbitales.",
      features: [
        "Reemplazo total ante pérdida de misión",
        "Seguro de responsabilidad por daños a terceros",
        "Servicio de remediación y rescate orbital",
        "Monitorización con IA y alertas proactivas"
      ],
      price: "9,800",
      buttonText: "Hire",
      featured: true,
      icon: (
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M18 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M8.5 4.5l7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <rect x="9" y="11.5" width="6" height="4.5" rx="0.6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <circle cx="12" cy="8" r="1.8" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: "corp",
      type: "CORP",
      title: "Plan Corporativo — Constellation",
      subtitle: "Solución para flotas y constelaciones con SLAs y personalización avanzada.",
      features: [
        "Política a medida para múltiples satélites",
        "Descuentos por volumen y auditorías periódicas",
        "Simulaciones de resiliencia y reporte regulatorio"
      ],
      price: "22,500",
      buttonText: "Hire",
      featured: false,
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 16c2-3 6-7 10-7s8 4 10 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="6" cy="10" r="1.2" fill="currentColor"/>
          <circle cx="18" cy="14" r="1.2" fill="currentColor"/>
          <circle cx="12" cy="7" r="1.4" fill="currentColor"/>
        </svg>
      )
    }
  ]);
  
  useEffect(() => {  
    async function fetchInsurance() {
      if(openInsurance == 1){
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * insurance.length);
          setSelected(insurance[randomIndex]);
        }, 1000)
      }
    }
    fetchInsurance();
  }, []);

  return (
    <div className="insurance-cards-grid">
      {insurance.map((plan, index) => (
        <div
          key={index}
          className={`insurance-card ${plan.featured ? "featured" : ""}`}
          aria-labelledby={`plan-${plan.id}`}
        >
          <div className="insurance-card-header">
            <div className="insurance-plan-badge">{plan.type}</div>
            <div className="insurance-card-icon" aria-hidden="true">
              {plan.icon}
            </div>
          </div>

          <h2 id={`plan-${plan.id}`} className="insurance-card-title">
            {plan.title}
          </h2>
          <p className="insurance-card-subtitle">{plan.subtitle}</p>

          <ul className="insurance-card-features">
            {plan.features.map((feature, i) => (
              <li key={i}>{feature}</li>
            ))}
          </ul>

          <div className="insurance-card-footer">
            <div className="insurance-card-price">
              <span className="currency">USD</span>
              <span className="amount">{plan.price}</span>
              <span className="period">/ año</span>
            </div>
            <p className="cursor-pointer" onClick={() => {setSelected(plan); console.log(plan)}}>
              Customize
            </p>
            <button
              className={`insurance-card-button ${plan.featured ? "insurance-card-button-primary" : ""}`}
              aria-label={`Contratar `}
            >
              {plan.buttonText}
            </button>
          </div>
        </div>
      ))}
      {/* Modal de detalle */}
      {selected && (
        <Modal
          width={50}
            body={
              <div className="" onClick={(e) => e.stopPropagation()}>
                <div className="insurance-body">
                  <div className="insurance-content" style={{textAlign: 'start'}}>
                    {/* Ícono y tipo */}
                    <div className="insurance-title">
                      <h2>{selected.title}</h2>
                      <span className="type-label">{selected.type}</span>
                    </div>

                    {/* Subtítulo */}
                    <p className="subtitle">{selected.subtitle}</p>
                  </div>
                  <div className="insurance-content" style={{textAlign: 'end'}}>
                    {/* Lista de características */}
                    <ul className="features-list">
                      {selected.features?.map((feature, index) => (
                        <li key={index}> *{feature}</li>
                      ))}
                    </ul>

                    {/* Precio */}
                    <p className="price">
                      💲 {selected.price?.toLocaleString()} USD
                    </p>
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="flex gap-8 w-full justify-between">
                  <p>
                    <Link to={`/insurance?openInsurance=1`}>Secure</Link>
                  </p>
                </div>
              </div>
            }
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
