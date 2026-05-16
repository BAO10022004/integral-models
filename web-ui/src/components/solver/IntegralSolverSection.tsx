import React, { useState, useRef } from 'react';
import { COLORS } from '../../constants/theme';
import { SectionBadge, SpinIcon } from '../common/UIComponents';

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

interface SolverResult {
  integral: string;
  result: string;
  steps: string[];
  definite_value: number | null;
}

interface HistoryItem {
  expr: string;
  lo: string;
  hi: string;
  dv: string;
  result: string;
  id: number;
}

const IntegralSolverSection: React.FC<{ onViewSolution?: (data: any) => void }> = ({ onViewSolution }) => {
  const [expr, setExpr] = useState("");
  const [lo, setLo] = useState("");
  const [hi, setHi] = useState("");
  const [dv, setDv] = useState("x");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function insert(v: string) {
    const el = inputRef.current;
    if (!el) { setExpr(p => p + v); return; }
    const s = el.selectionStart || 0, e2 = el.selectionEnd || 0;
    const nv = expr.slice(0, s) + v + expr.slice(e2);
    setExpr(nv);
    setTimeout(() => { el.focus(); el.setSelectionRange(s + v.length, s + v.length); }, 0);
  }

  function delChar() {
    const el = inputRef.current;
    if (!el) return;
    const s = el.selectionStart || 0;
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
    
    // Lưu ý: Key API nên để ở Backend, đây là logic demo từ code cũ của bạn
    const prompt = `Giải tích phân sau, trả lời CHỈ bằng JSON thuần (không markdown, không text ngoài):

{"integral":"${intStr}","result":"kết quả toán học rõ ràng","steps":["Bước 1: ...","Bước 2: ...","Bước 3: ..."],"definite_value":null}

Nếu tích phân xác định điền giá trị số vào definite_value. Bước viết tiếng Việt, chi tiết. Biểu thức: ${intStr}`;
    
    try {
      // Giả sử API endpoint hoặc logic xử lý của bạn
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-3-sonnet-20240229", max_tokens: 1200, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const raw = data.content?.find((c: any) => c.type === "text")?.text || "";
      const m = raw.replace(/```json|```/g, "").trim().match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Không parse được phản hồi");
      const parsed = JSON.parse(m[0]);
      setResult(parsed);
      setHistory(h => [{ expr, lo, hi, dv, result: parsed.result, id: Date.now() }, ...h].slice(0, 5));
    } catch (e: any) {
      setError("Lỗi: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const isDef = lo || hi;

  return (
    <section id="integral-solver" style={{ padding: "60px 24px", background: COLORS.bg }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <SectionBadge label="Integral Solver" />
          <h2 style={{ color: "#fff", fontSize: 36, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>
            Giải Tích Phân với AI
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 15 }}>
            Nhập biểu thức — Claude AI phân tích và trình bày từng bước chi tiết.
          </p>
        </div>

        {/* Input Card */}
        <div style={{
          background: COLORS.card, border: `1px solid ${COLORS.border}`,
          borderRadius: 18, padding: 24, marginBottom: 14,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 800, letterSpacing: ".1em",
            color: COLORS.muted, textTransform: "uppercase", marginBottom: 12,
          }}>Nhập tích phân cần giải</div>

          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: COLORS.surface, border: `1px solid #252525`,
            borderRadius: 12, padding: "10px 14px",
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <input value={hi} onChange={e => setHi(e.target.value)} placeholder="b"
                style={{
                  background: "transparent", border: "none", borderBottom: `1px solid #444`,
                  color: COLORS.text, fontSize: 11, width: 34, textAlign: "center", outline: "none", padding: "2px"
                }} />
              <span style={{ fontSize: 44, color: COLORS.yellow, fontStyle: "italic", lineHeight: 1 }}>∫</span>
              <input value={lo} onChange={e => setLo(e.target.value)} placeholder="a"
                style={{
                  background: "transparent", border: "none", borderBottom: `1px solid #444`,
                  color: COLORS.text, fontSize: 11, width: 34, textAlign: "center", outline: "none", padding: "2px"
                }} />
            </div>

            <input ref={inputRef} value={expr}
              onChange={e => setExpr(e.target.value)}
              onKeyDown={e => e.key === "Enter" && solve()}
              placeholder="Nhập biểu thức..."
              style={{
                flex: 1, background: "transparent", border: "none",
                color: COLORS.text, fontSize: 22, outline: "none",
                caretColor: COLORS.yellow, fontFamily: "'Manrope',monospace", minWidth: 0,
              }} />

            <div style={{ color: COLORS.muted, fontSize: 18, display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>
              d<input value={dv} onChange={e => setDv(e.target.value.slice(-1) || "x")} maxLength={1}
                style={{
                  background: "transparent", border: "none", borderBottom: `1px solid #444`,
                  color: COLORS.yellow, fontSize: 18, width: 22, textAlign: "center", outline: "none", fontWeight: 800
                }} />
            </div>
          </div>

          {/* Keyboard */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginTop: 12 }}>
            {KB_KEYS.map(k => (
              <button key={k.l} onClick={() => k.v === "DEL" ? delChar() : insert(k.v)}
                style={{
                  background: k.v === "DEL" ? "#1a0505" : COLORS.surface,
                  border: `1px solid ${k.v === "DEL" ? "#3a1515" : COLORS.border}`,
                  borderRadius: 7, color: k.v === "DEL" ? "#f09595" : COLORS.text,
                  fontSize: 12, padding: "7px 3px", cursor: "pointer",
                  fontFamily: "'Manrope',monospace", transition: "all .12s",
                }}
              >{k.l}</button>
            ))}
          </div>

          <button onClick={solve} disabled={loading || !expr.trim()}
            style={{
              width: "100%", background: COLORS.yellow, border: "none", borderRadius: 100,
              color: COLORS.bg, fontSize: 14, fontWeight: 800, padding: "13px 0",
              cursor: loading || !expr.trim() ? "not-allowed" : "pointer",
              marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: loading || !expr.trim() ? .5 : 1, fontFamily: "Manrope,sans-serif",
              transition: "opacity .2s",
            }}>
            {loading ? (
              <><SpinIcon /><span>Đang giải với Claude AI...</span></>
            ) : (
              <><span style={{ fontSize: 16 }}>✦</span><span>Giải tích phân với AI</span></>
            )}
          </button>
        </div>

        {/* Result Area */}
        {result && !loading && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", color: COLORS.muted, textTransform: "uppercase", marginBottom: 8 }}>Kết quả</div>
              <div style={{
                fontSize: 22, color: COLORS.yellow, background: "#0d0d00",
                borderRadius: 10, padding: "14px 16px", marginBottom: 16,
                fontFamily: "monospace", border: "1px solid #2a2500", fontWeight: 700
              }}>
                = {result.result}
              </div>

              {result.steps?.length > 0 && (
                <>
                  <div style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: ".1em", color: COLORS.muted,
                    textTransform: "uppercase", margin: "24px 0 16px"
                  }}>Quy trình biến đổi chi tiết</div>
                  
                  <div style={{ position: "relative", paddingLeft: 8 }}>
                    {/* Đường kẻ dọc nối các bước */}
                    <div style={{
                      position: "absolute", left: 19, top: 10, bottom: 10,
                      width: 1, background: `linear-gradient(to bottom, ${COLORS.yellow} 0%, ${COLORS.border} 100%)`,
                      opacity: 0.3
                    }} />

                    {result.steps.map((step, i) => (
                      <div key={i} style={{ 
                        display: "flex", gap: 20, marginBottom: 20, 
                        position: "relative", zIndex: 1 
                      }}>
                        {/* Circle Indicator */}
                        <div style={{
                          minWidth: 24, height: 24, borderRadius: "50%",
                          background: COLORS.card, color: COLORS.yellow,
                          fontSize: 10, fontWeight: 800, display: "flex",
                          alignItems: "center", justifyContent: "center",
                          flexShrink: 0, border: `2px solid ${COLORS.yellow}`,
                          boxShadow: `0 0 10px ${COLORS.yellow}44`
                        }}>
                          {i + 1}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 14, lineHeight: 1.8, color: COLORS.text,
                            background: "rgba(255,255,255,0.02)",
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 12, padding: "14px 18px",
                            fontFamily: "'Inter', system-ui, sans-serif",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                          }}>
                            {/* Phân tách Text và Công thức (giả định Claude trả về định dạng tốt) */}
                            {step.split(':').length > 1 ? (
                              <>
                                <span style={{ color: COLORS.yellow, fontWeight: 700, display: "block", marginBottom: 6, fontSize: 12, textTransform: "uppercase" }}>
                                  {step.split(':')[0]}
                                </span>
                                <div style={{ fontFamily: "monospace", fontSize: 15, color: "#fff" }}>
                                  {step.split(':').slice(1).join(':')}
                                </div>
                              </>
                            ) : (
                              <div style={{ fontFamily: "monospace", fontSize: 15 }}>{step}</div>
                            )}
                          </div>
                          
                          {/* Mũi tên trỏ xuống giữa các bước */}
                          {i < result.steps.length - 1 && (
                            <div style={{ padding: "8px 0 0 20px", color: COLORS.border2 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {/* View Full Solution Button */}
              {onViewSolution && result.steps?.length > 0 && (
                <button
                  onClick={() => onViewSolution({ ...result, expr, lo, hi, dv })}
                  style={{
                    width: "100%", marginTop: 20,
                    background: "transparent",
                    border: `1px solid ${COLORS.yellow}55`,
                    borderRadius: 100, color: COLORS.yellow,
                    fontSize: 13, fontWeight: 800,
                    padding: "12px 0", cursor: "pointer",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                    fontFamily: "Manrope,sans-serif",
                    transition: "all .2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = COLORS.yellowDim;
                    (e.currentTarget as HTMLButtonElement).style.borderColor = COLORS.yellow;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = `${COLORS.yellow}55`;
                  }}
                >
                  <span style={{ fontSize: 16 }}>✦</span>
                  Xem lời giải đầy đủ
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default IntegralSolverSection;
