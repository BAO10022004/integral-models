import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Image, Video, Monitor, LayoutGrid, Type, RotateCcw,
  Save, CheckCircle, ChevronLeft, ChevronRight, Trash2, Link2
} from "lucide-react";
import MediaPicker from "./MediaPicker";
import { DOTNET_API_URL } from "../../config";
import "../../styles/AdminTabs.css";

export default function AdminLandingTab() {
  // ─── Core config ────────────────────────────────────────────────────────
  const [btnText, setBtnText] = useState("Explore Now");
  const [backgroundType, setBackgroundType] = useState("video");

  // Logo
  const [logoUrl, setLogoUrl] = useState("");

  // Video bg
  const [videoUrl, setVideoUrl] = useState("");

  // Album
  const [albumImages, setAlbumImages] = useState([]);

  // Category images  { history | theory | ai | info | contact }
  const [categoryImages, setCategoryImages] = useState({
    history: "", theory: "", ai: "", info: "", contact: ""
  });

  const categoryLabels = {
    history: "Lịch sử phát triển",
    theory: "Kiến thức (Theory)",
    ai: "AI Solver",
    info: "Thông tin (Info)",
    contact: "Liên hệ (Contact)"
  };

  // Website Title & Favicon
  const [websiteTitle, setWebsiteTitle] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  // Toast
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  // ─── Load from localStorage ──────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("landing_config");
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setBtnText(p.btnText || "Explore Now");
        setBackgroundType(p.backgroundType || "video");
        setLogoUrl(p.logoUrl || "");
        setVideoUrl(p.videoUrl || "");
        setAlbumImages(p.albumImages || []);
      } catch (e) { console.error("Failed to load landing config", e); }
    }

    const storedCat = localStorage.getItem("landing_category_images");
    if (storedCat) {
      try { setCategoryImages(JSON.parse(storedCat)); } catch (e) { console.error(e); }
    }

    const storedTitle = localStorage.getItem("website_title") || "Integral.AI — High-Performance AI Calculus Solver";
    setWebsiteTitle(storedTitle);

    const storedFavicon = localStorage.getItem("website_favicon") || "/favicon.svg";
    setFaviconUrl(storedFavicon);
  }, []);

  // ─── Album helpers ───────────────────────────────────────────────────────
  const addAlbumImage = (base64) => setAlbumImages(prev => [...prev, base64]);

  const deleteAlbumImage = (idx) =>
    setAlbumImages(prev => prev.filter((_, i) => i !== idx));

  const swapAlbumImage = (i, j) => {
    if (i < 0 || j < 0 || i >= albumImages.length || j >= albumImages.length) return;
    setAlbumImages(prev => {
      const next = [...prev];[next[i], next[j]] = [next[j], next[i]]; return next;
    });
  };

  // ─── Save / Reset ────────────────────────────────────────────────────────
  const handleSave = () => {
    try {
      const config = { btnText, backgroundType, logoUrl, videoUrl, albumImages };
      localStorage.setItem("landing_config", JSON.stringify(config));
      localStorage.setItem("landing_category_images", JSON.stringify(categoryImages));

      // Save website title and favicon
      localStorage.setItem("website_title", websiteTitle);
      localStorage.setItem("website_favicon", faviconUrl);

      // Apply changes immediately to tab
      document.title = websiteTitle;
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;

      showToast("success", "Cấu hình đã được lưu thành công!");
    } catch {
      showToast("error", "Lỗi lưu trữ: dữ liệu quá lớn! Hãy dùng đường dẫn URL thay vì upload trực tiếp.");
    }
  };

  const handleReset = () => {
    if (!window.confirm("Bạn có chắc muốn khôi phục cấu hình mặc định?")) return;
    localStorage.removeItem("landing_config");
    localStorage.removeItem("landing_category_images");
    localStorage.removeItem("website_title");
    localStorage.removeItem("website_favicon");

    setBtnText("Explore Now");
    setBackgroundType("video");
    setLogoUrl("");
    setVideoUrl("");
    setAlbumImages([]);
    setCategoryImages({ history: "", theory: "", ai: "", info: "", contact: "" });

    const defaultTitle = "Integral.AI — High-Performance AI Calculus Solver";
    const defaultFavicon = "/favicon.svg";
    setWebsiteTitle(defaultTitle);
    setFaviconUrl(defaultFavicon);

    // Apply default changes immediately to tab
    document.title = defaultTitle;
    let link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = defaultFavicon;
    }

    showToast("success", "Đã khôi phục cấu hình mặc định thành công!");
  };

  // ─── Shared styles (light theme, square borders) ────────────────────────
  const cardStyle = {
    background: "var(--admin-card-bg)", border: "1px solid var(--admin-card-border)",
    padding: "20px 24px"
  };
  const sectionTitle = {
    fontSize: "13px", fontWeight: "800", color: "var(--admin-text-primary)",
    textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px",
    display: "flex", alignItems: "center", gap: "8px"
  };
  const sectionDesc = {
    fontSize: "12.5px", color: "var(--admin-text-secondary)",
    marginBottom: "20px", lineHeight: "1.5"
  };
  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1px solid var(--admin-input-border)",
    background: "var(--admin-input-bg)", color: "var(--admin-text-primary)",
    fontSize: "13px", outline: "none", fontFamily: "inherit",
    borderRadius: 0, boxSizing: "border-box"
  };
  const labelStyle = {
    fontSize: "11px", fontWeight: "800", color: "var(--admin-text-secondary)",
    textTransform: "uppercase", letterSpacing: "0.5px",
    marginBottom: "6px", display: "block"
  };
  const hintYellow = {
    background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e",
    padding: "10px 14px", fontSize: "12px", lineHeight: "1.6", marginBottom: "16px"
  };
  const hintBlue = {
    background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1",
    padding: "10px 14px", fontSize: "12px", lineHeight: "1.6", marginTop: "12px"
  };

  return (
    <div className="admin-tab-container-nasani">

      {/* ── Page Header ── */}
      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--admin-card-border)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--admin-text-primary)", margin: 0, marginBottom: "6px" }}>
          Cấu hình chung
        </h2>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* ── 1. HERO BUTTON TEXT ── */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Nội dung nút tương tác (Hero)</div>
          <div style={{ maxWidth: "480px" }}>
            <label style={labelStyle}>Nhãn nút tương tác</label>
            <input type="text" style={inputStyle} value={btnText}
              onChange={e => setBtnText(e.target.value)}
              placeholder="Ví dụ: Explore Now hoặc Bắt đầu" />
          </div>
        </div>

        {/* ── 2. BACKGROUND TYPE ── */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Kiểu nền Hero</div>
          <div style={{ display: "flex", gap: "0", border: "1px solid var(--admin-card-border)", width: "fit-content" }}>
            {[
              { val: "video", label: "Video vòng lặp", icon: <Video size={13} /> },
              { val: "album", label: "Album ảnh", icon: <Image size={13} /> }
            ].map(opt => (
              <button key={opt.val} type="button" onClick={() => setBackgroundType(opt.val)} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "10px 20px", fontSize: "13px", fontWeight: "700",
                border: "none", cursor: "pointer", transition: "all .2s",
                background: backgroundType === opt.val ? "var(--admin-text-primary)" : "transparent",
                color: backgroundType === opt.val ? "#fff" : "var(--admin-text-secondary)"
              }}>
                {opt.icon}{opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3. ALBUM MANAGER ── */}
        {backgroundType === "album" && (
          <div style={cardStyle}>
            <div style={sectionTitle}> Quản lý Album ảnh</div>
            <p style={sectionDesc}>Upload ảnh, sắp xếp thứ tự và xóa từng slide trong album slideshow.</p>
            <div style={hintYellow}>
              ⚠️ Kích thước khuyến nghị: <strong>1920×1080 px</strong>. Tối đa <strong>2 MB / ảnh</strong>.
            </div>

            {/* Add image via MediaPicker */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Thêm ảnh vào album</label>
              <MediaPicker
                value=""
                type="image"
                label="Kéo và thả hình vào đây"
                dimensionHint="Width: 1920 px – Height: 1080 px"
                formatHint="(jpg,png,jpeg,gif,webp)"
                maxMB={2}
                onChange={(base64) => { if (base64) addAlbumImage(base64); }}
                onSizeError={(file) => showToast("warning", `File "${file.name}" vượt quá 2MB và đã bị bỏ qua.`)}
              />
            </div>

            {/* Album grid */}
            <label style={{ ...labelStyle, marginBottom: "12px", display: "block" }}>
              ALBUM SLIDES ({albumImages.length} ảnh)
            </label>
            {albumImages.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px",
                border: "2px dashed var(--admin-card-border)",
                color: "var(--admin-text-secondary)", fontSize: "13px"
              }}>
                Chưa có ảnh trong album. Tải lên ảnh ở trên để bắt đầu.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "14px" }}>
                {albumImages.map((img, idx) => (
                  <div key={idx} style={{ border: "1px solid var(--admin-card-border)", overflow: "hidden" }}>
                    <div style={{ position: "relative", height: "100px" }}>
                      <img src={img} alt={`Slide ${idx + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <div style={{
                        position: "absolute", top: "6px", left: "6px",
                        background: "rgba(0,0,0,.7)", color: "#fff",
                        fontSize: "11px", fontWeight: "800", padding: "2px 6px"
                      }}>#{idx + 1}</div>
                    </div>
                    <div style={{ display: "flex", borderTop: "1px solid var(--admin-card-border)" }}>
                      <button type="button" disabled={idx === 0} onClick={() => swapAlbumImage(idx, idx - 1)} style={{ flex: 1, padding: "6px", border: "none", borderRight: "1px solid var(--admin-card-border)", background: "transparent", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? .3 : 1, color: "var(--admin-text-secondary)" }} title="Trái"><ChevronLeft size={14} /></button>
                      <button type="button" disabled={idx === albumImages.length - 1} onClick={() => swapAlbumImage(idx, idx + 1)} style={{ flex: 1, padding: "6px", border: "none", borderRight: "1px solid var(--admin-card-border)", background: "transparent", cursor: idx === albumImages.length - 1 ? "default" : "pointer", opacity: idx === albumImages.length - 1 ? .3 : 1, color: "var(--admin-text-secondary)" }} title="Phải"><ChevronRight size={14} /></button>
                      <button type="button" onClick={() => deleteAlbumImage(idx)} style={{ flex: 1, padding: "6px", border: "none", background: "transparent", cursor: "pointer", color: "#ef4444" }} title="Xóa"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 4. LOGO ── */}
        <div style={cardStyle}>
          <div style={sectionTitle}> Cấu hình Logo</div>
          <div style={hintYellow}>
            ⚠️ <strong>Kích thước khuyến nghị:</strong> rộng 120–240 px (tỷ lệ 1:1 hoặc 2:1). Ảnh tự động thu phóng và cắt xén.
          </div>
          <MediaPicker
            value={logoUrl}
            type="image"
            label="Kéo và thả logo vào đây"
            dimensionHint="Width: 240 px – Height: 120 px"
            formatHint="(png,jpg,jpeg,svg,webp)"
            maxMB={2}
            onChange={setLogoUrl}
            onSizeError={(f) => showToast("error", `Logo "${f.name}" vượt quá 2MB!`)}
          />
        </div>

        {/* ── 5. WEBSITE IDENTITY (TITLE & FAVICON) ── */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Cấu hình Tiêu đề & Favicon</div>
          <p style={sectionDesc}>Tùy chỉnh tiêu đề hiển thị trên tab trình duyệt và biểu tượng favicon đại diện cho trang web.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ maxWidth: "480px" }}>
              <label style={labelStyle}>Tiêu đề Trang Web (Website Title)</label>
              <input
                type="text"
                style={inputStyle}
                value={websiteTitle}
                onChange={e => setWebsiteTitle(e.target.value)}
                placeholder="Ví dụ: Integral.AI — High-Performance AI Calculus Solver"
              />
            </div>

            <div>
              <label style={labelStyle}>Biểu tượng Favicon (Website Favicon)</label>
              <div style={hintYellow}>
                ⚠️ <strong>Kích thước khuyến nghị:</strong> hình vuông (32×32 px hoặc 64×64 px). Tải lên trực tiếp để lưu trữ trên host.
              </div>
              <MediaPicker
                value={faviconUrl}
                type="image"
                accept="image/*"
                label="Kéo và thả favicon vào đây"
                dimensionHint="Width: 32 px – Height: 32 px"
                formatHint="(png,ico,svg,jpg,jpeg,webp)"
                maxMB={1}
                onChange={setFaviconUrl}
                onSizeError={(f) => showToast("error", `Favicon "${f.name}" vượt quá 1MB!`)}
              />
            </div>
          </div>
        </div>

        {/* ── 6. VIDEO BACKGROUND ── */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Video nền SlideShow</div>
          <p style={sectionDesc}>Thay đổi video nền chuyển động trong slideshow trang chủ.</p>
          <div style={hintYellow}>
            ⚠️ <strong>Độ phân giải khuyến nghị:</strong> Full HD (1920×1080 px, tỷ lệ 16:9). Tối đa <strong>3 MB</strong> khi upload trực tiếp.
          </div>
          <MediaPicker
            value={videoUrl}
            type="video"
            accept="video/mp4"
            label="Kéo và thả video vào đây"
            dimensionHint="Width: 1920 px – Height: 1080 px"
            formatHint="(mp4)"
            maxMB={3}
            onChange={setVideoUrl}
            onSizeError={(f) => showToast("warning", `Video "${f.name}" vượt quá 3MB! Hãy sao chép vào /web-ui/src/assets/ rồi dùng đường dẫn URL.`)}
          />
          <div style={hintBlue}>
            <strong>Nhúng video vào project:</strong> Sao chép video vào <code style={{ background: "#e0f2fe", padding: "1px 5px", fontFamily: "monospace" }}>/web-ui/src/assets/</code> rồi nhập tên file thay vì upload để không bị giới hạn localStorage.
          </div>
        </div>

        {/* ── 7. CATEGORY REPRESENTATIVE IMAGES ── */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Ảnh đại diện danh mục (Landing Page)</div>
          <p style={sectionDesc}>Cấu hình ảnh đại diện cho từng mục trên lưới trang chủ. Tỷ lệ khuyến nghị: 9:16 (1080×1920 px). Tối đa 1.5 MB.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {Object.keys(categoryImages).map(key => (
              <div key={key}>
                <label style={{ ...labelStyle, marginBottom: "10px" }}>
                  {categoryLabels[key].toUpperCase()}
                </label>
                <MediaPicker
                  value={categoryImages[key]}
                  type="image"
                  label="Kéo và thả hình vào đây"
                  dimensionHint="Width: 1080 px – Height: 1920 px"
                  formatHint="(jpg,png,jpeg,webp)"
                  maxMB={1.5}
                  onChange={(v) => setCategoryImages(prev => ({ ...prev, [key]: v }))}
                  onSizeError={(f) => showToast("error", `Ảnh "${f.name}" vượt quá 1.5MB!`)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. SAVE / RESET ── */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", paddingTop: "4px", paddingBottom: "24px" }}>
          <button className="search-btn-green btn-purple" onClick={handleSave}
            style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 28px" }}>
            <Save size={14} /> Lưu cấu hình
          </button>
          <button className="search-btn-green" onClick={handleReset}
            style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px" }}>
            <RotateCcw size={14} /> Khôi phục mặc định
          </button>
        </div>

      </div>

      {/* ── Toast ── */}
      {toast.show && createPortal(
        <div style={{
          position: "fixed", bottom: "28px", right: "28px", zIndex: 99999,
          maxWidth: "380px", animation: "fadeSlide .25s ease"
        }}>
          <div style={{
            background: toast.type === "success" ? "#f0fdf4" : toast.type === "warning" ? "#fffbeb" : "#fef2f2",
            border: `1px solid ${toast.type === "success" ? "#86efac" : toast.type === "warning" ? "#fde68a" : "#fca5a5"}`,
            padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: "12px"
          }}>
            <CheckCircle size={18} style={{
              flexShrink: 0, marginTop: "1px",
              color: toast.type === "success" ? "#16a34a" : toast.type === "warning" ? "#d97706" : "#dc2626"
            }} />
            <span style={{
              fontSize: "13px", fontWeight: "600", lineHeight: "1.5",
              color: toast.type === "success" ? "#15803d" : toast.type === "warning" ? "#92400e" : "#991b1b"
            }}>
              {toast.message}
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
