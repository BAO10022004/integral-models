import { useState, useRef, useEffect } from "react";
import SolutionPage from "./SolutionPage";
import Footer from "../components/common/Footer";
import ConfidenceBar from "../components/tester/ConfidenceBar";
import SolveStepCard from "../components/tester/SolveStepCard";
import HistoryItem from "../components/tester/HistoryItem";
import PredictionCard from "../components/tester/PredictionCard";
import ProbabilityDistribution from "../components/tester/ProbabilityDistribution";
import MathInput from "../components/tester/MathInput";
import { AI_API_URL as API, DOTNET_API_URL } from "../config";

const EXAMPLES = [
  { label: "x²", latex: String.raw`\int_{0}^{1}x^2 dx`, action: 0 },
  { label: "sin(x)", latex: String.raw`\int_{0}^{1}\sin(x) dx`, action: 0 },
  { label: "3x²", latex: String.raw`\int_{0}^{1}3x^2 dx`, action: 1 },
  { label: "x²+sin(x)", latex: String.raw`\int_{0}^{1}(x^2+\sin(x)) dx`, action: 2 },
  { label: "sin(2x)", latex: String.raw`\int_{0}^{1}\sin(2x) dx`, action: 4 },
  { label: "(x+1)³", latex: String.raw`\int_{0}^{1}(x+1)^3 dx`, action: 4 },
  { label: "x·sin(x)", latex: String.raw`\int_{0}^{1}x\sin(x) dx`, action: 5 },
  { label: "x·eˣ", latex: String.raw`\int_{0}^{1}xe^x dx`, action: 5 },
];

const LATEX_SNIPPETS = [
  { label: "\\int", insert: String.raw`\int_{0}^{1} ` },
  { label: "xⁿ", insert: "x^n" },
  { label: "sin", insert: String.raw`\sin(x)` },
  { label: "cos", insert: String.raw`\cos(x)` },
  { label: "tan", insert: String.raw`\tan(x)` },
  { label: "ln", insert: String.raw`\ln(x)` },
  { label: "eˣ", insert: "e^x" },
  { label: "√", insert: String.raw`\sqrt{x}` },
  { label: "frac", insert: String.raw`\frac{1}{x}` },
  { label: "dx", insert: " dx" },
];

export default function ModelTester({ user, onNavigate }) {
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

  useEffect(() => {
    const checkApi = async () => {
      try {
        const r = await fetch(`${API}/`, { method: 'GET', mode: 'cors', signal: AbortSignal.timeout(3000) });
        setApiStatus(r.ok ? "ok" : "error");
      } catch (e) { setApiStatus("error"); }
    };
    checkApi();
  }, []);

  // Fetch Firestore solved calculations history if user is logged in
  useEffect(() => {
    if (user && user.uid) {
      fetch(`${DOTNET_API_URL}/Integral/history?userId=${user.uid}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to load calculation history");
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            // Map C# Firestore documents to local calculation history list
            const formattedHistory = data.map(item => ({
              latex: item.input || "",
              action: "✓",
              name: `= ${item.finalAnswer || item.result || "?"}`,
              id: Date.now() - Math.random() // Unique ID
            }));
            setHistory(formattedHistory.slice(0, 8));
          }
        })
        .catch(err => {
          console.warn("Failed to fetch calculation history from server Firestore:", err);
        });
    }
  }, [user]);

  const insertSnippet = (text) => {
    const el = inputRef.current;
    if (!el) { setLatex(p => p + text); return; }
    const s = el.selectionStart, e = el.selectionEnd;
    setLatex(latex.slice(0, s) + text + latex.slice(e));
    setTimeout(() => { el.focus(); el.setSelectionRange(s + text.length, s + text.length); }, 0);
  };

  async function callApi(endpoint) {
    let cleanLatex = latex.trim();
    if (!cleanLatex) return;

    // Auto-formatting raw expressions (e.g. "2x" or "x^2") into valid LaTeX integrals
    if (!cleanLatex.includes("\\int") && !cleanLatex.toLowerCase().includes("int")) {
      // Auto-wrap into definite integral format
      cleanLatex = `\\int_{0}^{1}{${cleanLatex}}dx`;
      // Update UI input as well for visual clarity
      setLatex(cleanLatex);
    }

    setError(""); setResult(null); setSolveResult(null); setLoading(true);
    try {
      const url = endpoint === "solve"
        ? `${DOTNET_API_URL}/Integral/solve?userId=${user?.uid || ""}`
        : `${API}/${endpoint}`;

      const res = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex: cleanLatex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setApiStatus("ok");
      if (endpoint === "predict") {
        setResult(data);
        setHistory(h => [{ latex, action: data.action, name: data.action_name, id: Date.now() }, ...h].slice(0, 8));
      } else {
        setSolveResult(data);
        const ansText = data.finalAnswer || data.result || data.answer || "?";
        setHistory(h => [{ latex, action: data.success || (data.result && !data.error) ? "✓" : "✗", name: `= ${ansText}`, id: Date.now() }, ...h].slice(0, 8));
        if (data.success || (data.result && !data.error)) setShowSolution(true);
      }
    } catch (e) {
      setError(e.message.includes("fetch") ? "Không kết nối được API. Hãy chạy: dotnet run & python -m ai.api" : e.message);
      setApiStatus("error");
    } finally { setLoading(false); }
  }

  const solutionData = solveResult ? {
    expr: solveResult.input || solveResult.expr || latex,
    lo: solveResult.lo ?? "",
    hi: solveResult.hi ?? "",
    dv: solveResult.dv ?? "x",
    result: solveResult.result ?? solveResult.finalAnswer ?? solveResult.answer ?? "?",
    definite_value: solveResult.definite_value ?? solveResult.finalAnswer ?? null,
    steps: (solveResult.steps ?? []).map(s => {
      if (typeof s === "string") return s;
      const act = s.action || s.description || "";
      const exp = s.expression || s.formula || "";
      const expl = s.explanation || s.kind || "";

      let str = "";
      if (expl) str += `${expl}: `;
      if (act) str += `${act} `;
      if (exp) str += `-> ${exp}`;

      return str.trim() || JSON.stringify(s);
    }),
  } : null;

  if (showSolution && solutionData) return <SolutionPage data={solutionData} onBack={() => setShowSolution(false)} />;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      color: "#0f172a",
      padding: "24px",
      fontFamily: "Arial, Helvetica, sans-serif"
    }}>
      <style>{`
        body, body *, body input, body select, body button, body textarea {
          font-family: Arial, Helvetica, sans-serif !important;
        }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes runNeon {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .solve-neon-btn {
          flex: 1;
          padding: 16px 24px;
          position: relative;
          background: transparent;
          border: none !important;
          border-radius: 99px;
          color: #2563eb;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          z-index: 1;
        }
        .solve-neon-btn::before {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 99px;
          background: linear-gradient(90deg, #2563eb, #7c3aed, #10b981, #2563eb);
          background-size: 300% 300%;
          filter: blur(8px);
          z-index: -3;
          animation: runNeon 4s linear infinite;
          opacity: 0.4;
          transition: all 0.3s;
        }
        .solve-neon-btn::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 99px;
          background: linear-gradient(90deg, #2563eb, #7c3aed, #10b981, #2563eb);
          background-size: 300% 300%;
          z-index: -2;
          animation: runNeon 4s linear infinite;
          transition: all 0.3s;
        }
        .solve-neon-btn-bg {
          position: absolute;
          inset: 0;
          background: #ffffff;
          border-radius: 99px;
          z-index: -1;
          transition: all 0.3s;
        }
        .solve-neon-btn:hover:not(:disabled) {
          color: #ffffff !important;
          transform: translateY(-2px);
        }
        .solve-neon-btn:hover:not(:disabled)::before {
          opacity: 0.8;
          filter: blur(12px);
        }
        .solve-neon-btn:hover:not(:disabled) .solve-neon-btn-bg {
          opacity: 0;
        }
        .solve-neon-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .solve-neon-btn:disabled {
          color: #94a3b8 !important;
          cursor: not-allowed;
        }
        .solve-neon-btn:disabled::before {
          display: none;
        }
        .solve-neon-btn:disabled::after {
          background: #cbd5e1;
          animation: none;
          inset: -1px;
        }
        .solve-neon-btn:disabled .solve-neon-btn-bg {
          background: #cbd5e1;
          opacity: 0.15;
        }
      `}</style>

      {/* Ambient Blue Background Orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 500, height: 500, top: "-10%", left: "-5%", borderRadius: "50%", background: "rgba(37, 99, 235, 0.04)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, bottom: "-5%", right: "0", borderRadius: "50%", background: "rgba(124, 58, 237, 0.03)", filter: "blur(80px)" }} />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Top Header Section */}
        <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeSlide .5s ease-out" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#eff6ff", border: "1px solid #bfdbfe",
            borderRadius: 99, padding: "6px 18px", fontSize: 12, fontWeight: 800,
            color: "#2563eb", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
            Model Tester — F1: 95.82%
          </div>

          <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-1.5px", margin: "0 0 12px", color: "#0f172a" }}>
            Kiểm Tra Mô Hình
          </h1>

          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: apiStatus === "ok" ? "#10b981" : "#ef4444",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: apiStatus === "ok" ? "#10b981" : "#ef4444",
              display: "inline-block"
            }} />
            {apiStatus === "ok" ? "API Connected" : "API Offline"}
          </div>
        </div>

        {/* Two-Column Grid Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24, alignItems: "start" }}>

          {/* Left Column (Inputs & Options) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Visual Formula Builder */}
            <MathInput
              latex={latex}
              setLatex={setLatex}
              inputRef={inputRef}
              onPredict={() => callApi("predict")}
              onInsert={insertSnippet}
              loading={loading}
              snippets={LATEX_SNIPPETS}
            />

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 14 }}>
              <button
                onClick={() => callApi("predict")}
                disabled={loading || !latex.trim()}
                style={{
                  flex: 1, padding: 16,
                  background: latex.trim() ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "#cbd5e1",
                  borderRadius: 16, border: "none", color: "#fff",
                  fontWeight: 800, cursor: latex.trim() ? "pointer" : "not-allowed",
                  boxShadow: latex.trim() ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { if (latex.trim()) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { if (latex.trim()) e.currentTarget.style.transform = "none"; }}
              >
                Phân Tích
              </button>
              <button
                onClick={() => callApi("solve")}
                disabled={loading || !latex.trim()}
                className="solve-neon-btn"
              >
                <span className="solve-neon-btn-bg" />
                ✨ Giải Chi Tiết
              </button>
            </div>

            {/* Examples Grid Card */}
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              padding: 24,
              borderRadius: 24,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)"
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 16, letterSpacing: ".1em" }}>VÍ DỤ MẪU</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                {EXAMPLES.map(ex => (
                  <button
                    key={ex.label}
                    onClick={() => setLatex(ex.latex)}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      color: "#475569",
                      padding: "10px",
                      borderRadius: 12,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 700,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#eff6ff";
                      e.currentTarget.style.borderColor = "#bfdbfe";
                      e.currentTarget.style.color = "#2563eb";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.color = "#475569";
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* History List Card */}
            {history.length > 0 && (
              <div style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                padding: 24,
                borderRadius: 24,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)"
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 16, letterSpacing: ".1em" }}>
                  LỊCH SỬ TRA CỨU
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {history.map(h => <HistoryItem key={h.id} item={h} onClick={() => setLatex(h.latex)} />)}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Results Display) */}
          <div style={{ position: "sticky", top: 24 }}>

            {/* Empty State Display */}
            {!result && !loading && !solveResult && (
              <div style={{
                background: "#ffffff",
                border: "2px dashed #bfdbfe",
                borderRadius: 24,
                padding: "60px 24px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.01)"
              }}>
                <div style={{ fontSize: 48, color: "#2563eb", marginBottom: 14, fontWeight: 300 }}>∫</div>
                <p style={{ color: "#64748b", fontSize: 14, fontWeight: 600, margin: 0 }}>
                  Nhập biểu thức để xem kết quả phân tích
                </p>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div style={{ textAlign: "center", padding: 60, background: "#ffffff", borderRadius: 24, border: "1px solid #e2e8f0" }}>
                <div style={{
                  width: 40, height: 40,
                  border: "3px solid #eff6ff",
                  borderTopColor: "#2563eb",
                  borderRadius: "50%",
                  animation: "spin .8s linear infinite",
                  margin: "0 auto"
                }} />
              </div>
            )}

            {/* Predictive Results */}
            {result && !loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <PredictionCard result={result} />
                {result.probabilities && <ProbabilityDistribution probabilities={result.probabilities} />}
              </div>
            )}

            {/* Solved Calculation Display */}
            {solveResult && !loading && solveResult.success && (
              <div style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: 24,
                padding: 24,
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.05)"
              }}>
                <div style={{ fontSize: 11, color: "#10b981", fontWeight: 800, marginBottom: 10, letterSpacing: ".05em" }}>
                  KẾT QUẢ GIẢI
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#065f46" }}>
                  = {solveResult.answer}
                </div>
                <button
                  onClick={() => setShowSolution(true)}
                  style={{
                    width: "100%", marginTop: 20, padding: 14,
                    background: "#10b981", color: "#ffffff",
                    border: "none", borderRadius: 12,
                    fontWeight: 800, cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                >
                  Xem Lời Giải Chi Tiết
                </button>
              </div>
            )}

            {/* Error Message Alert */}
            {error && (
              <div style={{
                color: "#ef4444",
                padding: 16,
                background: "#fef2f2",
                borderRadius: 16,
                border: "1px solid #fca5a5",
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.5
              }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
