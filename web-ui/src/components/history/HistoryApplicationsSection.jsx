import React, { useState, useEffect } from "react";
import "../../styles/HistoryApplicationsSection.css";

const ERAS_APPLICATIONS = [
  {
    id: "1687",
    title: "Celestial Mechanics & Astronomy",
    subtitle: "Classical Era (1687 - 1800)",
    pioneer: "Sir Isaac Newton & Johannes Kepler",
    impact: "Calculated planetary orbits around the Sun, determined celestial periods, and formulated the law of universal gravitation.",
    equation: "A = \\int_{t_0}^{t_1} \\frac{1}{2} r^2 \\frac{d\\theta}{dt} dt",
    equationDesc: "Area swept integration of elliptical orbits over time (Kepler's Second Law).",
    techBadge: "Newtonian Physics",
    simulationType: "orbit",
    description: "With the invention of integration, Newton proved that the inverse-square law of gravity mathematically leads to elliptical orbits. Swept-area integration allowed perfect prediction of planetary positions at any future point in time."
  },
  {
    id: "1865",
    title: "Electrodynamics & Alternating Current",
    subtitle: "Industrial Era (1865 - 1950)",
    pioneer: "James Clerk Maxwell & Nikola Tesla",
    impact: "Invented alternating current (AC) grids, designed induction electric motors, and transmitted wireless electromagnetic waves.",
    equation: "\\Phi_B = \\iint_S \\mathbf{B} \\cdot d\\mathbf{a}",
    equationDesc: "Surface integration of magnetic flux generating induced electromotive force (Faraday-Maxwell Induction Law).",
    techBadge: "Maxwell Equations",
    simulationType: "electromagnetic",
    description: "Integrating magnetic field density over a surface area (magnetic flux) allowed Faraday and Maxwell to formulate electromagnetic induction. This became the core engineering principle Tesla used to build AC power generators, lighting up the globe."
  },
  {
    id: "1969",
    title: "Aerospace & Rocket Guidance Control",
    subtitle: "Space Age (1969 - 2000)",
    pioneer: "NASA Apollo Software Team & Rudolf E. Kálmán",
    impact: "Guided humans to land on the Moon (Apollo 11), steered real-time cruise missiles, and powered GPS satellite tracking.",
    equation: "\\mathbf{v}(t) = \\mathbf{v}_0 + \\int_{0}^{t} \\left( \\frac{\\mathbf{F}_{thrust}(\\tau) - \\mathbf{F}_{drag}(\\tau)}{m(\\tau)} + \\mathbf{g}(\\tau) \\right) d\\tau",
    equationDesc: "Vector integration of variable thrust and drag to calculate spacecraft velocity and flight trajectory.",
    techBadge: "Space Guidance",
    simulationType: "rocket",
    description: "To guide Apollo astronauts safely to the lunar surface, the Apollo Guidance Computer (AGC) continuously integrated accelerometer readings from the IMU. Real-time double integration converted variable acceleration to velocity and pinpoint spatial coordinates."
  },
  {
    id: "2026",
    title: "Artificial Intelligence & Quantum Physics",
    subtitle: "AI & Quantum Frontier (2000 - 2026+)",
    pioneer: "Deep Learning Pioneers & Erwin Schrödinger",
    impact: "Trained deep neural networks to solve complex analytical calculus, simulated quantum mechanics, and optimized autonomous robotic trajectories.",
    equation: "P(a \\le x \\le b) = \\int_{a}^{b} |\\Psi(x, t)|^2 dx",
    equationDesc: "Probability density integration of the Schrödinger wave function to calculate quantum particle location.",
    techBadge: "Quantum & Neural AI",
    simulationType: "quantum",
    description: "In quantum physics, integrating the squared amplitude of the wave function is the only way to calculate particle presence probability. Today, Deep Learning AI models utilize multi-dimensional integration optimizations (gradient descent backpropagation) to solve complex symbolic systems in microseconds."
  }
];

export default function HistoryApplicationsSection() {
  const [activeEraId, setActiveEraId] = useState("2026");
  const [isPlaying, setIsPlaying] = useState(true);
  const activeEra = ERAS_APPLICATIONS.find(e => e.id === activeEraId);

  // Simulation animation states
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);
  const [rocketY, setRocketY] = useState(120);
  const [rocketTargetY, setRocketTargetY] = useState(120);
  const [quantumTime, setQuantumTime] = useState(0);

  // Orbit animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setOrbitAngle(prev => (prev + 1.2) % 360);
      setWaveOffset(prev => (prev + 0.1) % (Math.PI * 2));
      setQuantumTime(prev => prev + 0.05);
    }, 16);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Rocket simulator handler
  const handleIgniteThrust = () => {
    if (rocketTargetY > 50) {
      setRocketTargetY(prev => prev - 25);
    } else {
      setRocketTargetY(120); // reset
    }
  };

  // Smooth rocket interpolation
  useEffect(() => {
    const interval = setInterval(() => {
      setRocketY(prev => {
        const diff = rocketTargetY - prev;
        if (Math.abs(diff) < 1) return rocketTargetY;
        return prev + diff * 0.15;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [rocketTargetY]);

  // Compute orbit coordinates based on Elip Kepler
  const a = 110; // semi-major axis
  const b = 75;  // semi-minor axis
  const e = Math.sqrt(1 - (b * b) / (a * a)); // eccentricity
  const orbitRad = (orbitAngle * Math.PI) / 180;
  // Kepler polar coordinates relative to focus
  const focusX = a * e; // distance from center to focus
  const planetX = a * Math.cos(orbitRad) - focusX;
  const planetY = b * Math.sin(orbitRad);

  return (
    <section className="history-snap-section history-apps-section">
      <div className="apps-wrapper">

        {/* Header Section */}
        <div className="apps-header">
          <div className="apps-badge">REAL-WORLD APPLICATIONS</div>
          <h2 className="apps-title">How Integration Shaped the Modern World</h2>
          <p className="apps-subtitle">
            Explore the timeless, real-world impacts of integral calculus. From steering planets in classical space to optimizing neural models in the quantum frontier.
          </p>
        </div>

        {/* Dynamic Era Navigation Tabs */}
        <div className="apps-tabs-bar">
          {ERAS_APPLICATIONS.map(era => (
            <button
              key={era.id}
              className={`apps-tab-btn ${activeEraId === era.id ? "active" : ""}`}
              onClick={() => {
                setActiveEraId(era.id);
                if (era.id === "1969") {
                  setRocketY(120);
                  setRocketTargetY(120);
                }
              }}
            >
              <span className="tab-year">{era.id}</span>
              <span className="tab-label">{era.title.split(" & ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Panels */}
        <div className="apps-panel-container">

          {/* Left Column: Era application metadata */}
          <div className="apps-info-panel">
            <div className="info-glass-card">

              <div className="info-card-header">
                <span className={`era-tag-badge badge-${activeEra.id}`}>{activeEra.techBadge}</span>
                <span className="era-subtitle">{activeEra.subtitle}</span>
              </div>

              <h3 className="era-title-text">{activeEra.title}</h3>

              <div className="info-row">
                <span className="row-label">Pioneers:</span>
                <span className="row-val highlight-pioneer">{activeEra.pioneer}</span>
              </div>

              <div className="info-row">
                <span className="row-label">Real-World Impact:</span>
                <span className="row-val">{activeEra.impact}</span>
              </div>

              {/* Formula Board */}
              <div className="formula-glass-board">
                <div className="formula-board-header">CORE EQUATION</div>
                <div className="formula-latex">
                  <span className="latex-expression">
                    {activeEra.id === "1687" && "A = \u222B [t\u2080 \u279F t\u2081] \u00BD r\u00B2 (d\u03B8/dt) dt"}
                    {activeEra.id === "1865" && "\u03A6\u209B = \u222B\u222B_S B \u22C5 da"}
                    {activeEra.id === "1969" && "v(t) = v\u2080 + \u222B [0 \u279F t] ( (F_thrust - F_drag)/m + g ) d\u03C4"}
                    {activeEra.id === "2026" && "P(a \u2264 x \u2264 b) = \u222B [a \u279F b] |\u03A8(x, t)|\u00B2 dx"}
                  </span>
                </div>
                <div className="formula-desc">{activeEra.equationDesc}</div>
              </div>

              <p className="era-paragraph-desc">{activeEra.description}</p>

              {/* Simulation Action Controls */}
              <div className="info-controls-row">
                <button
                  className={`sim-play-btn ${isPlaying ? "playing" : ""}`}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? "Pause Simulation ⏸" : "Resume Simulation ▶"}
                </button>
                {activeEra.id === "1969" && (
                  <button className="sim-action-btn rocket-ignite" onClick={handleIgniteThrust}>
                    Ignite Engine Thrust 🚀
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: High-fidelity graphical visual simulator */}
          <div className="apps-visual-panel">
            <div className={`simulator-screen screen-theme-${activeEra.id}`}>

              {activeEra.id === "1969" && <div className="sim-crt-scanlines" />}
              {activeEra.id === "2026" && <div className="sim-neural-grid" />}

              {/* SVG SIMULATOR 1: Kepler Orbit Planet Simulator */}
              {activeEra.simulationType === "orbit" && (
                <div className="svg-container">
                  <svg className="sim-svg" viewBox="-200 -120 400 240">
                    <ellipse cx={-focusX} cy="0" rx={a} ry={b} className="orbit-path-line" />

                    <path
                      d={`M ${-focusX} 0 L ${planetX} ${planetY} A ${a} ${b} 0 0 ${planetY < 0 ? 0 : 1} ${a * Math.cos(orbitRad - 0.25) - focusX} ${b * Math.sin(orbitRad - 0.25)} Z`}
                      className="orbit-swept-area"
                    />

                    <circle cx={-focusX} cy="0" r="14" className="orbit-sun-glow" />
                    <circle cx={-focusX} cy="0" r="8" className="orbit-sun-core" />
                    <text x={-focusX} y="22" className="orbit-text sun-label">SUN (FOCUS)</text>

                    <g transform={`translate(${planetX}, ${planetY})`}>
                      <circle cx="0" cy="0" r="9" className="orbit-planet-glow" />
                      <circle cx="0" cy="0" r="6" className="orbit-planet-core" />
                    </g>
                    <text x={planetX - 10} y={planetY - 15} className="orbit-text planet-label">EARTH (PLANET)</text>

                    <line x1={-focusX} y1="0" x2={planetX} y2={planetY} className="orbit-radius-line" />

                    <g transform="translate(-180, 95)" className="sim-meta-text">
                      <text x="0" y="0">Orbit: Ellipse (e = {e.toFixed(3)})</text>
                      <text x="0" y="12">Sweep Angle: {orbitAngle.toFixed(1)}°</text>
                      <text x="0" y="24">Area Integration dA/dt = Constant (Kepler II)</text>
                    </g>
                  </svg>
                </div>
              )}

              {/* SVG SIMULATOR 2: Electromagnetic Wave Oscilloscope */}
              {activeEra.simulationType === "electromagnetic" && (
                <div className="svg-container">
                  <svg className="sim-svg" viewBox="0 0 400 240">
                    <line x1="20" y1="120" x2="380" y2="120" className="osc-grid-axis" />

                    <path
                      d={Array.from({ length: 120 }, (_, i) => {
                        const x = 20 + i * 3;
                        const rad = (i / 120) * Math.PI * 4 + waveOffset;
                        const y = 120 + Math.sin(rad) * 60;
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      }).join(" ")}
                      className="osc-sine-wave"
                    />

                    <path
                      d={Array.from({ length: 120 }, (_, i) => {
                        const x = 20 + i * 3;
                        const rad = (i / 120) * Math.PI * 4 + waveOffset;
                        const y = 120 + Math.cos(rad) * 60;
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      }).join(" ")}
                      className="osc-cosine-wave"
                    />

                    <g transform="translate(100, 205)" className="osc-coil-graphics">
                      <rect x="0" y="0" width="200" height="20" rx="5" className="coil-iron-core" />
                      {Array.from({ length: 8 }).map((_, i) => (
                        <path key={i} d={`M ${15 + i * 24} -5 C ${15 + i * 24} 25, ${25 + i * 24} 25, ${25 + i * 24} -5`} className="coil-copper-turns" />
                      ))}
                      <text x="100" y="32" className="osc-text coil-label" textAnchor="middle">induction coil (AC motor stator)</text>
                    </g>

                    <g transform="translate(25, 30)" className="sim-meta-text">
                      <rect x="-5" y="-5" width="230" height="40" rx="4" className="legend-bg" />
                      <line x1="0" y1="10" x2="30" y2="10" className="osc-legend-sine" />
                      <text x="35" y="14">Magnetic Flux B(t) [Sin]</text>
                      <line x1="0" y1="24" x2="30" y2="24" className="osc-legend-cosine" />
                      <text x="35" y="28">Induced Current I(t) = ∫ B dA [Cos]</text>
                    </g>
                  </svg>
                </div>
              )}

              {/* SVG SIMULATOR 3: Space Telemetry Apollo Lander */}
              {activeEra.simulationType === "rocket" && (
                <div className="svg-container">
                  <svg className="sim-svg" viewBox="0 0 400 240">
                    <path d="M 0 210 Q 100 190 200 215 T 400 205 L 400 240 L 0 240 Z" className="moon-ground" />

                    <rect x="160" y="200" width="80" height="6" className="landing-pad" />
                    <text x="200" y="222" className="osc-text lander-pad-text" textAnchor="middle">target pad (tranquility base)</text>

                    <line x1="200" y1="20" x2="200" y2="200" className="rocket-projection-line" />
                    <line x1="120" y1={rocketY + 20} x2="200" y2={rocketY + 20} className="rocket-altitude-indicator" />

                    <g transform={`translate(200, ${rocketY})`}>
                      {rocketTargetY < rocketY && (
                        <path d="M -10 20 L 0 45 L 10 20 Z" className="rocket-fire-thrust" />
                      )}

                      <rect x="-18" y="-12" width="36" height="24" rx="4" className="apollo-body-outer" />
                      <circle cx="0" cy="-3" r="10" className="apollo-cabin" />
                      <line x1="-18" y1="12" x2="-25" y2="24" className="apollo-lander-leg" />
                      <line x1="18" y1="12" x2="25" y2="24" className="apollo-lander-leg" />
                      <circle cx="-25" cy="24" r="4" className="apollo-footpad" />
                      <circle cx="25" cy="24" r="4" className="apollo-footpad" />
                    </g>

                    <g transform="translate(18, 30)" className="sim-telemetry-text">
                      <text x="0" y="0">APOLLO DSKY MONITOR (AGC)</text>
                      <text x="0" y="16">ALTITUDE: {((200 - rocketY) * 23.4).toFixed(1)} METERS</text>
                      <text x="0" y="28">VERTICAL VEL: {(-(rocketTargetY - rocketY) * 6.2).toFixed(2)} M/S</text>
                      <text x="0" y="40">INTEGRAL ACCEL: v(t) = ∫ a(t) dt</text>
                      <text x="0" y="52" className="telemetry-status">STATUS: STEADY DESCENT PROFILE</text>
                    </g>
                  </svg>
                </div>
              )}

              {/* SVG SIMULATOR 4: Neural Graph & Quantum Wave */}
              {activeEra.simulationType === "quantum" && (
                <div className="svg-container">
                  <svg className="sim-svg" viewBox="0 0 400 240">
                    <path
                      d={Array.from({ length: 150 }, (_, i) => {
                        const x = 10 + i * 2.5;
                        const basePhase = (i / 150) * Math.PI * 6;
                        const envelope = Math.exp(-Math.pow((i - 75) / 45, 2));
                        const y = 120 + Math.sin(basePhase - quantumTime * 2.5) * 65 * envelope;
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      }).join(" ")}
                      className="quantum-prob-wave"
                    />

                    <line x1="120" y1="30" x2="120" y2="210" className="quantum-boundary-line" />
                    <line x1="280" y1="30" x2="280" y2="210" className="quantum-boundary-line" />
                    <text x="123" y="45" className="quantum-boundary-text">a</text>
                    <text x="283" y="45" className="quantum-boundary-text">b</text>

                    <path
                      d={
                        `M 120 120 ` +
                        Array.from({ length: 65 }, (_, i) => {
                          const idx = 44 + i;
                          const x = 10 + idx * 2.5;
                          const basePhase = (idx / 150) * Math.PI * 6;
                          const envelope = Math.exp(-Math.pow((idx - 75) / 45, 2));
                          const y = 120 + Math.sin(basePhase - quantumTime * 2.5) * 65 * envelope;
                          return `L ${x} ${y}`;
                        }).join(" ") +
                        ` L 280 120 Z`
                      }
                      className="quantum-shaded-integral"
                    />

                    <g className="neural-nodes-overlay">
                      <circle cx="200" cy="120" r="5" className="neural-node active" />
                      <circle cx="160" cy="70" r="4" className="neural-node" />
                      <circle cx="240" cy="170" r="4" className="neural-node active" />
                      <circle cx="280" cy="90" r="4" className="neural-node" />
                      <circle cx="120" cy="150" r="4" className="neural-node active" />

                      <path d="M 120 150 L 160 70 M 160 70 L 200 120 M 200 120 L 240 170 M 240 170 L 280 90" className="neural-connection-lines" />
                    </g>

                    <g transform="translate(18, 30)" className="sim-meta-text">
                      <text x="0" y="0" className="quantum-text-title">QUANTUM PROBABILITY INTEGRATOR</text>
                      <text x="0" y="14">Model: Gaussian Schrodinger Wavefunction Integration</text>
                      <text x="0" y="26">Probability of finding particle in [a, b]: P = 0.8427</text>
                      <text x="0" y="38" className="neural-compute-tag">AI DEEP GRADIENT INFERENCE: COMPLETE (12ms)</text>
                    </g>
                  </svg>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
