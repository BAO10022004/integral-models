import React, { useState, useRef } from 'react';

const C = {
  bg: "#030303",
  card: "#0f0f0f",
  surface: "#141414",
  border: "#191919",
  muted: "#999",
  text: "#e6e6e6",
  yellow: "#FFE41F",
};

const SectionBadge = ({ label }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
    <span style={{ color: C.yellow, fontSize: 13 }}>(</span>
    <span style={{ color: C.muted, fontSize: 13 }}>{label}</span>
    <span style={{ color: C.yellow, fontSize: 13 }}>)</span>
  </div>
);

const SpinIcon = () => (
  <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 14 }}>✦</span>
);

const KB_KEYS = [
  { l: "x", v: "x" }, { l: "y", v: "y" }, { l: "n", v: "n" }, { l: "π", v: "pi" }, { l: "e", v: "e" }, { l: "(", v: "(" }, { l: ")", v: ")" },
  { l: "x²", v: "x^2" }, { l: "xⁿ", v: "x^" }, { l: "√", v: "sqrt(" }, { l: "ln", v: "ln(" }, { l: "log", v: "log(" }, { l: "sin", v: "sin(" }, { l: "cos", v: "cos(" },
  { l: "tan", v: "tan(" }, { l: "abs", v: "abs(" }, { l: "1/x", v: "1/" }, { l: "sinh", v: "sinh(" }, { l: "cosh", v: "cosh(" }, { l: "asin", v: "asin(" }, { l: "⌫", v: "DEL" },
];

const QUICK = [
  { e: "x", lo: "", hi: "" }, { e: "x^2", lo: "", hi: "" }, { e: "x^3", lo: "", hi: "" },
  { e: "sin(x)", lo: "", hi: "" }, { e: "cos(x)", lo: "", hi: "" }, { e: "e^x", lo: "", hi: "" },
  { e: "ln(x)", lo: "", hi: "" }, { e: "1/(1+x^2)", lo: "", hi: "" },
];

const QUICK_DEF = [
  { e: "x^2", lo: "0", hi: "1" }, { e: "sin(x)", lo: "0", hi: "pi" },
  { e: "x^2+1", lo: "-1", hi: "1" }, { e: "e^x", lo: "0", hi: "1" },
];

const IntegralSolverSection = ({ onViewSolution }) => {
  const [expr, setExpr] = useState("");
  const [lo, setLo] = useState("");
  const [hi, setHi] = useState("");
  const [dv, setDv] = useState("x");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  function insert(v) {
    const el = inputRef.current;
    if (!el) { setExpr(p => p + v); return; }
    const s = el.selectionStart, e2 = el.selectionEnd;
    const nv = expr.slice(0, s) + v + expr.slice(e2);
    setExpr(nv);
    setTimeout(() => { el.focus(); el.setSelectionRange(s + v.length, s + v.length); }, 0);
  }

  function delChar() {
    const el = inputRef.current;
    if (!el) return;
    const s = el.selectionStart;
    if (s > 0) {
      const nv = expr.slice(0, s - 1) + expr.slice(s);
      setExpr(nv);
      setTimeout(() => { el.focus(); el.setSelectionRange(s - 1, s - 1); }, 0);
    }
  }

  async function solve() {
    if (!expr.trim()) return;
    if ((lo && !hi) || (!lo && hi)) { setError("Tích phân xác định cần đủ cận trên và cận dưới."); return; }
    setError(""); setResult(null); setLoading(true);
    const isDef = lo && hi;
    const intStr = isDef ? `∫[${lo} → ${hi}] (${expr}) d${dv}` : `∫ (${expr}) d${dv}`;
    const prompt = `Giải tích phân sau, trả lời CHỈ bằng JSON thuần (không markdown, không text ngoài):

{"integral":"${intStr}","result":"kết quả toán học rõ ràng","steps":["Bước 1: ...","Bước 2: ...","Bước 3: ..."],"definite_value":null}

Nếu tích phân xác định điền giá trị số vào definite_value. Bước viết tiếng Việt, chi tiết. Biểu thức: ${intStr}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const raw = data.content?.find(c => c.type === "text")?.text || "";
      const m = raw.replace(/```json|```/g, "").trim().match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Không parse được phản hồi");
      const parsed = JSON.parse(m[0]);
      setResult(parsed);
      setHistory(h => [{ expr, lo, hi, dv, result: parsed.result, id: Date.now() }, ...h].slice(0, 5));
    } catch (e) {
      setError("Lỗi: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const isDef = lo || hi;

  return (
    <section id="integral-solver" style={{ padding: "60px 24px", background: C.bg }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <SectionBadge label="Integral Solver" />
          <h2 style={{ color: "#fff", fontSize: 36, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>
            Giải Tích Phân với AI
          </h2>
          <p style={{ color: C.muted, fontSize: 15 }}>
            Nhập biểu thức — Claude AI phân tích và trình bày từng bước chi tiết.
          </p>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24, marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", color: C.muted, textTransform: "uppercase", marginBottom: 12 }}>
            Nhập tích phân cần giải
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface, border: `1px solid #252525`, borderRadius: 12, padding: "10px 14px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <input value={hi} onChange={e => setHi(e.target.value)} placeholder="b" style={{ background: "transparent", border: "none", borderBottom: `1px solid #444`, color: C.text, fontSize: 11, width: 34, textAlign: "center", outline: "none", padding: "2px" }} />
              <span style={{ fontSize: 44, color: C.yellow, fontStyle: "italic", lineHeight: 1 }}>∫</span>
              <input value={lo} onChange={e => setLo(e.target.value)} placeholder="a" style={{ background: "transparent", border: "none", borderBottom: `1px solid #444`, color: C.text, fontSize: 11, width: 34, textAlign: "center", outline: "none", padding: "2px" }} />
            </div>

            <input ref={inputRef} value={expr} onChange={e => setExpr(e.target.value)} onKeyDown={e => e.key === "Enter" && solve()} placeholder="Nhập biểu thức..." style={{ flex: 1, background: "transparent", border: "none", color: C.text, fontSize: 22, outline: "none", caretColor: C.yellow, fontFamily: "'Manrope',monospace", minWidth: 0 }} />

            <div style={{ color: C.muted, fontSize: 18, display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>
              d<input value={dv} onChange={e => setDv(e.target.value.slice(-1) || "x")} maxLength={1} style={{ background: "transparent", border: "none", borderBottom: `1px solid #444`, color: C.yellow, fontSize: 18, width: 22, textAlign: "center", outline: "none", fontWeight: 800 }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginTop: 12 }}>
            {KB_KEYS.map(k => (
              <button key={k.l} onClick={() => k.v === "DEL" ? delChar() : insert(k.v)} style={{ background: k.v === "DEL" ? "#1a0505" : C.surface, border: `1px solid ${k.v === "DEL" ? "#3a1515" : C.border}`, borderRadius: 7, color: k.v === "DEL" ? "#f09595" : C.text, fontSize: 12, padding: "7px 3px", cursor: "pointer", fontFamily: "'Manrope',monospace" }}>{k.l}</button>
            ))}
          </div>

          <button onClick={solve} disabled={loading || !expr.trim()} style={{ width: "100%", background: C.yellow, border: "none", borderRadius: 100, color: C.bg, fontSize: 14, fontWeight: 800, padding: "13px 0", cursor: loading || !expr.trim() ? "not-allowed" : "pointer", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading || !expr.trim() ? .5 : 1 }}>
            {loading ? <><SpinIcon /><span>Đang giải...</span></> : <><span style={{ fontSize: 16 }}>✦</span><span>Giải với AI</span></>}
          </button>
        </div>

        {result && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24, marginTop: 14 }}>
             <h3 style={{ color: C.yellow, marginBottom: 12 }}>Kết quả: {result.result}</h3>
             {result.steps?.map((s, i) => <div key={i} style={{ color: C.muted, fontSize: 14, marginBottom: 6 }}>{i+1}. {s}</div>)}
          </div>
        )}
      </div>
    </section>
  );
};

export default IntegralSolverSection;
