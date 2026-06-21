import React, { useState } from "react";
import Footer from "../components/common/Footer";
import MenuOverlay from "../components/common/MenuOverlay";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/KoaDesign.css";

const STATUS_ONLINE = "online";
const STATUS_BUILDING = "building";
const STATUS_PENDING = "pending";

const StatusBadge = ({ status }) => {
  const config = {
    online: { label: "Online", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e" },
    building: { label: "Building", color: "#d97706", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b" },
    pending: { label: "Pending", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", dot: "#9ca3af" },
  };
  const c = config[status] || config.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
      letterSpacing: "0.04em", textTransform: "uppercase",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0,
        boxShadow: status === STATUS_ONLINE ? `0 0 6px ${c.dot}` : "none"
      }} />
      {c.label}
    </span>
  );
};

const StatCard = ({ value, label, color = "#592eff", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay }}
    style={{
      background: "#ffffff", border: "1px solid #e0e0db",
      borderRadius: 24, padding: "24px 20px", textAlign: "center",
      boxShadow: "0 2px 16px rgba(53,50,65,0.04)",
    }}
  >
    <div style={{ fontSize: 30, fontWeight: 800, color, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 12, color: "#5f5f69", fontWeight: 600, marginTop: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>{label}</div>
  </motion.div>
);

const SpecRow = ({ label, value, mono = false, accent = false }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "11px 0", borderBottom: "1px solid #f0efec",
    gap: 12,
  }}>
    <span style={{ fontSize: 13, color: "#5f5f69", fontWeight: 500 }}>{label}</span>
    <span style={{
      fontSize: 13, fontWeight: 700,
      color: accent ? "#592eff" : "#21164c",
      fontFamily: mono ? "monospace" : "inherit",
      background: mono ? "#f4f3ff" : "transparent",
      padding: mono ? "2px 8px" : 0,
      borderRadius: mono ? 6 : 0,
    }}>{value}</span>
  </div>
);

export default function InfoPage({ onNavigate, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [checklist, setChecklist] = useState([
    {
      id: 1,
      label: "Giao diện React Web UI (Vite)",
      status: STATUS_ONLINE,
      desc: "Trình thiết kế tối giản, hỗ trợ xem kết quả phân tích xác suất và lời giải từng bước trực quan.",
      icon: "🌐",
    },
    {
      id: 2,
      label: "Mô hình AI (Gradient Boosting)",
      status: STATUS_ONLINE,
      desc: "Phân loại đa phân lớp đạt F1-Score 95.82%, nhận diện và phân tích cấu trúc biểu thức tích phân.",
      icon: "🤖",
    },
    {
      id: 3,
      label: "Flask API Inference Server",
      status: STATUS_ONLINE,
      desc: "Microservice suy luận mô hình AI tốc độ cao, chạy trên cổng localhost:5000.",
      icon: "⚡",
    },
    {
      id: 4,
      label: "Backend .NET 8 Core API",
      status: STATUS_BUILDING,
      desc: "Xác minh token, tích hợp Firebase Auth, lưu trữ lịch sử bài toán và quản lý cơ sở dữ liệu.",
      icon: "⚙️",
    },
    {
      id: 5,
      label: "Firebase Authentication",
      status: STATUS_PENDING,
      desc: "Bảo mật người dùng, xác minh đăng nhập Google Sign-In đồng bộ giữa Client và Backend.",
      icon: "🔐",
    },
  ]);

  const onlineCount = checklist.filter(i => i.status === STATUS_ONLINE).length;
  const progressPercent = Math.round((onlineCount / checklist.length) * 100);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f7f7f5",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: "#353241",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .info-hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #eef0ff 0%, #fce4f7 40%, #e8f9ff 75%, #f0ffe8 100%);
          z-index: 0;
        }
        .info-orb-1 { position:absolute; top:5%; left:3%; width:460px; height:460px; border-radius:50%; background:rgba(188,242,255,0.45); filter:blur(100px); pointer-events:none; z-index:1; }
        .info-orb-2 { position:absolute; top:20%; right:2%; width:500px; height:500px; border-radius:50%; background:rgba(255,170,230,0.35); filter:blur(110px); pointer-events:none; z-index:1; }
        .info-orb-3 { position:absolute; bottom:0; left:25%; width:400px; height:400px; border-radius:50%; background:rgba(223,255,157,0.3); filter:blur(90px); pointer-events:none; z-index:1; }

        .info-card {
          background: #ffffff;
          border: 1px solid #e0e0db;
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 4px 24px rgba(53,50,65,0.04);
          transition: box-shadow 0.25s, border-color 0.25s;
        }
        .info-card:hover {
          box-shadow: 0 8px 40px rgba(89,46,255,0.08);
          border-color: rgba(89,46,255,0.15);
        }

        .checklist-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid #ededea;
          background: #fafaf8;
          transition: all 0.2s;
          cursor: default;
        }
        .checklist-row:hover {
          background: #f4f3ff;
          border-color: rgba(89,46,255,0.15);
        }

        .info-progress-track {
          height: 8px;
          background: #ededea;
          border-radius: 99px;
          overflow: hidden;
          margin: 12px 0 20px;
        }
        .info-progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #592eff, #bc4fff, #2ed6ff);
          transition: width 0.6s cubic-bezier(.4,0,.2,1);
        }

        .endpoint-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 12px;
          background: #f7f7f5;
          border: 1px solid #ededea;
          gap: 12px;
        }

        .section-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 14px;
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="koa-nav" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <button
            onClick={() => onNavigate("intro")}
            style={{
              background: "transparent", border: "none", color: "inherit",
              fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center",
              gap: 6, cursor: "pointer", transition: "0.3s", opacity: 0.75, padding: 0,
            }}
          >
            ← Quay lại
          </button>
          <span style={{ fontSize: "0.68rem", letterSpacing: "0.3em", fontWeight: 800, opacity: 0.55, textTransform: "uppercase" }}>
            Thông Tin Hệ Thống
          </span>
        </div>
        <button className="koa-menu-btn" onClick={() => setMenuOpen(true)}>
          <span className="koa-menu-line" />
          <span className="koa-menu-line" />
        </button>
      </nav>

      <MenuOverlay menuOpen={menuOpen} setMenuOpen={setMenuOpen} onNavigate={onNavigate} user={user} onLogout={onLogout} />

      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden", paddingTop: 80, paddingBottom: 80 }}>
        <div className="info-hero-bg" />
        <div className="info-orb-1" />
        <div className="info-orb-2" />
        <div className="info-orb-3" />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 960, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 14px", borderRadius: 99,
              border: "1px solid rgba(89,46,255,0.25)",
              color: "#592eff", fontSize: 11, fontWeight: 700,
              background: "rgba(89,46,255,0.06)", marginBottom: 20,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}
          >
            Architecture Spec v1.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: 800, letterSpacing: "-0.03em",
              color: "#21164c", lineHeight: 1.1, marginBottom: 16,
            }}
          >
            Thông Tin{" "}
            <span style={{
              background: "linear-gradient(90deg,#592eff,#c026d3)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Hệ Thống
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            style={{ fontSize: 15, color: "#5f5f69", maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.7 }}
          >
            Kiến trúc vi dịch vụ và trạng thái hoàn thiện của hệ thống phân tích tích phân thông minh.
          </motion.p>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, maxWidth: 720, margin: "0 auto" }}>
            <StatCard value="95.82%" label="F1-Score AI" color="#592eff" delay={0.2} />
            <StatCard value="52K+" label="Samples" color="#c026d3" delay={0.25} />
            <StatCard value="3" label="Services" color="#0284c7" delay={0.3} />
            <StatCard value={`${progressPercent}%`} label="Hoàn thiện" color="#16a34a" delay={0.35} />
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "48px 24px 80px", display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 28, alignItems: "start" }}>

        {/* Left — Checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Progress card */}
          <motion.div
            className="info-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "#9ca3af", textTransform: "uppercase" }}>
                Độ hoàn thiện hệ thống
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#592eff" }}>{progressPercent}%</span>
            </div>
            <div className="info-progress-track">
              <div className="info-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <p style={{ fontSize: 13, color: "#5f5f69", lineHeight: 1.6, margin: 0 }}>
              Lõi AI phân tích toán học và web-client đã ổn định. Backend cơ sở dữ liệu và Firebase đang trong giai đoạn tích hợp sâu.
            </p>
          </motion.div>

          {/* Checklist items */}
          <motion.div
            className="info-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            style={{ padding: 20 }}
          >
            <div className="section-label">Trạng thái thành phần</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {checklist.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="checklist-row"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.07 }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#21164c" }}>{item.label}</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <p style={{ fontSize: 12, color: "#5f5f69", lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — Specs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* AI Architecture */}
          <motion.div
            className="info-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
          >
            <div className="section-label">🤖 AI Model Architecture</div>
            <SpecRow label="Algorithm" value="Gradient Boosting Classifier" />
            <SpecRow label="Validation Accuracy" value="95.82% F1-Score" accent />
            <SpecRow label="Features Curated" value="U-Sub, IBP, Trig, PF" />
            <SpecRow label="Dataset Volume" value="52,482 Samples" />
            <SpecRow label="Training Framework" value="scikit-learn / Python" />
            <div style={{ height: 0, borderBottom: "none" }} />
          </motion.div>

          {/* Microservice Endpoints */}
          <motion.div
            className="info-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
          >
            <div className="section-label">⚙️ Microservice Endpoints</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { name: "Web Application", port: "localhost:5173", status: STATUS_ONLINE },
                { name: "Flask AI Server", port: "localhost:5000", status: STATUS_ONLINE },
                { name: ".NET REST API", port: "localhost:5093", status: STATUS_BUILDING },
              ].map((ep) => (
                <div key={ep.port} className="endpoint-row">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#21164c" }}>{ep.name}</div>
                    <code style={{ fontSize: 11, color: "#592eff", fontWeight: 700 }}>{ep.port}</code>
                  </div>
                  <StatusBadge status={ep.status} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            className="info-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
          >
            <div className="section-label">🛠 Tech Stack</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["React + Vite", "Python 3.11", ".NET 8", "FastAPI", "scikit-learn", "KaTeX", "Firebase", "Framer Motion", "Tailwind CSS"].map((tech) => (
                <span key={tech} style={{
                  fontSize: 12, fontWeight: 700, padding: "5px 12px",
                  borderRadius: 99, background: "#f4f3ff",
                  color: "#592eff", border: "1px solid rgba(89,46,255,0.15)",
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
