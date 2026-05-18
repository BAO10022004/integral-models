import React from 'react';

const C = {
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#1e293b",
  blue: "#2563eb",
  blueDim: "#eff6ff",
  blueBorder: "#bfdbfe",
  green: "#10b981",
  greenDim: "#ecfdf5",
  greenBorder: "#a7f3d0",
};

const SolutionStep = ({ step, index, total, isVisible }) => {
  const isLast = index === total - 1;
  let title = null, body = step;
  const colonIdx = step.indexOf(":");
  if (colonIdx > 0 && colonIdx < 60) {
    title = step.slice(0, colonIdx).trim();
    body = step.slice(colonIdx + 1).trim();
  }

  return (
    <div style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity .55s ease ${index * 140}ms, transform .55s cubic-bezier(0.22,1,0.36,1) ${index * 140}ms`,
      fontFamily: "Arial, Helvetica, sans-serif"
    }}>
      <div style={{ display: "flex", gap: 20, position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
          {/* Step Number Circle */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: isLast ? C.green : C.blue,
            border: `2px solid ${isLast ? C.greenBorder : C.blueBorder}`,
            color: "#ffffff",
            fontSize: 14, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, zIndex: 1, position: "relative",
            boxShadow: isLast ? `0 4px 12px rgba(16, 185, 129, 0.2)` : `0 4px 12px rgba(37, 99, 235, 0.15)`,
          }}>
            {isLast ? "✓" : index + 1}
          </div>
          {/* Symmetrical Timeline Connector Track */}
          {!isLast && (
            <div style={{
              width: 3, flex: 1, minHeight: 36,
              background: `linear-gradient(to bottom, ${C.blue}50, ${C.border} 100%)`,
              marginTop: 4,
              borderRadius: 99
            }} />
          )}
        </div>

        <div style={{ flex: 1, paddingBottom: isLast ? 0 : 28 }}>
          {title && (
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: ".1em",
              color: isLast ? C.green : C.blue,
              textTransform: "uppercase", marginBottom: 8,
            }}>{title}</div>
          )}

          {/* Beautiful visual card with left border highlight */}
          <div style={{
            background: isLast ? C.greenDim : C.card,
            border: `1px solid ${isLast ? C.greenBorder : C.border}`,
            borderLeft: `4px solid ${isLast ? C.green : C.blue}`,
            borderRadius: 14, padding: "18px 24px", position: "relative", overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)"
          }}>
            <div style={{ fontSize: 16, lineHeight: 1.8, color: C.text, fontWeight: 500 }}>
              {body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionStep;
