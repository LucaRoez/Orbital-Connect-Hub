// src/components/WorldviewMap.jsx
import React from "react";

const WORLDVIEW_URL =
  "https://worldview.earthdata.nasa.gov/?v=-180,-85,180,85&l=Reference_Labels,Reference_Features,VIIRS_SNPP_CorrectedReflectance_TrueColor&as=1";

export default function WorldviewMap({ onBack }) {
  return (
    <div className="w-full h-[78vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
      <iframe
        title="NASA Worldview"
        src={WORLDVIEW_URL}
        className="w-full h-full"
        loading="lazy"
      />
      <button
        onClick={onBack}
        className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm backdrop-blur"
      >
        ← Volver al globo
      </button>
    </div>
  );
}
