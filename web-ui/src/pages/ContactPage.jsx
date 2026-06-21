import React, { useState } from "react";
import Footer from "../components/common/Footer";
import MenuOverlay from "../components/common/MenuOverlay";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/KoaDesign.css";

const PORTFOLIO_URL = "https://bao10022004.github.io/portfolio/";

export default function ContactPage({ onNavigate, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

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

        .contact-hero-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #eef0ff 0%, #fce4f7 40%, #e8f9ff 75%, #f0ffe8 100%);
          z-index: 0;
        }
        .contact-orb-1 { position:absolute; top:4%; left:2%; width:480px; height:480px; border-radius:50%; background:rgba(188,242,255,0.45); filter:blur(100px); pointer-events:none; z-index:1; }
        .contact-orb-2 { position:absolute; top:15%; right:2%; width:520px; height:520px; border-radius:50%; background:rgba(255,170,230,0.35); filter:blur(110px); pointer-events:none; z-index:1; }
        .contact-orb-3 { position:absolute; bottom:0; left:30%; width:400px; height:400px; border-radius:50%; background:rgba(223,255,157,0.3); filter:blur(90px); pointer-events:none; z-index:1; }

        .contact-card {
          background: #ffffff;
          border: 1px solid #e0e0db;
          border-radius: 28px;
          padding: 32px;
          box-shadow: 0 4px 24px rgba(53,50,65,0.04);
          transition: box-shadow 0.25s, border-color 0.25s;
        }
        .contact-card:hover {
          box-shadow: 0 8px 40px rgba(89,46,255,0.08);
          border-color: rgba(89,46,255,0.15);
        }

        .contact-info-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 20px;
          border-radius: 18px;
          border: 1px solid #ededea;
          background: #fafaf8;
          transition: all 0.2s;
          text-decoration: none;
          color: inherit;
        }
        .contact-info-item:hover {
          background: #f4f3ff;
          border-color: rgba(89,46,255,0.18);
          box-shadow: 0 4px 16px rgba(89,46,255,0.07);
        }

        .portfolio-cta {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 22px 24px;
          border-radius: 20px;
          border: 1.5px solid rgba(89,46,255,0.25);
          background: linear-gradient(135deg, #f4f3ff 0%, #fce4f7 100%);
          cursor: pointer;
          transition: all 0.25s;
          text-decoration: none;
          color: inherit;
        }
        .portfolio-cta:hover {
          border-color: rgba(89,46,255,0.5);
          box-shadow: 0 8px 32px rgba(89,46,255,0.12);
          transform: translateY(-2px);
        }

        .contact-input {
          width: 100%;
          background: #f9f9f8;
          border: 1px solid #e0e0db;
          color: #21164c;
          padding: 13px 15px;
          border-radius: 12px;
          outline: none;
          transition: all 0.25s;
          font-family: inherit;
          font-size: 14px;
          margin-top: 6px;
          box-sizing: border-box;
        }
        .contact-input:focus {
          border-color: #592eff;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(89,46,255,0.08);
        }
        .contact-input::placeholder { color: #9ca3af; }

        .btn-submit {
          width: 100%;
          background: linear-gradient(135deg, #592eff, #c026d3);
          border: none;
          color: white;
          font-weight: 700;
          padding: 15px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(89,46,255,0.25);
          font-size: 15px;
          font-family: inherit;
          letter-spacing: -0.01em;
        }
        .btn-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(89,46,255,0.32);
        }
        .btn-submit:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .toast-success {
          position: fixed;
          bottom: 28px;
          right: 28px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
          padding: 14px 22px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
          z-index: 1000;
          box-shadow: 0 8px 24px rgba(22,163,74,0.12);
          display: flex;
          align-items: center;
          gap: 8px;
          animation: toastIn 0.3s cubic-bezier(.4,0,.2,1);
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .field-label {
          font-size: 12px;
          font-weight: 700;
          color: #5f5f69;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          display: block;
          margin-bottom: 4px;
        }
      `}</style>

      {/* ── Toast ── */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            className="toast-success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            ✓ Gửi thông tin thành công! Chúng tôi sẽ phản hồi sớm nhất.
          </motion.div>
        )}
      </AnimatePresence>

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
            Liên Hệ
          </span>
        </div>
        <button className="koa-menu-btn" onClick={() => setMenuOpen(true)}>
          <span className="koa-menu-line" />
          <span className="koa-menu-line" />
        </button>
      </nav>

      <MenuOverlay menuOpen={menuOpen} setMenuOpen={setMenuOpen} onNavigate={onNavigate} user={user} onLogout={onLogout} />

      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden", paddingTop: 80, paddingBottom: 72 }}>
        <div className="contact-hero-bg" />
        <div className="contact-orb-1" />
        <div className="contact-orb-2" />
        <div className="contact-orb-3" />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 640, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
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
            Get In Touch
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              fontWeight: 800, letterSpacing: "-0.03em",
              color: "#21164c", lineHeight: 1.1, marginBottom: 16,
            }}
          >
            Liên Hệ{" "}
            <span style={{
              background: "linear-gradient(90deg,#592eff,#c026d3)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Với Chúng Tôi
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            style={{ fontSize: 15, color: "#5f5f69", lineHeight: 1.7, margin: 0 }}
          >
            Có câu hỏi hoặc muốn đóng góp ý kiến về Hệ thống Tích phân AI? Hãy gửi thư cho chúng tôi ngay bây giờ.
          </motion.p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 80px", display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 28, alignItems: "start" }}>

        {/* Left Column — Info + Portfolio CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Portfolio Link — Primary CTA */}
          <motion.a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: "linear-gradient(135deg,#592eff,#c026d3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, flexShrink: 0,
              boxShadow: "0 4px 14px rgba(89,46,255,0.3)",
            }}>
              👤
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#21164c", marginBottom: 3 }}>
                Portfolio của tác giả
              </div>
              <div style={{ fontSize: 12, color: "#592eff", fontWeight: 600, wordBreak: "break-all" }}>
                bao10022004.github.io/portfolio
              </div>
              <div style={{ fontSize: 11, color: "#5f5f69", marginTop: 4 }}>
                Mở tab mới · Ôn Gia Bảo
              </div>
            </div>
            <span style={{ fontSize: 18, color: "#592eff", flexShrink: 0 }}>↗</span>
          </motion.a>

          {/* Contact info cards */}
          {[
            { icon: "✉️", label: "Email", value: "ongiabao.it10022004@gmail.com" },
            { icon: "🏫", label: "Trường", value: "ĐẠI HỌC GTVT PHÂN HIỆU TẠI HỒ CHÍ MINH" },
            { icon: "💻", label: "GitHub", value: "github.com/BAO10022004" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="contact-info-item"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.18 + i * 0.08 }}
            >
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#21164c" }}>{item.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column — Form */}
        <motion.div
          className="contact-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14 }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 22 }}>
            📨 Gửi lời nhắn
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label className="field-label">Họ &amp; Tên</label>
              <input
                type="text"
                className="contact-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập họ và tên của bạn"
                required
              />
            </div>
            <div>
              <label className="field-label">Email Liên Hệ</label>
              <input
                type="email"
                className="contact-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                required
              />
            </div>
            <div>
              <label className="field-label">Lời Nhắn</label>
              <textarea
                className="contact-input"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Bạn cần hỗ trợ điều gì hoặc muốn đóng góp ý kiến gì..."
                rows="5"
                style={{ resize: "none" }}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi Lời Nhắn →"}
            </button>
          </form>
        </motion.div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
