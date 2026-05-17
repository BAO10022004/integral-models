import { useState, useRef, useEffect } from "react";
import SolutionPage from "./SolutionPage";
import ConfidenceBar from "../components/tester/ConfidenceBar";
import SolveStepCard from "../components/tester/SolveStepCard";
import HistoryItem from "../components/tester/HistoryItem";
import PredictionCard from "../components/tester/PredictionCard";
import ProbabilityDistribution from "../components/tester/ProbabilityDistribution";
import MathInput from "../components/tester/MathInput";
import { AI_API_URL as API, DOTNET_API_URL } from "../config";

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

export default function ModelTester({ user }) {
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
    <div style={{ minHeight: "100vh", background: "#020205", color: "#fff", padding: "24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes fadeSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* Background Orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 500, height: 500, top: "-10%", left: "-5%", borderRadius: "50%", background: "rgba(112,0,255,0.1)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, bottom: "-5%", right: "0", borderRadius: "50%", background: "rgba(0,242,255,0.08)", filter: "blur(80px)" }} />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeSlide .5s ease-out" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(0,242,255,0.08)", border: "1px solid rgba(0,242,255,0.2)",
            borderRadius: 99, padding: "6px 18px", fontSize: 12, fontWeight: 700,
            color: "#00f2ff", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f2ff", display: "inline-block" }} />
            Model Tester — F1: 95.82%
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-2px", margin: "0 0 10px" }}>Kiểm Tra Mô Hình</h1>
          <div style={{ color: apiStatus === "ok" ? "#00ff88" : "#ff4d4d", fontSize: 13 }}>
            {apiStatus === "ok" ? "● API Connected" : "● API Offline"}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24, alignItems: "start" }}>

          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <MathInput
              latex={latex}
              setLatex={setLatex}
              inputRef={inputRef}
              onPredict={() => callApi("predict")}
              onInsert={insertSnippet}
              loading={loading}
              snippets={LATEX_SNIPPETS}
            />

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => callApi("predict")} disabled={loading || !latex.trim()} style={{ flex: 1, padding: 16, background: "linear-gradient(135deg,#00f2ff,#7000ff)", borderRadius: 16, border: "none", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                Phân Tích
              </button>
              <button onClick={() => callApi("solve")} disabled={loading || !latex.trim()} style={{ flex: 1, padding: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                Giải Chi Tiết
              </button>
            </div>

            {/* Examples Grid */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: 20, borderRadius: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 16, letterSpacing: ".1em" }}>VÍ DỤ MẪU</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                {EXAMPLES.map(ex => (
                  <button key={ex.label} onClick={() => setLatex(ex.latex)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#aaa", padding: "10px", borderRadius: 12, cursor: "pointer", fontSize: 13 }}>
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* History List */}
            {history.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: 20, borderRadius: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 16, letterSpacing: ".1em" }}>LỊCH SỬ TRA CỨU</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {history.map(h => <HistoryItem key={h.id} item={h} onClick={() => setLatex(h.latex)} />)}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Results) */}
          <div style={{ position: "sticky", top: 24 }}>
            {!result && !loading && !solveResult && (
              <div style={{ background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 24, padding: 60, textAlign: "center" }}>
                <div style={{ fontSize: 40, color: "#222", marginBottom: 10 }}>∫</div>
                <p style={{ color: "#444", fontSize: 14 }}>Nhập biểu thức để xem kết quả phân tích</p>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ width: 40, height: 40, border: "3px solid rgba(0,242,255,0.1)", borderTopColor: "#00f2ff", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} />
              </div>
            )}

            {result && !loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <PredictionCard result={result} />
                {result.probabilities && <ProbabilityDistribution probabilities={result.probabilities} />}
              </div>
            )}

            {solveResult && !loading && solveResult.success && (
              <div style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 24, padding: 24 }}>
                <div style={{ fontSize: 11, color: "#00ff88", fontWeight: 800, marginBottom: 10 }}>KẾT QUẢ GIẢI</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>= {solveResult.answer}</div>
                <button onClick={() => setShowSolution(true)} style={{ width: "100%", marginTop: 20, padding: 14, background: "#00ff88", color: "#000", border: "none", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>
                  Xem Lời Giải Chi Tiết
                </button>
              </div>
            )}

            {error && <div style={{ color: "#ff4d4d", padding: 16, background: "rgba(255,77,77,0.05)", borderRadius: 16, border: "1px solid rgba(255,77,77,0.2)" }}>{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
