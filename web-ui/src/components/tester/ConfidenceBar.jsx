import React from 'react';

const ConfidenceBar = ({ pct, color }) => (
  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
    <div style={{
      height: "100%", width: `${pct}%`, background: color,
      borderRadius: 99,
      boxShadow: `0 0 10px ${color}66`,
      transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
    }} />
  </div>
);

export default ConfidenceBar;
