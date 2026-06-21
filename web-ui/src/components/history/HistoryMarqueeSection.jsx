import React from "react";
import { ThreeDMarquee } from "../lightswind/three-d-marquee";

import imgOrbit from "../../assets/history/design_orbit.png";
import imgMagnetic from "../../assets/history/design_magnetic.png";
import imgRocket from "../../assets/history/design_rocket.png";
import imgQuantum from "../../assets/history/design_quantum.png";
import imgNeural from "../../assets/history/design_neural.png";
import imgUi from "../../assets/history/design_ui.png";
import imgSketch from "../../assets/history/design_sketch.png";
import imgMath from "../../assets/history/design_math.png";

const MARQUEE_IMAGES = [
  { src: imgOrbit, alt: "Orbit Simulation" },
  { src: imgMagnetic, alt: "Electromagnetic Flux" },
  { src: imgRocket, alt: "Rocket Trajectory" },
  { src: imgQuantum, alt: "Quantum Density" },
  { src: imgNeural, alt: "Neural Optimization" },
  { src: imgUi, alt: "Calculus UI Mockup" },
  { src: imgSketch, alt: "Newton Manuscript Sketch" },
  { src: imgMath, alt: "Integration Theory Abstract" },
];

export default function HistoryMarqueeSection({ marqueeImages = [], onImageClick }) {
  const imagesToRender = marqueeImages && marqueeImages.length > 0
    ? marqueeImages.map((img, idx) => ({ src: img, alt: `Marquee Image ${idx + 1}` }))
    : MARQUEE_IMAGES;

  return (
    <section className="history-snap-section" style={{ background: "#CDC6AE", padding: 0 }}>
      <ThreeDMarquee 
        images={imagesToRender} 
        cols={5} 
        className="w-full h-full"
        onImageClick={onImageClick ? (image) => onImageClick(image.src, image.alt) : undefined}
      />
    </section>
  );
}
