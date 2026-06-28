import React, { useState, useEffect } from "react";
import "../../styles/HistoryApplicationsSection.css";
import BeamGridBackground from "../lightswind/BeamGridBackground";

const ERAS_APPLICATIONS = [
  {
    id: "1687",
    title: "Cơ học thiên thể & Thiên văn học",
    subtitle: "Kỷ nguyên cổ điển (1687 - 1800)",
    pioneer: "Sir Isaac Newton & Johannes Kepler",
    impact: "Tính toán quỹ đạo của các hành tinh quanh Mặt Trời, xác định chu kỳ thiên thể và thiết lập định luật vạn vật hấp dẫn.",
    equation: "A = \\int_{t_0}^{t_1} \\frac{1}{2} r^2 \\frac{d\\theta}{dt} dt",
    equationDesc: "Tích phân diện tích quét của quỹ đạo hình elip theo thời gian (Định luật Kepler thứ hai).",
    techBadge: "Vật lý Newton",
    simulationType: "orbit",
    description: "Với sự ra đời của phép tích phân, Newton đã chứng minh rằng định luật vạn vật hấp dẫn dạng nghịch đảo bình phương dẫn đến quỹ đạo hình elip một cách toán học. Việc tích phân diện tích quét cho phép dự đoán hoàn hảo vị trí hành tinh tại bất kỳ thời điểm nào trong tương lai."
  },
  {
    id: "1865",
    title: "Điện động lực học & Dòng điện xoay chiều",
    subtitle: "Kỷ nguyên công nghiệp (1865 - 1950)",
    pioneer: "James Clerk Maxwell & Nikola Tesla",
    impact: "Phát minh mạng lưới dòng điện xoay chiều (AC), thiết kế động cơ điện cảm ứng và truyền tải sóng điện từ không dây.",
    equation: "\\Phi_B = \\iint_S \\mathbf{B} \\cdot d\\mathbf{a}",
    equationDesc: "Tích phân mặt của từ thông tạo ra lực điện động cảm ứng (Định luật cảm ứng Faraday-Maxwell).",
    techBadge: "Phương trình Maxwell",
    simulationType: "electromagnetic",
    description: "Tích phân mật độ từ trường trên một diện tích bề mặt (từ thông) cho phép Faraday và Maxwell thiết lập định luật cảm ứng điện từ. Đây trở thành nguyên lý kỹ thuật cốt lõi mà Tesla sử dụng để chế tạo máy phát điện xoay chiều, thắp sáng toàn cầu."
  },
  {
    id: "1969",
    title: "Hàng không vũ trụ & Điều khiển dẫn đường tên lửa",
    subtitle: "Thời đại vũ trụ (1969 - 2000)",
    pioneer: "Đội ngũ phần mềm Apollo của NASA & Rudolf E. Kálmán",
    impact: "Dẫn đường đưa con người đáp xuống Mặt Trăng (Apollo 11), điều khiển tên lửa hành trình thời gian thực và định vị vệ tinh GPS.",
    equation: "\\mathbf{v}(t) = \\mathbf{v}_0 + \\int_{0}^{t} \\left( \\frac{\\mathbf{F}_{thrust}(\\tau) - \\mathbf{F}_{drag}(\\tau)}{m(\\tau)} + \\mathbf{g}(\\tau) \\right) d\\tau",
    equationDesc: "Tích phân vectơ của lực đẩy và lực cản biến thiên để tính toán vận tốc tàu vũ trụ và quỹ đạo bay.",
    techBadge: "Dẫn đường vũ trụ",
    simulationType: "rocket",
    description: "Để đưa các phi hành gia Apollo hạ cánh an toàn xuống bề mặt Mặt Trăng, Máy tính Dẫn đường Apollo (AGC) liên tục thực hiện tích phân các số đọc gia tốc từ thiết bị IMU. Tích phân hai lớp thời gian thực chuyển đổi gia tốc biến thiên thành vận tốc và tọa độ không gian chính xác."
  },
  {
    id: "2026",
    title: "Trí tuệ nhân tạo & Vật lý lượng tử",
    subtitle: "Ranh giới AI & Lượng tử (2000 - 2026+)",
    pioneer: "Các nhà tiên phong về Học sâu & Erwin Schrödinger",
    impact: "Huấn luyện mạng nơ-ron sâu để giải các hệ tích phân giải tích phức tạp, mô phỏng cơ học lượng tử và tối ưu hóa quỹ đạo robot tự hành.",
    equation: "P(a \\le x \\le b) = \\int_{a}^{b} |\\Psi(x, t)|^2 dx",
    equationDesc: "Tích phân mật độ xác suất của hàm sóng Schrödinger để tính toán vị trí hạt lượng tử.",
    techBadge: "Trí tuệ lượng tử & Nơ-ron",
    simulationType: "quantum",
    description: "In quantum physics, integrating the squared amplitude of the wave function is the only way to calculate particle presence probability. Today, Deep Learning AI models utilize multi-dimensional integration optimizations (gradient descent backpropagation) to solve complex symbolic systems in microseconds."
  }
];

export default function HistoryApplicationsSection() {
  const [activeEraId, setActiveEraId] = useState("2026");
  const [isPlaying, setIsPlaying] = useState(true);
  const [detailModal, setDetailModal] = useState(null);
  const activeEra = ERAS_APPLICATIONS.find(e => e.id === activeEraId);

  const [orbitAngle, setOrbitAngle] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);
  const [rocketY, setRocketY] = useState(120);
  const [rocketTargetY, setRocketTargetY] = useState(120);
  const [quantumTime, setQuantumTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setOrbitAngle(prev => (prev + 1.2) % 360);
      setWaveOffset(prev => (prev + 0.1) % (Math.PI * 2));
      setQuantumTime(prev => prev + 0.05);
    }, 16);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleIgniteThrust = () => {
    if (rocketTargetY > 50) {
      setRocketTargetY(prev => prev - 25);
    } else {
      setRocketTargetY(120);
    }
  };

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

  const a = 110;
  const b = 75;
  const e = Math.sqrt(1 - (b * b) / (a * a));
  const orbitRad = (orbitAngle * Math.PI) / 180;
  const focusX = a * e;
  const planetX = a * Math.cos(orbitRad) - focusX;
  const planetY = b * Math.sin(orbitRad);

  return (
    <section className="history-snap-section history-apps-section">
      {/* Beam Grid Background */}
      <BeamGridBackground
        gridSize={45}
        darkGridColor="#0d1117"
        gridColor="#0d1117"
        beamColor="rgba(0, 210, 255, 0.7)"
        darkBeamColor="rgba(0, 242, 255, 0.8)"
        beamSpeed={0.12}
        beamThickness={2}
        beamGlow={true}
        glowIntensity={35}
        beamCount={10}
        extraBeamCount={4}
        idleSpeed={1.2}
        interactive={true}
        asBackground={true}
        showFade={true}
        fadeIntensity={15}
        fadeColor="#000000"
      />

      <div className="apps-wrapper">

        {/* Header */}
        <div className="apps-header">
          <h2 className="apps-title">Cách Tích Phân Định Hình Thế Giới Hiện Đại</h2>
        </div>

        {/* Body: Info card (left) + Simulator background + Timeline rail (right) */}
        <div className="apps-body">

          {/* Left: Glassmorphic info card — compact summary */}
          <div className="apps-info-panel">
            <div className="info-glass-card">

              <div className="info-card-header">
                <span className={`era-tag-badge badge-${activeEra.id}`}>{activeEra.techBadge}</span>
                <span className="era-subtitle">{activeEra.subtitle}</span>
              </div>

              <h3 className="era-title-text">{activeEra.title}</h3>

              <div className="info-row">
                <span className="row-label">Nhà tiên phong:</span>
                <span className="row-val highlight-pioneer">{activeEra.pioneer}</span>
              </div>

              <div className="info-row">
                <span className="row-label">Tác động:</span>
                <span className="row-val era-impact-short">{activeEra.impact}</span>
              </div>

              <div className="formula-glass-board">
                <div className="formula-board-header">PHƯƠNG TRÌNH CỐT LÕI</div>
                <div className="formula-latex">
                  <span className="latex-expression">
                    {activeEra.id === "1687" && "A = ∫ [t₀ → t₁] ½ r² (dθ/dt) dt"}
                    {activeEra.id === "1865" && "Φ_B = ∬_S B · da"}
                    {activeEra.id === "1969" && "v(t) = v₀ + ∫ [0 → t] ( (F_thrust - F_drag)/m + g ) dτ"}
                    {activeEra.id === "2026" && "P(a ≤ x ≤ b) = ∫ [a → b] |Ψ(x, t)|² dx"}
                  </span>
                </div>
              </div>

              <div className="info-controls-row" style={{ marginTop: "auto" }}>
                <button
                  className={`sim-play-btn ${isPlaying ? "playing" : ""}`}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? "Tạm dừng mô phỏng ⏸" : "Tiếp tục mô phỏng ▶"}
                </button>
                {activeEra.id === "1969" && (
                  <button className="sim-action-btn rocket-ignite" onClick={handleIgniteThrust}>
                    Phóng kích đẩy 🚀
                  </button>
                )}
              </div>

              <button
                className="era-detail-btn"
                onClick={() => setDetailModal(activeEra)}
              >
                <span>Xem chi tiết đầy đủ</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

            </div>
          </div>

          {/* Background: Full-height simulator (absolute, behind everything) */}
          <div className="apps-visual-panel">
            <div className={`simulator-screen screen-theme-${activeEra.id}`}>

              {activeEra.id === "1969" && <div className="sim-crt-scanlines" />}
              {activeEra.id === "2026" && <div className="sim-neural-grid" />}

              {activeEra.simulationType === "orbit" && (
                <div className="svg-container">
                  <svg className="sim-svg" viewBox="-200 -120 400 240">
                    <ellipse cx={-focusX} cy="0" rx={a} ry={b} className="orbit-path-line" />
                    <path d={`M ${-focusX} 0 L ${planetX} ${planetY} A ${a} ${b} 0 0 ${planetY < 0 ? 0 : 1} ${a * Math.cos(orbitRad - 0.25) - focusX} ${b * Math.sin(orbitRad - 0.25)} Z`} className="orbit-swept-area" />
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
                      <text x="0" y="0">Quỹ đạo: Elip (e = {e.toFixed(3)})</text>
                      <text x="0" y="12">Góc quét: {orbitAngle.toFixed(1)}°</text>
                      <text x="0" y="24">Tích phân diện tích dA/dt = Hằng số (Kepler II)</text>
                    </g>
                  </svg>
                </div>
              )}

              {activeEra.simulationType === "electromagnetic" && (
                <div className="svg-container">
                  <svg className="sim-svg" viewBox="0 0 400 240">
                    <line x1="20" y1="120" x2="380" y2="120" className="osc-grid-axis" />
                    <path d={Array.from({ length: 120 }, (_, i) => { const x = 20 + i * 3; const rad = (i / 120) * Math.PI * 4 + waveOffset; const y = 120 + Math.sin(rad) * 60; return `${i === 0 ? "M" : "L"} ${x} ${y}`; }).join(" ")} className="osc-sine-wave" />
                    <path d={Array.from({ length: 120 }, (_, i) => { const x = 20 + i * 3; const rad = (i / 120) * Math.PI * 4 + waveOffset; const y = 120 + Math.cos(rad) * 60; return `${i === 0 ? "M" : "L"} ${x} ${y}`; }).join(" ")} className="osc-cosine-wave" />
                    <g transform="translate(100, 205)" className="osc-coil-graphics">
                      <rect x="0" y="0" width="200" height="20" rx="5" className="coil-iron-core" />
                      {Array.from({ length: 8 }).map((_, i) => (<path key={i} d={`M ${15 + i * 24} -5 C ${15 + i * 24} 25, ${25 + i * 24} 25, ${25 + i * 24} -5`} className="coil-copper-turns" />))}
                      <text x="100" y="32" className="osc-text coil-label" textAnchor="middle">cuộn cảm ứng (stator động cơ AC)</text>
                    </g>
                    <g transform="translate(25, 30)" className="sim-meta-text">
                      <rect x="-5" y="-5" width="230" height="40" rx="4" className="legend-bg" />
                      <line x1="0" y1="10" x2="30" y2="10" className="osc-legend-sine" />
                      <text x="35" y="14">Từ thông B(t) [Sin]</text>
                      <line x1="0" y1="24" x2="30" y2="24" className="osc-legend-cosine" />
                      <text x="35" y="28">Dòng điện cảm ứng I(t) = ∫ B dA [Cos]</text>
                    </g>
                  </svg>
                </div>
              )}

              {activeEra.simulationType === "rocket" && (
                <div className="svg-container">
                  <svg className="sim-svg" viewBox="0 0 400 240">
                    <path d="M 0 210 Q 100 190 200 215 T 400 205 L 400 240 L 0 240 Z" className="moon-ground" />
                    <rect x="160" y="200" width="80" height="6" className="landing-pad" />
                    <text x="200" y="222" className="osc-text lander-pad-text" textAnchor="middle">điểm đáp mục tiêu (căn cứ Tĩnh Lặng)</text>
                    <line x1="200" y1="20" x2="200" y2="200" className="rocket-projection-line" />
                    <line x1="120" y1={rocketY + 20} x2="200" y2={rocketY + 20} className="rocket-altitude-indicator" />
                    <g transform={`translate(200, ${rocketY})`}>
                      {rocketTargetY < rocketY && <path d="M -10 20 L 0 45 L 10 20 Z" className="rocket-fire-thrust" />}
                      <rect x="-18" y="-12" width="36" height="24" rx="4" className="apollo-body-outer" />
                      <circle cx="0" cy="-3" r="10" className="apollo-cabin" />
                      <line x1="-18" y1="12" x2="-25" y2="24" className="apollo-lander-leg" />
                      <line x1="18" y1="12" x2="25" y2="24" className="apollo-lander-leg" />
                      <circle cx="-25" cy="24" r="4" className="apollo-footpad" />
                      <circle cx="25" cy="24" r="4" className="apollo-footpad" />
                    </g>
                    <g transform="translate(18, 30)" className="sim-telemetry-text">
                      <text x="0" y="0">MÀN HÌNH THEO DÕI APOLLO DSKY (AGC)</text>
                      <text x="0" y="16">ĐỘ CAO: {((200 - rocketY) * 23.4).toFixed(1)} MÉT</text>
                      <text x="0" y="28">VẬN TỐC THẲNG ĐỨNG: {(-(rocketTargetY - rocketY) * 6.2).toFixed(2)} M/S</text>
                      <text x="0" y="40">TÍCH PHÂN GIA TỐC: v(t) = ∫ a(t) dt</text>
                      <text x="0" y="52" className="telemetry-status">TRẠNG THÁI: HẠ CÁNH ỔN ĐỊNH</text>
                    </g>
                  </svg>
                </div>
              )}

              {activeEra.simulationType === "quantum" && (
                <div className="svg-container">
                  <svg className="sim-svg" viewBox="0 0 400 240">
                    <path d={Array.from({ length: 150 }, (_, i) => { const x = 10 + i * 2.5; const basePhase = (i / 150) * Math.PI * 6; const envelope = Math.exp(-Math.pow((i - 75) / 45, 2)); const y = 120 + Math.sin(basePhase - quantumTime * 2.5) * 65 * envelope; return `${i === 0 ? "M" : "L"} ${x} ${y}`; }).join(" ")} className="quantum-prob-wave" />
                    <line x1="120" y1="30" x2="120" y2="210" className="quantum-boundary-line" />
                    <line x1="280" y1="30" x2="280" y2="210" className="quantum-boundary-line" />
                    <text x="123" y="45" className="quantum-boundary-text">a</text>
                    <text x="283" y="45" className="quantum-boundary-text">b</text>
                    <path d={`M 120 120 ` + Array.from({ length: 65 }, (_, i) => { const idx = 44 + i; const x = 10 + idx * 2.5; const basePhase = (idx / 150) * Math.PI * 6; const envelope = Math.exp(-Math.pow((idx - 75) / 45, 2)); const y = 120 + Math.sin(basePhase - quantumTime * 2.5) * 65 * envelope; return `L ${x} ${y}`; }).join(" ") + ` L 280 120 Z`} className="quantum-shaded-integral" />
                    <g className="neural-nodes-overlay">
                      <circle cx="200" cy="120" r="5" className="neural-node active" />
                      <circle cx="160" cy="70" r="4" className="neural-node" />
                      <circle cx="240" cy="170" r="4" className="neural-node active" />
                      <circle cx="280" cy="90" r="4" className="neural-node" />
                      <circle cx="120" cy="150" r="4" className="neural-node active" />
                      <path d="M 120 150 L 160 70 M 160 70 L 200 120 M 200 120 L 240 170 M 240 170 L 280 90" className="neural-connection-lines" />
                    </g>
                    <g transform="translate(18, 30)" className="sim-meta-text">
                      <text x="0" y="0" className="quantum-text-title">BỘ TÍCH PHÂN XÁC SUẤT LƯỢNG TỬ</text>
                      <text x="0" y="14">Mô hình: Tích phân hàm sóng Schrödinger Gaussian</text>
                      <text x="0" y="26">Xác suất tìm thấy hạt trong khoảng [a, b]: P = 0.8427</text>
                      <text x="0" y="38" className="neural-compute-tag">SUY LUẬN GIẢM ĐỘ DỐC AI SÂU: HOÀN THÀNH (12ms)</text>
                    </g>
                  </svg>
                </div>
              )}

            </div>
          </div>

          {/* Right: Vertical Era Timeline Rail */}
          <div className="apps-timeline-rail">
            <div className="timeline-rail-line" />
            {ERAS_APPLICATIONS.map(era => (
              <button
                key={era.id}
                className={`timeline-era-node tab-${era.id} ${activeEraId === era.id ? "active" : ""}`}
                onClick={() => {
                  setActiveEraId(era.id);
                  if (era.id === "1969") { setRocketY(120); setRocketTargetY(120); }
                }}
              >
                <div className="timeline-node-dot" />
                <div className="timeline-node-content">
                  <span className="timeline-node-year">{era.id}</span>
                  <span className="timeline-node-label">{era.title.split(" & ")[0]}</span>
                </div>
              </button>
            ))}
          </div>

        </div>{/* end apps-body */}

      </div>

      {/* ===== DETAIL MODAL ===== */}
      {detailModal && (
        <div
          className="era-modal-overlay"
          onClick={() => setDetailModal(null)}
        >
          <div
            className={`era-modal-card screen-theme-${detailModal.id}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button className="era-modal-close" onClick={() => setDetailModal(null)}>✕</button>

            {/* Header */}
            <div className="era-modal-header">
              <span className={`era-tag-badge badge-${detailModal.id}`}>{detailModal.techBadge}</span>
              <span className="era-subtitle" style={{ marginLeft: 10 }}>{detailModal.subtitle}</span>
            </div>

            <h2 className="era-modal-title">{detailModal.title}</h2>

            {/* Pioneers row */}
            <div className="era-modal-row">
              <span className="era-modal-label">Nhà tiên phong</span>
              <span className="era-modal-val highlight-pioneer">{detailModal.pioneer}</span>
            </div>

            {/* Formula */}
            <div className="formula-glass-board era-modal-formula">
              <div className="formula-board-header">PHƯƠNG TRÌNH CỐT LÕI</div>
              <div className="formula-latex">
                <span className="latex-expression" style={{ fontSize: "clamp(1rem,1.6vw,1.35rem)" }}>
                  {detailModal.id === "1687" && "A = ∫ [t₀ → t₁] ½ r² (dθ/dt) dt"}
                  {detailModal.id === "1865" && "Φ_B = ∬_S B · da"}
                  {detailModal.id === "1969" && "v(t) = v₀ + ∫ [0 → t] ( (F_thrust − F_drag)/m + g ) dτ"}
                  {detailModal.id === "2026" && "P(a ≤ x ≤ b) = ∫ [a → b] |Ψ(x, t)|² dx"}
                </span>
              </div>
              <div className="formula-desc">{detailModal.equationDesc}</div>
            </div>

            {/* Impact */}
            <div className="era-modal-row">
              <span className="era-modal-label">Tác động thực tế</span>
              <span className="era-modal-val">{detailModal.impact}</span>
            </div>

            {/* Full description */}
            <p className="era-modal-desc">{detailModal.description}</p>
          </div>
        </div>
      )}
    </section>
  );
}
