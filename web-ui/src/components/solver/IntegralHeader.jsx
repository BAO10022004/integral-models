import React, { useState, useEffect } from "react";

const IntegralHeader = ({ data }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 80); }, []);
  const { expr, lo, hi, dv, result, definite_value } = data;

  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(-16px)",
      transition: "opacity .5s ease, transform .5s cubic-bezier(0.22,1,0.36,1)",
      fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
    }}>
      {/* Main equation display */}
      <div style={{
        background: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: 20, padding: "32px 36px",
        textAlign: "center",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 0 60px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 6, flexWrap: "wrap",
        position: "relative", overflow: "hidden",
      }}>
        {/* Subtle gradient corner */}
        <div style={{
          position: "absolute", top: -40, left: -40, width: 200, height: 200,
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Integral sign + limits */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 2 }}>
          {(lo || hi) && (
            <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: -6 }}>
              {hi || "?"}
            </span>
          )}
          <span style={{
            fontSize: 76, fontWeight: 200, lineHeight: 0.9,
            background: "linear-gradient(160deg, #6366f1, #06b6d4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 16px rgba(99,102,241,0.4))",
            fontFamily: "serif", fontStyle: "italic",
          }}>∫</span>
          {(lo || hi) && (
            <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, marginTop: -6 }}>
              {lo || "?"}
            </span>
          )}
        </div>

        <span style={{
          fontSize: 28, fontWeight: 700, color: "#e2e8f0",
          letterSpacing: "-0.5px", padding: "0 4px",
        }}>
          {expr}
        </span>

        <span style={{
          fontSize: 22, fontWeight: 700, color: "#818cf8",
          fontStyle: "italic",
        }}>
          {" "}d{dv}
        </span>

        <span style={{ fontSize: 26, color: "rgba(148,163,184,0.4)", margin: "0 12px", fontWeight: 300 }}>
          =
        </span>

        <span style={{
          fontSize: 30, fontWeight: 900,
          background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 12px rgba(99,102,241,0.3))",
          letterSpacing: "-0.5px",
        }}>
          {result}
        </span>
      </div>

      {/* Numeric value badge */}
      {definite_value != null && lo && hi && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(5,150,105,0.1)",
            border: "1px solid rgba(52,211,153,0.25)",
            borderRadius: 99, padding: "8px 22px",
            backdropFilter: "blur(12px)",
          }}>
            <span style={{ color: "rgba(148,163,184,0.6)", fontSize: 12, fontWeight: 600 }}>
              Giá trị xấp xỉ:
            </span>
            <span style={{
              fontSize: 20, fontWeight: 800,
              background: "linear-gradient(135deg, #34d399, #6ee7b7)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              ≈ {definite_value}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegralHeader;
