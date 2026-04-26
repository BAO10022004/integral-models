import { useRef } from "react";
import "../../styles/Integral3D.css";

export default function Integral3D() {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    const rect = el.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const midX = rect.width / 2;
    const midY = rect.height / 2;

    const rotateX = -(y - midY) / 8;
    const rotateY = (x - midX) / 8;

    el.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.05)
    `;
  };

  const handleLeave = () => {
    const el = ref.current;
    el.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div className="integral-wrap">
      <div
        className="integral-3d"
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        ∫
      </div>
    </div>
  );
}