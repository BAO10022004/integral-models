import React, { useState } from "react";
import Footer from "../components/common/Footer";

export default function InfoPage({ onNavigate }) {
  const [checklist, setChecklist] = useState([
    { id: 1, label: "Giao diện React Web UI (Vite)", checked: true, desc: "Trình thiết kế tối giản, hỗ trợ xem kết quả phân tích phân phối xác suất và lời giải derivation từng bước trực quan." },
    { id: 2, label: "Mô hình học máy AI (Gradient Boosting)", checked: true, desc: "Mô hình phân loại đa phân lớp đạt F1-Score 95.82%, chịu trách nhiệm nhận diện và phân tích cấu trúc của biểu thức tích phân." },
    { id: 3, label: "Flask API Inference Server", checked: true, desc: "Cung cấp cổng dịch vụ microservice suy luận mô hình AI tốc độ cao chạy trên cổng localhost:5000." },
    { id: 4, label: "Hệ thống backend xử lý chính (.NET 8 Core API)", checked: false, desc: "Đảm nhận xác minh token, tích hợp Firebase Auth, lưu trữ lịch sử bài toán và giao lưu cơ sở dữ liệu." },
    { id: 5, label: "Tích hợp Firebase Authentication", checked: false, desc: "Hệ thống bảo mật người dùng, hỗ trợ xác minh đăng nhập bằng Google Sign-In đồng bộ trực tiếp giữa Client và Backend." }
  ]);

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const completedCount = checklist.filter(item => item.checked).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#030307", color: "#fff", padding: "40px 24px", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
        
        .info-bg-noise {
          position: fixed;
          inset: 0;
          z-index: 0;
          opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .info-title {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 800;
          letter-spacing: -2px;
          text-align: center;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.5));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 24px;
          padding: 28px;
          backdrop-filter: blur(20px);
          transition: all 0.3s;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
        }

        .info-card:hover {
          border-color: rgba(0, 242, 255, 0.15);
          background: rgba(255, 255, 255, 0.02);
        }

        .checklist-item {
          display: flex;
          align-items: start;
          gap: 16px;
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .checklist-item:hover {
          background: rgba(255,255,255,0.02);
          border-color: rgba(255,255,255,0.06);
        }

        .checklist-item.checked {
          border-color: rgba(0, 255, 136, 0.15);
          background: rgba(0, 255, 136, 0.01);
        }

        .checkbox-custom {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 2px solid #555;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #030307;
          font-weight: 800;
          flex-shrink: 0;
          margin-top: 2px;
          transition: all 0.2s;
        }

        .checklist-item.checked .checkbox-custom {
          background: #00ff88;
          border-color: #00ff88;
        }

        .progress-bar-wrap {
          height: 10px;
          background: rgba(255,255,255,0.05);
          border-radius: 99px;
          overflow: hidden;
          margin: 16px 0;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #00f2ff, #7000ff);
          transition: width 0.4s ease-out;
        }
      `}</style>

      <div className="info-bg-noise" />

      {/* Navigation */}
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, position: "relative", zIndex: 10 }}>
        <button onClick={() => onNavigate("intro")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", transition: "0.3s" }}>
          ← Quay Lại
        </button>
        <span style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>INTEGRAL ARCHITECTURE SPEC</span>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <h1 className="info-title">Thông Tin Hệ Thống</h1>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 15, maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Phân tích kiến trúc vi dịch vụ và danh sách kiểm tra tiến độ hoàn thiện hệ thống phân tích tích phân thông minh.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "start" }}>
          
          {/* Left Column - Systems Checklist */}
          <div>
            <div className="info-card" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>ĐỘ HOÀN THIỆN HỆ THỐNG</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#00f2ff" }}>{progressPercent}% COMPLETE</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                Hệ thống cốt lõi phân tích toán học & web-client đã hoàn thiện 100% và đang chạy ổn định. Phân vùng Backend cơ sở dữ liệu và tích hợp Firebase đang được hoàn thiện tích hợp sâu.
              </p>
            </div>

            <div>
              {checklist.map(item => (
                <div 
                  key={item.id} 
                  className={`checklist-item ${item.checked ? "checked" : ""}`}
                  onClick={() => toggleCheck(item.id)}
                >
                  <div className="checkbox-custom">
                    {item.checked && "✓"}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: item.checked ? "#00ff88" : "#fff", marginBottom: 6 }}>{item.label}</h4>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Tech Specs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="info-card">
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 10 }}>🤖 AI Model Architecture</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Algorithm</span>
                  <span style={{ fontWeight: 700 }}>Gradient Boosting Classifier</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Validation Accuracy</span>
                  <span style={{ fontWeight: 700, color: "#00ff88" }}>95.82% F1-Score</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Features Curated</span>
                  <span style={{ fontWeight: 700 }}>Add/Sub, Power, U-Sub, IBP, Trig</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Dataset Volume</span>
                  <span style={{ fontWeight: 700 }}>52,482 Samples</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 10 }}>⚙️ Microservice Endpoints</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Web Application</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 700 }}>localhost:5173</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Flask Server API</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 700 }}>localhost:5000</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>.NET REST Server API</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 700 }}>localhost:5093</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
