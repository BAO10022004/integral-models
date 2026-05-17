import React from 'react';

const STEP_COLORS = { 
  predict: "#00f2ff", 
  antiderivative: "#00ff88", 
  transform: "#ffd700", 
  result: "#ff00c8", 
  info: "#7000ff", 
  error: "#ff4d4d", 
  fallback: "#888" 
};

const ICONS = { 
  predict: "🤖", 
  antiderivative: "∫", 
  transform: "🔄", 
  result: "✅", 
  info: "ℹ️", 
  error: "❌", 
  fallback: "⚙️" 
};

const SolveStepCard = ({ step, index }) => {
  const col = STEP_COLORS[step.kind] || "#888";
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: "12px 16px", borderRadius: 12,
      background: `rgba(${col === "#00f2ff" ? "0,242,255" : col === "#00ff88" ? "0,255,136" : col === "#ffd700" ? "255,215,0" : col === "#ff00c8" ? "255,0,200" : "112,0,255"},0.06)`,
      border: `1px solid ${col}33`,
      marginLeft: step.depth * 16,
      animation: `fadeSlide 0.3s ${index * 0.05}s both ease-out`,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{ICONS[step.kind] || "•"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "#ddd", lineHeight: 1.6 }}>{step.description}</div>
        {step.formula && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: col, marginTop: 4, opacity: .9 }}>{step.formula}</div>}
        {step.integral && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#666", marginTop: 2 }}>{step.integral}</div>}
        {typeof step.value === "number" && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, color: "#ff00c8", marginTop: 4 }}>= {step.value}</div>}
      </div>
    </div>
  );
};

export default SolveStepCard;
