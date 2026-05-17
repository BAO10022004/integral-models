import React from 'react';

const MathInput = ({ latex, setLatex, inputRef, onPredict, onInsert, loading, snippets }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24, padding: 24, backdropFilter: "blur(20px)",
  }}>
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: "#888", textTransform: "uppercase", marginBottom: 12 }}>
      Biểu thức LaTeX
    </div>

    <textarea
      ref={inputRef}
      value={latex}
      onChange={e => setLatex(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onPredict(); }}
      rows={3}
      placeholder={String.raw`\int_{0}^{1}{x}^{2}dx`}
      style={{
        width: "100%", background: "rgba(0,0,0,0.3)",
        border: `1px solid ${latex ? "rgba(0,242,255,0.35)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 14, padding: "16px 18px", color: "#fff",
        fontSize: 20, fontFamily: "'JetBrains Mono', monospace",
        transition: "border-color .3s, box-shadow .3s",
        boxShadow: latex ? "0 0 20px rgba(0,242,255,0.1)" : "none",
      }}
    />

    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
      {snippets.map(s => (
        <button key={s.label} onClick={() => onInsert(s.insert)} style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, color: "#ccc", fontSize: 12, padding: "5px 10px",
          cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
          transition: "all .15s",
        }}>{s.label}</button>
      ))}
      {latex && (
        <button onClick={() => setLatex("")} style={{
          background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.2)",
          borderRadius: 8, color: "#ff6b6b", fontSize: 12, padding: "5px 10px", cursor: "pointer",
        }}>✕ Xoá</button>
      )}
    </div>
  </div>
);

export default MathInput;
