import React from "react";
import ConfidenceBar from "./ConfidenceBar";

const ProbabilityDistribution = ({ probabilities }) => (
  <div style={{
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
    borderRadius: 20,
    padding: 24,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
  }}>
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: ".12em",
      color: "#64748b", textTransform: "uppercase", marginBottom: 18,
    }}>
      Probability Distribution
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {probabilities.map(p => (
        <div key={p.action}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 12, marginBottom: 7, alignItems: "baseline",
          }}>
            <span style={{ color: "#334155", fontWeight: 500 }}>
              <span style={{ color: p.color, fontWeight: 700, marginRight: 4 }}>#{p.action}</span>
              {p.name}
            </span>
            <span style={{ color: p.color, fontWeight: 700 }}>{p.probability}%</span>
          </div>
          <ConfidenceBar pct={p.probability} color={p.color} />
        </div>
      ))}
    </div>
  </div>
);

export default ProbabilityDistribution;
