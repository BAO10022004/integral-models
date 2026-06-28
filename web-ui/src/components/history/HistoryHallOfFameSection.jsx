import React, { useState, useEffect } from "react";
import "../../styles/HistoryHallOfFameSection.css";

const GIANTS_DATA = [
  {
    id: "archimedes",
    name: "Archimedes thành Syracuse",
    period: "Khoảng 287 TCN – Khoảng 212 TCN",
    title: "TIÊN PHONG VỀ VÔ CÙNG BÉ",
    bio: "Nhà đa bác người Hy Lạp huyền thoại, người đã đặt nền móng cho phép tính vi tích phân hiện đại từ hơn hai thiên niên kỷ trước. Bằng 'Phương pháp kiệt quệ'—nội tiếp và ngoại tiếp các đa giác đều với số cạnh tăng dần—ông đã tính được diện tích hình tròn, parabol và tính toán xấp xỉ số Pi với độ chính xác cao. Ông là người đầu tiên áp dụng triết lý cốt lõi của giới hạn tích phân để giải quyết các bài toán thể tích hình học.",
    achievement: "Sáng tạo ra Phương pháp kiệt quệ, tiền thân của Tổng Riemann, để tính diện tích parabol và thể tích hình cầu.",
    discoveryTitle: "Phương pháp kiệt quệ",
    quote: "Có những điều dường như không thể tin được đối với hầu hết những người chưa từng nghiên cứu Toán học.",
    avatar: "📐"
  },
  {
    id: "newton",
    name: "Sir Isaac Newton",
    period: "1642 – 1727",
    title: "ĐỒNG SÁNG LẬP GIẢI TÍCH",
    bio: "Nhà khoa học vĩ đại người Anh, người đã tổng hợp 'Phương pháp Fluxions' (phép tính vi phân) và ngược lại (phép tích phân). Bằng cách liên kết tốc độ thay đổi với diện tích tích lũy, Newton đã phát hiện ra Định lý cơ bản của Giải tích. Ông áp dụng toán học này để định nghĩa cơ học cổ điển và lực hấp dẫn thiên thể, chứng minh rằng các định luật của tự nhiên được viết bằng ngôn ngữ của phép tính vi tích phân.",
    achievement: "Tổng hợp Định lý cơ bản của Giải tích, thống nhất tích phân và vi phân thành hai phép toán nghịch đảo.",
    discoveryTitle: "Phương pháp Fluxions",
    quote: "Nếu tôi nhìn được xa hơn, đó là nhờ đứng trên vai những người khổng lồ.",
    avatar: "🍎"
  },
  {
    id: "leibniz",
    name: "Gottfried Wilhelm Leibniz",
    period: "1646 – 1716",
    title: "BẬC THẦY KÝ HIỆU TOÁN HỌC",
    bio: "Nhà triết học và toán học thiên tài người Đức, người đã độc lập đồng sáng lập ra phép tính giải tích. Leibniz nhận ra sức mạnh to lớn của ký hiệu, đưa vào sử dụng chữ 'S' kéo dài (kí hiệu ∫ từ chữ 'summa') làm dấu tích phân và chữ 'd' cho vi phân. Ký hiệu dx/dy thanh nhã của ông, quy tắc tích và quy tắc chuỗi đã tạo nên tiêu chuẩn chung được tất cả các nhà khoa học sử dụng ngày nay.",
    achievement: "Phát triển ký hiệu tích phân (∫) và vi phân (dx) hiện đại, đồng thời thiết lập quy tắc nhân & quy tắc chuỗi.",
    discoveryTitle: "Phép tích phân Leibniz",
    quote: "Thật không xứng đáng khi những người xuất chúng phải lãng phí hàng giờ như nô lệ cho công việc tính toán cơ học.",
    avatar: "✍️"
  },
  {
    id: "riemann",
    name: "Bernhard Riemann",
    period: "1826 – 1866",
    title: "NGƯỜI SÁNG LẬP TÍCH PHÂN CHẶT CHẼ",
    bio: "Nhà toán học mang tính cách mạng người Đức, người đã đưa ra định nghĩa chặt chẽ đầu tiên về tích phân của một hàm số trên một khoảng. Bằng cách giới thiệu 'Tổng Riemann'—chia nhỏ các diện tích thành các phần hình chữ nhật và lấy giới hạn khi chiều rộng tiến về không—ông đã thiết lập phép tính giải tích trên sự chặt chẽ toán học tuyệt đối. Những đột phá hình học của ông sau đó đã giúp Einstein xây dựng thuyết Tương đối tổng quát.",
    achievement: "Định nghĩa Tích phân Riemann một cách chặt chẽ bằng cách sử dụng các phân hoạch hình chữ nhật hữu hạn (Tổng Riemann).",
    discoveryTitle: "Tổng phân hoạch Riemann",
    quote: "Giá như tôi có được các định lý! Khi đó tôi sẽ tìm ra các chứng minh đủ dễ dàng.",
    avatar: "📊"
  },
  {
    id: "lebesgue",
    name: "Henri Lebesgue",
    period: "1875 – 1941",
    title: "TIÊN PHONG THUYẾT ĐO HIỆN ĐẠI",
    bio: "Nhà toán học người Pháp có tầm nhìn xa trông rộng, người đã cách mạng hóa phép tích phân vào đầu thế kỷ 20. Chỉ ra những hạn chế của phương pháp Riemann đối với các hàm số gián đoạn mạnh, ông đã đưa vào Thuyết Đo và 'Tích phân Lebesgue'. Bằng cách phân hoạch dải giá trị (trục y) thay vì tập xác định (trục x), Lebesgue đã xây dựng một lý thuyết tích phân vô cùng mạnh mẽ làm cơ sở cho xác suất hiện đại và giải tích nâng cao.",
    achievement: "Thiết lập Tích phân Lebesgue dựa trên Thuyết Đo, cho phép tích phân các hàm số hỗn loạn/fractal.",
    discoveryTitle: "Phân hoạch dải Lebesgue",
    quote: "Theo tôi, một lý thuyết toán học chỉ có thể được coi là hoàn thiện nếu nó được phổ biến đến tất cả mọi người.",
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
              Đa giác: {numSides} cạnh (\u03C0 \u2248 {(numSides * Math.sin(Math.PI / numSides)).toFixed(5)})
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
              {t > 0.9 ? "Đạt giới hạn: Tiếp tuyến dy/dx" : "Khoảng cát tuyến \u0394x \u2192 0"}
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
              Tích lũy \u222B f(x) dx: {(t * 100).toFixed(0)}%
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
              Số hình chữ nhật (n): {rectCount} (Sai số \u2192 0)
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
              Phân hoạch Lebesgue: {numLevels} (Phân hoạch Độ đo \u03BC)
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
          <span className="hof-badge">NHỮNG VĨ NHÂN TOÁN HỌC</span>
          <h2 className="hof-title">Các Bậc Vĩ Nhân Của Giải Tích</h2>
          <p className="hof-subtitle">
            Khám phá những trí tuệ kiệt xuất đã mở khóa những bí ẩn vô tận của phép tích phân.
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
                  <strong>Khám phá:</strong> {selectedGiant.achievement}
                </div>
              </div>

              {/* Graphical demonstration and quote split */}
              <div className="display-visual-section">
                <div className="visual-graphic-screen">
                  <div className="visual-graphic-title">
                    MÔ PHỎNG: {selectedGiant.discoveryTitle}
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
