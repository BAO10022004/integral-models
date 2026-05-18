import React, { useState, useEffect } from 'react';

const C = {
  card: "#ffffff",
  blue: "#2563eb",
  text: "#0f172a",
  muted: "#64748b",
  muted2: "#475569",
  green: "#10b981",
  greenDim: "#ecfdf5",
  border: "#e2e8f0",
};

const IntegralHeader = ({ data }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 80); }, []);
  const { expr, lo, hi, dv, result, definite_value } = data;

  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(-20px)",
      transition: "opacity .6s ease, transform .6s cubic-bezier(0.22,1,0.36,1)",
      marginBottom: 36,
      fontFamily: "Arial, Helvetica, sans-serif"
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 8, flexWrap: "wrap", background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 24, padding: "32px 40px", textAlign: "center", position: "relative",
        boxShadow: "0 10px 30px rgba(37, 99, 235, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexDirection: "column", marginRight: 6 }}>
          {lo || hi ? (
            <>
              <span style={{ fontSize: 13, color: C.muted2, fontWeight: "bold", marginBottom: -4 }}>{hi || "?"}</span>
              <span style={{ 
                fontSize: 72, 
                fontWeight: 300,
                lineHeight: 1, 
                background: "linear-gradient(135deg, #2563eb 20%, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "serif",
                fontStyle: "italic"
              }}>∫</span>
              <span style={{ fontSize: 13, color: C.muted2, fontWeight: "bold", marginTop: -4 }}>{lo || "?"}</span>
            </>
          ) : (
            <span style={{ 
              fontSize: 72, 
              fontWeight: 300,
              lineHeight: 1, 
              background: "linear-gradient(135deg, #2563eb 20%, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "serif",
              fontStyle: "italic"
            }}>∫</span>
          )}
        </div>
        
        {/* Math expression wrapper */}
        <span style={{ fontSize: 32, color: C.text, fontWeight: 800, letterSpacing: "-0.5px" }}>{expr}</span>
        <span style={{ fontSize: 24, color: C.blue, fontWeight: 800, fontStyle: "italic" }}> d{dv}</span>
        <span style={{ fontSize: 28, color: C.muted, margin: "0 12px", fontWeight: 300 }}>=</span>
        <span style={{ 
          fontSize: 32, 
          color: C.blue, 
          fontWeight: 900,
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>{result}</span>
      </div>

      {definite_value != null && lo && hi && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 12, 
            background: C.greenDim, 
            border: `1px solid #a7f3d0`, 
            borderRadius: 100, 
            padding: "8px 24px",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.08)"
          }}>
            <span style={{ color: C.muted2, fontSize: 13, fontWeight: 700 }}>Giá trị xấp xỉ số:</span>
            <span style={{ color: C.green, fontSize: 20, fontWeight: 800 }}>≈ {definite_value}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegralHeader;
