import React, { useState, useEffect, useRef } from 'react';

const MathInput = ({ latex, setLatex, inputRef, onPredict, onInsert, loading, snippets }) => {
  const [lowerLimit, setLowerLimit] = useState("");
  const [upperLimit, setUpperLimit] = useState("");
  const [integrand, setIntegrand] = useState("");
  const [variable, setVariable] = useState("x");

  const [copied, setCopied] = useState(false);
  const lastGeneratedLatex = useRef("");

  const handleCopyLatex = () => {
    if (!latex) return;
    navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isVisualChanging = useRef(false);

  // Sync state changes from visual builder to outer latex state
  useEffect(() => {
    isVisualChanging.current = true;
    const cleanIntegrand = integrand.trim();
    let varPart = `d${variable || 'x'}`;

    let formula = "";
    if (lowerLimit || upperLimit) {
      formula = `\\int_{${lowerLimit || '0'}}^{${upperLimit || '1'}}{${cleanIntegrand}}${varPart}`;
    } else {
      formula = `\\int{${cleanIntegrand}}${varPart}`;
    }
    setLatex(formula);
  }, [lowerLimit, upperLimit, integrand, variable, setLatex]);

  // Sync outer latex state changes to visual builder (parsing incoming latex)
  useEffect(() => {
    if (isVisualChanging.current) {
      isVisualChanging.current = false;
      return;
    }

    if (!latex) {
      setIntegrand("");
      setLowerLimit("");
      setUpperLimit("");
      return;
    }

    try {
      // 1. Definite Integral check: \int_{lower}^{upper}{integrand}dvar
      if (latex.includes("\\int_")) {
        const lowerStart = latex.indexOf("\\int_{") + 6;
        const lowerEnd = latex.indexOf("}", lowerStart);
        const upperStart = latex.indexOf("}^{", lowerEnd) + 3;
        const upperEnd = latex.indexOf("}", upperStart);
        const integrandStart = latex.indexOf("{", upperEnd) + 1;
        const integrandEnd = latex.lastIndexOf("}");

        const lastChars = latex.substring(latex.length - 2);
        let extractedVar = "x";
        if (lastChars.startsWith("d") && ["x", "y", "t"].includes(lastChars.charAt(1))) {
          extractedVar = lastChars.charAt(1);
        }

        if (lowerStart > 5 && lowerEnd > lowerStart && upperStart > lowerEnd && upperEnd > upperStart && integrandStart > upperEnd && integrandEnd > integrandStart) {
          setLowerLimit(latex.substring(lowerStart, lowerEnd));
          setUpperLimit(latex.substring(upperStart, upperEnd));

          let extractedIntegrand = latex.substring(integrandStart, integrandEnd);
          if (extractedIntegrand.endsWith("d" + extractedVar)) {
            extractedIntegrand = extractedIntegrand.substring(0, extractedIntegrand.length - 2).trim();
          }
          setIntegrand(extractedIntegrand);
          setVariable(extractedVar);
          return;
        }
      }

      // 2. Indefinite Integral check: \int{integrand}dvar
      if (latex.startsWith("\\int")) {
        const integrandStart = latex.indexOf("{") + 1;
        const integrandEnd = latex.lastIndexOf("}");
        const lastChars = latex.substring(latex.length - 2);
        let extractedVar = "x";
        if (lastChars.startsWith("d") && ["x", "y", "t"].includes(lastChars.charAt(1))) {
          extractedVar = lastChars.charAt(1);
        }

        if (integrandStart > 0 && integrandEnd > integrandStart) {
          setLowerLimit("");
          setUpperLimit("");
          let extractedIntegrand = latex.substring(integrandStart, integrandEnd);
          if (extractedIntegrand.endsWith("d" + extractedVar)) {
            extractedIntegrand = extractedIntegrand.substring(0, extractedIntegrand.length - 2).trim();
          }
          setIntegrand(extractedIntegrand);
          setVariable(extractedVar);
          return;
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }, [latex]);

  return (
    <div className="math-input-container" style={{
      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      border: "1px solid #e2e8f0",
      borderRadius: 24, padding: "28px 24px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.05)",
      color: "#0f172a"
    }}>
      <style>{`
        body .math-input-container, 
        body .math-input-container *, 
        body .math-input-container input, 
        body .math-input-container select, 
        body .math-input-container button {
          font-family: Arial, Helvetica, sans-serif !important;
        }
        .integral-constructor-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 24px;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          overflow: visible !important;
        }
        .integral-flex-container {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: center;
          padding: 10px 0;
          overflow: visible !important;
        }
        .integral-symbols-block {
          position: relative;
          width: 80px;
          height: 120px;
          overflow: visible !important;
        }
        .limit-input-upper {
          position: absolute;
          top: -32px;
          right: -6px;
          width: 44px;
          height: 28px;
          background: #ffffff;
          border: 2px solid #cbd5e1;
          border-radius: 8px;
          color: #0f172a;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          outline: none;
          transition: all 0.2s ease-in-out;
          z-index: 2;
        }
        .limit-input-upper:focus {
          border-color: #2563eb;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .limit-input-upper::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }
        .main-integral-sign {
          font-size: 104px;
          font-weight: 300;
          line-height: 1.3;
          color: transparent;
          background: linear-gradient(135deg, #2563eb 20%, #7c3aed);
          -webkit-background-clip: text;
          background-clip: text;
          user-select: none;
          filter: drop-shadow(0 4px 6px rgba(37, 99, 235, 0.08));
          position: absolute;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          overflow: visible !important;
          padding: 8px 0;
        }
        .limit-input-lower {
          position: absolute;
          bottom: -14px;
          left: -6px;
          width: 44px;
          height: 28px;
          background: #ffffff;
          border: 2px solid #cbd5e1;
          border-radius: 8px;
          color: #0f172a;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          outline: none;
          transition: all 0.2s ease-in-out;
          z-index: 2;
        }
        .limit-input-lower:focus {
          border-color: #2563eb;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .limit-input-lower::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }
        .integrand-block {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }
        .math-parentheses {
          font-size: 64px;
          font-weight: 200;
          color: #cbd5e1;
          user-select: none;
        }
        .integrand-input {
          flex: 1;
          background: #ffffff;
          border: 2px solid #cbd5e1;
          border-radius: 14px;
          color: #0f172a;
          font-size: 20px;
          font-weight: 700;
          font-family: Arial, sans-serif;
          padding: 16px 20px;
          outline: none;
          transition: all 0.2s ease-in-out;
        }
        .integrand-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
        }
        .integrand-input::placeholder {
          color: #94a3b8;
          font-weight: 400;
          font-size: 16px;
        }
        .variable-selector-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 2px solid #cbd5e1;
          border-radius: 12px;
          padding: 8px 16px;
          transition: 0.2s;
        }
        .variable-selector-wrapper:hover {
          border-color: #2563eb;
        }
        .diff-d-label {
          font-size: 22px;
          font-weight: 800;
          font-style: italic;
          color: #2563eb;
        }
        .variable-dropdown {
          background: transparent;
          border: none;
          color: #0f172a;
          font-size: 18px;
          font-family: Arial, sans-serif;
          font-weight: 800;
          outline: none;
          cursor: pointer;
        }
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
          gap: 10px;
        }
        .template-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #334155;
          padding: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          text-align: center;
          font-family: Arial, sans-serif;
        }
        .template-btn:hover {
          background: #2563eb;
          border-color: #2563eb;
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        }
      `}</style>

      {/* Visual Constructor Panel */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#475569", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          🎛️ BỘ DỰNG TÍCH PHÂN TRỰC QUAN (SÁNG / ĐA TƯƠNG PHẢN)
        </span>
        <span style={{ fontSize: 11, background: "#dbeafe", color: "#2563eb", padding: "4px 8px", borderRadius: 99, fontWeight: 800 }}>
          DỄ THAO TÁC
        </span>
      </div>

      <div className="integral-constructor-box">
        <div className="integral-flex-container">
          {/* Left Side: Math symbols block */}
          <div className="integral-symbols-block">
            {/* Upper Limit Input */}
            <input
              type="text"
              placeholder="b"
              value={upperLimit}
              onChange={e => setUpperLimit(e.target.value)}
              className="limit-input-upper"
              title="Cận trên (b)"
            />

            {/* Main Integral Sign */}
            <div className="main-integral-sign">
              ∫
            </div>

            {/* Lower Limit Input */}
            <input
              type="text"
              placeholder="a"
              value={lowerLimit}
              onChange={e => setLowerLimit(e.target.value)}
              className="limit-input-lower"
              title="Cận dưới (a)"
            />
          </div>

          {/* Right Side: Integrand & Variable */}
          <div className="integrand-block">
            <div className="math-parentheses">(</div>

            <input
              type="text"
              placeholder="Nhập biểu thức cần tính (Ví dụ: x^2 + 3x)..."
              value={integrand}
              onChange={e => setIntegrand(e.target.value)}
              className="integrand-input"
              onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onPredict(); }}
              autoFocus
            />

            <div className="math-parentheses">)</div>

            {/* Differential variable selector */}
            <div className="variable-selector-wrapper">
              <span className="diff-d-label">d</span>
              <select
                value={variable}
                onChange={e => setVariable(e.target.value)}
                className="variable-dropdown"
                title="Biến tích phân"
              >
                <option value="x">x</option>
                <option value="y">y</option>
                <option value="t">t</option>
              </select>
            </div>
          </div>
        </div>

        {/* Helpful operator templates */}
        <div style={{ marginTop: 24, borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 12, letterSpacing: "0.08em" }}>
            PHÍM TẮT TOÁN HỌC CHÈN NHANH
          </div>
          <div className="templates-grid">
            {[
              { label: "x²", insert: "x^2" },
              { label: "xⁿ", insert: "x^n" },
              { label: "sin(x)", insert: "sin(x)" },
              { label: "cos(x)", insert: "cos(x)" },
              { label: "eˣ", insert: "e^x" },
              { label: "ln(x)", insert: "ln(x)" },
              { label: "√x", insert: "sqrt(x)" },
              { label: "1/x", insert: "1/x" },
            ].map(tpl => (
              <button
                key={tpl.label}
                onClick={() => {
                  setIntegrand(prev => prev + tpl.insert);
                }}
                className="template-btn"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div style={{
        marginTop: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid #f1f5f9",
        paddingTop: 20
      }}>
        {/* Left Side: Clear Reset button */}
        {(lowerLimit || upperLimit || integrand || latex) ? (
          <button
            onClick={() => {
              setIntegrand("");
              setLowerLimit("");
              setUpperLimit("");
              setLatex("");
            }}
            style={{
              background: "#fee2e2",
              border: "none",
              borderRadius: 12,
              color: "#ef4444",
              fontSize: 13,
              padding: "10px 20px",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fecaca"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fee2e2"; }}
          >
            ✕ Clear All
          </button>
        ) : <div />}

        {/* Right Side: Convert to LaTeX Button */}
        <button
          onClick={handleCopyLatex}
          disabled={!latex}
          style={{
            background: latex ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "#cbd5e1",
            border: "none",
            borderRadius: 12,
            color: "#ffffff",
            fontSize: 13,
            padding: "10px 20px",
            cursor: latex ? "pointer" : "not-allowed",
            transition: "all 0.2s ease-in-out",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: latex ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none"
          }}
          onMouseEnter={e => { if (latex) e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { if (latex) e.currentTarget.style.transform = "none"; }}
        >
          {copied ? "✓ Copied to Clipboard!" : "📋 Convert to LaTeX Code"}
        </button>
      </div>
    </div>
  );
};

export default MathInput;
