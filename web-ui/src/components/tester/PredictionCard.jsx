import React from 'react';
import ConfidenceBar from './ConfidenceBar';

const PredictionCard = ({ result }) => (
  <div style={{
    background: "#ffffff", 
    border: `1px solid ${result.color}33`,
    borderRadius: 24, padding: 24, position: "relative", overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01)",
    fontFamily: "Arial, Helvetica, sans-serif"
  }}>
    <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `${result.color}08`, filter: "blur(20px)" }} />
    
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: "#64748b", textTransform: "uppercase", marginBottom: 16 }}>
      Phương Pháp Phân Tích
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
      <div style={{
        width: 54, height: 54, borderRadius: 16, fontSize: 26,
        background: `${result.color}08`, border: `2px solid ${result.color}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{result.icon}</div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
          Action {result.action}
        </div>
        <div style={{ fontSize: 14, color: result.color, fontWeight: 800 }}>
          {result.action_name}
        </div>
      </div>
    </div>

    <div style={{
      padding: "12px 16px", borderRadius: 12,
      background: "#f8fafc", 
      fontSize: 13, color: "#334155", marginBottom: 16,
      border: "1px solid #e2e8f0",
      fontFamily: "monospace",
      fontWeight: 700,
      wordBreak: "break-all"
    }}>{result.latex}</div>

    <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.6, marginBottom: 20, fontWeight: 500 }}>
      {result.description}
    </p>

    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, fontWeight: 700 }}>
        <span style={{ color: "#64748b" }}>Độ tin cậy</span>
        <span style={{ color: result.color }}>{result.confidence}%</span>
      </div>
      <ConfidenceBar pct={result.confidence} color={result.color} />
    </div>
  </div>
);

export default PredictionCard;
