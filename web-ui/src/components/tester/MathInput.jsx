import React, { useState, useEffect, useRef } from "react";
import "../../styles/MathInput.css";

const UNIFIED_KEYS = [
  { label: "sin", insert: "sin()", type: "func" },
  { label: "cos", insert: "cos()", type: "func" },
  { label: "tan", insert: "tan()", type: "func" },
  { label: "cot", insert: "cot()", type: "func" },
  { label: "ln", insert: "ln()", type: "func" },
  { label: "⌫", action: "backspace", type: "del" },

  { label: "x", insert: "x", type: "var" },
  { label: "y", insert: "y", type: "var" },
  { label: "t", insert: "t", type: "var" },
  { label: "e", insert: "e", type: "var" },
  { label: "π", insert: "pi", type: "var" },
  { label: "C", action: "clear", type: "clear" },

  { label: "7", insert: "7", type: "num" },
  { label: "8", insert: "8", type: "num" },
  { label: "9", insert: "9", type: "num" },
  { label: "/", insert: " / ", type: "op" },
  { label: "^", insert: "^", type: "op" },
  { label: "x²", insert: "x^2", type: "shortcut" },

  { label: "4", insert: "4", type: "num" },
  { label: "5", insert: "5", type: "num" },
  { label: "6", insert: "6", type: "num" },
  { label: "×", insert: "*", type: "op" },
  { label: "√", insert: "sqrt()", type: "op" },
  { label: "x³", insert: "x^3", type: "shortcut" },

  { label: "1", insert: "1", type: "num" },
  { label: "2", insert: "2", type: "num" },
  { label: "3", insert: "3", type: "num" },
  { label: "−", insert: " - ", type: "op" },
  { label: "1/x", insert: "1/x", type: "shortcut" },
  { label: "xⁿ", insert: "x^n", type: "shortcut" },

  { label: "0", insert: "0", type: "num" },
  { label: ".", insert: ".", type: "num" },
  { label: "+", insert: " + ", type: "op" },
  { label: "(", insert: "(", type: "op" },
  { label: ")", insert: ")", type: "op" },
  { label: "log", insert: "log()", type: "func" },
];

const MathInput = ({ latex, setLatex, inputRef, onPredict, loading }) => {
  const [lowerLimit, setLowerLimit] = useState("");
  const [upperLimit, setUpperLimit] = useState("");
  const [integrand, setIntegrand] = useState("");
  const [variable, setVariable] = useState("x");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const integrandRef = useRef(null);
  const isVisualChanging = useRef(false);

  /* Insert at cursor */
  const insertSnippet = (text) => {
    const el = integrandRef.current;
    if (!el) { setIntegrand(p => p + text); return; }
    const s = el.selectionStart, e = el.selectionEnd;
    const next = integrand.substring(0, s) + text + integrand.substring(e);
    setIntegrand(next);

    // Smart cursor positioning inside parentheses
    let offset = text.length;
    if (text.endsWith("()")) {
      offset = text.length - 1;
    } else if (text.endsWith("[]")) {
      offset = text.length - 1;
    } else if (text.endsWith("{}")) {
      offset = text.length - 1;
    }

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(s + offset, s + offset);
    }, 0);
  };

  /* Delete character at cursor (Backspace) */
  const handleBackspace = () => {
    const el = integrandRef.current;
    if (!el) {
      setIntegrand(p => p.slice(0, -1));
      return;
    }
    const s = el.selectionStart, e = el.selectionEnd;
    if (s !== e) {
      const next = integrand.substring(0, s) + integrand.substring(e);
      setIntegrand(next);
      setTimeout(() => { el.focus(); el.setSelectionRange(s, s); }, 0);
    } else if (s > 0) {
      const next = integrand.substring(0, s - 1) + integrand.substring(s);
      setIntegrand(next);
      setTimeout(() => { el.focus(); el.setSelectionRange(s - 1, s - 1); }, 0);
    }
  };

  /* Handle key click for calculator tab */
  const handleKeyClick = (k) => {
    if (k.action === "backspace") {
      handleBackspace();
    } else if (k.action === "clear") {
      setIntegrand("");
    } else if (k.insert) {
      insertSnippet(k.insert);
    }
  };

  /* Visual → LaTeX */
  useEffect(() => {
    isVisualChanging.current = true;
    const ci = integrand.trim();
    const vp = `d${variable || "x"}`;
    let formula = (lowerLimit || upperLimit)
      ? `\\int_{${lowerLimit || "0"}}^{${upperLimit || "1"}}{${ci}}${vp}`
      : `\\int{${ci}}${vp}`;
    setLatex(formula);
  }, [lowerLimit, upperLimit, integrand, variable, setLatex]);

  /* LaTeX → Visual (on external set) */
  useEffect(() => {
    if (isVisualChanging.current) { isVisualChanging.current = false; return; }
    if (!latex) { setIntegrand(""); setLowerLimit(""); setUpperLimit(""); return; }
    try {
      if (latex.includes("\\int_")) {
        const ls = latex.indexOf("\\int_{") + 6, le = latex.indexOf("}", ls);
        const us = latex.indexOf("}^{", le) + 3, ue = latex.indexOf("}", us);
        const is = latex.indexOf("{", ue) + 1, ie = latex.lastIndexOf("}");
        const lc = latex.substring(latex.length - 2);
        let v = "x";
        if (lc.startsWith("d") && ["x", "y", "t"].includes(lc[1])) v = lc[1];
        if (ls > 5 && le > ls && us > le && ue > us && is > ue && ie > is) {
          setLowerLimit(latex.substring(ls, le));
          setUpperLimit(latex.substring(us, ue));
          let ig = latex.substring(is, ie);
          if (ig.endsWith("d" + v)) ig = ig.slice(0, -2).trim();
          setIntegrand(ig); setVariable(v); return;
        }
      }
      if (latex.startsWith("\\int")) {
        const is = latex.indexOf("{") + 1, ie = latex.lastIndexOf("}");
        const lc = latex.substring(latex.length - 2);
        let v = "x";
        if (lc.startsWith("d") && ["x", "y", "t"].includes(lc[1])) v = lc[1];
        if (is > 0 && ie > is) {
          setLowerLimit(""); setUpperLimit("");
          let ig = latex.substring(is, ie);
          if (ig.endsWith("d" + v)) ig = ig.slice(0, -2).trim();
          setIntegrand(ig); setVariable(v);
        }
      }
    } catch { }
  }, [latex]);

  return (
    <div style={{
      background: "rgba(255,255,255,0.9)",
      border: "1px solid rgba(0,0,0,0.05)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
      borderRadius: 24,
      padding: "28px 24px",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      color: "#0f172a",
      fontFamily: "'Be Vietnam Pro', sans-serif",
    }}>


      <div className="mi">
        {/* Section label */}
        <div className="mi-panel-label">Integral Constructor</div>

        {/* Visual constructor */}
        <div className="mi-constructor">
          {/* Integral sign + limits */}
          <div className="mi-int-block">
            <input type="text" className="mi-limit-input mi-limit-upper"
              placeholder="b" value={upperLimit}
              onChange={e => setUpperLimit(e.target.value)} title="Upper limit" />
            <div className="mi-int-sign">∫</div>
            <input type="text" className="mi-limit-input mi-limit-lower"
              placeholder="a" value={lowerLimit}
              onChange={e => setLowerLimit(e.target.value)} title="Lower limit" />
          </div>

          {/* Integrand */}
          <div className="mi-paren">(</div>
          <input
            ref={integrandRef}
            type="text"
            className="mi-integrand"
            placeholder="Enter expression... (e.g., x^2 + sin(x))"
            value={integrand}
            onChange={e => setIntegrand(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onPredict(); }}
            autoFocus
          />
          <div className="mi-paren">)</div>

          {/* Variable selector */}
          <div className="mi-dvar">
            <span className="mi-d">d</span>
            <select className="mi-var-select" value={variable} onChange={e => setVariable(e.target.value)}>
              <option value="x">x</option>
              <option value="y">y</option>
              <option value="t">t</option>
            </select>
          </div>
        </div>

        {/* Keyboard section */}
        <div style={{ marginTop: 24 }}>
          <div
            className="mi-panel-label mi-panel-label-interactive"
            onClick={() => setShowKeyboard(!showKeyboard)}
            style={{ marginBottom: showKeyboard ? 12 : 0 }}
          >
            <span>Keyboard</span>
            <svg
              style={{
                width: 12,
                height: 12,
                transform: showKeyboard ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.25s ease",
                color: "#64748b",
                marginLeft: 8,
                flexShrink: 0
              }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <div style={{
            maxHeight: showKeyboard ? "400px" : "0px",
            opacity: showKeyboard ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out",
          }}>
            <div className="mi-calc-grid" style={{ marginTop: 4 }}>
              {UNIFIED_KEYS.map(k => (
                <button
                  key={k.label}
                  type="button"
                  className={`mi-calc-key key-${k.type}`}
                  onClick={() => handleKeyClick(k)}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathInput;
