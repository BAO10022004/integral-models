import React, { useState } from "react";

export default function TheoryPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "usub" | "ibp" | "trig" | "basic"
  const [expandedFormula, setExpandedFormula] = useState(null);

  const topics = [
    {
      id: "usub_1",
      category: "usub",
      title: "Phương pháp đổi biến số (U-Substitution)",
      formula: String.raw`\int f(g(x)) g'(x) dx = \int f(u) du`,
      explanation: "Phương pháp này đảo ngược quy tắc chuỗi (chain rule) trong đạo hàm. Bằng cách đặt u = g(x), ta thu gọn biểu thức vi phân thành một dạng tích phân cơ bản dễ giải quyết.",
      example: {
        problem: String.raw`\int 2x \cos(x^2) dx`,
        steps: [
          String.raw`Đặt u = x^2, suy ra vi phân du = 2x dx`,
          String.raw`Thay thế vào biểu thức: \int \cos(u) du`,
          String.raw`Giải tích phân cơ bản: = \sin(u) + C`,
          String.raw`Thay lại u = x^2: = \sin(x^2) + C`
        ]
      }
    },
    {
      id: "ibp_1",
      category: "ibp",
      title: "Tích phân từng phần (Integration By Parts)",
      formula: String.raw`\int u dv = u v - \int v du`,
      explanation: "Phương pháp đảo ngược quy tắc tích (product rule) của đạo hàm. Rất hữu ích khi biểu thức tích phân là tích của hai hàm khác loại (như hàm mũ nhân lượng giác, đa thức nhân logarit).",
      example: {
        problem: String.raw`\int x e^x dx`,
        steps: [
          String.raw`Đặt u = x \Rightarrow du = dx`,
          String.raw`Đặt dv = e^x dx \Rightarrow v = e^x`,
          String.raw`Áp dụng công thức: x e^x - \int e^x dx`,
          String.raw`Kết quả: = x e^x - e^x + C`
        ]
      }
    },
    {
      id: "trig_1",
      category: "trig",
      title: "Tích phân hàm lượng giác (Trigonometric Integration)",
      formula: String.raw`\int \sin^n(x) \cos^m(x) dx`,
      explanation: "Sử dụng các đẳng thức lượng giác cơ bản (như sin²x + cos²x = 1 hoặc công thức nhân đôi, hạ bậc) kết hợp phương pháp đổi biến số để giản lược bậc lượng giác.",
      example: {
        problem: String.raw`\int \sin^3(x) dx`,
        steps: [
          String.raw`Tách hạng tử: \int \sin^2(x) \sin(x) dx = \int (1 - \cos^2(x)) \sin(x) dx`,
          String.raw`Đặt u = \cos(x) \Rightarrow du = -\sin(x) dx`,
          String.raw`Thay vào biểu thức: \int -(1 - u^2) du = \int (u^2 - 1) du`,
          String.raw`Giải tích phân: \frac{u^3}{3} - u + C`,
          String.raw`Kết quả: = \frac{\cos^3(x)}{3} - \cos(x) + C`
        ]
      }
    },
    {
      id: "basic_1",
      category: "basic",
      title: "Quy tắc lũy thừa cơ bản (Power Rule)",
      formula: String.raw`\int x^n dx = \frac{x^{n+1}}{n+1} + C \quad (n \neq -1)`,
      explanation: "Công thức nền tảng nhất của giải tích tích phân, áp dụng cho mọi hàm số đa thức lũy thừa bậc n (ngoại trừ n = -1).",
      example: {
        problem: String.raw`\int 3x^2 dx`,
        steps: [
          String.raw`Đưa hằng số ra ngoài: 3 \int x^2 dx`,
          String.raw`Áp dụng quy tắc lũy thừa: 3 \left( \frac{x^3}{3} \right) + C`,
          String.raw`Kết quả: = x^3 + C`
        ]
      }
    }
  ];

  const filteredTopics = activeTab === "all" ? topics : topics.filter(t => t.category === activeTab);

  return (
    <div style={{ minHeight: "100vh", background: "#020205", color: "#fff", padding: "40px 24px", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
        
        .theory-bg-noise {
          position: fixed;
          inset: 0;
          z-index: 0;
          opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .theory-title {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 800;
          letter-spacing: -2px;
          text-align: center;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.5));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .theory-tab-btn {
          padding: 10px 18px;
          border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .theory-tab-btn:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
        }

        .theory-tab-btn.active {
          color: #00f2ff;
          border-color: rgba(0, 242, 255, 0.25);
          background: rgba(0, 242, 255, 0.08);
          box-shadow: 0 0 15px rgba(0, 242, 255, 0.05);
        }

        .theory-accordion-item {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theory-accordion-item:hover {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }

        .theory-accordion-item.open {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(0, 242, 255, 0.15);
        }

        .formula-box {
          font-family: 'JetBrains Mono', monospace;
          background: rgba(0, 242, 255, 0.03);
          border: 1px solid rgba(0, 242, 255, 0.1);
          padding: 12px 18px;
          border-radius: 12px;
          color: #00f2ff;
          font-size: 15px;
          font-weight: 700;
          display: inline-block;
          margin: 10px 0;
        }

        .example-block {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 20px;
          border-radius: 16px;
          margin-top: 16px;
        }

        .step-item {
          display: flex;
          gap: 12px;
          margin-bottom: 10px;
          font-size: 14px;
          line-height: 1.6;
        }

        .step-number {
          background: rgba(255, 255, 255, 0.06);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: #00f2ff;
          flex-shrink: 0;
        }
      `}</style>

      <div className="theory-bg-noise" />

      {/* Navigation */}
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, position: "relative", zIndex: 10 }}>
        <button onClick={() => onNavigate("intro")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", transition: "0.3s" }}>
          ← Quay Lại
        </button>
        <span style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>INTEGRAL STUDY HUB</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <h1 className="theory-title">Kiến Thức Tích Phân</h1>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 15, maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Học tập và tra cứu các phương pháp biến đổi tích phân cốt lõi, chuẩn hóa theo hệ thống giảng dạy toán giải tích nâng cao.
        </p>

        {/* Tabs Filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 32 }}>
          <button className={`theory-tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>Tất Cả</button>
          <button className={`theory-tab-btn ${activeTab === "usub" ? "active" : ""}`} onClick={() => setActiveTab("usub")}>U-Substitution</button>
          <button className={`theory-tab-btn ${activeTab === "ibp" ? "active" : ""}`} onClick={() => setActiveTab("ibp")}>Tích Phân Từng Phần</button>
          <button className={`theory-tab-btn ${activeTab === "trig" ? "active" : ""}`} onClick={() => setActiveTab("trig")}>Lượng Giác</button>
          <button className={`theory-tab-btn ${activeTab === "basic" ? "active" : ""}`} onClick={() => setActiveTab("basic")}>Quy Tắc Lũy Thừa</button>
        </div>

        {/* Accordions List */}
        <div>
          {filteredTopics.map(topic => {
            const isOpen = expandedFormula === topic.id;
            return (
              <div 
                key={topic.id} 
                className={`theory-accordion-item ${isOpen ? "open" : ""}`}
                onClick={() => setExpandedFormula(isOpen ? null : topic.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: isOpen ? "#00f2ff" : "#fff" }}>{topic.title}</h3>
                  <span style={{ fontSize: 18, color: "rgba(255,255,255,0.3)" }}>{isOpen ? "−" : "+"}</span>
                </div>

                <div className="formula-box">
                  {topic.formula}
                </div>

                {isOpen && (
                  <div style={{ marginTop: 16, animation: "fadeSlide .3s ease-out" }} onClick={(e) => e.stopPropagation()}>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 20 }}>{topic.explanation}</p>
                    
                    <div className="example-block">
                      <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 12, letterSpacing: "0.08em" }}>VÍ DỤ CHI TIẾT</div>
                      <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
                        Giải biểu thức: {topic.example.problem}
                      </div>
                      
                      <div>
                        {topic.example.steps.map((step, idx) => (
                          <div key={idx} className="step-item">
                            <span className="step-number">{idx + 1}</span>
                            <span style={{ color: "rgba(255,255,255,0.7)" }}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
