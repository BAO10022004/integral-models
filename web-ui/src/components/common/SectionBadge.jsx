import React from 'react';

const SectionBadge = ({ label }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
    <span style={{ color: "#FFE41F", fontSize: 13 }}>(</span>
    <span style={{ color: "#999", fontSize: 13 }}>{label}</span>
    <span style={{ color: "#FFE41F", fontSize: 13 }}>)</span>
  </div>
);

export default SectionBadge;
