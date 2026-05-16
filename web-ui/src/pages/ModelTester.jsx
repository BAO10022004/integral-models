import { useState, useRef } from "react";
import SolutionPage from "./SolutionPage";

const API = "http://localhost:5000";

const EXAMPLES = [
  { label: "x²", latex: String.raw`\int_{0}^{1}{x}^{2}dx`, action: 0 },
  { label: "sin(x)", latex: String.raw`\int_{0}^{1}\sin{x}dx`, action: 0 },
  { label: "3x²", latex: String.raw`\int_{0}^{1}3*{x}^{2}dx`, action: 1 },
  { label: "x²+sin(x)", latex: String.raw`\int_{0}^{1}{x}^{2}+\sin{x}dx`, action: 2 },
  { label: "sin(2x)", latex: String.raw`\int_{0}^{1}\sin{2*x}dx`, action: 4 },
  { label: "(x+1)³", latex: String.raw`\int_{0}^{1}{x+1}^{3}dx`, action: 4 },
  { label: "x·sin(x)", latex: String.raw`\int_{0}^{1}{x}*\sin{x}dx`, action: 5 },
  { label: "x·eˣ", latex: String.raw`\int_{0}^{1}{x}*e^{x}dx`, action: 5 },
];

const LATEX_SNIPPETS = [
  { label: "\\int", insert: String.raw`\int_{0}^{1}` },
  { label: "xⁿ", insert: "{x}^{n}" },
  { label: "sin", insert: String.raw`\sin{x}` },
  { label: "cos", insert: String.raw`\cos{x}` },
  { label: "tan", insert: String.raw`\tan{x}` },
  { label: "ln", insert: String.raw`\ln{x}` },
  { label: "eˣ", insert: "e^{x}" },
  { label: "√", insert: String.raw`\sqrt[2]{x}` },
  { label: "frac", insert: String.raw`\frac{1}{x}` },
  { label: "dx", insert: "dx" },
];

function ConfidenceBar({ pct, color }) {
  return (
    <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${pct}%`, background: color,
        borderRadius: 99,
        boxShadow: `0 0 10px ${color}66`,
        transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

function StepCard({ step, index }) {
  return (
    <div style={{
      display: "flex", gap: 16, alignItems: "flex-start",
      padding: "14px 18px", borderRadius: 14,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      animation: `fadeSlide 0.4s ${index * 0.08}s both ease-out`,
    }}>
      <div style={{
        minWidth: 28, height: 28, borderRadius: "50%",
        background: "linear-gradient(135deg,#00f2ff,#7000ff)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 800, color: "#000", flexShrink: 0,
      }}>{index + 1}</div>
      <span style={{ fontSize: 14, lineHeight: 1.7, color: "#ddd", fontFamily: "'JetBrains Mono', monospace" }}>{step}</span>
    </div>
  );
}

function FormulaChip({ formula }) {
  return (
    <div style={{
      padding: "8px 14px", borderRadius: 10, fontSize: 13,
      background: "rgba(0,242,255,0.06)",
      border: "1px solid rgba(0,242,255,0.18)",
      color: "#00f2ff", fontFamily: "'JetBrains Mono', monospace",
      whiteSpace: "nowrap",
    }}>{formula}</div>
  );
}

const STEP_COLORS = { predict:"#00f2ff", antiderivative:"#00ff88", transform:"#ffd700", result:"#ff00c8", info:"#7000ff", error:"#ff4d4d", fallback:"#888" };

function SolveStepCard({ step, index }) {
  const col = STEP_COLORS[step.kind] || "#888";
  const icons = { predict:"🤖", antiderivative:"∫", transform:"🔄", result:"✅", info:"ℹ️", error:"❌", fallback:"⚙️" };
  return (
    <div style={{
      display:"flex", gap:12, alignItems:"flex-start",
      padding:"12px 16px", borderRadius:12,
      background:`rgba(${col=="#00f2ff"?"0,242,255":col=="#00ff88"?"0,255,136":col=="#ffd700"?"255,215,0":col=="#ff00c8"?"255,0,200":"112,0,255"},0.06)`,
      border:`1px solid ${col}33`,
      marginLeft: step.depth * 16,
      animation:`fadeSlide 0.3s ${index*0.05}s both ease-out`,
    }}>
      <span style={{ fontSize:16, flexShrink:0 }}>{icons[step.kind]||"•"}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, color:"#ddd", lineHeight:1.6 }}>{step.description}</div>
        {step.formula && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:col, marginTop:4, opacity:.9 }}>{step.formula}</div>}
        {step.integral && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#666", marginTop:2 }}>{step.integral}</div>}
        {typeof step.value==="number" && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:"#ff00c8", marginTop:4 }}>= {step.value}</div>}
      </div>
    </div>
  );
}

export default function ModelTester() {
  const [latex, setLatex] = useState("");
  const [result, setResult] = useState(null);
  const [solveResult, setSolveResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [mode, setMode] = useState("predict"); // "predict" | "solve"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [apiStatus, setApiStatus] = useState("unknown");
  const inputRef = useRef(null);

  async function checkApi() {
    try {
      const r = await fetch(`${API}/`, { signal: AbortSignal.timeout(2000) });
      setApiStatus(r.ok ? "ok" : "error");
    } catch { setApiStatus("error"); }
  }
  useState(() => { checkApi(); }, []);

  function insertSnippet(text) {
    const el = inputRef.current;
    if (!el) { setLatex(p => p + text); return; }
    const s = el.selectionStart, e = el.selectionEnd;
    setLatex(latex.slice(0, s) + text + latex.slice(e));
    setTimeout(() => { el.focus(); el.setSelectionRange(s+text.length, s+text.length); }, 0);
  }

  async function callApi(endpoint) {
    if (!latex.trim()) return;
    setError(""); setResult(null); setSolveResult(null); setLoading(true);
    try {
      const res = await fetch(`${API}/${endpoint}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ latex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setApiStatus("ok");
      if (endpoint === "predict") {
        setResult(data);
        setHistory(h => [{ latex, action: data.action, name: data.action_name, id: Date.now() }, ...h].slice(0, 8));
      } else {
        setSolveResult(data);
        setHistory(h => [{ latex, action: data.success ? "✓" : "✗", name: `= ${data.answer ?? "?"}`, id: Date.now() }, ...h].slice(0, 8));
        if (data.success) setShowSolution(true);
      }
    } catch (e) {
      setError(e.message.includes("fetch") ? "Không kết nối được API. Hãy chạy: python -m ai.api" : e.message);
      setApiStatus("error");
    } finally { setLoading(false); }
  }

  const predict = () => { setMode("predict"); callApi("predict"); };
  const solveIntegral = () => { setMode("solve"); callApi("solve"); };

  /* ── Map solveResult → SolutionPage data prop ── */
  const solutionData = solveResult ? {
    expr:           solveResult.expr         ?? latex,
    lo:             solveResult.lo            ?? "",
    hi:             solveResult.hi            ?? "",
    dv:             solveResult.dv            ?? "x",
    result:         solveResult.result        ?? solveResult.answer ?? "?",
    definite_value: solveResult.definite_value ?? solveResult.answer ?? null,
    steps:          (solveResult.steps ?? []).map(s =>
      typeof s === "string" ? s : `${s.description ?? ""}${ s.formula ? ": " + s.formula : "" }`
    ),
  } : null;

  /* ── Khi đang xem lời giải, chiếm toàn màn hình ── */
  if (showSolution && solutionData) {
    return (
      <SolutionPage
        data={solutionData}
        onBack={() => setShowSolution(false)}
      />
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#020205",
      fontFamily: "'Outfit', sans-serif", color: "#fff",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes fadeSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px #00f2ff44} 50%{box-shadow:0 0 40px #00f2ffaa} }
        * { box-sizing: border-box; }
        ::placeholder { color: #333 }
        textarea:focus { outline: none; }
        textarea { resize: none; }
      `}</style>

      {/* Fixed bg orbs */}
      <div style={{ position:"fixed",inset:0,zIndex:-1,overflow:"hidden",pointerEvents:"none" }}>
        <div style={{ position:"absolute",width:500,height:500,top:"-10%",left:"-5%",borderRadius:"50%",background:"rgba(112,0,255,0.15)",filter:"blur(80px)" }} />
        <div style={{ position:"absolute",width:400,height:400,bottom:"-5%",right:"0",borderRadius:"50%",background:"rgba(0,242,255,0.1)",filter:"blur(80px)" }} />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom: 40, animation:"fadeSlide .5s ease-out" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(0,242,255,0.08)", border:"1px solid rgba(0,242,255,0.2)",
            borderRadius:99, padding:"6px 18px", fontSize:12, fontWeight:700,
            color:"#00f2ff", letterSpacing:".1em", textTransform:"uppercase", marginBottom:20,
          }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#00f2ff",
              animation:"pulse 1.5s infinite", display:"inline-block" }} />
            Model Tester — F1: 95.82%
          </div>

          <h1 style={{
            fontSize:"clamp(28px,5vw,52px)", fontWeight:800, letterSpacing:"-2px",
            margin:"0 0 14px",
            background:"linear-gradient(135deg, #fff 0%, #00f2ff 60%, #7000ff 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>Kiểm Tra Mô Hình Tích Phân</h1>
          <p style={{ color:"#888", fontSize:16, maxWidth:480, margin:"0 auto" }}>
            Nhập biểu thức tích phân LaTeX — mô hình sẽ phân loại phương pháp giải và đưa ra hướng dẫn chi tiết.
          </p>

          {/* API status pill */}
          <div style={{ marginTop:14, display:"inline-flex", alignItems:"center", gap:6, fontSize:12, color: apiStatus==="ok" ? "#00ff88" : "#ff4d4d" }}>
            <span style={{ width:7,height:7,borderRadius:"50%",background:"currentColor",display:"inline-block" }} />
            {apiStatus==="ok" ? "API kết nối OK" : apiStatus==="error" ? "API chưa chạy — python -m ai.api" : "Đang kiểm tra API..."}
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 400px", gap:20, alignItems:"start" }}>

          {/* ── LEFT: Input panel ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Input card */}
            <div style={{
              background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:24, padding:24, backdropFilter:"blur(20px)",
              animation:"fadeSlide .5s .1s both ease-out",
            }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:".12em", color:"#888", textTransform:"uppercase", marginBottom:12 }}>
                Biểu thức LaTeX
              </div>

              <textarea
                ref={inputRef}
                value={latex}
                onChange={e => setLatex(e.target.value)}
                onKeyDown={e => { if (e.key==="Enter" && (e.ctrlKey||e.metaKey)) predict(); }}
                rows={3}
                placeholder={String.raw`\int_{0}^{1}{x}^{2}dx`}
                style={{
                  width:"100%", background:"rgba(0,0,0,0.3)",
                  border:`1px solid ${latex ? "rgba(0,242,255,0.35)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius:14, padding:"16px 18px", color:"#fff",
                  fontSize:20, fontFamily:"'JetBrains Mono', monospace",
                  transition:"border-color .3s, box-shadow .3s",
                  boxShadow: latex ? "0 0 20px rgba(0,242,255,0.1)" : "none",
                }}
              />

              {/* Snippets toolbar */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:12 }}>
                {LATEX_SNIPPETS.map(s => (
                  <button key={s.label} onClick={() => insertSnippet(s.insert)} style={{
                    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:8, color:"#ccc", fontSize:12, padding:"5px 10px",
                    cursor:"pointer", fontFamily:"'JetBrains Mono', monospace",
                    transition:"all .15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#00f2ff"; e.currentTarget.style.color="#00f2ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#ccc"; }}
                  >{s.label}</button>
                ))}
                {latex && (
                  <button onClick={() => setLatex("")} style={{
                    background:"rgba(255,60,60,0.08)", border:"1px solid rgba(255,60,60,0.2)",
                    borderRadius:8, color:"#ff6b6b", fontSize:12, padding:"5px 10px", cursor:"pointer",
                  }}>✕ Xoá</button>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                <button onClick={predict} disabled={loading || !latex.trim()} style={{
                  flex:1, padding:"13px 0",
                  background: loading||!latex.trim() ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#00f2ff,#7000ff)",
                  border:"none", borderRadius:14, color: loading||!latex.trim() ? "#555" : "#fff",
                  fontSize:13, fontWeight:800, cursor: loading||!latex.trim() ? "not-allowed" : "pointer",
                  fontFamily:"'Outfit',sans-serif", transition:"all .3s",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}>
                  {loading && mode==="predict"
                    ? <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite" }} />Đang phân tích...</>
                    : <>🔍 Phân Loại</>}
                </button>
                <button onClick={solveIntegral} disabled={loading || !latex.trim()} style={{
                  flex:1, padding:"13px 0",
                  background: loading||!latex.trim() ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#00ff88,#00f2ff)",
                  border:"none", borderRadius:14, color: loading||!latex.trim() ? "#555" : "#000",
                  fontSize:13, fontWeight:800, cursor: loading||!latex.trim() ? "not-allowed" : "pointer",
                  fontFamily:"'Outfit',sans-serif", transition:"all .3s",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}>
                  {loading && mode==="solve"
                    ? <><span style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.3)",borderTopColor:"#000",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite" }} />Đang giải...</>
                    : <>∫ Giải Tích Phân</>}
                </button>
              </div>

              {error && (
                <div style={{
                  marginTop:12, padding:"12px 16px", borderRadius:12,
                  background:"rgba(255,60,60,0.08)", border:"1px solid rgba(255,60,60,0.25)",
                  color:"#ff8080", fontSize:13,
                }}>{error}</div>
              )}
            </div>

            {/* Examples */}
            <div style={{
              background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:20, padding:20, animation:"fadeSlide .5s .2s both ease-out",
            }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:".12em", color:"#888", textTransform:"uppercase", marginBottom:14 }}>
                Ví Dụ Nhanh
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))", gap:8 }}>
                {EXAMPLES.map(ex => (
                  <button key={ex.label} onClick={() => { setLatex(ex.latex); setResult(null); }} style={{
                    background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:10, color:"#ccc", fontSize:12, padding:"10px 12px",
                    cursor:"pointer", fontFamily:"'JetBrains Mono', monospace",
                    textAlign:"left", transition:"all .15s",
                    borderLeft: `3px solid ${["#00f2ff","#7000ff","#ff00c8","#ffd700","#00ff88","#ff6b35"][ex.action]}`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.transform="none"; }}
                  >
                    <div style={{ fontWeight:700, color:"#fff", marginBottom:3 }}>{ex.label}</div>
                    <div style={{ fontSize:10, opacity:.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ex.latex.slice(0,30)}...</div>
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div style={{
                background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)",
                borderRadius:20, padding:20,
              }}>
                <div style={{ fontSize:11, fontWeight:800, letterSpacing:".12em", color:"#888", textTransform:"uppercase", marginBottom:14 }}>
                  Lịch Sử ({history.length})
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {history.map(h => (
                    <div key={h.id} onClick={() => { setLatex(h.latex); setResult(null); }}
                      style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"10px 12px", borderRadius:10, cursor:"pointer",
                        background:"rgba(255,255,255,0.03)", transition:"all .15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.07)"}
                      onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                    >
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#ccc", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>{h.latex}</span>
                      <span style={{ fontSize:11, color:"#888", marginLeft:8, flexShrink:0 }}>→ {h.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Result panel ── */}
          <div style={{ position:"sticky", top:24 }}>
            {!result && !loading && (
              <div style={{
                background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)",
                borderRadius:24, padding:40, textAlign:"center",
                animation:"fadeSlide .5s .15s both ease-out",
              }}>
                <div style={{ fontSize:56, marginBottom:16 }}>∫</div>
                <p style={{ color:"#555", fontSize:14, lineHeight:1.7 }}>Nhập một biểu thức tích phân và nhấn<br/><strong style={{color:"#888"}}>Phân Tích Tích Phân</strong> để bắt đầu.</p>
              </div>
            )}

            {loading && (
              <div style={{
                background:"rgba(255,255,255,0.02)", border:"1px solid rgba(0,242,255,0.2)",
                borderRadius:24, padding:40, textAlign:"center",
              }}>
                <div style={{ width:48,height:48,border:"3px solid rgba(0,242,255,0.2)",borderTopColor:"#00f2ff",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 20px" }} />
                <p style={{ color:"#888" }}>Đang trích xuất features và phân tích...</p>
              </div>
            )}

            {result && !loading && (
              <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeSlide .4s ease-out" }}>

                {/* Action result card */}
                <div style={{
                  background:"rgba(255,255,255,0.03)", border:`1px solid ${result.color}44`,
                  borderRadius:24, padding:24, position:"relative", overflow:"hidden",
                  boxShadow:`0 0 40px ${result.color}18`,
                }}>
                  <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:`${result.color}15`, filter:"blur(20px)" }} />
                  
                  <div style={{ fontSize:11, fontWeight:800, letterSpacing:".12em", color:"#888", textTransform:"uppercase", marginBottom:16 }}>
                    Phương Pháp Phân Tích
                  </div>

                  <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
                    <div style={{
                      width:54, height:54, borderRadius:16, fontSize:26,
                      background:`${result.color}18`, border:`2px solid ${result.color}44`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>{result.icon}</div>
                    <div>
                      <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>
                        Action {result.action}
                      </div>
                      <div style={{ fontSize:14, color: result.color, fontWeight:700 }}>
                        {result.action_name}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding:"12px 16px", borderRadius:12,
                    background:"rgba(0,0,0,0.3)", fontFamily:"'JetBrains Mono',monospace",
                    fontSize:13, color:"#ccc", marginBottom:16,
                    border:"1px solid rgba(255,255,255,0.06)",
                  }}>{result.latex}</div>

                  <p style={{ color:"#aaa", fontSize:13, lineHeight:1.6, marginBottom:16 }}>
                    {result.description}
                  </p>

                  {/* Confidence */}
                  <div style={{ marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
                      <span style={{ color:"#888" }}>Độ tin cậy</span>
                      <span style={{ color: result.color, fontWeight:700 }}>{result.confidence}%</span>
                    </div>
                    <ConfidenceBar pct={result.confidence} color={result.color} />
                  </div>
                </div>

                {/* Probability breakdown */}
                <div style={{
                  background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:20, padding:20,
                }}>
                  <div style={{ fontSize:11, fontWeight:800, letterSpacing:".12em", color:"#888", textTransform:"uppercase", marginBottom:14 }}>
                    Phân Phối Xác Suất
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {result.probabilities.map(p => (
                      <div key={p.action}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                          <span style={{ color:"#ccc" }}>Action {p.action} — {p.name}</span>
                          <span style={{ color: p.color, fontWeight:700 }}>{p.probability}%</span>
                        </div>
                        <ConfidenceBar pct={p.probability} color={p.color} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steps from /predict */}
                {result.steps?.length > 0 && (
                  <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:20 }}>
                    <div style={{ fontSize:11, fontWeight:800, letterSpacing:".12em", color:"#888", textTransform:"uppercase", marginBottom:14 }}>Hướng Giải Quyết</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {result.steps.map((s, i) => <StepCard key={i} step={s} index={i} />)}
                    </div>
                  </div>
                )}
                {result.formulas?.length > 0 && (
                  <div style={{ background:"rgba(0,242,255,0.03)", border:"1px solid rgba(0,242,255,0.12)", borderRadius:20, padding:20 }}>
                    <div style={{ fontSize:11, fontWeight:800, letterSpacing:".12em", color:"#00f2ff88", textTransform:"uppercase", marginBottom:14 }}>Công Thức Tham Khảo</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {result.formulas.map((f, i) => <FormulaChip key={i} formula={f} />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Solve result summary (khi giải thất bại hoặc trước khi mở SolutionPage) ── */}
            {solveResult && !loading && !solveResult.success && (
              <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeSlide .4s ease-out" }}>
                <div style={{
                  background:"rgba(255,77,77,0.06)",
                  border:"1px solid #ff4d4d44",
                  borderRadius:24, padding:24,
                }}>
                  <div style={{ fontSize:11, fontWeight:800, letterSpacing:".12em", color:"#888", textTransform:"uppercase", marginBottom:12 }}>Kết Quả Giải</div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:"#666", marginBottom:12, wordBreak:"break-all" }}>{solveResult.latex ?? latex}</div>
                  <div style={{ fontSize:14, color:"#ff6b6b" }}>❌ {solveResult.error || "Không tính được"}</div>
                </div>
              </div>
            )}

            {/* ── Nút xem lời giải chi tiết (khi solve thành công) ── */}
            {solveResult && !loading && solveResult.success && (
              <div style={{ animation:"fadeSlide .4s ease-out" }}>
                <div style={{
                  background:"rgba(0,255,136,0.06)",
                  border:"1px solid #00ff8844",
                  borderRadius:24, padding:24, marginBottom:14,
                }}>
                  <div style={{ fontSize:11, fontWeight:800, letterSpacing:".12em", color:"#888", textTransform:"uppercase", marginBottom:12 }}>Kết Quả Giải</div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:"#666", marginBottom:12, wordBreak:"break-all" }}>{solveResult.latex ?? latex}</div>
                  <div style={{ fontSize:32, fontWeight:800, color:"#00ff88", fontFamily:"'JetBrains Mono',monospace" }}>= {solveResult.answer ?? solveResult.result}</div>
                </div>
                <button
                  onClick={() => setShowSolution(true)}
                  style={{
                    width:"100%", padding:"14px 0",
                    background:"linear-gradient(135deg,#FFE41F,#ff9f00)",
                    border:"none", borderRadius:16,
                    color:"#000", fontSize:14, fontWeight:800,
                    cursor:"pointer", fontFamily:"'Outfit',sans-serif",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    boxShadow:"0 0 24px #FFE41F44",
                    transition:"all .3s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 0 36px #FFE41F88"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 0 24px #FFE41F44"; }}
                >
                  📖 Xem Lời Giải Chi Tiết
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
