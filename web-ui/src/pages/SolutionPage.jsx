import { useState, useEffect, useRef } from "react";
import SolutionStep from "../components/solver/SolutionStep";
import IntegralHeader from "../components/solver/IntegralHeader";

const C = {
  bg: "#030303",
  border: "#191919",
  border2: "#1f1f1f",
  muted: "#666",
  muted2: "#999",
  yellow: "#FFE41F",
  yellowDim: "#1a1500",
  green: "#4ade80",
  greenDim: "#052010",
};

export default function SolutionPage({ data, onBack }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const intervalRef = useRef(null);

  const steps = data?.steps || [];

  useEffect(() => {
    const t1 = setTimeout(() => setHeaderVisible(true), 200);
    if (autoPlay) {
      const t2 = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          setVisibleCount(v => {
            if (v >= steps.length) {
              clearInterval(intervalRef.current);
              return v;
            }
            return v + 1;
          });
        }, 600);
      }, 900);
      return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(intervalRef.current); };
    } else {
      setVisibleCount(steps.length);
    }
    return () => clearTimeout(t1);
  }, [autoPlay, steps.length]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Manrope', sans-serif", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Top Navigation */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(3,3,3,0.88)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ background: "transparent", border: `1px solid ${C.border2}`, borderRadius: 100, padding: "8px 16px", cursor: "pointer", color: C.muted2, fontSize: 13, fontWeight: 700 }}>
          ← Quay lại
        </button>
        <div style={{ background: C.yellowDim, border: `1px solid #2a2500`, borderRadius: 100, padding: "6px 14px", color: C.yellow, fontSize: 13, fontWeight: 700 }}>
          Lời giải chi tiết
        </div>
        <button onClick={() => { setAutoPlay(false); setVisibleCount(steps.length); }} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 12 }}>
          Xem ngay →
        </button>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 120px" }}>
        <div style={{ opacity: headerVisible ? 1 : 0, transition: "all .6s", transform: headerVisible ? "none" : "translateY(-10px)" }}>
          <IntegralHeader data={data} />
        </div>

        {steps.length > 0 && (
          <div style={{ marginTop: 40 }}>
            {steps.map((step, i) => (
              <SolutionStep key={i} step={step} index={i} total={steps.length} isVisible={i < visibleCount} />
            ))}
          </div>
        )}

        {visibleCount >= steps.length && steps.length > 0 && (
          <div style={{ marginTop: 32, background: C.greenDim, border: `1px solid #1a4a20`, borderRadius: 18, padding: 24, display: "flex", alignItems: "center", gap: 16, animation: "fadeIn .6s" }}>
            <div style={{ color: C.green, fontWeight: 800 }}>✓ Hoàn thành!</div>
            <button onClick={onBack} style={{ marginLeft: "auto", background: C.green, border: "none", borderRadius: 100, padding: "10px 22px", cursor: "pointer", fontWeight: 800 }}>
              Giải tiếp →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
