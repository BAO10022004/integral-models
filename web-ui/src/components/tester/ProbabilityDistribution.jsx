import React from 'react';
import ConfidenceBar from './ConfidenceBar';

const ProbabilityDistribution = ({ probabilities }) => (
  <div style={{
    background: "#ffffff", 
    border: "1px solid #e2e8f0",
    borderRadius: 24, padding: 24,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01)",
    fontFamily: "Arial, Helvetica, sans-serif"
  }}>
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: "#64748b", textTransform: "uppercase", marginBottom: 16 }}>
      Phân Phối Xác Suất
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {probabilities.map(p => (
        <div key={p.action}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, fontWeight: 700 }}>
            <span style={{ color: "#334155" }}>Action {p.action} — {p.name}</span>
            <span style={{ color: p.color }}>{p.probability}%</span>
          </div>
          <ConfidenceBar pct={p.probability} color={p.color} />
        </div>
      ))}
    </div>
  </div>
);

export default ProbabilityDistribution;
