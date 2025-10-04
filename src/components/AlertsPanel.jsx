import React from "react";
import alerts from "../data/alerts.json";

export default function AlertsPanel() {
  const color = (severity) =>
    severity === "alta" ? "text-red-400" :
    severity === "media" ? "text-yellow-400" : "text-cyan-300";

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 border border-white/10 shadow-2xl w-full lg:w-80">
      <h3 className="text-xl font-bold text-cyan-300 mb-4">🚨 Alertas Orbitales</h3>
      <ul className="space-y-3">
        {alerts.map((a) => (
          <li key={a.id} className={`text-sm leading-snug ${color(a.severity)}`}>
            {a.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
