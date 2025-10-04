// src/components/OrbitViz.jsx
import React, { useMemo } from "react";

/**
 * OrbitViz
 * Visualizador SVG liviano de órbitas LEO con un satélite animado.
 * props:
 *  - orbit: "LEO-SSO" | "LEO-polar" | "LEO-inclinado" | "" (default: ciclo)
 */
export default function OrbitViz({ orbit = "" }) {
  // definimos 3 paths (órbitas) con distinta inclinación
  const paths = {
    "LEO-SSO": "M 60,120 a 100,60 0 1,0 200,0 a 100,60 0 1,0 -200,0",         // SSO (inclinada ~98º)
    "LEO-polar": "M 160,20 a 40,100 0 1,0 0,200 a 40,100 0 1,0 0,-200",      // Polar (casi norte-sur)
    "LEO-inclinado": "M 40,160 a 110,50 0 1,0 240,0 a 110,50 0 1,0 -240,0",  // Inclinado (~45º)
  };

  // si no viene seleccionada, vamos alternando automáticamente
  const sequence = ["LEO-SSO", "LEO-polar", "LEO-inclinado"];
  const selected = useMemo(() => (orbit && paths[orbit] ? orbit : ""), [orbit]);

  // velocidad de orbitado (segundos por vuelta)
  const speed = 9;

  return (
    <div className="orbitviz-card">
      <svg
        viewBox="0 0 320 240"
        width="100%"
        height="100%"
        role="img"
        aria-label="Visualización de órbita"
      >
        <defs>
          {/* Tierra en gradiente */}
          <radialGradient id="earthGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#69b7ff" />
            <stop offset="55%" stopColor="#265b9b" />
            <stop offset="100%" stopColor="#0a2a4e" />
          </radialGradient>

          {/* Glow sutil de estrellas */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Paths de órbitas */}
          {Object.entries(paths).map(([key, d]) => (
            <path key={key} id={key} d={d} fill="none" />
          ))}
        </defs>

        {/* Fondo discreto */}
        <rect x="0" y="0" width="320" height="240" fill="none" />

        {/* Tierra */}
        <g transform="translate(160,120)">
          <circle r="58" fill="url(#earthGrad)" filter="url(#softGlow)" />
          {/* terminador de luz (noche/día) */}
          <ellipse rx="58" ry="58" fill="rgba(0,0,0,0.25)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="30s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* Dibujo de órbitas */}
        {Object.entries(paths).map(([key]) => (
          <use
            key={key}
            href={`#${key}`}
            stroke={
              selected
                ? key === selected
                  ? "rgba(0,247,255,0.9)"
                  : "rgba(255,255,255,0.15)"
                : "rgba(255,255,255,0.25)"
            }
            strokeWidth={key === selected || !selected ? 2 : 1}
          />
        ))}

        {/* Satélite animado */}
        <g>
          {/* cuerpo */}
          <g id="sat">
            <rect x="-4" y="-3" width="8" height="6" rx="1" fill="#e4f6ff" />
            {/* paneles solares */}
            <rect x="-16" y="-2" width="10" height="4" rx="1" fill="#80c6ff" />
            <rect x="6" y="-2" width="10" height="4" rx="1" fill="#80c6ff" />
          </g>

          {/* Animación: si hay órbita seleccionada → usar ese path.
              Si no, alternamos automáticamente por secuencia. */}
          {selected ? (
            <animateMotion dur={`${speed}s`} rotate="auto" repeatCount="indefinite">
              <mpath href={`#${selected}`} />
            </animateMotion>
          ) : (
            <>
              <animateMotion dur={`${speed}s`} rotate="auto" repeatCount="indefinite" keyTimes="0;1">
                <mpath href="#LEO-SSO" />
              </animateMotion>
              {/* simple “ciclo” cambiando el path cada vuelta con begin encadenado */}
              <animateMotion
                dur={`${speed}s`}
                rotate="auto"
                repeatCount="indefinite"
                begin={`${speed}s`}
              >
                <mpath href="#LEO-polar" />
              </animateMotion>
              <animateMotion
                dur={`${speed}s`}
                rotate="auto"
                repeatCount="indefinite"
                begin={`${speed * 2}s`}
              >
                <mpath href="#LEO-inclinado" />
              </animateMotion>
            </>
          )}
        </g>

        {/* Etiqueta inferior */}
        <text
          x="160"
          y="228"
          textAnchor="middle"
          fill="#aee8ff"
          style={{ fontWeight: 600, fontSize: 12, letterSpacing: 0.3 }}
        >
          {selected || "LEO — demo"}
        </text>
      </svg>
    </div>
  );
}
