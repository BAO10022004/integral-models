import React from 'react';

const HistoryItem = ({ item, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: "12px 16px", borderRadius: 12,
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      cursor: "pointer", transition: "all 0.2s ease-in-out",
      fontFamily: "Arial, Helvetica, sans-serif"
    }}
    onMouseEnter={e => { 
      e.currentTarget.style.background = "#eff6ff"; 
      e.currentTarget.style.borderColor = "#bfdbfe"; 
      e.currentTarget.style.transform = "translateY(-1px)";
    }}
    onMouseLeave={e => { 
      e.currentTarget.style.background = "#f8fafc"; 
      e.currentTarget.style.borderColor = "#e2e8f0"; 
      e.currentTarget.style.transform = "none";
    }}
  >
    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6, wordBreak: "break-all" }}>
      {item.latex}
    </div>
    <div style={{ fontSize: 11, color: "#64748b", display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
      <span style={{ color: "#2563eb" }}>{item.name}</span>
      <span style={{ 
        background: item.action === "✓" ? "#ecfdf5" : "#eff6ff", 
        color: item.action === "✓" ? "#10b981" : "#2563eb",
        padding: "2px 6px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 800
      }}>{item.action === "✓" ? "SOLVE" : "PREDICT"}</span>
    </div>
  </div>
);

export default HistoryItem;
