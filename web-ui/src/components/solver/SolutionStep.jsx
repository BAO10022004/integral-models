import React, { useState, useEffect } from 'react';

const C = {
  bg: "#030303",
  card: "#0f0f0f",
  border: "#191919",
  text: "#e6e6e6",
  yellow: "#FFE41F",
  green: "#4ade80",
  greenDim: "#052010",
};

const SolutionStep = ({ step, index, total, isVisible }) => {
  const isLast = index === total - 1;
  let title = null, body = step;
  const colonIdx = step.indexOf(":");
  if (colonIdx > 0 && colonIdx < 60) {
    title = step.slice(0, colonIdx).trim();
    body = step.slice(colonIdx + 1).trim();
  }

  return (
    <div style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity .55s ease ${index * 140}ms, transform .55s cubic-bezier(0.22,1,0.36,1) ${index * 140}ms`,
    }}>
      <div style={{ display: "flex", gap: 20, position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: isLast ? C.yellow : C.card,
            border: `2px solid ${isLast ? C.yellow : "#2a2500"}`,
            color: isLast ? C.bg : C.yellow,
            fontSize: 13, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, zIndex: 1, position: "relative",
            boxShadow: isLast ? `0 0 20px ${C.yellow}55` : `0 0 8px ${C.yellow}22`,
          }}>
            {isLast ? "✓" : index + 1}
          </div>
          {!isLast && (
            <div style={{
              width: 1, flex: 1, minHeight: 32,
              background: `linear-gradient(to bottom, ${C.yellow}50, ${C.border} 100%)`,
              marginTop: 4,
            }} />
          )}
        </div>

        <div style={{ flex: 1, paddingBottom: isLast ? 0 : 28 }}>
          {title && (
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: ".14em",
              color: isLast ? C.green : C.yellow,
              textTransform: "uppercase", marginBottom: 8,
            }}>{title}</div>
          )}
          <div style={{
            background: isLast ? C.greenDim : "#0a0a00",
            border: `1px solid ${isLast ? "#1a4a20" : "#2a2500"}`,
            borderRadius: 14, padding: "16px 20px", position: "relative", overflow: "hidden",
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, lineHeight: 1.85, color: isLast ? C.green : C.text }}>
              {body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionStep;
