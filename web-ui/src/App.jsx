import { useState, useRef, useEffect } from "react";
import Navbar from "./components/layout/Navbar.jsx";
import Integral3D from "./components/ui/Integral3D.jsx";
const C = {
  bg: "#030303",
  card: "#0f0f0f",
  surface: "#141414",
  border: "#191919",
  border2: "#1f1f1f",
  muted: "#999",
  muted2: "#b3b3b3",
  text: "#e6e6e6",
  yellow: "#FFE41F",
  yellowDim: "#393414",
};



/* ─── SECTION BADGE ───────────────────────────────── */
function SectionBadge({ label }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:4, marginBottom:16 }}>
      <span style={{ color: C.yellow, fontSize: 13 }}>(</span>
      <span style={{ color: C.muted, fontSize: 13 }}>{label}</span>
      <span style={{ color: C.yellow, fontSize: 13 }}>)</span>
    </div>
  );
}

/* ─── HERO ────────────────────────────────────────── */
function Hero({ onOpenSolver }) {
  return (
    <section style={{
      padding: "80px 24px 60px", textAlign: "center",
      background: C.bg, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:`radial-gradient(ellipse 80% 60% at 50% 0%, #1a1400 0%, transparent 70%)`,
      }}/>
      <div style={{ position:"relative", maxWidth:680, margin:"0 auto" }}>
        <a href="#" style={{
          display:"inline-flex", alignItems:"center", gap:8,
          background: C.surface, border:`1px solid ${C.border2}`,
          borderRadius:100, padding:"6px 14px",
          color: C.muted2, fontSize:13, textDecoration:"none", marginBottom:28,
        }}>
          <span style={{
            background: C.yellow, color: C.bg,
            fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:100,
          }}>New</span>
          Smart Meeting Notes
        </a>

        <h1 style={{
          fontSize:"clamp(32px,6vw,58px)", fontWeight:800,
          letterSpacing:"-1.5px", lineHeight:1.1,
          color:"#fff", margin:"0 0 20px",
        }}>
          Stop Taking Meeting Notes<br/>
          <span style={{ color: C.yellow }}>During Important Calls</span>
        </h1>

        <p style={{ color: C.muted, fontSize:17, lineHeight:1.7, margin:"0 0 36px", maxWidth:520, marginInline:"auto" }}>
          AI joins your calls, transcribes conversations, and generates action items
          so you can focus entirely on participating and making decisions.
        </p>

        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button style={{
            background: C.yellow, border:"none", borderRadius:100,
            color: C.bg, fontWeight:700, fontSize:15,
            padding:"14px 28px", cursor:"pointer", fontFamily:"Manrope,sans-serif",
          }}>Start 14-Day Trial</button>
          <button style={{
            background:"transparent", border:`1px solid ${C.border2}`,
            borderRadius:100, color: C.muted2, fontSize:15,
            padding:"14px 28px", cursor:"pointer", fontFamily:"Manrope,sans-serif",
          }}>Watch Demo</button>
        </div>

        <p style={{ color:"#555", fontSize:13, marginTop:28 }}>
          Trusted by the world's most innovative teams
        </p>
        <div style={{ display:"flex", justifyContent:"center", gap:32, marginTop:16, flexWrap:"wrap" }}>
          {["Zoom","Slack","Notion","Linear","Figma","Jira","Loom"].map(b => (
            <span key={b} style={{ color:"#444", fontSize:13, fontWeight:600, letterSpacing:".04em" }}>{b}</span>
          ))}
        </div>
      </div>
    </section>
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

/* ─── FEATURES ────────────────────────────────────── */
function Features() {
  const items = [
    { title:"Never Miss a Word", desc:"Industry-leading speech-to-text accuracy across 20+ languages and accents." },
    { title:"No More Blurry Recordings", desc:"AI fixes poor lighting, shaky cameras, and low resolution to deliver crisp, clear video." },
    { title:"AI Meeting Leadership", desc:"Help leaders focus on discussions while AI handles agenda tracking and engagement." },
    { title:"Smart File Processing", desc:"Upload files from any platform and let AI extract key insights and content." },
    { title:"Crystal Clear Audio", desc:"AI removes background noise and enhances voice clarity for perfect playback." },
    { title:"Complete Meeting Archive", desc:"Access and download meeting files organized by date, project, or participant." },
  ];
  return (
    <section style={{ padding:"60px 24px", background: C.bg }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <SectionBadge label="Features" />
          <h2 style={{ color:"#fff", fontSize:36, fontWeight:800, letterSpacing:"-1px", margin:"0 0 8px" }}>
            What Makes Us Different
          </h2>
          <p style={{ color: C.muted }}>Exclusive AI features that give your team a competitive advantage in meetings.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
          {items.map(({ title, desc }) => (
            <div key={title} style={{
              background: C.card, border:`1px solid ${C.border}`,
              borderRadius:18, padding:24,
              transition:"border-color .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor="#2a2a2a"}
            onMouseLeave={e => e.currentTarget.style.borderColor=C.border}
            >
              <div style={{
                width:40, height:40, borderRadius:10,
                background: C.yellowDim, marginBottom:16,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{ color:"#fff", fontSize:16, fontWeight:700, margin:"0 0 8px", letterSpacing:"-.3px" }}>{title}</h3>
              <p style={{ color: C.muted, fontSize:14, lineHeight:1.65, margin:0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PROCESS ─────────────────────────────────────── */
function Process() {
  const steps = [
    { n:"Step 1", title:"Schedule & Connect", desc:"Seamlessly integrate with your calendar and automatically join scheduled meetings across all platforms, ensuring you stay connected, on time, and fully prepared." },
    { n:"Step 2", title:"AI-Powered Note Taking", desc:"Our intelligent assistant captures every discussion, decision, and action item in real-time with perfect accuracy, keeping your team aligned and informed at all times." },
    { n:"Step 3", title:"Clear Audio Processing", desc:"Advanced audio processing ensures optimal sound quality for precise transcription and better meeting experiences, allowing every word to be captured clearly and effortlessly." },
  ];
  return (
    <section style={{ padding:"60px 24px", background: C.bg }}>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <SectionBadge label="Process" />
          <h2 style={{ color:"#fff", fontSize:36, fontWeight:800, letterSpacing:"-1px", margin:0 }}>How It Works</h2>
        </div>
        {steps.map(({ n, title, desc }) => (
          <div key={n} style={{
            background: C.card, border:`1px solid ${C.border}`,
            borderRadius:18, padding:"28px 28px", marginBottom:14,
            display:"flex", gap:24, alignItems:"flex-start",
          }}>
            <span style={{
              background: C.yellow, color: C.bg,
              fontSize:12, fontWeight:800, padding:"4px 12px",
              borderRadius:100, whiteSpace:"nowrap", flexShrink:0, marginTop:2,
            }}>{n}</span>
            <div>
              <h3 style={{ color:"#fff", fontSize:18, fontWeight:700, margin:"0 0 8px" }}>{title}</h3>
              <p style={{ color: C.muted, fontSize:14, lineHeight:1.7, margin:0 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── INTEGRAL SOLVER SECTION ──────────────────────── */
const KB_KEYS = [
  {l:"x",v:"x"},{l:"y",v:"y"},{l:"n",v:"n"},{l:"π",v:"pi"},{l:"e",v:"e"},{l:"(",v:"("},{l:")",v:")"},
  {l:"x²",v:"x^2"},{l:"xⁿ",v:"x^"},{l:"√",v:"sqrt("},{l:"ln",v:"ln("},{l:"log",v:"log("},{l:"sin",v:"sin("},{l:"cos",v:"cos("},
  {l:"tan",v:"tan("},{l:"abs",v:"abs("},{l:"1/x",v:"1/"},{l:"sinh",v:"sinh("},{l:"cosh",v:"cosh("},{l:"asin",v:"asin("},{l:"⌫",v:"DEL"},
];
const QUICK = [
  {e:"x",lo:"",hi:""},{e:"x^2",lo:"",hi:""},{e:"x^3",lo:"",hi:""},
  {e:"sin(x)",lo:"",hi:""},{e:"cos(x)",lo:"",hi:""},{e:"e^x",lo:"",hi:""},
  {e:"ln(x)",lo:"",hi:""},{e:"1/(1+x^2)",lo:"",hi:""},
];
const QUICK_DEF = [
  {e:"x^2",lo:"0",hi:"1"},{e:"sin(x)",lo:"0",hi:"pi"},
  {e:"x^2+1",lo:"-1",hi:"1"},{e:"e^x",lo:"0",hi:"1"},
];

function IntegralSolverSection() {
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
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1200, messages:[{role:"user",content:prompt}] }),
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
    <section id="integral-solver" style={{ padding:"60px 24px", background: C.bg }}>
      <div style={{ maxWidth:780, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <SectionBadge label="Integral Solver" />
          <h2 style={{ color:"#fff", fontSize:36, fontWeight:800, letterSpacing:"-1px", margin:"0 0 8px" }}>
            Giải Tích Phân với AI
          </h2>
          <p style={{ color: C.muted, fontSize:15 }}>
            Nhập biểu thức — Claude AI phân tích và trình bày từng bước chi tiết.
          </p>
        </div>

        {/* Input Card */}
        <div style={{
          background: C.card, border:`1px solid ${C.border}`,
          borderRadius:18, padding:24, marginBottom:14,
        }}>
          <div style={{
            fontSize:10, fontWeight:800, letterSpacing:".1em",
            color: C.muted, textTransform:"uppercase", marginBottom:12,
          }}>Nhập tích phân cần giải</div>

          {/* Input row */}
          <div style={{
            display:"flex", alignItems:"center", gap:10,
            background: C.surface, border:`1px solid #252525`,
            borderRadius:12, padding:"10px 14px",
          }}>
            {/* Bounds + integral symbol */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <input value={hi} onChange={e => setHi(e.target.value)} placeholder="b"
                style={{ background:"transparent", border:"none", borderBottom:`1px solid #444`,
                  color: C.text, fontSize:11, width:34, textAlign:"center", outline:"none", padding:"2px" }} />
              <span style={{ fontSize:44, color: C.yellow, fontStyle:"italic", lineHeight:1 }}>∫</span>
              <input value={lo} onChange={e => setLo(e.target.value)} placeholder="a"
                style={{ background:"transparent", border:"none", borderBottom:`1px solid #444`,
                  color: C.text, fontSize:11, width:34, textAlign:"center", outline:"none", padding:"2px" }} />
            </div>

            <input ref={inputRef} value={expr}
              onChange={e => setExpr(e.target.value)}
              onKeyDown={e => e.key === "Enter" && solve()}
              placeholder="Nhập biểu thức..."
              style={{
                flex:1, background:"transparent", border:"none",
                color: C.text, fontSize:22, outline:"none",
                caretColor: C.yellow, fontFamily:"'Manrope',monospace", minWidth:0,
              }} />

            <div style={{ color: C.muted, fontSize:18, display:"flex", alignItems:"center", gap:3, whiteSpace:"nowrap" }}>
              d<input value={dv} onChange={e => setDv(e.target.value.slice(-1)||"x")} maxLength={1}
                style={{ background:"transparent", border:"none", borderBottom:`1px solid #444`,
                  color: C.yellow, fontSize:18, width:22, textAlign:"center", outline:"none", fontWeight:800 }} />
            </div>
          </div>

          {/* Keyboard */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5, marginTop:12 }}>
            {KB_KEYS.map(k => (
              <button key={k.l} onClick={() => k.v === "DEL" ? delChar() : insert(k.v)}
                style={{
                  background: k.v === "DEL" ? "#1a0505" : C.surface,
                  border:`1px solid ${k.v === "DEL" ? "#3a1515" : C.border}`,
                  borderRadius:7, color: k.v === "DEL" ? "#f09595" : C.text,
                  fontSize:12, padding:"7px 3px", cursor:"pointer",
                  fontFamily:"'Manrope',monospace", transition:"all .12s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = k.v === "DEL" ? "#2a0a0a" : "#1e1e1e"}
                onMouseLeave={e => e.currentTarget.style.background = k.v === "DEL" ? "#1a0505" : C.surface}
              >{k.l}</button>
            ))}
          </div>

          {/* Warnings */}
          {isDef && (!lo || !hi) && (
            <div style={{ background:"#1a0a00", border:"1px solid #3a1f00", borderRadius:8,
              padding:"8px 12px", color:"#f0b595", fontSize:13, marginTop:10 }}>
              Tích phân xác định cần điền đầy đủ cả cận trên và cận dưới.
            </div>
          )}

          {/* Solve button */}
          <button onClick={solve} disabled={loading || !expr.trim()}
            style={{
              width:"100%", background: C.yellow, border:"none", borderRadius:100,
              color: C.bg, fontSize:14, fontWeight:800, padding:"13px 0",
              cursor: loading || !expr.trim() ? "not-allowed" : "pointer",
              marginTop:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              opacity: loading || !expr.trim() ? .5 : 1, fontFamily:"Manrope,sans-serif",
              transition:"opacity .2s",
            }}>
            {loading ? (
              <><SpinIcon /><span>Đang giải với Claude AI...</span></>
            ) : (
              <><span style={{ fontSize:16 }}>✦</span><span>Giải tích phân với AI</span></>
            )}
          </button>

          {error && (
            <div style={{ background:"#1a0505", border:"1px solid #4a0c0c", borderRadius:8,
              padding:"10px 14px", color:"#f09595", fontSize:13, marginTop:10 }}>
              {error}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", marginBottom:14 }}>
            <div style={{ background: C.surface, borderBottom:`1px solid ${C.border}`,
              padding:"12px 18px", display:"flex", alignItems:"center", gap:8,
              fontSize:11, fontWeight:800, color: C.muted, letterSpacing:".1em" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background: C.yellow,
                display:"inline-block", animation:"pulse 1s infinite" }} />
              AI ĐANG TÍNH TOÁN
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", justifyContent:"center", padding:"32px 0" }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width:8, height:8, borderRadius:"50%", background: C.yellow,
                  display:"inline-block",
                  animation:`bounce 1.1s ${i*.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", marginBottom:14 }}>
            <div style={{ background: C.surface, borderBottom:`1px solid ${C.border}`,
              padding:"12px 18px", display:"flex", alignItems:"center", gap:8,
              fontSize:11, fontWeight:800, color: C.muted, letterSpacing:".1em" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background: C.yellow, display:"inline-block" }} />
              KẾT QUẢ PHÂN TÍCH
            </div>
            <div style={{ padding:24 }}>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:".1em", color: C.muted, textTransform:"uppercase", marginBottom:8 }}>Tích phân</div>
              <div style={{ fontSize:15, color:"#fff", background: C.surface, borderRadius:10,
                padding:"12px 16px", marginBottom:16, fontFamily:"monospace",
                border:`1px solid ${C.border}`, lineHeight:1.5 }}>{result.integral}</div>

              <div style={{ fontSize:10, fontWeight:800, letterSpacing:".1em", color: C.muted, textTransform:"uppercase", marginBottom:8 }}>Kết quả</div>
              <div style={{ fontSize:22, color: C.yellow, background:"#0d0d00",
                borderRadius:10, padding:"14px 16px", marginBottom:16,
                fontFamily:"monospace", border:"1px solid #2a2500", fontWeight:700 }}>
                = {result.result}
              </div>

              {result.definite_value !== null && result.definite_value !== undefined && (lo && hi) && (
                <>
                  <div style={{ fontSize:10, fontWeight:800, letterSpacing:".1em", color: C.muted, textTransform:"uppercase", marginBottom:8 }}>Giá trị số</div>
                  <div style={{ fontSize:18, color:"#97c459", background:"#070f02",
                    borderRadius:10, padding:"12px 16px", marginBottom:16,
                    fontFamily:"monospace", border:"1px solid #1a3000" }}>
                    ≈ {result.definite_value}
                  </div>
                </>
              )}

              {result.steps?.length > 0 && (
                <>
                  <div style={{ fontSize:10, fontWeight:800, letterSpacing:".1em", color: C.muted,
                    textTransform:"uppercase", margin:"20px 0 10px" }}>Các bước giải chi tiết</div>
                  {result.steps.map((step, i) => (
                    <div key={i} style={{ display:"flex", gap:12, marginBottom:10, alignItems:"flex-start" }}>
                      <span style={{
                        minWidth:24, height:24, borderRadius:"50%",
                        background:"#1a1300", color: C.yellow,
                        fontSize:11, fontWeight:800, display:"flex",
                        alignItems:"center", justifyContent:"center",
                        flexShrink:0, marginTop:2, border:`1px solid #2a2000`,
                      }}>{i + 1}</span>
                      <div style={{
                        fontSize:13, lineHeight:1.65, color: C.text,
                        background: C.surface, borderRadius:8,
                        padding:"8px 12px", border:`1px solid ${C.border}`,
                        flex:1, fontFamily:"monospace",
                      }}>{step}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Examples */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:20 }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:".1em", color: C.muted, textTransform:"uppercase", marginBottom:12 }}>Ví dụ nhanh</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {QUICK.map(q => (
                <button key={q.e} onClick={() => { setExpr(q.e); setLo(q.lo); setHi(q.hi); }}
                  style={{
                    background: C.surface, border:`1px solid ${C.border}`,
                    borderRadius:8, color: C.text, fontSize:12,
                    padding:"6px 10px", cursor:"pointer", fontFamily:"monospace",
                    transition:"all .12s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#3a3a00"}
                  onMouseLeave={e => e.currentTarget.style.borderColor=C.border}
                >{q.e}</button>
              ))}
            </div>
          </div>
          <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:20 }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:".1em", color: C.muted, textTransform:"uppercase", marginBottom:12 }}>Tích phân xác định</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {QUICK_DEF.map(q => (
                <button key={q.e+q.lo} onClick={() => { setExpr(q.e); setLo(q.lo); setHi(q.hi); }}
                  style={{
                    background: C.surface, border:`1px solid ${C.border}`,
                    borderRadius:8, color: C.text, fontSize:12,
                    padding:"6px 10px", cursor:"pointer", fontFamily:"monospace",
                    transition:"all .12s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#3a3a00"}
                  onMouseLeave={e => e.currentTarget.style.borderColor=C.border}
                >{q.e} [{q.lo}→{q.hi}]</button>
              ))}
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:20 }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:".1em", color: C.muted, textTransform:"uppercase", marginBottom:12 }}>Lịch sử tra cứu</div>
            {history.map(h => (
              <div key={h.id} onClick={() => { setExpr(h.expr); setLo(h.lo); setHi(h.hi); setDv(h.dv); }}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"9px 8px", borderBottom:`1px solid ${C.border}`,
                  cursor:"pointer", borderRadius:6, transition:"background .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background="#111"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}
              >
                <div>
                  <div style={{ fontSize:13, fontFamily:"monospace", color: C.text }}>∫ {h.expr} d{h.dv}</div>
                  <div style={{ fontSize:11, color: C.muted, marginTop:2 }}>= {h.result}</div>
                </div>
                <span style={{ color:"#444", fontSize:13 }}>→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SpinIcon() {
  return (
    <span style={{ display:"inline-block", animation:"spin 1s linear infinite", fontSize:14 }}>✦</span>
  );
}

/* ─── TESTIMONIALS ────────────────────────────────── */
function Testimonials() {
  const items = [
    { text:"Callox has completely changed how I run client calls. I show up, speak freely, and everything's handled—notes, actions, follow-ups.", name:"Sarah Whitman", role:"Freelance UX Designer" },
    { text:"We use Callox in every sprint planning and retro. It's made our dev process way more efficient and less reliant on memory.", name:"Sophie Allen", role:"Business Coach" },
    { text:"Clients love how fast I follow up after meetings. They think I have a secret team. It's just Callox doing the heavy lifting.", name:"Anita Rao", role:"COO at Lumino Labs" },
  ];
  return (
    <section style={{ padding:"60px 24px", background: C.bg }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <SectionBadge label="Testimonials" />
          <h2 style={{ color:"#fff", fontSize:36, fontWeight:800, letterSpacing:"-1px", margin:0 }}>What Our Users Say</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:14 }}>
          {items.map(({ text, name, role }) => (
            <div key={name} style={{
              background: C.surface, border:`1px solid ${C.border2}`,
              borderRadius:18, padding:24,
            }}>
              <p style={{ color: C.text, fontSize:15, lineHeight:1.7, margin:"0 0 20px", fontStyle:"italic" }}>"{text}"</p>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{
                  width:38, height:38, borderRadius:"50%",
                  background: C.yellowDim, display:"flex", alignItems:"center",
                  justifyContent:"center", color: C.yellow, fontWeight:800, fontSize:13,
                }}>{name[0]}</div>
                <div>
                  <div style={{ color:"#fff", fontSize:14, fontWeight:700 }}>{name}</div>
                  <div style={{ color: C.muted, fontSize:12 }}>{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



/* ─── FAQ ─────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState(null);
  const items = [
    { q:"How does the AI assistant join my meetings?", a:"It connects via your calendar or shared meeting link and joins as a silent participant to capture everything." },
    { q:"Is it compatible with Zoom, Google Meet, and Teams?", a:"Yes, it supports Zoom, Google Meet, Microsoft Teams, and other major platforms used by professionals." },
    { q:"Do I need to inform others the meeting is recorded?", a:"Yes, we recommend transparency. The AI will be labeled clearly as a note-taking assistant." },
    { q:"What kind of notes does it take?", a:"You'll get clear summaries with key points, decisions, action items, and follow-ups in one place." },
    { q:"Is my data safe and private?", a:"Absolutely. All data is encrypted and stored securely. Only authorized users can access it." },
  ];
  return (
    <section style={{ padding:"60px 24px", background: C.bg }}>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <SectionBadge label="FAQ" />
          <h2 style={{ color:"#fff", fontSize:36, fontWeight:800, letterSpacing:"-1px", margin:0 }}>We've Got the Answers</h2>
        </div>
        {items.map(({ q, a }, i) => (
          <div key={i} style={{
            background: C.card, border:`1px solid ${C.border}`,
            borderRadius:14, marginBottom:8, overflow:"hidden",
          }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{
              width:"100%", display:"flex", alignItems:"center",
              justifyContent:"space-between", padding:"18px 20px",
              background:"transparent", border:"none", cursor:"pointer",
              color:"#fff", fontSize:15, fontWeight:600,
              fontFamily:"Manrope,sans-serif", textAlign:"left", gap:12,
            }}>
              <span>{q}</span>
              <span style={{
                color: C.yellow, fontSize:20, lineHeight:1,
                transform: open === i ? "rotate(45deg)" : "none",
                transition:"transform .2s", flexShrink:0,
              }}>+</span>
            </button>
            {open === i && (
              <div style={{ padding:"0 20px 18px", color: C.muted, fontSize:14, lineHeight:1.7 }}>{a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA ─────────────────────────────────────────── */
function CTA({ onOpenSolver }) {
  return (
    <section style={{ padding:"60px 24px", background: C.bg }}>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        <div style={{
          background: C.card, border:`1px solid ${C.border}`,
          borderRadius:24, padding:"48px 40px", textAlign:"center",
        }}>
          <h2 style={{ color:"#fff", fontSize:32, fontWeight:800, letterSpacing:"-1px", margin:"0 0 12px" }}>
            Let AI Take Over Your Meetings and Keep You Moving Forward
          </h2>
          <p style={{ color: C.muted, fontSize:15, lineHeight:1.7, margin:"0 0 32px" }}>
            Our AI assistant joins your calls, takes detailed notes, and instantly turns discussions into clear action items.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button style={{
              background: C.yellow, border:"none", borderRadius:100,
              color: C.bg, fontWeight:700, fontSize:15,
              padding:"14px 28px", cursor:"pointer", fontFamily:"Manrope,sans-serif",
            }}>Start 14-Day Trial</button>
            <button onClick={onOpenSolver} style={{
              background:"transparent", border:`1px solid ${C.border2}`,
              borderRadius:100, color: C.muted2, fontSize:15,
              padding:"14px 28px", cursor:"pointer", fontFamily:"Manrope,sans-serif",
            }}>Try Integral Solver</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ──────────────────────────────────────── */
function Footer() {
  const cols = [
    { title:"Company", links:["Home","About","Features","Integration","Pricing"] },
    { title:"Support",  links:["Changelog","Contact","Blog","Coming Soon"] },
    { title:"Legal",    links:["Terms of Use","Privacy Policy","Cookie Policy","Security Policy"] },
    { title:"Social",   links:["Twitter","Instagram","TikTok","Facebook"] },
  ];
  return (
    <footer style={{ background: C.bg, borderTop:`1px solid ${C.border}`, padding:"48px 24px 32px" }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr repeat(4,1fr)", gap:32, marginBottom:40 }}>
          <div>
            <div style={{ marginBottom:16 }}>
              <span style={{ fontWeight:800, fontSize:18, color:"#fff", letterSpacing:"-.5px" }}>Callox</span>
            </div>
            <p style={{ color:"#555", fontSize:13, lineHeight:1.7, margin:"0 0 16px" }}>
              Callox transforms your meetings with AI-powered note-taking, automatic action item creation, and seamless follow-up management.
            </p>
          </div>
          {cols.map(({ title, links }) => (
            <div key={title}>
              <div style={{ color:"#fff", fontSize:13, fontWeight:700, marginBottom:12 }}>{title}</div>
              {links.map(l => (
                <div key={l} style={{ marginBottom:8 }}>
                  <a href="#" style={{ color:"#555", fontSize:13, textDecoration:"none", transition:"color .2s" }}
                    onMouseEnter={e => e.target.style.color=C.muted2}
                    onMouseLeave={e => e.target.style.color="#555"}
                  >{l}</a>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"#555", fontSize:13 }}>©Callox 2026. All Rights Reserved.</span>
          <span style={{ color:"#444", fontSize:12 }}>Template by Ammar Hassan</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── SCROLL-TO-SOLVER MODAL BUTTON ──────────────── */
function SolverFloatBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position:"fixed", bottom:28, right:28, zIndex:200,
      background: C.yellow, border:"none", borderRadius:100,
      color: C.bg, fontWeight:800, fontSize:13,
      padding:"12px 20px", cursor:"pointer",
      boxShadow:"0 4px 24px rgba(255,228,31,.25)",
      display:"flex", alignItems:"center", gap:8,
      fontFamily:"Manrope,sans-serif", transition:"opacity .2s",
    }}
    onMouseEnter={e => e.currentTarget.style.opacity=".88"}
    onMouseLeave={e => e.currentTarget.style.opacity="1"}
    >
      <span style={{ fontSize:16 }}>∫</span> Giải tích phân
    </button>
  );
}

/* ─── APP ─────────────────────────────────────────── */
export default function App() {
  function scrollToSolver() {
    document.getElementById("integral-solver")?.scrollIntoView({ behavior:"smooth" });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #030303; font-family: 'Manrope', system-ui, sans-serif; }
        input::placeholder { color: #333; }
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); opacity: .25; }
          40% { transform: translateY(-7px); opacity: 1; }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Navbar onOpenSolver={scrollToSolver} />
      <Integral3D/>
      <Hero onOpenSolver={scrollToSolver} />
      <Stats />
      <Features />
      <Process />
      <IntegralSolverSection />
      <Testimonials />
      <FAQ />
      <CTA onOpenSolver={scrollToSolver} />
      <Footer />
      <SolverFloatBtn onClick={scrollToSolver} />
    </>
  );
}