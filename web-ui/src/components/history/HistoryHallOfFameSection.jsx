import React, { useState, useEffect } from "react";
import "../../styles/HistoryHallOfFameSection.css";

const GIANTS_DATA = [
  {
    id: "archimedes",
    name: "Archimedes of Syracuse",
    period: "c. 287 BC – c. 212 BC",
    title: "PIONEER OF INFINITESIMALS",
    bio: "The legendary Greek polymath who laid the foundation for modern calculus over two millennia ago. Using the 'Method of Exhaustion'—inscribing and circumscribing regular polygons with increasing sides—he computed the area of circles, parabolas, and calculated a highly accurate approximation of Pi. He was the first to implement the core philosophy of integral limits to solve geometric volume problems.",
    achievement: "Created the Method of Exhaustion, precursor to the Riemann Sum, to compute parabolic areas and spherical volumes.",
    discoveryTitle: "Method of Exhaustion",
    quote: "There are things which seem incredible to most men who have not studied Mathematics.",
    avatar: "📐"
  },
  {
    id: "newton",
    name: "Sir Isaac Newton",
    period: "1642 – 1727",
    title: "CO-INVENTOR OF CALCULUS",
    bio: "The English scientific titan who synthesized the 'Method of Fluxions' (differential calculus) and inverse fluxions (integral calculus). By linking rates of change with accumulated areas, Newton discovered the Fundamental Theorem of Calculus. He applied this math to define classical mechanics and celestial gravity, proving that nature's laws are written in the language of calculus.",
    achievement: "Synthesized the Fundamental Theorem of Calculus, uniting integration and differentiation as inverse operations.",
    discoveryTitle: "Method of Fluxions",
    quote: "If I have seen further it is by standing on the shoulders of Giants.",
    avatar: "🍎"
  },
  {
    id: "leibniz",
    name: "Gottfried Wilhelm Leibniz",
    period: "1646 – 1716",
    title: "MASTER OF MATHEMATICAL NOTATION",
    bio: "The brilliant German philosopher and mathematician who independently co-invented calculus. Leibniz recognized the immense power of notation, introducing the elongated 'S' (\u222B for 'summa') as the integral sign and 'd' for differentials. His elegant dx/dy notation, product rule, and systemic integration rules formed the universal standard utilized by all scientists today.",
    achievement: "Developed modern integral (\u222B) and differential (dx) notation, and formulated the product & chain rules.",
    discoveryTitle: "Leibniz Integral Calculus",
    quote: "It is unworthy of excellent men to lose hours like slaves in the labor of calculation.",
    avatar: "✍️"
  },
  {
    id: "riemann",
    name: "Bernhard Riemann",
    period: "1826 – 1866",
    title: "FOUNDER OF RIGOROUS INTEGRATION",
    bio: "The revolutionary German mathematician who provided the first rigorous definition of the integral of a function on an interval. By introducing the 'Riemann Sum'—dividing areas into rectangular partitions and taking the limit as width approaches zero—he established calculus on absolute mathematical rigor. His geometric breakthroughs later enabled Einstein's General Relativity.",
    achievement: "Defined the Riemann Integral rigorously using finite rectangular partitions (Riemann Sums).",
    discoveryTitle: "Riemann Partitioning Sums",
    quote: "If only I had the theorems! Then I should find the proofs easily enough.",
    avatar: "📊"
  },
  {
    id: "lebesgue",
    name: "Henri Lebesgue",
    period: "1875 – 1941",
    title: "PIONEER OF MODERN MEASURE THEORY",
    bio: "The visionary French mathematician who revolutionized integration at the dawn of the 20th century. Pointing out the limitations of Riemann's approach on highly discontinuous functions, he introduced Measure Theory and the 'Lebesgue Integral'. By partitioning the range (y-axis) instead of the domain (x-axis), Lebesgue built an incredibly powerful integration theory that supports modern probability and advanced analysis.",
    achievement: "Formulated the Lebesgue Integral based on Measure Theory, allowing integration of chaotic/fractal functions.",
    discoveryTitle: "Lebesgue Range Partitioning",
    quote: "In my opinion, a mathematical theory can only be considered complete if it has been made accessible to all.",
    avatar: "🧬"
  }
];

export default function HistoryHallOfFameSection() {
  const [selectedGiant, setSelectedGiant] = useState(GIANTS_DATA[0]);
  const [animationTick, setAnimationTick] = useState(0);

  // Simple loop animation tick for SVG visuals
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTick((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Renders the dynamic geometric animation based on who is selected
  const renderInteractiveFormula = () => {
    switch (selectedGiant.id) {
      case "archimedes": {
        // Archimedes: Inscribing polygons in a circle to approximate Pi
        const steps = [6, 12, 24, 48];
        const stepIndex = Math.floor(animationTick / 25) % 4;
        const numSides = steps[stepIndex];
        const points = [];
        const radius = 65;
        for (let i = 0; i < numSides; i++) {
          const angle = (i * 2 * Math.PI) / numSides;
          points.push(`${radius * Math.cos(angle)},${radius * Math.sin(angle)}`);
        }
        const polygonPath = points.join(" ");

        return (
          <svg className="hof-sim-svg" viewBox="-100 -100 200 200">
            <circle cx="0" cy="0" r={radius} className="hof-circle-base" />
            <polygon points={polygonPath} className="hof-polygon-approx" />
            {/* Dots */}
            {points.map((p, idx) => {
              const [x, y] = p.split(",");
              return <circle key={idx} cx={x} cy={y} r="2.5" className="hof-dot" />;
            })}
            <text x="0" y="90" className="hof-svg-text" textAnchor="middle">
              Polygons: {numSides} sides (\u03C0 \u2248 {(numSides * Math.sin(Math.PI / numSides)).toFixed(5)})
            </text>
          </svg>
        );
      }
      case "newton": {
        // Newton: Secant line turning into a Tangent (dx/dy derivative limit)
        const t = (animationTick % 50) / 50; // 0 to 1
        const x1 = -40;
        const x2 = x1 + 80 * (1 - t);
        const y1 = (x1 * x1) / 50 - 30;
        const y2 = (x2 * x2) / 50 - 30;

        // Curve path
        const curvePath = Array.from({ length: 100 }, (_, idx) => {
          const x = -80 + idx * 1.6;
          const y = (x * x) / 50 - 30;
          return `${x},${y}`;
        }).join(" ");

        // Line equation: y - y1 = m(x - x1) => y = m(x - x1) + y1
        const m = x2 !== x1 ? (y2 - y1) / (x2 - x1) : (2 * x1) / 50;
        const lineY1 = m * (-80 - x1) + y1;
        const lineY2 = m * (80 - x1) + y1;

        return (
          <svg className="hof-sim-svg" viewBox="-100 -100 200 200">
            <polyline points={curvePath} className="hof-curve-line" />
            <line x1="-80" y1={lineY1} x2="80" y2={lineY2} className="hof-secant-line" />
            <circle cx={x1} cy={y1} r="4" className="hof-dot-static" />
            <circle cx={x2} cy={y2} r="4" className="hof-dot-moving" />
            <text x="0" y="90" className="hof-svg-text" textAnchor="middle">
              {t > 0.9 ? "Limit reached: Tangent dy/dx" : "Secant interval \u0394x \u2192 0"}
            </text>
          </svg>
        );
      }
      case "leibniz": {
        // Leibniz: Sweeping integral area & dx differential slices
        const t = (animationTick % 100) / 100;
        const currentX = -60 + 120 * t;
        const curvePoints = Array.from({ length: 100 }, (_, idx) => {
          const x = -70 + idx * 1.4;
          const y = 30 * Math.sin(x / 20) - 10;
          return { x, y };
        });
        const curvePath = curvePoints.map((p) => `${p.x},${p.y}`).join(" ");

        // Shaded integral area path
        const shadedPoints = curvePoints.filter((p) => p.x <= currentX);
        let areaPath = "";
        if (shadedPoints.length > 0) {
          areaPath = `M ${shadedPoints[0].x},60 ` +
            shadedPoints.map((p) => `L ${p.x},${p.y}`).join(" ") +
            ` L ${shadedPoints[shadedPoints.length - 1].x},60 Z`;
        }

        return (
          <svg className="hof-sim-svg" viewBox="-100 -100 200 200">
            <line x1="-80" y1="60" x2="80" y2="60" className="hof-axis-line" />
            {areaPath && <path d={areaPath} className="hof-integral-area" />}
            <polyline points={curvePath} className="hof-curve-line" />
            <line x1={currentX} y1="60" x2={currentX} y2={30 * Math.sin(currentX / 20) - 10} className="hof-dx-slice" />
            <text x={currentX} y="-45" className="hof-leibniz-symbol" textAnchor="middle">\u222B</text>
            <text x="0" y="90" className="hof-svg-text" textAnchor="middle">
              \u222B f(x) dx accumulated: {(t * 100).toFixed(0)}%
            </text>
          </svg>
        );
      }
      case "riemann": {
        // Riemann sums: Dynamic rectangular partitions fitting closer and closer
        const steps = [4, 8, 16, 32];
        const stepIndex = Math.floor(animationTick / 25) % 4;
        const rectCount = steps[stepIndex];
        const width = 120 / rectCount;
        const rects = [];

        const f = (x) => {
          return -0.005 * (x + 60) * (x - 80) + 10;
        };

        for (let i = 0; i < rectCount; i++) {
          const rx1 = -60 + i * width;
          const ry1 = f(rx1 + width / 2); // midpoint rule
          rects.push(
            <rect
              key={i}
              x={rx1}
              y={ry1}
              width={width}
              height={60 - ry1}
              className="hof-riemann-rect"
            />
          );
        }

        const curvePath = Array.from({ length: 100 }, (_, idx) => {
          const x = -70 + idx * 1.4;
          const y = f(x);
          return `${x},${y}`;
        }).join(" ");

        return (
          <svg className="hof-sim-svg" viewBox="-100 -100 200 200">
            <line x1="-80" y1="60" x2="80" y2="60" className="hof-axis-line" />
            {rects}
            <polyline points={curvePath} className="hof-curve-line" />
            <text x="0" y="90" className="hof-svg-text" textAnchor="middle">
              Rectangles (n): {rectCount} (Error \u2192 0)
            </text>
          </svg>
        );
      }
      case "lebesgue": {
        // Lebesgue: Partitioning the y-axis horizontally (measure theory)
        const levels = [3, 5, 8];
        const levelIndex = Math.floor(animationTick / 33) % 3;
        const numLevels = levels[levelIndex];
        const yStep = 80 / numLevels;
        const lines = [];

        const f = (x) => {
          return 40 * Math.sin(x / 12) * Math.cos(x / 24) - 10;
        };

        // Draw horizontal slices
        for (let i = 0; i <= numLevels; i++) {
          const yVal = -50 + i * yStep;
          lines.push(
            <line
              key={i}
              x1="-70"
              y1={yVal}
              x2="70"
              y2={yVal}
              className="hof-lebesgue-horizontal"
            />
          );
        }

        const curvePath = Array.from({ length: 120 }, (_, idx) => {
          const x = -70 + idx * 1.16;
          const y = f(x);
          return `${x},${y}`;
        }).join(" ");

        return (
          <svg className="hof-sim-svg" viewBox="-100 -100 200 200">
            {lines}
            <polyline points={curvePath} className="hof-curve-line" />
            <text x="0" y="90" className="hof-svg-text" textAnchor="middle">
              Lebesgue Slices: {numLevels} (\u03BC Measure Partition)
            </text>
          </svg>
        );
      }
      default:
        return null;
    }
  };

  return (
    <section className="history-snap-section history-hof-section">
      <div className="hof-wrapper">
        {/* Header Title */}
        <div className="hof-header">
          <span className="hof-badge">HALL OF FAME</span>
          <h2 className="hof-title">The Giants of Calculus</h2>
          <p className="hof-subtitle">
            Exploring the visionary minds who unlocked the infinite mysteries of integration.
          </p>
        </div>

        {/* Dashboard grid split */}
        <div className="hof-split-container">
          {/* Left panel: Selector list */}
          <div className="hof-selector-panel">
            <div className="selector-list">
              {GIANTS_DATA.map((giant) => {
                const isSelected = selectedGiant.id === giant.id;
                return (
                  <button
                    key={giant.id}
                    className={`selector-item-card ${isSelected ? "active" : ""}`}
                    onClick={() => setSelectedGiant(giant)}
                  >
                    <div className="item-icon-avatar">{giant.avatar}</div>
                    <div className="item-details">
                      <div className="item-name">{giant.name}</div>
                      <div className="item-period">{giant.period}</div>
                    </div>
                    {isSelected && <span className="active-arrow-glow">\u27E9</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Showcase display of selected giant */}
          <div className="hof-display-panel">
            <div className="display-glass-card">
              {/* Profile layout */}
              <div className="display-profile-meta">
                <span className="profile-era-tag">{selectedGiant.title}</span>
                <h3 className="profile-name">{selectedGiant.name}</h3>
                <span className="profile-period">{selectedGiant.period}</span>
                <p className="profile-bio">{selectedGiant.bio}</p>
                <div className="profile-achievement">
                  <strong>Discovery:</strong> {selectedGiant.achievement}
                </div>
              </div>

              {/* Graphical demonstration and quote split */}
              <div className="display-visual-section">
                <div className="visual-graphic-screen">
                  <div className="visual-graphic-title">
                    SIMULATING: {selectedGiant.discoveryTitle}
                  </div>
                  {renderInteractiveFormula()}
                </div>

                <div className="visual-quote-card">
                  <div className="quote-icon">“</div>
                  <blockquote className="quote-text">
                    {selectedGiant.quote}
                  </blockquote>
                  <cite className="quote-author">— {selectedGiant.name}</cite>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
