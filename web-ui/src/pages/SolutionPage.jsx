import { useState, useEffect, useRef } from "react";
import SolutionStep from "../components/solver/SolutionStep";
import IntegralHeader from "../components/solver/IntegralHeader";

const C = {
  bg: "#f8fafc",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
  muted2: "#475569",
  blue: "#2563eb",
  blueDim: "#eff6ff",
  green: "#10b981",
  greenDim: "#ecfdf5",
  greenBorder: "#a7f3d0",
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
    <div style={{ 
      minHeight: "100vh", 
      background: C.bg, 
      fontFamily: "Arial, Helvetica, sans-serif", 
      color: C.text 
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        body, body * {
          font-family: Arial, Helvetica, sans-serif !important;
        }
      `}</style>

      {/* Top Sticky Navigation with Glass Effect */}
      <div style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 100, 
        background: "rgba(255, 255, 255, 0.85)", 
        backdropFilter: "blur(20px)", 
        borderBottom: `1px solid ${C.border}`, 
        padding: "14px 24px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)"
      }}>
        <button 
          onClick={onBack} 
          style={{ 
            background: "transparent", 
            border: `1px solid ${C.border}`, 
            borderRadius: 100, 
            padding: "8px 18px", 
            cursor: "pointer", 
            color: C.muted2, 
            fontSize: 13, 
            fontWeight: 800,
            transition: "all 0.2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          ← Quay lại
        </button>
        
        {/* Title Capsule */}
        <div style={{ 
          background: C.blueDim, 
          border: `1px solid #bfdbfe`, 
          borderRadius: 100, 
          padding: "6px 16px", 
          color: C.blue, 
          fontSize: 13, 
          fontWeight: 800 
        }}>
          Lời Giải Chi Tiết
        </div>
        
        <button 
          onClick={() => { setAutoPlay(false); setVisibleCount(steps.length); }} 
          style={{ 
            background: "transparent", 
            border: "none", 
            color: C.muted, 
            cursor: "pointer", 
            fontSize: 12,
            fontWeight: 800
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.blue; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.muted; }}
        >
          Xem nhanh →
        </button>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 120px" }}>
        <div style={{ 
          opacity: headerVisible ? 1 : 0, 
          transition: "all .6s", 
          transform: headerVisible ? "none" : "translateY(-10px)" 
        }}>
          <IntegralHeader data={data} />
        </div>

        {steps.length > 0 && (
          <div style={{ marginTop: 40 }}>
            {steps.map((step, i) => (
              <SolutionStep key={i} step={step} index={i} total={steps.length} isVisible={i < visibleCount} />
            ))}
          </div>
        )}

        {/* Emerald Completion Card */}
        {visibleCount >= steps.length && steps.length > 0 && (
          <div style={{ 
            marginTop: 40, 
            background: C.greenDim, 
            border: `1px solid ${C.greenBorder}`, 
            borderRadius: 20, 
            padding: "24px 32px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            animation: "fadeIn .6s ease-out",
            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.05)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ 
                width: 24, height: 24, borderRadius: "50%", 
                background: C.green, color: "#ffffff", 
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontWeight: "bold", fontSize: 13
              }}>✓</span>
              <div style={{ color: "#065f46", fontWeight: 800, fontSize: 15 }}>
                Đã giải xong bài toán tích phân!
              </div>
            </div>
            <button 
              onClick={onBack} 
              style={{ 
                background: C.green, 
                border: "none", 
                borderRadius: 100, 
                padding: "10px 24px", 
                cursor: "pointer", 
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 14,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
            >
              Giải tiếp →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
