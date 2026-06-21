import React, { useState, useEffect, useRef } from "react";
import "../../styles/AdminTabs.css";
import { DOTNET_API_URL } from "../../config";

// A self-contained dynamic CKEditor 4 loading wrapper for React
const CKEditorWrapper = ({ value, onChange }) => {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const initEditor = () => {
      if (!textareaRef.current) return;
      const editorId = textareaRef.current.id;

      // Avoid double initialization
      if (window.CKEDITOR.instances[editorId]) {
        window.CKEDITOR.instances[editorId].destroy(true);
      }

      const editor = window.CKEDITOR.replace(editorId, {
        height: 320,
        removePlugins: 'resize',
        skin: 'moono-lisa',
        // Enable rich format styling
        allowedContent: true,
      });

      editorRef.current = editor;

      editor.on('instanceReady', () => {
        editor.setData(value || "");
      });

      // Call onChange on changes
      editor.on('change', () => {
        const data = editor.getData();
        onChange(data);
      });
    };

    if (!window.CKEDITOR) {
      let script = document.querySelector('script[src*="ckeditor.js"]');
      if (!script) {
        script = document.createElement("script");
        script.src = "https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js";
        script.async = true;
        document.body.appendChild(script);
      }

      const checkLoaded = setInterval(() => {
        if (window.CKEDITOR) {
          clearInterval(checkLoaded);
          initEditor();
        }
      }, 100);

      return () => {
        clearInterval(checkLoaded);
        if (editorRef.current) {
          editorRef.current.destroy(true);
          editorRef.current = null;
        }
      };
    } else {
      initEditor();
      return () => {
        if (editorRef.current) {
          editorRef.current.destroy(true);
          editorRef.current = null;
        }
      };
    }
  }, []);

  return (
    <div style={{ marginTop: "8px", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
      <textarea
        ref={textareaRef}
        id={`milestone-editor-${Math.floor(Math.random() * 1000000)}`}
        defaultValue={value || ""}
        style={{ width: "100%", height: "200px" }}
      />
    </div>
  );
};

const compressImage = (file, maxWidth = 1200, maxHeight = 900, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AdminHistoryTab() {
  const [config, setConfig] = useState({
    heroImgUrl: "",
    showcaseImgUrl: "",
    headline: "The Journey of AI Innovation",
    introText: "The intelligent calculus solver system was born from a desire to bridge the gap between complex mathematical theories and real-world digital applications.\n\nThrough numerous cycles of research and algorithmic optimization, we developed a state-of-the-art action classification model powered by Deep Learning. Today, any integral problem—from fundamental concepts to highly complex derivations—is processed in the blink of an eye with absolute precision.",
    marqueeImages: []
  });

  const [milestones, setMilestones] = useState([]);
  const [activeCategory, setActiveCategory] = useState("general"); // "general" | "milestones"
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(1);
  const [heroSourceType, setHeroSourceType] = useState("default"); // "default" | "url" | "upload"
  const [showcaseSourceType, setShowcaseSourceType] = useState("default"); // "default" | "url" | "upload"
  const [customHeroUrl, setCustomHeroUrl] = useState("");
  const [customShowcaseUrl, setCustomShowcaseUrl] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  // Load configuration from API on mount (with localStorage fallback)
  useEffect(() => {
    fetch(`${DOTNET_API_URL}/HistoryTimeline`)
      .then(res => {
        if (!res.ok) throw new Error("API failed to load");
        return res.json();
      })
      .then(data => {
        if (data && data.config) {
          const parsed = data.config;
          parsed.marqueeImages = parsed.marqueeImages || [];
          setConfig(parsed);

          // Determine source type for hero image
          if (!parsed.heroImgUrl) {
            setHeroSourceType("default");
          } else if (parsed.heroImgUrl.startsWith("data:")) {
            setHeroSourceType("upload");
          } else {
            setHeroSourceType("url");
            setCustomHeroUrl(parsed.heroImgUrl);
          }

          // Determine source type for showcase image
          if (!parsed.showcaseImgUrl) {
            setShowcaseSourceType("default");
          } else if (parsed.showcaseImgUrl.startsWith("data:")) {
            setShowcaseSourceType("upload");
          } else {
            setShowcaseSourceType("url");
            setCustomShowcaseUrl(parsed.showcaseImgUrl);
          }
        }
        if (data && data.milestones) {
          setMilestones(data.milestones);
          if (data.milestones.length > 0) {
            setSelectedMilestoneId(data.milestones[0].id);
          }
        }
      })
      .catch(err => {
        console.warn("Failed to fetch timeline from API on mount, falling back to localStorage:", err);

        // localStorage fallback
        const stored = localStorage.getItem("history_page_config");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            parsed.marqueeImages = parsed.marqueeImages || [];
            setConfig(parsed);
            if (!parsed.heroImgUrl) setHeroSourceType("default");
            else if (parsed.heroImgUrl.startsWith("data:")) setHeroSourceType("upload");
            else { setHeroSourceType("url"); setCustomHeroUrl(parsed.heroImgUrl); }

            if (!parsed.showcaseImgUrl) setShowcaseSourceType("default");
            else if (parsed.showcaseImgUrl.startsWith("data:")) setShowcaseSourceType("upload");
            else { setShowcaseSourceType("url"); setCustomShowcaseUrl(parsed.showcaseImgUrl); }
          } catch (e) { }
        }
        const storedMilestones = localStorage.getItem("history_timeline_milestones");
        if (storedMilestones) {
          try {
            const parsed = JSON.parse(storedMilestones);
            setMilestones(parsed);
            if (parsed.length > 0) setSelectedMilestoneId(parsed[0].id);
          } catch (e) { }
        }
      });
  }, []);

  const handleAddMilestone = () => {
    const nextId = milestones.length > 0 ? Math.max(...milestones.map(m => m.id)) + 1 : 1;
    const newMilestone = {
      id: nextId,
      year: "2027",
      title: "Tiêu đề cột mốc mới",
      image: "",
      desc: "Mô tả ngắn gọn về cột mốc sự kiện mới này...",
      article: "Nội dung bài viết chi tiết...",
      articleType: "html",
      url: ""
    };
    const newMilestones = [...milestones, newMilestone];
    setMilestones(newMilestones);
    setSelectedMilestoneId(newMilestone.id);
  };

  const handleDeleteMilestone = (id) => {
    if (window.confirm("⚠️ Bạn có chắc chắn muốn xóa mốc sự kiện lịch sử này không?")) {
      const newMilestones = milestones.filter(m => m.id !== id);
      setMilestones(newMilestones);
      if (selectedMilestoneId === id) {
        setSelectedMilestoneId(newMilestones[0]?.id || null);
      }
    }
  };

  const handleFieldChange = (field, value) => {
    const newMilestones = milestones.map(m => {
      if (m.id === selectedMilestoneId) {
        return { ...m, [field]: value };
      }
      return m;
    });
    setMilestones(newMilestones);
  };

  const handleMilestoneImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    compressImage(file, 600, 450, 0.7)
      .then(base64 => {
        handleFieldChange("image", base64);
      })
      .catch(err => {
        console.error("Image compression failed", err);
      });
  };

  const activeMilestone = milestones.find(m => m.id === selectedMilestoneId);

  const handleHeroFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    compressImage(file, 1600, 1000, 0.75)
      .then(base64 => {
        setConfig(prev => ({ ...prev, heroImgUrl: base64 }));
      })
      .catch(err => console.error("Hero image compression failed", err));
  };

  const handleShowcaseFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    compressImage(file, 800, 600, 0.7)
      .then(base64 => {
        setConfig(prev => ({ ...prev, showcaseImgUrl: base64 }));
      })
      .catch(err => console.error("Showcase image compression failed", err));
  };

  const handleMarqueeBulkUpload = (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    fileList.forEach(file => {
      compressImage(file, 970, 700, 0.7)
        .then(base64 => {
          setConfig(prev => ({
            ...prev,
            marqueeImages: [...(prev.marqueeImages || []), base64]
          }));
        })
        .catch(err => console.error("Marquee image compression failed", err));
    });
  };

  const handleReplaceMarqueeImage = (index, file) => {
    if (!file) return;
    compressImage(file, 970, 700, 0.7)
      .then(base64 => {
        setConfig(prev => {
          const updated = [...(prev.marqueeImages || [])];
          updated[index] = base64;
          return { ...prev, marqueeImages: updated };
        });
      })
      .catch(err => console.error("Replace image compression failed", err));
  };

  const handleDeleteMarqueeImage = (index) => {
    if (window.confirm("🗑️ Bạn có chắc chắn muốn xóa ảnh này khỏi album cuộn không?")) {
      setConfig(prev => {
        const updated = (prev.marqueeImages || []).filter((_, idx) => idx !== index);
        return { ...prev, marqueeImages: updated };
      });
    }
  };

  const handleSwapMarqueeImages = (i, j) => {
    setConfig(prev => {
      const updated = [...(prev.marqueeImages || [])];
      if (i < 0 || i >= updated.length || j < 0 || j >= updated.length) return prev;
      const temp = updated[i];
      updated[i] = updated[j];
      updated[j] = temp;
      return { ...prev, marqueeImages: updated };
    });
  };

  const handleMarqueeUrlChange = (index, value) => {
    setConfig(prev => {
      const updated = [...(prev.marqueeImages || [])];
      updated[index] = value;
      return { ...prev, marqueeImages: updated };
    });
  };

  const handleSave = () => {
    let finalConfig = { ...config };

    // Set hero image based on type
    if (heroSourceType === "default") {
      finalConfig.heroImgUrl = "";
    } else if (heroSourceType === "url") {
      finalConfig.heroImgUrl = customHeroUrl;
    } // If upload, it's already in config

    // Set showcase image based on type
    if (showcaseSourceType === "default") {
      finalConfig.showcaseImgUrl = "";
    } else if (showcaseSourceType === "url") {
      finalConfig.showcaseImgUrl = customShowcaseUrl;
    } // If upload, it's already in config

    const payload = {
      config: finalConfig,
      milestones: milestones
    };

    setSaveStatus("Saving changes to server...");

    fetch(`${DOTNET_API_URL}/HistoryTimeline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("API POST failed");
        return res.json();
      })
      .then(() => {
        // Double-save in localStorage for immediate sync robustness
        localStorage.setItem("history_page_config", JSON.stringify(finalConfig));
        localStorage.setItem("history_timeline_milestones", JSON.stringify(milestones));

        setSaveStatus("Configuration saved to server successfully!");
        setTimeout(() => setSaveStatus(""), 3000);
      })
      .catch(err => {
        console.warn("API save failed, using local storage backup:", err);
        try {
          localStorage.setItem("history_page_config", JSON.stringify(finalConfig));
          localStorage.setItem("history_timeline_milestones", JSON.stringify(milestones));
          setSaveStatus("Saved to Local Storage (Server Offline)!");
          setTimeout(() => setSaveStatus(""), 3000);
        } catch (e) {
          alert("❌ Storage Error: Data is too large for local backup!");
        }
      });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore the default History Page layout?")) {
      setSaveStatus("Restoring server defaults...");

      fetch(`${DOTNET_API_URL}/HistoryTimeline/default`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch default settings");
          return res.json();
        })
        .then(defaultPayload => {
          return fetch(`${DOTNET_API_URL}/HistoryTimeline`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(defaultPayload)
          }).then(res => {
            if (!res.ok) throw new Error("Reset POST failed");
            return defaultPayload;
          });
        })
        .then(defaultPayload => {
          localStorage.removeItem("history_page_config");
          localStorage.removeItem("history_timeline_milestones");

          const resetConfig = defaultPayload.config || {};
          resetConfig.marqueeImages = resetConfig.marqueeImages || [];
          setConfig(resetConfig);
          setMilestones(defaultPayload.milestones || []);
          setHeroSourceType("default");
          setShowcaseSourceType("default");
          setCustomHeroUrl("");
          setCustomShowcaseUrl("");

          setSaveStatus("Restored default configurations on server successfully!");
          setTimeout(() => setSaveStatus(""), 3000);
        })
        .catch(err => {
          console.error("Server reset failed:", err);
          setSaveStatus("Failed to restore defaults!");
          setTimeout(() => setSaveStatus(""), 3000);
        });
    }
  };

  return (
    <div className="admin-tab-container">
      <h3 className="admin-tab-title">📜 Customize History Page (Evolution)</h3>
      <p className="admin-tab-desc">Modify the images, headlines, and historical introduction stories shown on the system evolution page.</p>

      {/* Sub-tab Switcher Bar */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "28px",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        padding: "6px",
        borderRadius: "12px",
        width: "fit-content"
      }}>
        <button
          onClick={() => setActiveCategory("general")}
          style={{
            background: activeCategory === "general" ? "rgba(0, 242, 255, 0.08)" : "transparent",
            border: "1px solid " + (activeCategory === "general" ? "rgba(0, 242, 255, 0.25)" : "transparent"),
            color: activeCategory === "general" ? "#00f2ff" : "rgba(255, 255, 255, 0.6)",
            padding: "8px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
        >
          📜 Cấu hình Chung (General Layout)
        </button>
        <button
          onClick={() => setActiveCategory("milestones")}
          style={{
            background: activeCategory === "milestones" ? "rgba(0, 242, 255, 0.08)" : "transparent",
            border: "1px solid " + (activeCategory === "milestones" ? "rgba(0, 242, 255, 0.25)" : "transparent"),
            color: activeCategory === "milestones" ? "#00f2ff" : "rgba(255, 255, 255, 0.6)",
            padding: "8px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
        >
          ⏳ Quản lý Dòng Sự Kiện (Timeline Eras)
        </button>
        <button
          onClick={() => setActiveCategory("marquee")}
          style={{
            background: activeCategory === "marquee" ? "rgba(0, 242, 255, 0.08)" : "transparent",
            border: "1px solid " + (activeCategory === "marquee" ? "rgba(0, 242, 255, 0.25)" : "transparent"),
            color: activeCategory === "marquee" ? "#00f2ff" : "rgba(255, 255, 255, 0.6)",
            padding: "8px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
        >
          🌌 Bộ Sưu Tập Cuộn (Marquee Album)
        </button>
      </div>

      <div className="admin-form-group-list">

        {/* ================= CATEGORY 1: GENERAL PAGE LAYOUT ================= */}
        {activeCategory === "general" && (
          <>
            {/* TEXT CONTENT CONFIG */}
            <div className="admin-card-inner" style={{ marginTop: 0 }}>
              <h4 className="admin-card-inner-title">Text Content Configuration</h4>
              <p className="admin-card-inner-desc">Configure the headline title and detailed narrative story about the system's journey.</p>

              <div className="admin-form-group" style={{ marginBottom: "16px" }}>
                <label className="admin-form-label">MAIN HEADLINE TITLE</label>
                <input
                  type="text"
                  className="control-input"
                  value={config.headline}
                  onChange={(e) => setConfig(prev => ({ ...prev, headline: e.target.value }))}
                  placeholder="Example: The Journey of AI Innovation"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">INTRODUCTION STORYTEXT</label>
                <textarea
                  className="control-input"
                  rows="6"
                  value={config.introText}
                  onChange={(e) => setConfig(prev => ({ ...prev, introText: e.target.value }))}
                  placeholder="Write the introduction description paragraphs..."
                  style={{ resize: "vertical", minHeight: "120px" }}
                />
              </div>
            </div>

            {/* HERO IMAGE CUSTOMIZATION */}
            <div className="admin-card-inner">
              <h4 className="admin-card-inner-title">Section 1: Hero Banner Image</h4>
              <p className="admin-card-inner-desc">Customize the high-impact banner image displayed at the top of the history page.</p>

              <div style={{
                marginBottom: "16px",
                padding: "10px",
                background: "rgba(255, 170, 0, 0.04)",
                border: "1px solid rgba(255, 170, 0, 0.15)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "rgba(255, 200, 100, 0.85)",
                lineHeight: "1.4"
              }}>
                ⚠️ <strong>Recommended Size:</strong> 1920px x 800px (aspect ratio 2.4:1 or 16:9).
                As a full-width background hero banner, images with other aspect ratios will be cropped automatically.
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">HERO IMAGE SOURCE</label>
                  <select
                    className="control-input"
                    value={heroSourceType}
                    onChange={(e) => setHeroSourceType(e.target.value)}
                  >
                    <option value="default">Default Hero Image (Assets: slide.png)</option>
                    <option value="url">Custom File Path or URL Link</option>
                    <option value="upload">Upload New Image File (.png, .jpg, .webp)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  {heroSourceType === "url" && (
                    <>
                      <label className="admin-form-label">CUSTOM HERO IMAGE PATH / URL</label>
                      <input
                        type="text"
                        className="control-input"
                        value={customHeroUrl}
                        onChange={(e) => setCustomHeroUrl(e.target.value)}
                        placeholder="e.g. /src/assets/history/slide.png or URL link"
                      />
                    </>
                  )}

                  {heroSourceType === "upload" && (
                    <>
                      <label className="admin-form-label">UPLOAD HERO IMAGE</label>
                      <input
                        type="file"
                        className="control-input"
                        accept="image/*"
                        onChange={handleHeroFileChange}
                        style={{ paddingTop: "8px" }}
                      />
                    </>
                  )}

                  {heroSourceType === "default" && (
                    <div style={{ display: "flex", alignItems: "center", height: "100%", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                      Using default system slideshow image.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SHOWCASE IMAGE CUSTOMIZATION */}
            <div className="admin-card-inner">
              <h4 className="admin-card-inner-title">Section 2: Narrative Showcase Image</h4>
              <p className="admin-card-inner-desc">Customize the frame image displayed next to the introduction story.</p>

              <div style={{
                marginBottom: "16px",
                padding: "10px",
                background: "rgba(255, 170, 0, 0.04)",
                border: "1px solid rgba(255, 170, 0, 0.15)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "rgba(255, 200, 100, 0.85)",
                lineHeight: "1.4"
              }}>
                ⚠️ <strong>Recommended Size:</strong> 800px x 600px (aspect ratio 4:3 or 1.3:1).
                The image is styled with a beautiful frame container, and will be cropped automatically to fill the display boundary.
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">SHOWCASE IMAGE SOURCE</label>
                  <select
                    className="control-input"
                    value={showcaseSourceType}
                    onChange={(e) => setShowcaseSourceType(e.target.value)}
                  >
                    <option value="default">Default Showcase Image (Assets: history.webp)</option>
                    <option value="url">Custom File Path or URL Link</option>
                    <option value="upload">Upload New Image File (.png, .jpg, .webp)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  {showcaseSourceType === "url" && (
                    <>
                      <label className="admin-form-label">CUSTOM SHOWCASE IMAGE PATH / URL</label>
                      <input
                        type="text"
                        className="control-input"
                        value={customShowcaseUrl}
                        onChange={(e) => setCustomShowcaseUrl(e.target.value)}
                        placeholder="e.g. /src/assets/history.webp or URL link"
                      />
                    </>
                  )}

                  {showcaseSourceType === "upload" && (
                    <>
                      <label className="admin-form-label">UPLOAD SHOWCASE IMAGE</label>
                      <input
                        type="file"
                        className="control-input"
                        accept="image/*"
                        onChange={handleShowcaseFileChange}
                        style={{ paddingTop: "8px" }}
                      />
                    </>
                  )}

                  {showcaseSourceType === "default" && (
                    <div style={{ display: "flex", alignItems: "center", height: "100%", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                      Using default system history showcase image.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= CATEGORY 2: TIMELINE MILESTONES SPLIT PANE ================= */}
        {activeCategory === "milestones" && (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "28px", alignItems: "start", marginTop: "4px" }}>

            {/* LEFT PANEL: Compact Sidebar List */}
            <div style={{
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxHeight: "680px",
              overflowY: "auto"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Active Eras ({milestones.length})
                </span>
                <button
                  onClick={handleAddMilestone}
                  style={{
                    background: "rgba(0, 255, 136, 0.08)",
                    border: "1px solid rgba(0, 255, 136, 0.25)",
                    color: "#00ff88",
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#00ff88"; e.currentTarget.style.color = "#020205"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(0, 255, 136, 0.08)"; e.currentTarget.style.color = "#00ff88"; }}
                >
                  + Thêm mới
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {milestones.map((m, index) => {
                  const isSelected = m.id === selectedMilestoneId;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMilestoneId(m.id)}
                      style={{
                        padding: "10px 14px",
                        background: isSelected ? "rgba(0, 242, 255, 0.05)" : "rgba(255, 255, 255, 0.01)",
                        border: "1px solid " + (isSelected ? "rgba(0, 242, 255, 0.25)" : "rgba(255, 255, 255, 0.04)"),
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                        <span style={{ fontSize: "13px", fontWeight: "900", color: isSelected ? "#00f2ff" : "#fff" }}>
                          {m.year || "New Year"}
                        </span>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                          {m.title || "No Title"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMilestone(m.id);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(255, 70, 70, 0.5)",
                          fontSize: "13px",
                          cursor: "pointer",
                          padding: "4px",
                          transition: "color 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = "#ff4646"}
                        onMouseLeave={e => e.currentTarget.style.color = "rgba(255, 70, 70, 0.5)"}
                        title="Xóa cột mốc"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PANEL: Focused Milestone Editor Form */}
            <div style={{
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
              borderRadius: "16px",
              padding: "24px",
              minHeight: "450px"
            }}>
              {activeMilestone ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px", marginBottom: "4px" }}>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#00f2ff" }}>
                      Chỉnh sửa Cột Mốc: {activeMilestone.year || "Mới"}
                    </h4>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>ID: {activeMilestone.id}</span>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">MILESTONE YEAR / TIME</label>
                      <input
                        type="text"
                        className="control-input"
                        value={activeMilestone.year}
                        onChange={(e) => handleFieldChange("year", e.target.value)}
                        placeholder="e.g. 1687"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">MILESTONE TITLE</label>
                      <input
                        type="text"
                        className="control-input"
                        value={activeMilestone.title}
                        onChange={(e) => handleFieldChange("title", e.target.value)}
                        placeholder="e.g. Newton & Leibniz Era"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">MILESTONE IMAGE (PREVIEW & UPLOAD)</label>
                    <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "16px", alignItems: "center", marginTop: "8px" }}>
                      {/* Image Preview */}
                      <div style={{
                        width: "150px",
                        height: "100px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(0, 0, 0, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative"
                      }}>
                        {activeMilestone.image ? (
                          <img
                            src={activeMilestone.image}
                            alt="preview"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>No Image</span>
                        )}
                      </div>

                      {/* Upload and URL controls */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input
                            type="text"
                            className="control-input"
                            value={activeMilestone.image || ""}
                            onChange={(e) => handleFieldChange("image", e.target.value)}
                            placeholder="Image URL or File Path (e.g. /src/assets/history.webp)"
                            style={{ flex: 1 }}
                          />
                          <label className="btn-primary" style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: "10px 16px",
                            fontSize: "12px",
                            height: "auto",
                            background: "rgba(0, 242, 255, 0.1)",
                            border: "1px solid rgba(0, 242, 255, 0.3)",
                            color: "#00f2ff",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            margin: 0
                          }}>
                            Upload File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleMilestoneImageChange}
                              style={{ display: "none" }}
                            />
                          </label>
                        </div>
                        {/* Drag and Drop */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = "#00f2ff";
                            e.currentTarget.style.background = "rgba(0, 242, 255, 0.05)";
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                            const file = e.dataTransfer.files[0];
                            if (file) {
                              compressImage(file, 600, 450, 0.7)
                                .then(base64 => {
                                  handleFieldChange("image", base64);
                                })
                                .catch(err => console.error("Milestone drop image compression failed", err));
                            }
                          }}
                          style={{
                            border: "1px dashed rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            padding: "10px",
                            textAlign: "center",
                            fontSize: "11px",
                            color: "rgba(255,255,255,0.4)",
                            background: "rgba(255,255,255,0.01)",
                            transition: "all 0.3s",
                            cursor: "pointer"
                          }}
                        >
                          Drag & drop image file here to upload (max 2MB)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">NARRATIVE DESCRIPTION</label>
                    <textarea
                      className="control-input"
                      rows="2"
                      value={activeMilestone.desc}
                      onChange={(e) => handleFieldChange("desc", e.target.value)}
                      placeholder="Brief description about this milestone..."
                      style={{ resize: "vertical", minHeight: "50px" }}
                    />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">ARTICLE FORMAT TYPE (BÀI VIẾT)</label>
                      <select
                        className="control-input"
                        value={activeMilestone.articleType || "text"}
                        onChange={(e) => handleFieldChange("articleType", e.target.value)}
                      >
                        <option value="text">Văn bản thường (Plain Text)</option>
                        <option value="html">Văn bản HTML (Rich HTML)</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">ARTICLE LINK SOURCE URL (ĐƯỜNG DẪN BÀI VIẾT)</label>
                      <input
                        type="text"
                        className="control-input"
                        value={activeMilestone.url || ""}
                        onChange={(e) => handleFieldChange("url", e.target.value)}
                        placeholder="e.g. https://wikipedia.org/wiki/Riemann_integral"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">DETAILED ARTICLE CONTENT (NỘI DUNG BÀI VIẾT CHI TIẾT - SOẠN THẢO WYSIWYG)</label>
                    <CKEditorWrapper
                      key={selectedMilestoneId}
                      value={activeMilestone.article || ""}
                      onChange={(val) => handleFieldChange("article", val)}
                    />
                  </div>
                </div>
              ) : (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  minHeight: "350px",
                  color: "rgba(255,255,255,0.25)",
                  fontSize: "13px",
                  gap: "8px"
                }}>
                  <span>📂 Vui lòng chọn một cột mốc sự kiện từ danh sách bên trái để chỉnh sửa</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>hoặc bấm nút "+ Thêm mới"</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= CATEGORY 3: MARQUEE ALBUM MANAGER ================= */}
        {activeCategory === "marquee" && (
          <div className="admin-card-inner" style={{ marginTop: 0 }}>
            <h4 className="admin-card-inner-title">🌌 Cấu hình Bộ Sưu Tập Cuộn (3D Marquee Album)</h4>
            <p className="admin-card-inner-desc">
              Quản lý danh sách các ảnh chạy cuộn 3D ở phần thiết kế trên trang Lịch sử. Khuyên dùng tối thiểu 4 - 8 ảnh để đạt hiệu ứng cuộn mượt mà nhất.
            </p>

            <div style={{
              marginBottom: "24px",
              padding: "12px 16px",
              background: "rgba(0, 242, 255, 0.03)",
              border: "1px solid rgba(0, 242, 255, 0.15)",
              borderRadius: "12px",
              fontSize: "13px",
              color: "rgba(0, 242, 255, 0.85)",
              lineHeight: "1.5"
            }}>
              💡 <strong>Kích thước tối ưu:</strong> Tỷ lệ khuyên dùng là <strong>970px x 700px</strong> (tương đương tỷ lệ ~1.4:1). Các ảnh có tỷ lệ khác sẽ được tự động căn giữa và phủ kín khung hiển thị. Dung lượng mỗi ảnh tải trực tiếp không nên vượt quá 2MB.
            </div>

            {/* Bulk upload / drag & drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "#00f2ff";
                e.currentTarget.style.background = "rgba(0, 242, 255, 0.06)";
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.01)";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                handleMarqueeBulkUpload(e.dataTransfer.files);
              }}
              style={{
                border: "2px dashed rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "32px",
                textAlign: "center",
                background: "rgba(255,255,255,0.01)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                marginBottom: "28px"
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>📥</div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#fff" }}>
                Kéo thả nhiều ảnh vào đây hoặc bấm để tải lên
              </p>
              <p style={{ margin: "4px 0 16px 0", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                Hỗ trợ PNG, JPG, WEBP (tối đa 2MB/ảnh)
              </p>
              <label className="btn-primary" style={{
                display: "inline-block",
                padding: "8px 20px",
                fontSize: "12px",
                height: "auto",
                background: "rgba(0, 242, 255, 0.1)",
                border: "1px solid rgba(0, 242, 255, 0.3)",
                color: "#00f2ff",
                borderRadius: "8px",
                fontWeight: "bold",
                margin: 0,
                cursor: "pointer"
              }}>
                Chọn file ảnh
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleMarqueeBulkUpload(e.target.files)}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* Gallery Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px"
            }}>
              {(config.marqueeImages || []).map((img, idx) => (
                <div key={idx} style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  transition: "all 0.3s ease",
                  position: "relative"
                }}>
                  {/* Image preview */}
                  <div style={{
                    width: "100%",
                    height: "160px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(0,0,0,0.2)",
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    {img.startsWith("data:") ? (
                      <img src={img} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a24" }}>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>🔍 Ảnh từ đường dẫn / asset</span>
                        <img src={img} alt={`Preview ${idx + 1}`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}

                    {/* Index Badge */}
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      background: "rgba(0, 242, 255, 0.8)",
                      color: "#000",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "800"
                    }}>
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Edit path/url input */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Đường dẫn hoặc URL ảnh</label>
                    <input
                      type="text"
                      className="control-input"
                      value={img.startsWith("data:") ? "[Tệp Base64 tải lên]" : img}
                      disabled={img.startsWith("data:")}
                      onChange={(e) => handleMarqueeUrlChange(idx, e.target.value)}
                      placeholder="e.g. /src/assets/history/design_orbit.png"
                      style={{ fontSize: "12px", padding: "8px 12px" }}
                    />
                  </div>

                  {/* Actions row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleSwapMarqueeImages(idx, idx - 1)}
                        disabled={idx === 0}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: idx === 0 ? "rgba(255,255,255,0.15)" : "#fff",
                          cursor: idx === 0 ? "not-allowed" : "pointer",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          transition: "all 0.2s"
                        }}
                        title="Di chuyển sang trái"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() => handleSwapMarqueeImages(idx, idx + 1)}
                        disabled={idx === (config.marqueeImages || []).length - 1}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: idx === (config.marqueeImages || []).length - 1 ? "rgba(255,255,255,0.15)" : "#fff",
                          cursor: idx === (config.marqueeImages || []).length - 1 ? "not-allowed" : "pointer",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          transition: "all 0.2s"
                        }}
                        title="Di chuyển sang phải"
                      >
                        ▶
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      {/* Replace */}
                      <label className="btn-primary" style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px 10px",
                        fontSize: "11px",
                        height: "auto",
                        background: "rgba(0, 242, 255, 0.06)",
                        border: "1px solid rgba(0, 242, 255, 0.2)",
                        color: "#00f2ff",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        margin: 0,
                        cursor: "pointer"
                      }}>
                        Thay thế
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleReplaceMarqueeImage(idx, e.target.files[0])}
                          style={{ display: "none" }}
                        />
                      </label>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteMarqueeImage(idx)}
                        style={{
                          background: "rgba(255, 70, 70, 0.08)",
                          border: "1px solid rgba(255, 70, 70, 0.25)",
                          color: "#ff4646",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#ff4646"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 70, 70, 0.08)"}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {(!config.marqueeImages || config.marqueeImages.length === 0) && (
              <div style={{
                textAlign: "center",
                padding: "40px",
                color: "rgba(255,255,255,0.35)",
                fontSize: "14px",
                border: "1px dashed rgba(255,255,255,0.06)",
                borderRadius: "12px",
                background: "rgba(0,0,0,0.1)"
              }}>
                ⚠️ Album hiện đang rỗng. Trang Lịch sử sẽ tự động hiển thị 8 ảnh toán học/mô phỏng mặc định.
              </div>
            )}
          </div>
        )}

        {/* SAVE & RESET BUTTONS */}
        <div style={{ display: "flex", gap: "12px", marginTop: "12px", alignItems: "center" }}>
          <button className="btn-primary" onClick={handleSave}>
            Save Configuration
          </button>

          <button
            className="btn-primary"
            onClick={handleReset}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#aaa",
              boxShadow: "none"
            }}
          >
            Restore Defaults
          </button>

          {saveStatus && (
            <span style={{ color: "#00ff88", fontWeight: "700", fontSize: "14px", marginLeft: "12px", animation: "fadeSlide 0.3s ease" }}>
              ✓ {saveStatus}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
