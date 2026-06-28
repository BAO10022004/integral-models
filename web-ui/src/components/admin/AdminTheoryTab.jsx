import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Save, RotateCcw, CheckCircle, BookOpen, Layers,
  Plus, Trash2, ChevronLeft, Type, AlignLeft, Image, Calculator
} from "lucide-react";
import MediaPicker from "./MediaPicker";
import { DEFAULT_CONCEPTS, DEFAULT_DEFINITIONS, DEFAULT_PAGE_CONFIG, DEFAULT_THEOREMS, DEFAULT_PROPERTIES, DEFAULT_PROPERTY_GROUPS } from "../../constants/theoryData";
import "../../styles/AdminTabs.css";

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
        id={`theory-editor-${Math.floor(Math.random() * 1000000)}`}
        defaultValue={value || ""}
        style={{ width: "100%", height: "200px" }}
      />
    </div>
  );
};

export default function AdminTheoryTab() {
  // ── States ─────────────────────────────────────────────────────────────────
  const [pageConfig, setPageConfig] = useState({ ...DEFAULT_PAGE_CONFIG });
  const [concepts, setConcepts] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [theorems, setTheorems] = useState([]);
  const [properties, setProperties] = useState([]);
  
  // Selected article IDs for editor view
  const [selectedConceptId, setSelectedConceptId] = useState(null);
  const [selectedDefinitionId, setSelectedDefinitionId] = useState(null);
  const [selectedTheoremId, setSelectedTheoremId] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [propertyGroups, setPropertyGroups] = useState([...DEFAULT_PROPERTY_GROUPS]);
  const [propertiesMode, setPropertiesMode] = useState("items"); // 'items' or 'groups'

  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  // Active subtab driven by sidebar via localStorage
  const [activeSection, setActiveSection] = useState(
    () => localStorage.getItem("admin_theory_subtab") || "general"
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const val = localStorage.getItem("admin_theory_subtab");
      if (val) setActiveSection(val);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedConfig = localStorage.getItem("theory_page_config");
    if (storedConfig) {
      try { setPageConfig(JSON.parse(storedConfig)); } catch (e) {}
    }

    const storedConcepts = localStorage.getItem("theory_concepts_data");
    if (storedConcepts) {
      try {
        const parsed = JSON.parse(storedConcepts);
        setConcepts(parsed.map((c, i) => ({ ...c, id: c.id || `concept_${Date.now()}_${i}` })));
      } catch (e) {
        setConcepts([...DEFAULT_CONCEPTS]);
      }
    } else {
      setConcepts([...DEFAULT_CONCEPTS]);
    }

    const storedDefinitions = localStorage.getItem("theory_definitions_data");
    if (storedDefinitions) {
      try {
        const parsed = JSON.parse(storedDefinitions);
        setDefinitions(parsed.map((d, i) => ({ ...d, id: d.id || `definition_${Date.now()}_${i}` })));
      } catch (e) {
        setDefinitions([...DEFAULT_DEFINITIONS]);
      }
    } else {
      setDefinitions([...DEFAULT_DEFINITIONS]);
    }

    const storedTheorems = localStorage.getItem("theory_theorems_data");
    if (storedTheorems) {
      try {
        const parsed = JSON.parse(storedTheorems);
        setTheorems(parsed.map((t, i) => ({ ...t, id: t.id || `theorem_${Date.now()}_${i}` })));
      } catch (e) {
        setTheorems([...DEFAULT_THEOREMS]);
      }
    } else {
      setTheorems([...DEFAULT_THEOREMS]);
    }

    const storedProperties = localStorage.getItem("theory_properties_data");
    if (storedProperties) {
      try {
        const parsed = JSON.parse(storedProperties);
        setProperties(parsed.map((p, i) => ({ ...p, id: p.id || `prop_${Date.now()}_${i}` })));
      } catch (e) {
        setProperties([...DEFAULT_PROPERTIES]);
      }
    } else {
      setProperties([...DEFAULT_PROPERTIES]);
    }

    const storedPropertyGroups = localStorage.getItem("theory_property_groups_data");
    if (storedPropertyGroups) {
      try {
        setPropertyGroups(JSON.parse(storedPropertyGroups));
      } catch (e) {
        setPropertyGroups([...DEFAULT_PROPERTY_GROUPS]);
      }
    } else {
      setPropertyGroups([...DEFAULT_PROPERTY_GROUPS]);
    }
  }, []);

  // ── Concept Actions ───────────────────────────────────────────────────────
  const activeConcept = concepts.find(c => c.id === selectedConceptId);

  const handleAddConcept = () => {
    const nextId = `concept_${Date.now()}`;
    const item = {
      id: nextId,
      title: "Khái niệm mới",
      desc: "Mô tả ngắn gọn...",
      formula: "",
      tagColor: "#592eff",
      badge: "Mới",
      image: "",
      content: "Nội dung bài viết chi tiết..."
    };
    setConcepts(prev => [...prev, item]);
    setSelectedConceptId(nextId);
  };

  const handleDeleteConcept = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khái niệm này?")) return;
    const next = concepts.filter(c => c.id !== id);
    setConcepts(next);
    if (selectedConceptId === id) setSelectedConceptId(null);
  };

  const handleConceptFieldChange = (field, value) => {
    setConcepts(prev => prev.map(c => c.id === selectedConceptId ? { ...c, [field]: value } : c));
  };

  // ── Definition Actions ─────────────────────────────────────────────────────
  const activeDefinition = definitions.find(d => d.id === selectedDefinitionId);

  const handleAddDefinition = () => {
    const nextId = `definition_${Date.now()}`;
    const item = {
      id: nextId,
      title: "Định nghĩa mới",
      desc: "Mô tả ngắn gọn...",
      formula: "",
      tagColor: "#592eff",
      badge: "Mới",
      image: "",
      content: "Nội dung bài viết chi tiết..."
    };
    setDefinitions(prev => [...prev, item]);
    setSelectedDefinitionId(nextId);
  };

  const handleDeleteDefinition = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa định nghĩa này?")) return;
    const next = definitions.filter(d => d.id !== id);
    setDefinitions(next);
    if (selectedDefinitionId === id) setSelectedDefinitionId(null);
  };

  const handleDefinitionFieldChange = (field, value) => {
    setDefinitions(prev => prev.map(d => d.id === selectedDefinitionId ? { ...d, [field]: value } : d));
  };

  // ── Theorem Actions ────────────────────────────────────────────────────────
  const activeTheorem = theorems.find(t => t.id === selectedTheoremId);

  const handleAddTheorem = () => {
    const nextId = `theorem_${Date.now()}`;
    const item = {
      id: nextId,
      title: "Định lý mới",
      desc: "Mô tả...",
      formula: "",
      tagColor: "#592eff",
      badge: "Mới"
    };
    setTheorems(prev => [...prev, item]);
    setSelectedTheoremId(nextId);
  };

  const handleDeleteTheorem = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa định lý này?")) return;
    const next = theorems.filter(t => t.id !== id);
    setTheorems(next);
    if (selectedTheoremId === id) setSelectedTheoremId(null);
  };

  const handleTheoremFieldChange = (field, value) => {
    setTheorems(prev => prev.map(t => t.id === selectedTheoremId ? { ...t, [field]: value } : t));
  };

  // ── Property Actions ───────────────────────────────────────────────────────
  const activeProperty = properties.find(p => p.id === selectedPropertyId);

  const handleAddProperty = () => {
    const nextId = `prop_${Date.now()}`;
    const item = {
      id: nextId,
      group: "algebraic",
      title: "Tính chất mới",
      desc: "Mô tả ngắn gọn...",
      formula: "",
      tagColor: "#592eff",
      badge: "Mới",
      image: "",
      content: "Nội dung bài viết chi tiết..."
    };
    setProperties(prev => [...prev, item]);
    setSelectedPropertyId(nextId);
  };

  const handleDeleteProperty = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tính chất này?")) return;
    const next = properties.filter(p => p.id !== id);
    setProperties(next);
    if (selectedPropertyId === id) setSelectedPropertyId(null);
  };

  const handlePropertyFieldChange = (field, value) => {
    setProperties(prev => prev.map(p => p.id === selectedPropertyId ? { ...p, [field]: value } : p));
  };

  // ── Property Group Actions ────────────────────────────────────────────────
  const handleAddPropertyGroup = () => {
    const nextId = `group_${Date.now()}`;
    const group = {
      id: nextId,
      title: "Nhóm tính chất mới"
    };
    setPropertyGroups(prev => [...prev, group]);
  };

  const handleDeletePropertyGroup = (id) => {
    if (!window.confirm("Xóa nhóm này sẽ ảnh hưởng đến các tính chất thuộc nhóm đó. Bạn có chắc chắn muốn xóa?")) return;
    setPropertyGroups(prev => prev.filter(g => g.id !== id));
  };

  const handlePropertyGroupChange = (id, value) => {
    setPropertyGroups(prev => prev.map(g => g.id === id ? { ...g, title: value } : g));
  };

  // ── Save & Reset ────────────────────────────────────────────────────────────
  const handleSave = () => {
    try {
      localStorage.setItem("theory_page_config", JSON.stringify(pageConfig));
      localStorage.setItem("theory_concepts_data", JSON.stringify(concepts));
      localStorage.setItem("theory_definitions_data", JSON.stringify(definitions));
      localStorage.setItem("theory_theorems_data", JSON.stringify(theorems));
      localStorage.setItem("theory_properties_data", JSON.stringify(properties));
      localStorage.setItem("theory_property_groups_data", JSON.stringify(propertyGroups));
      showToast("success", "Cấu hình lý thuyết đã được lưu thành công!");
    } catch (e) {
      showToast("error", "Lỗi lưu trữ: dữ liệu quá lớn!");
    }
  };

  const handleReset = () => {
    if (!window.confirm("Bạn có chắc muốn khôi phục cấu hình mặc định trang Kiến thức?")) return;
    
    localStorage.removeItem("theory_page_config");
    localStorage.removeItem("theory_concepts_data");
    localStorage.removeItem("theory_definitions_data");
    localStorage.removeItem("theory_theorems_data");
    localStorage.removeItem("theory_properties_data");
    localStorage.removeItem("theory_property_groups_data");

    setPageConfig({ ...DEFAULT_PAGE_CONFIG });
    setConcepts([...DEFAULT_CONCEPTS]);
    setDefinitions([...DEFAULT_DEFINITIONS]);
    setTheorems([...DEFAULT_THEOREMS]);
    setProperties([...DEFAULT_PROPERTIES]);
    setPropertyGroups([...DEFAULT_PROPERTY_GROUPS]);
    setSelectedConceptId(null);
    setSelectedDefinitionId(null);
    setSelectedTheoremId(null);
    setSelectedPropertyId(null);

    showToast("success", "Đã khôi phục cấu hình mặc định thành công!");
  };

  // ── Styling Design Tokens ──────────────────────────────────────────────────
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

  return (
    <div className="admin-tab-container-nasani">

      {/* Page Header */}
      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--admin-card-border)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--admin-text-primary)", margin: 0, marginBottom: "6px" }}>
          Quản lý kiến thức {activeSection === "general" ? "— Home" : activeSection === "concepts" ? "— Khái niệm" : activeSection === "definitions" ? "— Định nghĩa" : activeSection === "theorems" ? "— Định lý" : "— Tính chất"}
        </h2>
        <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: 0 }}>
          {activeSection === "general" && "Cấu hình tiêu đề chính và mô tả (Hero) hiển thị ở đầu trang Kiến thức."}
          {activeSection === "concepts" && "Quản lý danh sách các bài viết Khái niệm cốt lõi (Nguyên hàm, Tích phân bất định)."}
          {activeSection === "definitions" && "Quản lý danh sách các bài viết Định nghĩa (Ý nghĩa hình học, Tổng Riemann)."}
          {activeSection === "theorems" && "Quản lý danh sách các Định lý giải tích cơ bản (Newton-Leibniz, Giá trị trung bình)."}
          {activeSection === "properties" && "Quản lý danh sách các bài viết Tính chất tích phân (Đại số, Phân đoạn, Đối xứng)."}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* ══════════════════ SUBTAB: HOME ══════════════════ */}
        {activeSection === "general" && (
          <div style={cardStyle}>
            <div style={sectionTitle}><Type size={14} /> Tiêu đề & Mô tả Hero</div>
            <p style={sectionDesc}>Thay đổi tiêu đề lớn và mô tả tóm tắt ở trang chính Thư viện kiến thức.</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>Nhãn phụ (Subtitle)</label>
                <input type="text" style={inputStyle}
                  value={pageConfig.subtitle || ""}
                  onChange={e => setPageConfig(p => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Ví dụ: THƯ VIỆN KIẾN THỨC" />
              </div>
              <div>
                <label style={labelStyle}>Tiêu đề chính (Headline)</label>
                <input type="text" style={inputStyle}
                  value={pageConfig.headline || ""}
                  onChange={e => setPageConfig(p => ({ ...p, headline: e.target.value }))}
                  placeholder="Ví dụ: GIẢI TÍCH PHÂN" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Mô tả chi tiết</label>
              <textarea
                style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
                rows={4}
                value={pageConfig.desc || ""}
                onChange={e => setPageConfig(p => ({ ...p, desc: e.target.value }))}
                placeholder="Nhập đoạn văn mô tả..." />
            </div>
          </div>
        )}

        {/* ══════════════════ SUBTAB: CONCEPTS ══════════════════ */}
        {activeSection === "concepts" && selectedConceptId === null && (
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div style={sectionTitle}>Khái niệm giải tích</div>
                <p style={{ ...sectionDesc, marginBottom: 0 }}>Danh sách các khái niệm toán học nền tảng.</p>
              </div>
              <button
                onClick={handleAddConcept}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "10px 20px", border: "none",
                  background: "var(--admin-text-primary)", color: "#fff",
                  fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit"
                }}
              >
                <Plus size={14} /> Thêm khái niệm mới
              </button>
            </div>

            {concepts.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                border: "2px dashed var(--admin-card-border)",
                color: "var(--admin-text-secondary)", fontSize: "13px"
              }}>
                Chưa có khái niệm nào. Nhấn "Thêm khái niệm mới" ở trên để bắt đầu.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
                {concepts.map(c => (
                  <div 
                    key={c.id}
                    onClick={() => setSelectedConceptId(c.id)}
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
                    {/* Image Preview */}
                    <div style={{ height: "130px", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                      {c.image ? (
                        <img src={c.image} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <BookOpen size={36} style={{ color: "var(--admin-text-secondary)", opacity: 0.3 }} />
                      )}
                      
                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConcept(c.id);
                        }}
                        style={{
                          position: "absolute", top: "10px", right: "10px",
                          background: "rgba(239, 68, 68, 0.9)", border: "none",
                          width: "26px", height: "26px", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", cursor: "pointer", padding: 0
                        }}
                        title="Xóa khái niệm"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: c.tagColor || "var(--admin-text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                        {c.badge || "CONCEPT"}
                      </span>
                      <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--admin-text-primary)", margin: "0 0 6px 0", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {c.title || "Chưa có tiêu đề"}
                      </h4>
                      <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.5", flex: 1 }}>
                        {c.desc || "Không có mô tả tóm tắt..."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "concepts" && selectedConceptId !== null && activeConcept && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Header control */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => setSelectedConceptId(null)}
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
                Đang chỉnh sửa khái niệm: <span style={{ color: "var(--admin-text-primary)" }}>{activeConcept.title}</span>
              </div>
            </div>

            {/* Inputs Form */}
            <div style={cardStyle}>
              <div style={sectionTitle}><Type size={14} /> Thông tin chung</div>
              <p style={sectionDesc}>Chỉnh sửa tiêu đề, nhãn và mô tả tóm tắt cho khái niệm này.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Tiêu đề bài viết</label>
                  <input type="text" style={inputStyle}
                    value={activeConcept.title}
                    onChange={e => handleConceptFieldChange("title", e.target.value)}
                    placeholder="Ví dụ: Khái niệm Nguyên hàm" />
                </div>
                <div>
                  <label style={labelStyle}>Badge nhãn</label>
                  <input type="text" style={inputStyle}
                    value={activeConcept.badge}
                    onChange={e => handleConceptFieldChange("badge", e.target.value)}
                    placeholder="Ví dụ: Cơ sở" />
                </div>
                <div>
                  <label style={labelStyle}>Màu nhãn (Hex Color)</label>
                  <input type="text" style={inputStyle}
                    value={activeConcept.tagColor}
                    onChange={e => handleConceptFieldChange("tagColor", e.target.value)}
                    placeholder="Ví dụ: #2ed6ff" />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Mô tả ngắn gọn (Hiển thị ở card danh sách)</label>
                <input type="text" style={inputStyle}
                  value={activeConcept.desc}
                  onChange={e => handleConceptFieldChange("desc", e.target.value)}
                  placeholder="Mô tả tóm tắt ngắn..." />
              </div>

              <div>
                <label style={labelStyle}>Công thức chính (LaTeX)</label>
                <input type="text" style={{ ...inputStyle, fontFamily: "monospace" }}
                  value={activeConcept.formula}
                  onChange={e => handleConceptFieldChange("formula", e.target.value)}
                  placeholder="Ví dụ: F'(x) = f(x)" />
              </div>
            </div>

            {/* Background Image picker */}
            <div style={cardStyle}>
              <div style={sectionTitle}><Image size={14} /> Ảnh đại diện bài viết</div>
              <p style={sectionDesc}>Tải lên hình ảnh 4:3 làm ảnh nền cho card khái niệm.</p>
              <div style={hintYellow}>
                ⚠️ Kích thước khuyến nghị: <strong>800×600 px</strong>. Giới hạn 2MB.
              </div>
              <MediaPicker
                value={activeConcept.image}
                type="image"
                label="Kéo và thả ảnh vào đây"
                dimensionHint="Tỷ lệ 4:3"
                formatHint="(jpg,png,jpeg,webp)"
                maxMB={2}
                onChange={v => handleConceptFieldChange("image", v)}
                onSizeError={f => showToast("error", `Ảnh "${f.name}" quá dung lượng 2MB!`)}
              />
            </div>

            {/* Rich Editor content */}
            <div style={cardStyle}>
              <div style={sectionTitle}><AlignLeft size={14} /> Nội dung bài viết chi tiết</div>
              <p style={sectionDesc}>Nội dung giải nghĩa chi tiết khi nhấp vào bài viết. Hỗ trợ HTML.</p>
              <CKEditorWrapper
                value={activeConcept.content}
                onChange={v => handleConceptFieldChange("content", v)}
              />
            </div>

          </div>
        )}

        {/* ══════════════════ SUBTAB: DEFINITIONS ══════════════════ */}
        {activeSection === "definitions" && selectedDefinitionId === null && (
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div style={sectionTitle}>Định nghĩa tích phân</div>
                <p style={{ ...sectionDesc, marginBottom: 0 }}>Danh sách định nghĩa toán học cốt lõi.</p>
              </div>
              <button
                onClick={handleAddDefinition}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "10px 20px", border: "none",
                  background: "var(--admin-text-primary)", color: "#fff",
                  fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit"
                }}
              >
                <Plus size={14} /> Thêm định nghĩa mới
              </button>
            </div>

            {definitions.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                border: "2px dashed var(--admin-card-border)",
                color: "var(--admin-text-secondary)", fontSize: "13px"
              }}>
                Chưa có định nghĩa nào. Nhấn "Thêm định nghĩa mới" ở trên để bắt đầu.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
                {definitions.map(d => (
                  <div 
                    key={d.id}
                    onClick={() => setSelectedDefinitionId(d.id)}
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
                    {/* Image Preview */}
                    <div style={{ height: "130px", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                      {d.image ? (
                        <img src={d.image} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Layers size={36} style={{ color: "var(--admin-text-secondary)", opacity: 0.3 }} />
                      )}
                      
                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDefinition(d.id);
                        }}
                        style={{
                          position: "absolute", top: "10px", right: "10px",
                          background: "rgba(239, 68, 68, 0.9)", border: "none",
                          width: "26px", height: "26px", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", cursor: "pointer", padding: 0
                        }}
                        title="Xóa định nghĩa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: d.tagColor || "var(--admin-text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                        {d.badge || "DEFINITION"}
                      </span>
                      <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--admin-text-primary)", margin: "0 0 6px 0", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {d.title || "Chưa có tiêu đề"}
                      </h4>
                      <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.5", flex: 1 }}>
                        {d.desc || "Không có mô tả tóm tắt..."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "definitions" && selectedDefinitionId !== null && activeDefinition && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Header control */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => setSelectedDefinitionId(null)}
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
                Đang chỉnh sửa định nghĩa: <span style={{ color: "var(--admin-text-primary)" }}>{activeDefinition.title}</span>
              </div>
            </div>

            {/* Inputs Form */}
            <div style={cardStyle}>
              <div style={sectionTitle}><Type size={14} /> Thông tin chung</div>
              <p style={sectionDesc}>Chỉnh sửa tiêu đề, nhãn và mô tả tóm tắt cho định nghĩa này.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Tiêu đề bài viết</label>
                  <input type="text" style={inputStyle}
                    value={activeDefinition.title}
                    onChange={e => handleDefinitionFieldChange("title", e.target.value)}
                    placeholder="Ví dụ: Định nghĩa Riemann" />
                </div>
                <div>
                  <label style={labelStyle}>Badge nhãn</label>
                  <input type="text" style={inputStyle}
                    value={activeDefinition.badge}
                    onChange={e => handleDefinitionFieldChange("badge", e.target.value)}
                    placeholder="Ví dụ: Giới hạn" />
                </div>
                <div>
                  <label style={labelStyle}>Màu nhãn (Hex Color)</label>
                  <input type="text" style={inputStyle}
                    value={activeDefinition.tagColor}
                    onChange={e => handleDefinitionFieldChange("tagColor", e.target.value)}
                    placeholder="Ví dụ: #2ed6ff" />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Mô tả ngắn gọn (Hiển thị ở card danh sách)</label>
                <input type="text" style={inputStyle}
                  value={activeDefinition.desc}
                  onChange={e => handleDefinitionFieldChange("desc", e.target.value)}
                  placeholder="Mô tả tóm tắt ngắn..." />
              </div>

              <div>
                <label style={labelStyle}>Công thức chính (LaTeX)</label>
                <input type="text" style={{ ...inputStyle, fontFamily: "monospace" }}
                  value={activeDefinition.formula}
                  onChange={e => handleDefinitionFieldChange("formula", e.target.value)}
                  placeholder="Ví dụ: \int_a^b f(x)dx = \lim \sum f(x_i^*)\Delta x" />
              </div>
            </div>

            {/* Background Image picker */}
            <div style={cardStyle}>
              <div style={sectionTitle}><Image size={14} /> Ảnh đại diện bài viết</div>
              <p style={sectionDesc}>Tải lên hình ảnh 4:3 làm ảnh nền cho card định nghĩa.</p>
              <div style={hintYellow}>
                ⚠️ Kích thước khuyến nghị: <strong>800×600 px</strong>. Giới hạn 2MB.
              </div>
              <MediaPicker
                value={activeDefinition.image}
                type="image"
                label="Kéo và thả ảnh vào đây"
                dimensionHint="Tỷ lệ 4:3"
                formatHint="(jpg,png,jpeg,webp)"
                maxMB={2}
                onChange={v => handleDefinitionFieldChange("image", v)}
                onSizeError={f => showToast("error", `Ảnh "${f.name}" quá dung lượng 2MB!`)}
              />
            </div>

            {/* Rich Editor content */}
            <div style={cardStyle}>
              <div style={sectionTitle}><AlignLeft size={14} /> Nội dung bài viết chi tiết</div>
              <p style={sectionDesc}>Nội dung giải nghĩa chi tiết khi nhấp vào bài viết. Hỗ trợ HTML.</p>
              <CKEditorWrapper
                value={activeDefinition.content}
                onChange={v => handleDefinitionFieldChange("content", v)}
              />
            </div>

          </div>
        )}

        {/* ══════════════════ SUBTAB: THEOREMS ══════════════════ */}
        {activeSection === "theorems" && selectedTheoremId === null && (
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div style={sectionTitle}><Layers size={14} /> Định lý cơ bản</div>
                <p style={{ ...sectionDesc, marginBottom: 0 }}>Danh sách các định lý toán học cốt lõi.</p>
              </div>
              <button
                onClick={handleAddTheorem}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "10px 20px", border: "none",
                  background: "var(--admin-text-primary)", color: "#fff",
                  fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit"
                }}
              >
                <Plus size={14} /> Thêm định lý mới
              </button>
            </div>

            {theorems.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                border: "2px dashed var(--admin-card-border)",
                color: "var(--admin-text-secondary)", fontSize: "13px"
              }}>
                Chưa có định lý nào. Nhấn "Thêm định lý mới" ở trên để bắt đầu.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
                {theorems.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => setSelectedTheoremId(t.id)}
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
                    {/* Header */}
                    <div style={{ height: "60px", background: "#0a0a0a", display: "flex", alignItems: "center", padding: "0 16px", position: "relative", borderBottom: `2px solid ${t.tagColor || "var(--admin-card-border)"}` }}>
                      <Layers size={20} style={{ color: t.tagColor || "var(--admin-text-secondary)", marginRight: "8px" }} />
                      <span style={{ fontSize: "12px", fontWeight: "800", color: "#fff", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "140px" }}>
                        {t.title || "Chưa có tiêu đề"}
                      </span>
                      
                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTheorem(t.id);
                        }}
                        style={{
                          position: "absolute", top: "16px", right: "16px",
                          background: "rgba(239, 68, 68, 0.9)", border: "none",
                          width: "26px", height: "26px", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", cursor: "pointer", padding: 0
                        }}
                        title="Xóa định lý"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "0 0 10px 0", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.5", flex: 1 }}>
                        {t.desc || "Không có mô tả..."}
                      </p>
                      {t.formula && (
                        <div style={{ background: "rgba(0,0,0,0.15)", padding: "6px 10px", borderRadius: "4px", fontSize: "11px", fontFamily: "monospace", color: "var(--admin-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.formula}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "theorems" && selectedTheoremId !== null && activeTheorem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Header control */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => setSelectedTheoremId(null)}
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
                Đang chỉnh sửa định lý: <span style={{ color: "var(--admin-text-primary)" }}>{activeTheorem.title}</span>
              </div>
            </div>

            {/* Inputs Form */}
            <div style={cardStyle}>
              <div style={sectionTitle}><Type size={14} /> Thông tin định lý</div>
              <p style={sectionDesc}>Chỉnh sửa tiêu đề, mô tả và công thức cho định lý này.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Tiêu đề định lý</label>
                  <input type="text" style={inputStyle}
                    value={activeTheorem.title}
                    onChange={e => handleTheoremFieldChange("title", e.target.value)}
                    placeholder="Ví dụ: Định lý Newton-Leibniz" />
                </div>
                <div>
                  <label style={labelStyle}>Màu chủ đạo (Hex Color)</label>
                  <input type="text" style={inputStyle}
                    value={activeTheorem.tagColor}
                    onChange={e => handleTheoremFieldChange("tagColor", e.target.value)}
                    placeholder="Ví dụ: #f843c2" />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Mô tả định lý</label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
                  rows={3}
                  value={activeTheorem.desc}
                  onChange={e => handleTheoremFieldChange("desc", e.target.value)}
                  placeholder="Mô tả nội dung định lý..." />
              </div>

              <div>
                <label style={labelStyle}>Công thức (LaTeX)</label>
                <input type="text" style={{ ...inputStyle, fontFamily: "monospace" }}
                  value={activeTheorem.formula}
                  onChange={e => handleTheoremFieldChange("formula", e.target.value)}
                  placeholder="Ví dụ: \int_a^b f(x)dx = F(b) - F(a)" />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ SUBTAB: PROPERTIES ══════════════════ */}
        {activeSection === "properties" && selectedPropertyId === null && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Sub-tab Mode selectors */}
            <div style={{ ...cardStyle, padding: "12px 24px", display: "flex", gap: "12px" }}>
              <button
                onClick={() => setPropertiesMode("items")}
                style={{
                  padding: "8px 16px",
                  border: "1px solid " + (propertiesMode === "items" ? "var(--admin-text-primary)" : "var(--admin-card-border)"),
                  background: propertiesMode === "items" ? "var(--admin-text-primary)" : "transparent",
                  color: propertiesMode === "items" ? "#fff" : "var(--admin-text-primary)",
                  fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Bài viết Tính chất (Level 2)
              </button>
              <button
                onClick={() => setPropertiesMode("groups")}
                style={{
                  padding: "8px 16px",
                  border: "1px solid " + (propertiesMode === "groups" ? "var(--admin-text-primary)" : "var(--admin-card-border)"),
                  background: propertiesMode === "groups" ? "var(--admin-text-primary)" : "transparent",
                  color: propertiesMode === "groups" ? "#fff" : "var(--admin-text-primary)",
                  fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Nhóm tính chất (Level 1)
              </button>
            </div>

            {/* Mode: Items (Level 2) */}
            {propertiesMode === "items" && (
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <div style={sectionTitle}><Calculator size={14} /> Tính chất giải tích (Level 2)</div>
                    <p style={{ ...sectionDesc, marginBottom: 0 }}>Danh sách các tính chất tích phân.</p>
                  </div>
                  <button
                    onClick={handleAddProperty}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "10px 20px", border: "none",
                      background: "var(--admin-text-primary)", color: "#fff",
                      fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit"
                    }}
                  >
                    <Plus size={14} /> Thêm tính chất mới
                  </button>
                </div>

                {properties.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "60px 20px",
                    border: "2px dashed var(--admin-card-border)",
                    color: "var(--admin-text-secondary)", fontSize: "13px"
                  }}>
                    Chưa có tính chất nào. Nhấn "Thêm tính chất mới" ở trên để bắt đầu.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
                    {properties.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => setSelectedPropertyId(p.id)}
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
                        {/* Image Preview */}
                        <div style={{ height: "130px", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                          {p.image ? (
                            <img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <Calculator size={36} style={{ color: "var(--admin-text-secondary)", opacity: 0.3 }} />
                          )}
                          
                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProperty(p.id);
                            }}
                            style={{
                              position: "absolute", top: "10px", right: "10px",
                              background: "rgba(239, 68, 68, 0.9)", border: "none",
                              width: "26px", height: "26px", borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#fff", cursor: "pointer", padding: 0
                            }}
                            title="Xóa tính chất"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Metadata */}
                        <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--admin-text-primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                            {(propertyGroups.find(g => g.id === p.group)?.title || p.group || "").replace(/\s*\(.*\)/, "")}
                          </span>
                          <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--admin-text-primary)", margin: "0 0 6px 0", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {p.title || "Chưa có tiêu đề"}
                          </h4>
                          <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.5", flex: 1 }}>
                            {p.desc || "Không có mô tả..."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mode: Groups (Level 1) */}
            {propertiesMode === "groups" && (
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <div style={sectionTitle}><Layers size={14} /> Quản lý Nhóm tính chất (Level 1)</div>
                    <p style={{ ...sectionDesc, marginBottom: 0 }}>Thêm, sửa, hoặc xóa các nhóm danh mục cấp 1 của tính chất tích phân.</p>
                  </div>
                  <button
                    onClick={handleAddPropertyGroup}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "10px 20px", border: "none",
                      background: "var(--admin-text-primary)", color: "#fff",
                      fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit"
                    }}
                  >
                    <Plus size={14} /> Thêm nhóm mới
                  </button>
                </div>

                {propertyGroups.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "60px 20px",
                    border: "2px dashed var(--admin-card-border)",
                    color: "var(--admin-text-secondary)", fontSize: "13px"
                  }}>
                    Chưa có nhóm nào. Nhấn "Thêm nhóm mới" ở trên để bắt đầu.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {propertyGroups.map(g => (
                      <div key={g.id} style={{ display: "flex", gap: "16px", alignItems: "center", border: "1px solid var(--admin-card-border)", padding: "16px", background: "var(--admin-input-bg)" }}>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Tên nhóm tính chất (Level 1)</label>
                          <input type="text" style={inputStyle}
                            value={g.title}
                            onChange={e => handlePropertyGroupChange(g.id, e.target.value)}
                            placeholder="Ví dụ: Nhóm Đại số..." />
                        </div>
                        <div style={{ width: "150px" }}>
                          <label style={labelStyle}>Mã nhóm (ID)</label>
                          <input type="text" style={{ ...inputStyle, background: "#f3f4f6", cursor: "not-allowed" }}
                            value={g.id}
                            readOnly
                            disabled />
                        </div>
                        <button
                          onClick={() => handleDeletePropertyGroup(g.id)}
                          style={{
                            background: "rgba(239, 68, 68, 0.9)", border: "none",
                            width: "36px", height: "36px", marginTop: "18px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", cursor: "pointer", padding: 0
                          }}
                          title="Xóa nhóm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {activeSection === "properties" && selectedPropertyId !== null && activeProperty && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Header control */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => setSelectedPropertyId(null)}
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
                Đang chỉnh sửa tính chất: <span style={{ color: "var(--admin-text-primary)" }}>{activeProperty.title}</span>
              </div>
            </div>

            {/* Inputs Form */}
            <div style={cardStyle}>
              <div style={sectionTitle}><Type size={14} /> Thông tin chung</div>
              <p style={sectionDesc}>Chỉnh sửa tiêu đề, phân nhóm và công thức cho tính chất này.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Tiêu đề bài viết</label>
                  <input type="text" style={inputStyle}
                    value={activeProperty.title}
                    onChange={e => handlePropertyFieldChange("title", e.target.value)}
                    placeholder="Ví dụ: Tính Tuyến Tính" />
                </div>
                <div>
                  <label style={labelStyle}>Phân nhóm tính chất</label>
                  <select style={inputStyle}
                    value={activeProperty.group}
                    onChange={e => handlePropertyFieldChange("group", e.target.value)}
                  >
                    {propertyGroups.map(g => (
                      <option key={g.id} value={g.id}>{(g.title || "").replace(/\s*\(.*\)/, "")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Màu nhãn (Hex Color)</label>
                  <input type="text" style={inputStyle}
                    value={activeProperty.tagColor}
                    onChange={e => handlePropertyFieldChange("tagColor", e.target.value)}
                    placeholder="Ví dụ: #592eff" />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Mô tả ngắn gọn (Hiển thị ở card danh sách)</label>
                <input type="text" style={inputStyle}
                  value={activeProperty.desc}
                  onChange={e => handlePropertyFieldChange("desc", e.target.value)}
                  placeholder="Mô tả tóm tắt ngắn..." />
              </div>

              <div>
                <label style={labelStyle}>Công thức chính (LaTeX)</label>
                <input type="text" style={{ ...inputStyle, fontFamily: "monospace" }}
                  value={activeProperty.formula}
                  onChange={e => handlePropertyFieldChange("formula", e.target.value)}
                  placeholder="Ví dụ: \int (f+g)dx = \int fdx + \int gdx" />
              </div>
            </div>

            {/* Background Image picker */}
            <div style={cardStyle}>
              <div style={sectionTitle}><Image size={14} /> Ảnh đại diện bài viết</div>
              <p style={sectionDesc}>Tải lên hình ảnh 4:3 làm ảnh nền cho card tính chất.</p>
              <div style={hintYellow}>
                ⚠️ Kích thước khuyến nghị: <strong>800×600 px</strong>. Giới hạn 2MB.
              </div>
              <MediaPicker
                value={activeProperty.image}
                type="image"
                label="Kéo và thả ảnh vào đây"
                dimensionHint="Tỷ lệ 4:3"
                formatHint="(jpg,png,jpeg,webp)"
                maxMB={2}
                onChange={v => handlePropertyFieldChange("image", v)}
                onSizeError={f => showToast("error", `Ảnh "${f.name}" quá dung lượng 2MB!`)}
              />
            </div>

            {/* Rich Editor content */}
            <div style={cardStyle}>
              <div style={sectionTitle}><AlignLeft size={14} /> Nội dung bài viết chi tiết</div>
              <p style={sectionDesc}>Nội dung giải nghĩa chi tiết khi nhấp vào bài viết. Hỗ trợ HTML.</p>
              <CKEditorWrapper
                value={activeProperty.content}
                onChange={v => handlePropertyFieldChange("content", v)}
              />
            </div>

          </div>
        )}

        {/* ══════════════════ SAVE / RESET BUTTONS ══════════════════ */}
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

      {/* Toast notification portal */}
      {toast.show && createPortal(
        <div style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 99999, maxWidth: "380px", animation: "fadeSlide .25s ease" }}>
          <div style={{
            background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${toast.type === "success" ? "#86efac" : "#fca5a5"}`,
            padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: "12px"
          }}>
            <CheckCircle size={18} style={{
              flexShrink: 0, marginTop: "1px",
              color: toast.type === "success" ? "#16a34a" : "#dc2626"
            }} />
            <span style={{
              fontSize: "13px", fontWeight: "600", lineHeight: "1.5",
              color: toast.type === "success" ? "#15803d" : "#991b1b"
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
