import React, { useState } from "react";

export default function ContactPage({ onNavigate }) {
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
      setTimeout(() => setSubmitted(false), 5000); // Clear toast after 5s
    }, 1500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#020205", color: "#fff", padding: "40px 24px", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
        
        .contact-bg-noise {
          position: fixed;
          inset: 0;
          z-index: 0;
          opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .contact-title {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 800;
          letter-spacing: -2px;
          text-align: center;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.5));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .contact-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 24px;
          padding: 32px;
          backdrop-filter: blur(20px);
          transition: all 0.3s;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
        }

        .contact-card:hover {
          border-color: rgba(0, 242, 255, 0.15);
        }

        .contact-input {
          width: 100%;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          color: #fff;
          padding: 14px;
          border-radius: 12px;
          outline: none;
          transition: all 0.3s;
          font-family: inherit;
          font-size: 14px;
          margin-top: 6px;
        }

        .contact-input:focus {
          border-color: #00f2ff;
          background: rgba(0,242,255,0.02);
          box-shadow: 0 0 15px rgba(0,242,255,0.1);
        }

        .btn-submit {
          width: 100%;
          background: linear-gradient(135deg, #00f2ff, #7000ff);
          border: none;
          color: white;
          font-weight: 700;
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(112,0,255,0.25);
          font-size: 15px;
        }

        .btn-submit:hover {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(0,242,255,0.35);
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .contact-info-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 16px;
          padding: 18px;
          transition: all 0.3s;
        }

        .contact-info-item:hover {
          border-color: rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
        }

        .toast-success {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: rgba(0,255,136,0.1);
          border: 1px solid rgba(0,255,136,0.25);
          color: #00ff88;
          padding: 16px 24px;
          border-radius: 16px;
          backdrop-filter: blur(20px);
          font-weight: 700;
          font-size: 14px;
          z-index: 1000;
          box-shadow: 0 10px 30px rgba(0, 255, 136, 0.05);
          animation: fadeSlide .3s ease-out;
        }
      `}</style>

      <div className="contact-bg-noise" />

      {/* Toast Notification */}
      {submitted && (
        <div className="toast-success">
          ✓ Gửi thông tin thành công! Chúng tôi sẽ phản hồi lại bạn sớm nhất.
        </div>
      )}

      {/* Navigation */}
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, position: "relative", zIndex: 10 }}>
        <button onClick={() => onNavigate("intro")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", transition: "0.3s" }}>
          ← Quay Lại
        </button>
        <span style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>GET IN TOUCH</span>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <h1 className="contact-title">Liên Hệ Với Chúng Tôi</h1>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 15, maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Có câu hỏi hoặc muốn đóng góp ý kiến về Hệ thống Tích phân AI? Hãy gửi thư cho chúng tôi ngay bây giờ.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 32, alignItems: "start" }}>
          
          {/* Left Column - Contact Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="contact-info-item">
              <span style={{ fontSize: 24 }}>✉️</span>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>EMAIL</h4>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginTop: 4 }}>support@integral.ai</p>
              </div>
            </div>

            <div className="contact-info-item">
              <span style={{ fontSize: 24 }}>📞</span>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>HOTLINE</h4>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginTop: 4 }}>+84 (0) 90 123 4567</p>
              </div>
            </div>

            <div className="contact-info-item">
              <span style={{ fontSize: 24 }}>📍</span>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>ĐỊA CHỈ</h4>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginTop: 4 }}>Học viện Công nghệ Bưu chính Viễn thông, Hà Nội</p>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="contact-card">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Họ & Tên</label>
                <input 
                  type="text" 
                  className="contact-input" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="Nhập tên của bạn"
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Email Liên Hệ</label>
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
                <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Lời Nhắn</label>
                <textarea 
                  className="contact-input" 
                  value={formData.message} 
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                  placeholder="Bạn cần hỗ trợ điều gì..."
                  rows="4"
                  style={{ resize: "none" }}
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit" 
                disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
              >
                {isSubmitting ? "Đang Gửi..." : "Gửi Lời Nhắn"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
