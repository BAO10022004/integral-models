import React from 'react';
import ConfidenceBar from './ConfidenceBar';

const PredictionCard = ({ result }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)", border: `1px solid ${result.color}44`,
    borderRadius: 24, padding: 24, position: "relative", overflow: "hidden",
    boxShadow: `0 0 40px ${result.color}18`,
  }}>
    <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `${result.color}15`, filter: "blur(20px)" }} />
    
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: "#888", textTransform: "uppercase", marginBottom: 16 }}>
      Phương Pháp Phân Tích
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
      <div style={{
        width: 54, height: 54, borderRadius: 16, fontSize: 26,
        background: `${result.color}18`, border: `2px solid ${result.color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{result.icon}</div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>
          Action {result.action}
        </div>
        <div style={{ fontSize: 14, color: result.color, fontWeight: 700 }}>
          {result.action_name}
        </div>
      </div>
    </div>

    <div style={{
      padding: "12px 16px", borderRadius: 12,
      background: "rgba(0,0,0,0.3)", fontFamily: "'JetBrains Mono',monospace",
      fontSize: 13, color: "#ccc", marginBottom: 16,
      border: "1px solid rgba(255,255,255,0.06)",
    }}>{result.latex}</div>

    <p style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
      {result.description}
    </p>

    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: "#888" }}>Độ tin cậy</span>
        <span style={{ color: result.color, fontWeight: 700 }}>{result.confidence}%</span>
      </div>
      <ConfidenceBar pct={result.confidence} color={result.color} />
    </div>
  </div>
);

export default PredictionCard;
