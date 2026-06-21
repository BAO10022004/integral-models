import { useState, useEffect } from "react";
import SolutionStep from "../components/solver/SolutionStep";
import IntegralHeader from "../components/solver/IntegralHeader";

export default function SolutionPage({ data, onBack }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const steps = data?.steps || [];

  useEffect(() => {
    const t1 = setTimeout(() => setHeaderVisible(true), 200);
    if (autoPlay) {
      const t2 = setTimeout(() => {
        const iv = setInterval(() => {
          setVisibleCount(v => {
            if (v >= steps.length) { clearInterval(iv); return v; }
            return v + 1;
          });
        }, 550);
        return () => clearInterval(iv);
      }, 800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setVisibleCount(steps.length);
    }
    return () => clearTimeout(t1);
  }, [autoPlay, steps.length]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
      color: "#0f172a",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-24px) scale(1.04); }
        }
        .sol-orb {
          position: fixed; border-radius: 50%; filter: blur(80px);
          pointer-events: none; z-index: 0;
        }
        .sol-step-appear { animation: fadeInUp 0.5s ease-out both; }
      `}</style>

      {/* Background orbs */}
      <div className="sol-orb" style={{
        width: 500, height: 500, top: -150, left: -150,
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        animation: "orbFloat 9s ease-in-out infinite"
      }} />
      <div className="sol-orb" style={{
        width: 400, height: 400, bottom: -100, right: -100,
        background: "radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)",
        animation: "orbFloat 11s ease-in-out infinite reverse"
      }} />

      {/* Sticky nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={onBack} style={{
          background: "rgba(241,245,249,0.8)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 99, padding: "8px 18px",
          cursor: "pointer", color: "#64748b",
          fontSize: 13, fontWeight: 600,
          transition: "all 0.2s", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 6,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.12)"; e.currentTarget.style.color = "#4f46e5"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(241,245,249,0.8)"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; }}
        >
          ← Quay lại
        </button>




      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "48px 24px 120px" }}>
        {/* Integral header */}
        <div style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "none" : "translateY(-16px)",
          transition: "opacity .5s ease, transform .5s cubic-bezier(0.22,1,0.36,1)",
          marginBottom: 40,
        }}>
          <IntegralHeader data={data} />
        </div>

        {/* Steps */}
        {steps.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {steps.map((step, i) => (
              <SolutionStep
                key={i} step={step} index={i}
                total={steps.length} isVisible={i < visibleCount}
              />
            ))}
          </div>
        )}

        {/* Done card */}
        {visibleCount >= steps.length && steps.length > 0 && (
          <div style={{
            marginTop: 40,
            background: "rgba(5,150,105,0.08)",
            border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: 20, padding: "22px 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            animation: "fadeInUp .5s ease-out",
            backdropFilter: "blur(12px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "rgba(16,185,129,0.15)",
                border: "1.5px solid rgba(16,185,129,0.4)",
                color: "#059669",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 13,
              }}>✓</span>
              <div style={{ color: "#059669", fontWeight: 700, fontSize: 15 }}>
                Đã giải xong bài toán tích phân!
              </div>
            </div>
            <button onClick={onBack} style={{
              background: "linear-gradient(135deg, #059669, #047857)",
              border: "none", borderRadius: 99, padding: "10px 22px",
              cursor: "pointer", color: "#ffffff",
              fontWeight: 700, fontSize: 13,
              boxShadow: "0 4px 16px rgba(5,150,105,0.3)",
              transition: "all 0.2s", fontFamily: "inherit",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(5,150,105,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(5,150,105,0.3)"; }}
            >
              Giải tiếp →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
