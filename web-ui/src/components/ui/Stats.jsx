import { useEffect, useRef, useCallback, useState } from "react";
function SectionBadge({ label }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:4, marginBottom:16 }}>
      <span style={{ color: C.yellow, fontSize: 13 }}>(</span>
      <span style={{ color: C.muted, fontSize: 13 }}>{label}</span>
      <span style={{ color: C.yellow, fontSize: 13 }}>)</span>
    </div>
  );
}



/* ─── STATS ───────────────────────────────────────── */
function Stats() {
  const items = [
    { num:"50k+", label:"Teams using our AI" },
    { num:"20+",  label:"Languages supported" },
    { num:"140+", label:"Countries served" },
    { num:"80+",  label:"Platform integrations" },
  ];
  return (
    <section style={{ padding:"60px 24px", background: C.bg }}>
      <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center" }}>
        <SectionBadge label="Stats" />
        <h2 style={{ color:"#fff", fontSize:36, fontWeight:800, letterSpacing:"-1px", margin:"0 0 8px" }}>
          Numbers That Matter
        </h2>
        <p style={{ color: C.muted, marginBottom:40 }}>
          See why thousands of teams trust our AI to transform their meeting experience.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16 }}>
          {items.map(({ num, label }) => (
            <div key={label} style={{
              background: C.card, border:`1px solid ${C.border}`,
              borderRadius:18, padding:"28px 20px",
            }}>
              <div style={{ fontSize:40, fontWeight:700, color:"#fff", letterSpacing:"-2px" }}>{num}</div>
              <div style={{ color: C.muted, fontSize:14, marginTop:6 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
