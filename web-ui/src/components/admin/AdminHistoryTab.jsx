import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Type, Image, Layers, Save, RotateCcw, CheckCircle,
  Plus, Trash2, ChevronLeft, ChevronRight, AlignLeft, Link2
} from "lucide-react";
import MediaPicker from "./MediaPicker";
import "../../styles/AdminTabs.css";
import { DOTNET_API_URL } from "../../config";

// ─── CKEditor 4 wrapper ──────────────────────────────────────────────────────
const CKEditorWrapper = ({ value, onChange }) => {
  const textareaRef = useRef(null);
  const editorRef   = useRef(null);

  useEffect(() => {
    const initEditor = () => {
      if (!textareaRef.current) return;
      const editorId = textareaRef.current.id;
      if (window.CKEDITOR.instances[editorId]) {
        window.CKEDITOR.instances[editorId].destroy(true);
      }
      const editor = window.CKEDITOR.replace(editorId, {
        height: 320, removePlugins: "resize",
        skin: "moono-lisa", allowedContent: true,
      });
      editorRef.current = editor;
      editor.on("instanceReady", () => editor.setData(value || ""));
      editor.on("change", () => onChange(editor.getData()));
    };

    if (!window.CKEDITOR) {
      let script = document.querySelector('script[src*="ckeditor.js"]');
      if (!script) {
        script = document.createElement("script");
        script.src = "https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js";
        script.async = true;
        document.body.appendChild(script);
      }
      const check = setInterval(() => {
        if (window.CKEDITOR) { clearInterval(check); initEditor(); }
      }, 100);
      return () => {
        clearInterval(check);
        editorRef.current?.destroy(true); editorRef.current = null;
      };
    } else {
      initEditor();
      return () => { editorRef.current?.destroy(true); editorRef.current = null; };
    }
  }, []);

  return (
    <div style={{ marginTop: "8px", border: "1px solid var(--admin-input-border)", overflow: "hidden", background: "#fff" }}>
      <textarea
        ref={textareaRef}
        id={`milestone-editor-${Math.floor(Math.random() * 1000000)}`}
        defaultValue={value || ""}
        style={{ width: "100%", height: "200px" }}
      />
    </div>
  );
};

// ─── Image compression helper ─────────────────────────────────────────────────
const compressImage = (file, maxWidth = 1200, maxHeight = 900, quality = 0.7) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      const img = new window.Image();
      img.src = ev.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth; }
        } else {
          if (height > maxHeight) { width = Math.round(width * maxHeight / height); height = maxHeight; }
        }
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminHistoryTab() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [config, setConfig] = useState({
    heroImgUrl: "", showcaseImgUrl: "",
    headline: "The Journey of AI Innovation",
    introText: "The intelligent calculus solver system was born from a desire to bridge the gap between complex mathematical theories and real-world digital applications.\n\nThrough numerous cycles of research and algorithmic optimization, we developed a state-of-the-art action classification model powered by Deep Learning.",
    marqueeImages: []
  });
  const [milestones, setMilestones]               = useState([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [toast, setToast]                         = useState({ show: false, type: "success", message: "" });

  // activeSection driven by sidebar via localStorage
  const [activeSection, setActiveSection] = useState(
    () => localStorage.getItem("admin_history_subtab") || "general"
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const val = localStorage.getItem("admin_history_subtab");
      if (val) setActiveSection(val);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${DOTNET_API_URL}/HistoryTimeline`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        if (data?.config) {
          const c = { ...data.config, marqueeImages: data.config.marqueeImages || [] };
          setConfig(c);
        }
        if (data?.milestones?.length) {
          setMilestones(data.milestones);
          setSelectedMilestoneId(null);
        }
      })
      .catch(() => {
        const stored = localStorage.getItem("history_page_config");
        if (stored) {
          try { const c = JSON.parse(stored); setConfig({ ...c, marqueeImages: c.marqueeImages || [] }); } catch {}
        }
        const sm = localStorage.getItem("history_timeline_milestones");
        if (sm) {
          try {
            const m = JSON.parse(sm);
            setMilestones(m);
            setSelectedMilestoneId(null);
          } catch {}
        }
      });
  }, []);

  // ── Milestone helpers ───────────────────────────────────────────────────────
  const activeMilestone = milestones.find(m => m.id === selectedMilestoneId);

  const handleAddMilestone = () => {
    const nextId = milestones.length > 0 ? Math.max(...milestones.map(m => m.id)) + 1 : 1;
    const m = { id: nextId, year: "2027", title: "Tiêu đề cột mốc mới", image: "", desc: "Mô tả ngắn gọn...", article: "Nội dung bài viết chi tiết...", articleType: "html", url: "" };
    setMilestones(prev => [...prev, m]);
    setSelectedMilestoneId(m.id);
  };

  const handleDeleteMilestone = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa cột mốc này không?")) return;
    const next = milestones.filter(m => m.id !== id);
    setMilestones(next);
    if (selectedMilestoneId === id) setSelectedMilestoneId(next[0]?.id ?? null);
  };

  const handleFieldChange = (field, value) =>
    setMilestones(prev => prev.map(m => m.id === selectedMilestoneId ? { ...m, [field]: value } : m));

  // ── Save / Reset ────────────────────────────────────────────────────────────
  const handleSave = () => {
    const payload = { config, milestones };
    showToast("success", "Đang lưu cấu hình lên server...");
    fetch(`${DOTNET_API_URL}/HistoryTimeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => {
        localStorage.setItem("history_page_config", JSON.stringify(config));
        localStorage.setItem("history_timeline_milestones", JSON.stringify(milestones));
        showToast("success", "Cấu hình đã được lưu lên server thành công!");
      })
      .catch(() => {
        try {
          localStorage.setItem("history_page_config", JSON.stringify(config));
          localStorage.setItem("history_timeline_milestones", JSON.stringify(milestones));
          showToast("warning", "Server ngoại tuyến — đã lưu vào localStorage!");
        } catch {
          showToast("error", "Lỗi lưu trữ: Dữ liệu quá lớn!");
        }
      });
  };

  const handleReset = () => {
    if (!window.confirm("Khôi phục cấu hình mặc định trang Lịch sử?")) return;
    showToast("success", "Đang khôi phục...");
    fetch(`${DOTNET_API_URL}/HistoryTimeline/default`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(def => fetch(`${DOTNET_API_URL}/HistoryTimeline`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(def)
      }).then(() => def))
      .then(def => {
        localStorage.removeItem("history_page_config");
        localStorage.removeItem("history_timeline_milestones");
        const c = { ...def.config, marqueeImages: def.config?.marqueeImages || [] };
        setConfig(c);
        setMilestones(def.milestones || []);
        showToast("success", "Đã khôi phục cấu hình mặc định thành công!");
      })
      .catch(() => showToast("error", "Khôi phục thất bại — server ngoại tuyến!"));
  };

  // ── Shared design tokens (mirrors AdminLandingTab) ─────────────────────────
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
    borderRadius: 0, boxSizing: "border-box", transition: "border-color .2s"
  };
  const labelStyle = {
    fontSize: "11px", fontWeight: "800", color: "var(--admin-text-secondary)",
    textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block"
  };
  const hintYellow = {
    background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e",
    padding: "10px 14px", fontSize: "12px", lineHeight: "1.6", marginBottom: "16px"
  };
  const hintBlue = {
    background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1",
    padding: "10px 14px", fontSize: "12px", lineHeight: "1.6", marginTop: "12px"
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="admin-tab-container-nasani">

      {/* Page Header */}
      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--admin-card-border)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--admin-text-primary)", margin: 0, marginBottom: "6px" }}>
          Quản lý lịch sử {activeSection === "general" ? "— Home" : activeSection === "about" ? "— About us" : activeSection === "milestones" ? "— Lịch sử phát triển" : "— Marquee Album"}
        </h2>
        <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: 0 }}>
          {activeSection === "general" && "Thay đổi ảnh nền Banner Hero (Section 1) hiển thị ở đầu trang Lịch sử."}
          {activeSection === "about" && "Cấu hình tiêu đề, đoạn văn giới thiệu và hình ảnh Showcase (Section 2)."}
          {activeSection === "milestones" && "Quản lý các cột mốc thời gian, tiêu đề, tóm tắt và bài viết chi tiết."}
          {activeSection === "marquee" && "Quản lý bộ sưu tập hình ảnh cuộn 3D ở trang Lịch sử."}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* ══════════════════ SECTION: HOME (Section 1 Banner) ══════════════════ */}
        {activeSection === "general" && (
          <div style={cardStyle}>
            <div style={sectionTitle}><Image size={14} /> Ảnh Banner Hero (Section 1)</div>
            <p style={sectionDesc}>Tùy chỉnh ảnh banner hiển thị toàn chiều rộng phía trên trang Lịch sử.</p>
            <div style={hintYellow}>
              ⚠️ <strong>Kích thước khuyến nghị:</strong> 1920×800 px (tỷ lệ 2.4:1 hoặc 16:9). Ảnh sẽ tự động cắt xén để phủ toàn bề rộng.
            </div>
            <MediaPicker
              value={config.heroImgUrl}
              type="image"
              label="Kéo và thả ảnh banner vào đây"
              dimensionHint="Width: 1920 px – Height: 800 px"
              formatHint="(jpg,png,jpeg,webp)"
              maxMB={5}
              onChange={v => {
                if (!v) { setConfig(p => ({ ...p, heroImgUrl: "" })); return; }
                setConfig(p => ({ ...p, heroImgUrl: v }));
              }}
              onSizeError={f => showToast("error", `Ảnh "${f.name}" quá lớn! Vui lòng dùng ảnh nhỏ hơn 5MB.`)}
            />
          </div>
        )}

        {/* ══════════════════ SECTION: ABOUT US (Texts & Section 2 Showcase) ══════════════════ */}
        {activeSection === "about" && (
          <>
            {/* Text Content */}
            <div style={cardStyle}>
              <div style={sectionTitle}><Type size={14} /> Nội dung văn bản</div>
              <p style={sectionDesc}>Cấu hình tiêu đề chính và đoạn văn giới thiệu câu chuyện hành trình phát triển hệ thống.</p>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Tiêu đề chính (Headline)</label>
                <input type="text" style={inputStyle}
                  value={config.headline}
                  onChange={e => setConfig(p => ({ ...p, headline: e.target.value }))}
                  placeholder="Ví dụ: The Journey of AI Innovation" />
              </div>

              <div>
                <label style={labelStyle}>Đoạn văn giới thiệu (Intro Text)</label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
                  rows={6}
                  value={config.introText}
                  onChange={e => setConfig(p => ({ ...p, introText: e.target.value }))}
                  placeholder="Nhập nội dung giới thiệu..." />
              </div>
            </div>

            {/* Showcase Image */}
            <div style={cardStyle}>
              <div style={sectionTitle}><Image size={14} /> Ảnh Showcase (Section 2)</div>
              <p style={sectionDesc}>Ảnh hiển thị trong khung bên cạnh đoạn văn giới thiệu câu chuyện.</p>
              <div style={hintYellow}>
                ⚠️ <strong>Kích thước khuyến nghị:</strong> 800×600 px (tỷ lệ 4:3). Ảnh được hiển thị trong khung đẹp và sẽ tự động căn phủ.
              </div>
              <MediaPicker
                value={config.showcaseImgUrl}
                type="image"
                label="Kéo và thả ảnh showcase vào đây"
                dimensionHint="Width: 800 px – Height: 600 px"
                formatHint="(jpg,png,jpeg,webp)"
                maxMB={3}
                onChange={v => setConfig(p => ({ ...p, showcaseImgUrl: v }))}
                onSizeError={f => showToast("error", `Ảnh "${f.name}" quá lớn! Vui lòng dùng ảnh nhỏ hơn 3MB.`)}
              />
            </div>
          </>
        )}

        {/* ══════════════════ SECTION: MILESTONES ══════════════════ */}
        {activeSection === "milestones" && selectedMilestoneId === null && (
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div style={sectionTitle}>Danh sách cột mốc lịch sử</div>
                <p style={{ ...sectionDesc, marginBottom: 0 }}>Quản lý các sự kiện, cột mốc phát triển theo thời gian.</p>
              </div>
              <button
                onClick={handleAddMilestone}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "10px 20px", border: "none",
                  background: "var(--admin-text-primary)", color: "#fff",
                  fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit"
                }}
              >
                <Plus size={14} /> Thêm cột mốc mới
              </button>
            </div>

            {milestones.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                border: "2px dashed var(--admin-card-border)",
                color: "var(--admin-text-secondary)", fontSize: "13px"
              }}>
                Chưa có cột mốc nào. Nhấn "Thêm cột mốc mới" ở trên để bắt đầu.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
                {milestones.map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => setSelectedMilestoneId(m.id)}
                    style={{
                      border: "1px solid var(--admin-card-border)",
                      background: "var(--admin-input-bg)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.2s",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--admin-text-primary)"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--admin-card-border)"}
                  >
                    {/* Thumbnail preview */}
                    <div style={{ height: "130px", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                      {m.image ? (
                        <img src={m.image} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Layers size={36} style={{ color: "var(--admin-text-secondary)", opacity: 0.3 }} />
                      )}
                      <div style={{
                        position: "absolute", top: "10px", left: "10px",
                        background: "var(--admin-text-primary)", color: "#fff",
                        fontSize: "11px", fontWeight: "800", padding: "3px 8px"
                      }}>
                        {m.year || "Năm"}
                      </div>
                      
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMilestone(m.id);
                        }}
                        style={{
                          position: "absolute", top: "10px", right: "10px",
                          background: "rgba(239, 68, 68, 0.9)", border: "none",
                          width: "26px", height: "26px", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", cursor: "pointer", padding: 0
                        }}
                        title="Xóa cột mốc"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Meta info */}
                    <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--admin-text-primary)", margin: "0 0 6px 0", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {m.title || "Chưa có tiêu đề"}
                      </h4>
                      <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.5", flex: 1 }}>
                        {m.desc || "Chưa có mô tả ngắn..."}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Add new milestone card */}
                <div 
                  onClick={handleAddMilestone}
                  style={{
                    border: "2px dashed var(--admin-card-border)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "30px 20px",
                    minHeight: "220px",
                    textAlign: "center",
                    color: "var(--admin-text-secondary)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--admin-text-primary)";
                    e.currentTarget.style.color = "var(--admin-text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--admin-card-border)";
                    e.currentTarget.style.color = "var(--admin-text-secondary)";
                  }}
                >
                  <Plus size={32} strokeWidth={1.5} style={{ marginBottom: "12px" }} />
                  <span style={{ fontSize: "13px", fontWeight: "700" }}>Thêm cột mốc mới</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === "milestones" && selectedMilestoneId !== null && activeMilestone && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Header control with Back button */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => setSelectedMilestoneId(null)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", border: "1px solid var(--admin-card-border)",
                  background: "var(--admin-card-bg)", color: "var(--admin-text-primary)",
                  fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit"
                }}
              >
                <ChevronLeft size={14} /> Quay lại danh sách
              </button>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--admin-text-secondary)" }}>
                Đang chỉnh sửa cột mốc: <span style={{ color: "var(--admin-text-primary)" }}>{activeMilestone.year} - {activeMilestone.title}</span>
              </div>
            </div>

            {/* Year & Title */}
            <div style={cardStyle}>
              <div style={sectionTitle}><Type size={14} /> Thông tin cột mốc</div>
              <p style={sectionDesc}>Chỉnh sửa năm, tiêu đề và mô tả ngắn cho cột mốc.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Năm / Thời gian</label>
                  <input type="text" style={inputStyle}
                    value={activeMilestone.year}
                    onChange={e => handleFieldChange("year", e.target.value)}
                    placeholder="2024" />
                </div>
                <div>
                  <label style={labelStyle}>Tiêu đề cột mốc</label>
                  <input type="text" style={inputStyle}
                    value={activeMilestone.title}
                    onChange={e => handleFieldChange("title", e.target.value)}
                    placeholder="Tên cột mốc sự kiện" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Mô tả ngắn (Summary)</label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
                  rows={3}
                  value={activeMilestone.desc}
                  onChange={e => handleFieldChange("desc", e.target.value)}
                  placeholder="Mô tả ngắn về sự kiện..." />
              </div>
            </div>

            {/* Milestone image */}
            <div style={cardStyle}>
              <div style={sectionTitle}><Image size={14} /> Ảnh đại diện cột mốc</div>
              <p style={sectionDesc}>Ảnh đại diện hiển thị cho cột mốc này. Tải ảnh trực tiếp lên host.</p>
              <div style={hintYellow}>
                ⚠️ <strong>Kích thước khuyến nghị:</strong> 600×450 px (tỷ lệ 4:3).
              </div>
              <MediaPicker
                value={activeMilestone.image}
                type="image"
                accept="image/*"
                label="Kéo và thả ảnh vào đây"
                dimensionHint="Width: 600 px – Height: 450 px"
                formatHint="(jpg,png,jpeg,webp)"
                maxMB={5}
                onChange={v => handleFieldChange("image", v)}
                onSizeError={f => showToast("error", `Ảnh "${f.name}" vượt quá 5MB!`)}
              />
            </div>

            {/* Article content */}
            <div style={cardStyle}>
              <div style={sectionTitle}><AlignLeft size={14} /> Nội dung bài viết chi tiết</div>
              <p style={sectionDesc}>Nội dung chi tiết khi người dùng nhấn xem cột mốc này. Hỗ trợ định dạng Rich Text.</p>
              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>Loại nội dung</label>
                <select style={{ ...inputStyle, width: "180px", cursor: "pointer" }}
                  value={activeMilestone.articleType || "html"}
                  onChange={e => handleFieldChange("articleType", e.target.value)}>
                  <option value="html">HTML (Rich Text)</option>
                  <option value="text">Plain Text</option>
                </select>
              </div>
              {activeMilestone.articleType === "html" || !activeMilestone.articleType ? (
                <CKEditorWrapper
                  value={activeMilestone.article}
                  onChange={v => handleFieldChange("article", v)}
                />
              ) : (
                <textarea
                  style={{ ...inputStyle, resize: "vertical", minHeight: "160px" }}
                  rows={8}
                  value={activeMilestone.article}
                  onChange={e => handleFieldChange("article", e.target.value)}
                  placeholder="Nội dung bài viết..." />
              )}
            </div>

            {/* URL link */}
            <div style={cardStyle}>
              <div style={sectionTitle}><Link2 size={14} /> Đường dẫn liên kết ngoài (Tùy chọn)</div>
              <p style={sectionDesc}>Đường dẫn ngoài tham chiếu bài viết nếu có.</p>
              <input type="text" style={inputStyle}
                value={activeMilestone.url || ""}
                onChange={e => handleFieldChange("url", e.target.value)}
                placeholder="https://example.com/article hoặc để trống" />
            </div>

          </div>
        )}

        {/* ══════════════════ SECTION: MARQUEE ALBUM ══════════════════ */}
        {activeSection === "marquee" && (
          <>
            <div style={cardStyle}>
              <div style={sectionTitle}><Layers size={14} /> Bộ sưu tập cuộn 3D (Marquee Album)</div>
              <p style={sectionDesc}>
                Quản lý danh sách ảnh chạy cuộn 3D ở trang Lịch sử. Khuyến nghị tối thiểu 4–8 ảnh để hiệu ứng mượt mà.
              </p>
              <div style={hintBlue}>
                💡 <strong>Kích thước tối ưu:</strong> 970×700 px (tỷ lệ ~1.4:1). Ảnh tự động nén khi upload. Nên dùng ảnh dưới 2MB.
              </div>

              {/* Add new image */}
              <div style={{ marginBottom: "24px", marginTop: "8px" }}>
                <label style={labelStyle}>Thêm ảnh vào album</label>
                <MediaPicker
                  value=""
                  type="image"
                  label="Kéo và thả ảnh vào đây"
                  dimensionHint="Width: 970 px – Height: 700 px"
                  formatHint="(jpg,png,jpeg,webp)"
                  maxMB={5}
                  onChange={(v, file) => {
                    if (!v) return;
                    if (file) {
                      compressImage(file, 970, 700, 0.7)
                        .then(b64 => setConfig(p => ({ ...p, marqueeImages: [...(p.marqueeImages || []), b64] })))
                        .catch(() => setConfig(p => ({ ...p, marqueeImages: [...(p.marqueeImages || []), v] })));
                    } else {
                      setConfig(p => ({ ...p, marqueeImages: [...(p.marqueeImages || []), v] }));
                    }
                  }}
                  onSizeError={f => showToast("warning", `Ảnh "${f.name}" quá lớn! Vui lòng chọn ảnh nhỏ hơn 5MB.`)}
                />
              </div>

              {/* Album grid */}
              <label style={{ ...labelStyle, display: "block", marginBottom: "12px" }}>
                ALBUM ({(config.marqueeImages || []).length} ảnh)
              </label>

              {(!config.marqueeImages || config.marqueeImages.length === 0) ? (
                <div style={{
                  textAlign: "center", padding: "40px",
                  border: "2px dashed var(--admin-card-border)",
                  color: "var(--admin-text-secondary)", fontSize: "13px"
                }}>
                  Chưa có ảnh trong album. Tải lên ảnh ở trên để bắt đầu.
                  <br />
                  <span style={{ fontSize: "11px", opacity: 0.7 }}>Trang Lịch sử sẽ hiển thị ảnh mặc định khi album trống.</span>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "14px" }}>
                  {(config.marqueeImages || []).map((img, idx) => (
                    <div key={idx} style={{ border: "1px solid var(--admin-card-border)", overflow: "hidden" }}>
                      <div style={{ position: "relative", height: "110px" }}>
                        <img src={img} alt={`Marquee ${idx + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <div style={{
                          position: "absolute", top: "6px", left: "6px",
                          background: "rgba(0,0,0,.7)", color: "#fff",
                          fontSize: "11px", fontWeight: "800", padding: "2px 6px"
                        }}>#{idx + 1}</div>
                      </div>
                      <div style={{ display: "flex", borderTop: "1px solid var(--admin-card-border)" }}>
                        <button type="button" disabled={idx === 0}
                          onClick={() => {
                            setConfig(p => {
                              const a = [...p.marqueeImages];
                              [a[idx], a[idx - 1]] = [a[idx - 1], a[idx]];
                              return { ...p, marqueeImages: a };
                            });
                          }}
                          style={{ flex: 1, padding: "6px", border: "none", borderRight: "1px solid var(--admin-card-border)", background: "transparent", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? .3 : 1, color: "var(--admin-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ChevronLeft size={14} />
                        </button>
                        <button type="button" disabled={idx === (config.marqueeImages || []).length - 1}
                          onClick={() => {
                            setConfig(p => {
                              const a = [...p.marqueeImages];
                              [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]];
                              return { ...p, marqueeImages: a };
                            });
                          }}
                          style={{ flex: 1, padding: "6px", border: "none", borderRight: "1px solid var(--admin-card-border)", background: "transparent", cursor: idx === (config.marqueeImages || []).length - 1 ? "default" : "pointer", opacity: idx === (config.marqueeImages || []).length - 1 ? .3 : 1, color: "var(--admin-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ChevronRight size={14} />
                        </button>
                        <button type="button"
                          onClick={() => {
                            if (window.confirm("Xóa ảnh này khỏi album?"))
                              setConfig(p => ({ ...p, marqueeImages: p.marqueeImages.filter((_, i) => i !== idx) }));
                          }}
                          style={{ flex: 1, padding: "6px", border: "none", background: "transparent", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════ SAVE / RESET ══════════════════ */}
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
        <div style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 99999, maxWidth: "380px", animation: "fadeSlide .25s ease" }}>
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
