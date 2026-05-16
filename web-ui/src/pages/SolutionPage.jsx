import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#030303",
  card: "#0f0f0f",
  surface: "#141414",
  border: "#191919",
  border2: "#1f1f1f",
  muted: "#666",
  muted2: "#999",
  text: "#e6e6e6",
  yellow: "#FFE41F",
  yellowDim: "#1a1500",
  green: "#4ade80",
  greenDim: "#052010",
};

/* ── Animated Number (counts up) ─────────────── */
function AnimatedNum({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const target = parseFloat(value) || 0;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(+(eased * target).toFixed(4));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <span>{display}</span>;
}

/* ── Step Card ─────────────────────────────────── */
function StepCard({ step, index, total, isVisible }) {
  const isLast = index === total - 1;

  // Parse step string: "Title: formula"
  let title = null, body = step;
  const colonIdx = step.indexOf(":");
  if (colonIdx > 0 && colonIdx < 60) {
    title = step.slice(0, colonIdx).trim();
    body  = step.slice(colonIdx + 1).trim();
  }

  return (
    <div style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity .55s ease ${index * 140}ms, transform .55s cubic-bezier(0.22,1,0.36,1) ${index * 140}ms`,
    }}>
      <div style={{ display: "flex", gap: 20, position: "relative" }}>

        {/* Left timeline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
          {/* Number bubble */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: isLast ? C.yellow : C.card,
            border: `2px solid ${isLast ? C.yellow : "#2a2500"}`,
            color: isLast ? C.bg : C.yellow,
            fontSize: 13, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, zIndex: 1, position: "relative",
            boxShadow: isLast ? `0 0 20px ${C.yellow}55` : `0 0 8px ${C.yellow}22`,
          }}>
            {isLast ? "✓" : index + 1}
          </div>
          {/* Connector line */}
          {!isLast && (
            <div style={{
              width: 1, flex: 1, minHeight: 32,
              background: `linear-gradient(to bottom, ${C.yellow}50, ${C.border} 100%)`,
              marginTop: 4,
            }} />
          )}
        </div>

        {/* Card body */}
        <div style={{ flex: 1, paddingBottom: isLast ? 0 : 28 }}>
          {title && (
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: ".14em",
              color: isLast ? C.green : C.yellow,
              textTransform: "uppercase", marginBottom: 8,
            }}>
              {title}
            </div>
          )}
          <div style={{
            background: isLast ? C.greenDim : "#0a0a00",
            border: `1px solid ${isLast ? "#1a4a20" : "#2a2500"}`,
            borderRadius: 14,
            padding: "16px 20px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Glow accent */}
            <div style={{
              position: "absolute", top: 0, left: 0, width: "60%", height: 1,
              background: `linear-gradient(to right, ${isLast ? C.green : C.yellow}80, transparent)`,
            }} />
            <div style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontSize: 15, lineHeight: 1.85,
              color: isLast ? C.green : C.text,
              letterSpacing: "0.01em",
              whiteSpace: "pre-wrap",
            }}>
              {body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Integral Display Header ───────────────────── */
function IntegralHeader({ data }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 80); }, []);
  const { expr, lo, hi, dv, result, definite_value } = data;

  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(-20px)",
      transition: "opacity .6s ease, transform .6s cubic-bezier(0.22,1,0.36,1)",
      marginBottom: 40,
    }}>
      {/* Big integral notation */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 6, flexWrap: "wrap",
        background: C.card,
        border: `1px solid #2a2500`,
        borderRadius: 20,
        padding: "28px 36px",
        textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* bg glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, #1a140010 0%, transparent 70%)`,
        }} />

        {/* Integral notation */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexDirection: "column", marginRight: 2 }}>
          {lo || hi ? (
            <>
              <span style={{ fontSize: 11, color: C.text, fontFamily: "monospace", marginBottom: -2 }}>{hi || "?"}</span>
              <span style={{ fontSize: 64, color: C.yellow, fontStyle: "italic", lineHeight: 1, fontFamily: "serif" }}>∫</span>
              <span style={{ fontSize: 11, color: C.text, fontFamily: "monospace", marginTop: -2 }}>{lo || "?"}</span>
            </>
          ) : (
            <span style={{ fontSize: 64, color: C.yellow, fontStyle: "italic", lineHeight: 1, fontFamily: "serif" }}>∫</span>
          )}
        </div>

        <span style={{
          fontSize: 28, color: "#fff", fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600, letterSpacing: "0.02em",
        }}>{expr}</span>

        <span style={{ fontSize: 22, color: C.muted2, fontFamily: "monospace" }}> d{dv}</span>

        <span style={{ fontSize: 28, color: C.muted, margin: "0 12px" }}>=</span>

        <span style={{
          fontSize: 28, color: C.yellow, fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
        }}>{result}</span>
      </div>

      {/* Definite value badge */}
      {definite_value != null && lo && hi && (
        <div style={{
          display: "flex", justifyContent: "center", marginTop: 14,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: C.greenDim, border: `1px solid #1a4a20`,
            borderRadius: 100, padding: "8px 20px",
          }}>
            <span style={{ color: C.muted, fontSize: 13 }}>Giá trị số</span>
            <span style={{ color: C.green, fontSize: 20, fontFamily: "monospace", fontWeight: 700 }}>
              ≈ {definite_value}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Progress Bar ──────────────────────────────── */
function ProgressBar({ current, total }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: C.muted, fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
          Tiến trình
        </span>
        <span style={{ color: C.yellow, fontSize: 12, fontWeight: 700 }}>
          {current} / {total} bước
        </span>
      </div>
      <div style={{
        height: 3, background: C.border, borderRadius: 100, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 100,
          width: `${pct}%`,
          background: `linear-gradient(to right, ${C.yellow}, #ff9f00)`,
          transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 300ms",
          boxShadow: `0 0 8px ${C.yellow}80`,
        }} />
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────── */
export default function SolutionPage({ data, onBack }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const intervalRef = useRef(null);

  const steps = data?.steps || [];

  useEffect(() => {
    // Fade in header first
    const t1 = setTimeout(() => setHeaderVisible(true), 200);

    if (autoPlay) {
      // Then reveal steps one-by-one
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

  function skipAll() {
    setAutoPlay(false);
    clearInterval(intervalRef.current);
    setVisibleCount(steps.length);
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'Manrope', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(3,3,3,0.88)", backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        animation: "fadeIn .5s ease",
      }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "transparent", border: `1px solid ${C.border2}`,
          borderRadius: 100, padding: "8px 16px", cursor: "pointer",
          color: C.muted2, fontSize: 13, fontWeight: 700,
          fontFamily: "Manrope,sans-serif", transition: "all .2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.yellow; e.currentTarget.style.color = C.yellow; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.muted2; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: C.yellowDim, border: `1px solid #2a2500`,
          borderRadius: 100, padding: "6px 14px",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", background: C.yellow,
            display: "inline-block", animation: "float 2s ease-in-out infinite",
          }} />
          <span style={{ color: C.yellow, fontSize: 13, fontWeight: 700 }}>Lời giải chi tiết</span>
        </div>

        {visibleCount < steps.length ? (
          <button onClick={skipAll} style={{
            background: "transparent", border: `1px solid ${C.border2}`,
            borderRadius: 100, padding: "8px 16px", cursor: "pointer",
            color: C.muted, fontSize: 12, fontWeight: 700,
            fontFamily: "Manrope,sans-serif",
          }}>
            Xem ngay →
          </button>
        ) : <div style={{ width: 80 }} />}
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 120px" }}>

        {/* Integral header */}
        <div style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "translateY(0)" : "translateY(-20px)",
          transition: "opacity .6s ease, transform .6s cubic-bezier(0.22,1,0.36,1)",
          marginBottom: 40,
        }}>
          {/* Section label */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span style={{ color: C.muted, fontSize: 12, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" }}>
              Đề bài
            </span>
          </div>
          <IntegralHeader data={data} />
        </div>

        {/* Progress bar */}
        {steps.length > 0 && (
          <div style={{
            opacity: headerVisible ? 1 : 0,
            transition: "opacity .6s ease .3s",
          }}>
            <ProgressBar current={visibleCount} total={steps.length} />
          </div>
        )}

        {/* Steps label */}
        {steps.length > 0 && (
          <div style={{
            opacity: headerVisible ? 1 : 0,
            transition: "opacity .6s ease .4s",
            marginBottom: 28,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ color: C.muted, fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                Các bước giải
              </span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
          </div>
        )}

        {/* Step cards */}
        <div>
          {steps.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              index={i}
              total={steps.length}
              isVisible={i < visibleCount}
            />
          ))}
        </div>

        {/* Done banner */}
        {visibleCount >= steps.length && steps.length > 0 && (
          <div style={{
            animation: "fadeIn .6s ease",
            marginTop: 32,
            background: C.greenDim,
            border: `1px solid #1a4a20`,
            borderRadius: 18, padding: "24px 28px",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "#0a2a10", border: `2px solid ${C.green}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}>✓</div>
            <div>
              <div style={{ color: C.green, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                Hoàn thành {steps.length} bước giải!
              </div>
              <div style={{ color: C.muted2, fontSize: 13 }}>
                Kết quả: <span style={{ color: C.yellow, fontFamily: "monospace", fontWeight: 700 }}>{data?.result}</span>
              </div>
            </div>
            <button onClick={onBack} style={{
              marginLeft: "auto", background: C.green, border: "none",
              borderRadius: 100, padding: "10px 22px", cursor: "pointer",
              color: "#000", fontWeight: 800, fontSize: 13,
              fontFamily: "Manrope,sans-serif",
            }}>
              Giải tiếp →
            </button>
          </div>
        )}

        {/* Empty state */}
        {steps.length === 0 && (
          <div style={{
            textAlign: "center", padding: "80px 0",
            color: C.muted, animation: "fadeIn .6s ease",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>∅</div>
            <div style={{ fontSize: 15 }}>Không có bước giải nào được trả về.</div>
          </div>
        )}
      </div>
    </div>
  );
}
