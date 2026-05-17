import React from 'react';

const HistoryItem = ({ item, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: "12px 14px", borderRadius: 12,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      cursor: "pointer", transition: "all 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(0,242,255,0.2)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
  >
    <div style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "#fff", marginBottom: 4 }}>{item.latex}</div>
    <div style={{ fontSize: 11, color: "#888", display: "flex", justifyContent: "space-between" }}>
      <span>{item.name}</span>
      <span>{item.action === "✓" ? "Solve" : "Predict"}</span>
    </div>
  </div>
);

export default HistoryItem;
