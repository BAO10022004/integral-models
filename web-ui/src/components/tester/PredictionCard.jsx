import React from "react";
import ConfidenceBar from "./ConfidenceBar";

const PredictionCard = ({ result }) => {
  // Map action color to dark-theme compatible accent
  const accent = result.color || "#6366f1";

  return (
    <div style={{
      background: "rgba(255,255,255,0.9)",
      border: `1px solid ${accent}40`,
      boxShadow: `0 4px 15px ${accent}15`,
      borderRadius: 20,
      padding: 24,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: -60, right: -60,
        width: 180, height: 180, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: ".12em",
        color: "#64748b", textTransform: "uppercase", marginBottom: 16,
      }}>
        Analysis Method
      </div>

      {/* Method badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, fontSize: 24,
          background: `${accent}15`,
          border: `1.5px solid ${accent}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: `0 0 20px ${accent}20`,
        }}>
          {result.icon}
        </div>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 600, color: "#64748b",
            marginBottom: 3, letterSpacing: ".06em",
          }}>
            Action {result.action}
          </div>
          <div style={{
            fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px",
          }}>
            {result.action_name}
          </div>
        </div>
      </div>

      {/* LaTeX expression */}
      <div style={{
        padding: "10px 14px", borderRadius: 10,
        background: "rgba(241,245,249,0.8)",
        border: "1px solid rgba(0,0,0,0.05)",
        fontFamily: "'Courier New', monospace",
        fontSize: 12, color: "#475569",
        marginBottom: 14, wordBreak: "break-all", lineHeight: 1.5,
      }}>
        {result.latex}
      </div>

      {/* Description */}
      <p style={{
        color: "#334155", fontSize: 13,
        lineHeight: 1.7, marginBottom: 18, fontWeight: 400,
      }}>
        {result.description}
      </p>

      {/* Confidence */}
      <div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 12, marginBottom: 8, fontWeight: 600,
        }}>
          <span style={{ color: "#64748b" }}>Confidence</span>
          <span style={{ color: accent, fontWeight: 700 }}>{result.confidence}%</span>
        </div>
        <ConfidenceBar pct={result.confidence} color={accent} />
      </div>
    </div>
  );
};

export default PredictionCard;
