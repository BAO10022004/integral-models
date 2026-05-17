import React from 'react';
import ConfidenceBar from './ConfidenceBar';

const ProbabilityDistribution = ({ probabilities }) => (
  <div style={{
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20, padding: 20,
  }}>
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: "#888", textTransform: "uppercase", marginBottom: 14 }}>
      Phân Phối Xác Suất
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {probabilities.map(p => (
        <div key={p.action}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
            <span style={{ color: "#ccc" }}>Action {p.action} — {p.name}</span>
            <span style={{ color: p.color, fontWeight: 700 }}>{p.probability}%</span>
          </div>
          <ConfidenceBar pct={p.probability} color={p.color} />
        </div>
      ))}
    </div>
  </div>
);

export default ProbabilityDistribution;
