import React from "react";

const SolutionStep = ({ step, index, total, isVisible }) => {
  const isLast = index === total - 1;
  const data = typeof step === "string" ? { description: step } : step;
  
  const kind = data.kind || data.explanation || "step";
  const desc = data.description || data.action || "";
  const formula = data.formula || data.expression;
  const integral = data.integral || (data.formula ? undefined : data.expression); // If formula is missing, expression was the integral
  const value = data.value;
  const depth = data.depth || 0;

  const accent = isLast ? "#059669" : (kind === "error" ? "#dc2626" : "#4f46e5");
  const accentDim = isLast ? "rgba(16,185,129,0.15)" : (kind === "error" ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.12)");
  const accentBorder = isLast ? "rgba(16,185,129,0.3)" : (kind === "error" ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.25)");
  const trackColor = isLast ? "rgba(16,185,129,0.4)" : (kind === "error" ? "rgba(239,68,68,0.4)" : "rgba(99,102,241,0.3)");

  return (
    <div style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity .45s ease ${index * 120}ms, transform .45s cubic-bezier(0.22,1,0.36,1) ${index * 120}ms`,
      fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
    }}>
      <div style={{ display: "flex", gap: 16, position: "relative" }}>
        {/* Timeline column */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
          {/* Step circle */}
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: accentDim,
            border: `1.5px solid ${accentBorder}`,
            color: accent,
            fontSize: 13, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, zIndex: 1, position: "relative",
            boxShadow: `0 0 16px ${accent}20`,
          }}>
            {kind === "error" ? "!" : (isLast ? "✓" : index + 1)}
          </div>
          {/* Connector */}
          {!isLast && (
            <div style={{
              width: 2, flex: 1, minHeight: 32,
              background: `linear-gradient(to bottom, ${trackColor}, rgba(0,0,0,0.04))`,
              marginTop: 4, borderRadius: 99,
            }} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, paddingBottom: isLast ? 0 : 32 }}>
          


          {/* Đề (Sub-problem) if depth > 0 */}
          {integral && depth > 0 && (
            <div style={{
              fontSize: 15, color: "#475569", fontWeight: 600,
              fontFamily: "'Cambria Math', 'Times New Roman', serif",
              marginBottom: 12, marginTop: 4,
              padding: "6px 12px", background: "rgba(0,0,0,0.03)",
              borderRadius: 8, display: "inline-block",
              border: "1px solid rgba(0,0,0,0.05)"
            }}>
              Sub-problem: {integral}
            </div>
          )}

          {/* Thông báo (Message/Description) */}
          {desc && (
            <div style={{
              fontSize: 14, color: kind === "error" ? "#ef4444" : "#475569", 
              fontWeight: 500, lineHeight: 1.6,
              marginBottom: (formula || (value !== undefined && value !== null)) ? 12 : 0,
              marginTop: (integral && depth > 0) ? 0 : 6,
            }}>
              <span style={{ 
                color: accent, fontWeight: 700, marginRight: 8,
                textTransform: "uppercase", fontSize: 11, letterSpacing: "1px",
                background: accentDim, padding: "3px 8px", borderRadius: 6,
                border: `1px solid ${accentBorder}`
              }}>
                {kind}
              </span>
              <span dangerouslySetInnerHTML={{ __html: desc.replace(/\n/g, "<br/>") }} />
            </div>
          )}

          {/* Kết quả (Result/Formula) */}
          {(formula || (value !== undefined && value !== null)) && (
            <div style={{
              background: accentDim,
              border: `1px solid ${accentBorder}`,
              borderLeft: `3px solid ${accent}`,
              borderRadius: 12, padding: "16px 20px",
              boxShadow: `0 0 24px ${accent}08`,
              backdropFilter: "blur(8px)",
              fontSize: 17, lineHeight: 1.6,
              color: isLast ? "#059669" : "#0f172a",
              fontWeight: 600,
              fontFamily: "'Cambria Math', 'Times New Roman', serif",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
            }}>
              = {(value !== undefined && value !== null) ? value : formula}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionStep;
