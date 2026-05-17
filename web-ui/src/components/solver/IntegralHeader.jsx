import React, { useState, useEffect } from 'react';

const C = {
  card: "#0f0f0f",
  yellow: "#FFE41F",
  text: "#e6e6e6",
  muted: "#666",
  muted2: "#999",
  green: "#4ade80",
  greenDim: "#052010",
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
      marginBottom: 40,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 6, flexWrap: "wrap", background: C.card, border: `1px solid #2a2500`,
        borderRadius: 20, padding: "28px 36px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexDirection: "column", marginRight: 2 }}>
          {lo || hi ? (
            <>
              <span style={{ fontSize: 11, color: C.text, fontFamily: "monospace", marginBottom: -2 }}>{hi || "?"}</span>
              <span style={{ fontSize: 64, color: C.yellow, fontStyle: "italic", lineHeight: 1, fontFamily: "serif" }}>∫</span>
              <span style={{ fontSize: 11, color: C.text, fontFamily: "monospace", marginTop: -2 }}>{lo || "?"}</span>
            </>
          ) : (
            <span style={{ fontSize: 64, color: C.yellow, fontStyle: "italic", lineHeight: 1, fontFamily: "serif" }}>∫</span>
          )}
        </div>
        <span style={{ fontSize: 28, color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{expr}</span>
        <span style={{ fontSize: 22, color: C.muted2, fontFamily: "monospace" }}> d{dv}</span>
        <span style={{ fontSize: 28, color: C.muted, margin: "0 12px" }}>=</span>
        <span style={{ fontSize: 28, color: C.yellow, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{result}</span>
      </div>

      {definite_value != null && lo && hi && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.greenDim, border: `1px solid #1a4a20`, borderRadius: 100, padding: "8px 20px" }}>
            <span style={{ color: C.muted, fontSize: 13 }}>Giá trị số</span>
            <span style={{ color: C.green, fontSize: 20, fontFamily: "monospace", fontWeight: 700 }}>≈ {definite_value}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegralHeader;
