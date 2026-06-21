import React, { useState, useRef, useEffect, useMemo } from "react";
import SolutionPage from "./SolutionPage";
import Footer from "../components/common/Footer";
import HistoryItem from "../components/tester/HistoryItem";
import PredictionCard from "../components/tester/PredictionCard";
import ProbabilityDistribution from "../components/tester/ProbabilityDistribution";
import MathInput from "../components/tester/MathInput";
import { AI_API_URL as API, DOTNET_API_URL } from "../config";
import { AuroraTextEffect } from "@/components/lightswind/aurora-text-effect";
import RippleLoader from "@/components/lightswind/RippleLoader";
import { Menu, X, ArrowRight, ArrowLeft, Zap, Brain, Cpu, Network, Bot, AtomIcon } from "lucide-react";
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { motion } from "framer-motion";
import BeamCircle from "@/components/ui/beam-circle";
import { Button } from "@/components/ui/button";
import AnimatedBubbleParticles from "@/components/lightswind/animated-bubble-particles";
import AuroraShader from "@/components/lightswind/aurora-shader";
import GoBackButton from "@/components/common/GoBackButton";

import "../styles/ModelTester.css";
import "../styles/KoaDesign.css";

export default function ModelTester({ user, onNavigate }) {
  const [latex, setLatex] = useState("");
  const [result, setResult] = useState(null);
  const [solveResult, setSolveResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [apiStatus, setApiStatus] = useState("unknown");
  const [modelMeta, setModelMeta] = useState(null);
  const [solveGlitch, setSolveGlitch] = useState(false);
  const [showPredictModal, setShowPredictModal] = useState(false);
  const inputRef = useRef(null);
  const lenisRef = useRef(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Initialize Lenis globally to smooth out the native scroll
    // This allows sticky elements to work while adding silky inertia
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const handleTryModelClick = (e) => {
    e.preventDefault();
    if (lenisRef.current) {
      lenisRef.current.scrollTo('#model', { offset: 0, duration: 1.5 });
    } else {
      document.getElementById('model')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (showPredictModal) {
      lenisRef.current?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenisRef.current?.start();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPredictModal]);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const r = await fetch(`${API}/health`, { method: "GET", mode: "cors", signal: AbortSignal.timeout(3000) });
        if (r.ok) {
          const meta = await r.json();
          setApiStatus("ok");
          setModelMeta(meta);
        } else {
          setApiStatus("error");
        }
      } catch { setApiStatus("error"); }
    };
    checkApi();
  }, []);

  useEffect(() => {
    if (user && user.uid) {
      fetch(`${DOTNET_API_URL}/Integral/history?userId=${user.uid}`)
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(data => {
          if (Array.isArray(data)) {
            setHistory(data.map(item => ({
              latex: item.input || "",
              action: "✓",
              name: `= ${item.finalAnswer || item.result || "?"}`,
              id: Date.now() - Math.random()
            })).slice(0, 8));
          }
        })
        .catch(() => { });
    }
  }, [user]);

  async function callApi(endpoint) {
    let cleanLatex = latex.trim();
    if (!cleanLatex) return;
    if (!cleanLatex.includes("\\int") && !cleanLatex.toLowerCase().includes("int")) {
      cleanLatex = `\\int_{0}^{1}{${cleanLatex}}dx`;
    }
    setError(""); setResult(null); setSolveResult(null); setLoading(true);
    try {
      const url = endpoint === "solve"
        ? `${DOTNET_API_URL}/Integral/solve?userId=${user?.uid || ""}`
        : `${API}/integrals/${endpoint}`;
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
        setShowPredictModal(true);
      } else {
        setSolveResult(data);
        const ansText = data.finalAnswer || data.result || data.answer || "?";
        setHistory(h => [{ latex, action: (data.success || (data.result && !data.error)) ? "✓" : "✗", name: `= ${ansText}`, id: Date.now() }, ...h].slice(0, 8));
        if (data.success || (data.result && !data.error)) setShowSolution(true);
      }
    } catch (e) {
      setError(e.message.includes("fetch") ? "Could not connect to API. Please run: dotnet run & python -m ai.api" : e.message);
      setApiStatus("error");
    } finally { setLoading(false); }
  }

  const handleSolveClick = () => {
    setSolveGlitch(true);
    setTimeout(() => {
      setSolveGlitch(false);
    }, 400);
    callApi("solve");
  };

  const solutionData = solveResult ? {
    expr: solveResult.input || solveResult.expr || latex,
    lo: solveResult.lo ?? "",
    hi: solveResult.hi ?? "",
    dv: solveResult.dv ?? "x",
    result: solveResult.result ?? solveResult.finalAnswer ?? solveResult.answer ?? "?",
    definite_value: solveResult.definite_value ?? solveResult.finalAnswer ?? null,
    steps: solveResult.steps ?? [],
  } : null;

  const hasInput = latex.trim().length > 0;

  const SITE_CONFIG = {
    logo: "Callo",
    logoHighlight: "X"
  };

  const NAVIGATION_LINKS = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "Model", href: "#model" },
    { label: "History", href: "#history" }
  ];

  const HEADER_CTA = {
    signIn: { label: "Sign in", href: "#signin" },
    getStarted: { label: "Get Started", href: "#get-started" }
  };

  const HERO_CONTENT = {
    title: {
      line1: "Introducing Integral AI",
      line2: "The Future of Math Solutions"
    },
    description: "Solve complex integrals instantly with AI-driven models that deliver step-by-step reasoning and prediction probabilities. Empower your research and learning.",
    cta: {
      primary: { label: "Try Model Now", href: "#model" },
      secondary: { label: "Learn More", href: "#learn-more" }
    }
  };

  const beamOrbits = useMemo(() => [
    { id: 1, radiusFactor: 0.25, speed: 10, icon: <Brain className="text-gray-900" />, iconSize: 32, orbitThickness: 1.5 },
    { id: 2, radiusFactor: 0.45, speed: 15, icon: <Cpu className="text-gray-900" />, iconSize: 36, orbitThickness: 1.5 },
    { id: 3, radiusFactor: 0.65, speed: 12, icon: <Network className="text-gray-900" />, iconSize: 40, orbitThickness: 2 },
    { id: 4, radiusFactor: 0.85, speed: 18, icon: <Zap className="text-gray-900" />, iconSize: 36, orbitThickness: 1.5 },
    { id: 5, radiusFactor: 1.05, speed: 20, icon: <Bot className="text-gray-900" />, iconSize: 32, orbitThickness: 1 },
  ], []);

  const centerIcon = useMemo(() => (
    <AtomIcon className="text-gray-900" size={40} strokeWidth={2} />
  ), []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  if (showSolution && solutionData) return <SolutionPage data={solutionData} onBack={() => setShowSolution(false)} />;

  return (
    <div className="w-full min-h-screen bg-[#020205] text-[#0f172a] font-sans">
      {loading && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999, backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
          <RippleLoader size={50} duration="3s" logoColor="dodgerblue" />
        </div>
      )}

      <GoBackButton onClick={() => onNavigate('intro')} />

      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <AuroraShader
          colorStops={["#3b82f6", "#8b5cf6", "#06b6d4"]}
          amplitude={1.2}
          blend={0.6}
          speed={0.8}
        />
        <section id="home" className="relative h-full w-full flex items-center justify-center pt-16 text-white">
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 leading-tight">
                  <span className="block text-white">{HERO_CONTENT.title.line1}</span>
                  <span className="block text-gray-400 mt-2">{HERO_CONTENT.title.line2}</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {HERO_CONTENT.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
                  <a href={HERO_CONTENT.cta.primary.href} onClick={handleTryModelClick} className="koa-btn flex items-center justify-center gap-2" style={{ textDecoration: 'none', padding: '14px 32px' }}>
                    {HERO_CONTENT.cta.primary.label}
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </a>
                </div>
              </div>

              <div className="relative flex items-center justify-center min-h-[500px]">
                <div className="relative z-10 scale-75 sm:scale-75 md:scale-90 lg:scale-100">
                  <BeamCircle size={400} orbits={beamOrbits} centerIcon={centerIcon} />
                  <motion.div
                    className="absolute bottom-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-green-500/10 blur-2xl pointer-events-none"
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-green-500/10 blur-2xl pointer-events-none"
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <AnimatedBubbleParticles
        className="sticky top-0 z-10 bg-[#f8fafc] w-full min-h-screen rounded-t-[40px] shadow-[0_-30px_60px_rgba(0,0,0,0.6)] border-t border-white/10"
        height="auto"
        particleColor="rgba(6, 182, 212, 0.4)" // cyan color to match the theme
        spawnInterval={300}
      >
        <section id="model" style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: "64px 24px 100px" }}>

          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <AuroraTextEffect
              text="INTEGRAL INTELLIGENCE"
              textClassName="title-font-wide"
              fontSize="clamp(32px, 5vw, 52px)"
              colors={{ first: 'bg-cyan-400', second: 'bg-yellow-400', third: 'bg-green-400', fourth: 'bg-primarylw' }}
              blurAmount="blur-lg"
              animationSpeed={{ border: 6, first: 5, second: 5, third: 3, fourth: 13 }}
            />
          </div>

          <div className="mt-grid-layout">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <MathInput
                latex={latex}
                setLatex={setLatex}
                inputRef={inputRef}
                onPredict={() => callApi("predict")}
                onInsert={() => { }}
                loading={loading}
                snippets={[]}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                <div
                  className={`btn-solve-wrapper ${loading || !hasInput ? "disabled" : ""} ${solveGlitch ? "click-glitch" : ""}`}
                  style={{ width: "100%", height: "54px" }}
                >
                  <button
                    className="btn-solve"
                    onClick={handleSolveClick}
                    disabled={loading || !hasInput}
                    style={{ height: "100%", fontSize: "16px", fontWeight: "800", letterSpacing: "1.5px" }}
                  >
                    {loading ? (
                      <span style={{ width: 18, height: 18, border: "2.5px solid rgba(196,181,253,0.3)", borderTopColor: "#c4b5fd", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block", marginRight: "8px" }} />
                    ) : (
                      <svg style={{ width: 20, height: 20, marginRight: 8, display: "inline-block", verticalAlign: "middle" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    )}
                    SOLVE INTEGRAL
                  </button>
                </div>

                <button
                  className="btn-glass"
                  onClick={() => callApi("predict")}
                  disabled={loading || !hasInput}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "12px",
                    fontSize: "13px",
                    fontWeight: "800",
                    letterSpacing: "1.5px",
                    color: "#00d2ff",
                    textShadow: "0 0 10px rgba(0, 210, 255, 0.6)",
                    opacity: (loading || !hasInput) ? 0.5 : 1
                  }}
                >
                  <svg style={{ width: 18, height: 18, marginRight: 6, filter: "drop-shadow(0 0 5px rgba(0,210,255,0.8))" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  PHÂN TÍCH AI (PREDICT)
                </button>
              </div>

              {error && (
                <div className="result-appear glass-card-light" style={{ padding: "14px 18px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.07)", borderRadius: 14, color: "#fca5a5", fontSize: 13, fontWeight: 500, lineHeight: 1.6 }}>
                  ⚠️ {error}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Removed empty state as requested */}

              {loading && (
                <div className="glass-card" style={{ padding: "52px 24px", textAlign: "center" }}>
                  <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, border: "3px solid rgba(99,102,241,0.15)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>Processing...</span>
                  </div>
                </div>
              )}

              {/* Prediction results are now shown in the center pop-up modal */}

              {solveResult && !loading && solveResult.success && (
                <div className="result-appear glass-card" style={{ padding: 24, border: "1px solid rgba(52,211,153,0.3)", background: "#ecfdf5" }}>
                  <div style={{ fontSize: 11, color: "#34d399", fontWeight: 700, marginBottom: 8, letterSpacing: ".08em", textTransform: "uppercase" }}>Result</div>
                  <div style={{ fontSize: 36, fontWeight: 900, background: "linear-gradient(135deg, #34d399, #6ee7b7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 20 }}>
                    = {solveResult.finalAnswer || solveResult.answer || solveResult.result}
                  </div>
                  <button
                    onClick={() => setShowSolution(true)}
                    style={{ width: "100%", padding: "13px 20px", background: "linear-gradient(135deg, #059669, #047857)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit", boxShadow: "0 4px 20px rgba(5,150,105,0.3)" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(5,150,105,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(5,150,105,0.3)"; }}
                  >
                    📖 View Detailed Solution
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </AnimatedBubbleParticles>

      {/* History Session (3rd Layer) */}
      <div className="relative z-20 bg-[#0f172a] w-full min-h-screen rounded-t-[40px] shadow-[0_-30px_60px_rgba(0,0,0,0.6)] border-t border-white/10 flex flex-col overflow-hidden">
        <section id="history" className="relative z-10 flex-1 flex flex-col" style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Calculation History
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Review your past integral evaluations and AI predictions.
            </p>
          </div>

          {history.length > 0 ? (
            <div className="grid gap-4 w-full">
              {history.map(h => (
                <div
                  key={h.id}
                  className="cursor-pointer transition-all hover:scale-[1.01]"
                  onClick={() => {
                    setLatex(h.latex);
                    if (lenisRef.current) lenisRef.current.scrollTo('#model', { duration: 1.2 });
                  }}
                  style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16 }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: h.action === "✓" ? "rgba(52,211,153,0.1)" : h.action === "✗" ? "rgba(248,113,113,0.1)" : "rgba(165,180,252,0.1)", color: h.action === "✓" ? "#34d399" : h.action === "✗" ? "#f87171" : "#a5b4fc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: "bold" }}>
                    {h.action === "✓" ? "✓" : h.action === "✗" ? "✗" : `#`}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 20, color: "#f8fafc", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 6 }}>{h.latex}</div>
                    {h.name && <div style={{ fontSize: 15, color: "#94a3b8" }}>{h.name}</div>}
                  </div>
                  <ArrowRight size={20} className="text-gray-600" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-20">
              <Bot size={64} className="mb-6 text-gray-500" />
              <div className="text-xl font-semibold text-gray-400 mb-2">No history yet</div>
              <div className="text-base text-gray-500">Your recent integral calculations will appear here.</div>
            </div>
          )}
        </section>

        <Footer onNavigate={onNavigate} theme="dark" />
      </div>

      {showPredictModal && result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all duration-300"
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <div
            className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6"
            style={{
              animation: "fadeUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <button
              onClick={() => setShowPredictModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-all cursor-pointer border-none bg-transparent"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-500 rounded-xl">
                <Brain size={24} />
              </div>
              <div style={{ textAlign: "left" }}>
                <h3 className="text-xl font-bold text-slate-900">AI Analysis Results</h3>
                <p className="text-xs text-slate-500">Model prediction and feature analysis</p>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto pr-2"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxHeight: "calc(90vh - 180px)",
                textAlign: "left"
              }}
            >
              <PredictionCard result={result} />
              {result.probabilities && <ProbabilityDistribution probabilities={result.probabilities} />}
            </div>

            <button
              onClick={() => setShowPredictModal(false)}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all cursor-pointer border-none mt-2"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
