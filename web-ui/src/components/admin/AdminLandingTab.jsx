import React, { useState, useEffect } from "react";
import "../../styles/AdminTabs.css";

export default function AdminLandingTab() {
  const [config, setConfig] = useState({
    logoUrl: "",
    videoUrl: "",
    btnText: "Explore Now",
    backgroundType: "video",
    albumImages: []
  });

  const [logoSourceType, setLogoSourceType] = useState("default"); // "default" | "url" | "upload"
  const [videoSourceType, setVideoSourceType] = useState("default"); // "default" | "url" | "upload"
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [customVideoUrl, setCustomVideoUrl] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [backgroundType, setBackgroundType] = useState("video");
  const [albumImages, setAlbumImages] = useState([]);

  // Category Representative Images Config
  const [categoryImages, setCategoryImages] = useState({
    history: { sourceType: "default", customUrl: "", value: "" },
    theory: { sourceType: "default", customUrl: "", value: "" },
    ai: { sourceType: "default", customUrl: "", value: "" },
    info: { sourceType: "default", customUrl: "", value: "" },
    contact: { sourceType: "default", customUrl: "", value: "" }
  });

  // Load configuration from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("landing_config");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig(parsed);
        setBackgroundType(parsed.backgroundType || "video");
        setAlbumImages(parsed.albumImages || []);

        // Determine source type for logo
        if (!parsed.logoUrl) {
          setLogoSourceType("default");
        } else if (parsed.logoUrl.startsWith("data:")) {
          setLogoSourceType("upload");
        } else {
          setLogoSourceType("url");
          setCustomLogoUrl(parsed.logoUrl);
        }

        // Determine source type for video
        if (!parsed.videoUrl) {
          setVideoSourceType("default");
        } else if (parsed.videoUrl.startsWith("data:") || parsed.videoUrl.startsWith("blob:")) {
          setVideoSourceType("upload");
        } else {
          setVideoSourceType("url");
          setCustomVideoUrl(parsed.videoUrl);
        }
      } catch (e) {
        console.error("Failed to load landing config", e);
      }
    }

    // Load category images config
    const storedCatImages = localStorage.getItem("landing_category_config");
    if (storedCatImages) {
      try {
        setCategoryImages(JSON.parse(storedCatImages));
      } catch (e) {
        console.error("Failed to load category images config", e);
      }
    }
  }, []);

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      // Base64 logo src
      setConfig(prev => ({ ...prev, logoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Browser Blob URL for instant preview (works in active session)
    const blobUrl = URL.createObjectURL(file);
    setConfig(prev => ({ ...prev, videoUrl: blobUrl }));

    // Warn about localStorage size limit
    if (file.size > 3 * 1024 * 1024) {
      alert("⚠️ Video file is larger than 3MB! To save permanently without browser storage limitations (5MB LocalStorage limit), please copy your video file into the 'web-ui/src/assets/' directory and configure using the 'File Path / URL' option.");
    } else {
      // Try to convert to Base64 if small enough
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          setConfig(prev => ({ ...prev, videoUrl: reader.result }));
        } catch (err) {
          console.error("Video too large for Base64", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBulkUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    let processedCount = 0;
    const newBase64s = [];

    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`⚠️ File ${file.name} is larger than 2MB! To prevent storage limit exceeded errors, please upload smaller images.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        newBase64s.push(reader.result);
        processedCount++;
        if (processedCount === files.length) {
          setAlbumImages((prev) => [...prev, ...newBase64s]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const handleReplaceImage = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("⚠️ Image file is larger than 2MB! Please select a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAlbumImages((prev) => {
        const next = [...prev];
        next[index] = reader.result;
        return next;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleDeleteImage = (index) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hình số ${index + 1} khỏi album không?`)) {
      setAlbumImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSwap = (i, j) => {
    if (i < 0 || i >= albumImages.length || j < 0 || j >= albumImages.length) return;
    setAlbumImages((prev) => {
      const next = [...prev];
      const temp = next[i];
      next[i] = next[j];
      next[j] = temp;
      return next;
    });
  };

  const handleSave = () => {
    let finalConfig = {
      ...config,
      backgroundType,
      albumImages
    };

    // Set logo based on type
    if (logoSourceType === "default") {
      finalConfig.logoUrl = "";
    } else if (logoSourceType === "url") {
      finalConfig.logoUrl = customLogoUrl;
    } // If upload, it's already set in config state by handleLogoFileChange

    // Set video based on type
    if (videoSourceType === "default") {
      finalConfig.videoUrl = "";
    } else if (videoSourceType === "url") {
      finalConfig.videoUrl = customVideoUrl;
    } // If upload, it's already set in config state by handleVideoFileChange

    try {
      localStorage.setItem("landing_config", JSON.stringify(finalConfig));

      // Save category images config and values
      const savedConfig = {};
      const finalValues = {};
      Object.keys(categoryImages).forEach(key => {
        const item = categoryImages[key];
        savedConfig[key] = item;

        if (item.sourceType === "url") {
          finalValues[key] = item.customUrl;
        } else if (item.sourceType === "upload") {
          finalValues[key] = item.value;
        } else {
          finalValues[key] = ""; // default
        }
      });
      localStorage.setItem("landing_category_config", JSON.stringify(savedConfig));
      localStorage.setItem("landing_category_images", JSON.stringify(finalValues));

      setSaveStatus("Configuration saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (e) {
      alert("❌ Storage Error: Data is too large! Please switch to using a URL path or copy the files into the project assets folder.");
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore the default Landing Page layout?")) {
      localStorage.removeItem("landing_config");
      localStorage.removeItem("landing_category_config");
      localStorage.removeItem("landing_category_images");
      setConfig({ logoUrl: "", videoUrl: "", btnText: "Explore Now", backgroundType: "video", albumImages: [] });
      setLogoSourceType("default");
      setVideoSourceType("default");
      setCustomLogoUrl("");
      setCustomVideoUrl("");
      setBackgroundType("video");
      setAlbumImages([]);
      setCategoryImages({
        history: { sourceType: "default", customUrl: "", value: "" },
        theory: { sourceType: "default", customUrl: "", value: "" },
        ai: { sourceType: "default", customUrl: "", value: "" },
        info: { sourceType: "default", customUrl: "", value: "" },
        contact: { sourceType: "default", customUrl: "", value: "" }
      });
      setSaveStatus("Restored default configurations successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  return (
    <div className="admin-tab-container">
      <h3 className="admin-tab-title">🏠 Customize Landing Page (Intro)</h3>
      <p className="admin-tab-desc">Modify the Slideshow hero section, logo, and active background resources.</p>

      <div className="admin-form-group-list">

        {/* HERO ACTIONS */}
        <div className="admin-card-inner" style={{ marginTop: 0 }}>
          <h4 className="admin-card-inner-title">SlideShow & Hero Content</h4>
          <p className="admin-card-inner-desc">Configure the action buttons and texts displayed on the home page slideshow.</p>

          <div className="admin-form-group" style={{ marginBottom: "16px" }}>
            <label className="admin-form-label">BUTTON INTERACTION TEXT</label>
            <input
              type="text"
              className="control-input"
              value={config.btnText}
              onChange={(e) => setConfig(prev => ({ ...prev, btnText: e.target.value }))}
              placeholder="Example: Explore Now or Get Started"
            />
          </div>
        </div>

        {/* BACKGROUND OPTIONS */}
        <div className="admin-card-inner">
          <h4 className="admin-card-inner-title">Hero Background Settings</h4>
          <p className="admin-card-inner-desc">Choose between a looping video or an image album slideshow for the hero background.</p>

          <div className="admin-form-group" style={{ marginBottom: "20px" }}>
            <label className="admin-form-label">BACKGROUND TYPE</label>
            <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#fff", fontSize: "14px" }}>
                <input
                  type="radio"
                  name="backgroundType"
                  value="video"
                  checked={backgroundType === "video"}
                  onChange={() => setBackgroundType("video")}
                  style={{ cursor: "pointer" }}
                />
                Looped Video Background
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#fff", fontSize: "14px" }}>
                <input
                  type="radio"
                  name="backgroundType"
                  value="album"
                  checked={backgroundType === "album"}
                  onChange={() => setBackgroundType("album")}
                  style={{ cursor: "pointer" }}
                />
                Image Album Slideshow
              </label>
            </div>
          </div>
        </div>

        {backgroundType === "album" && (
          <div className="admin-card-inner">
            <h4 className="admin-card-inner-title">Image Album Manager</h4>
            <p className="admin-card-inner-desc">Upload multiple images, rearrange their order, replace individual images, or delete them.</p>

            <div style={{
              marginBottom: "20px",
              padding: "12px",
              background: "rgba(0, 242, 255, 0.03)",
              border: "1px solid rgba(0, 242, 255, 0.15)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.65)"
            }}>
              💡 <strong>Bulk Upload:</strong> You can select multiple images at once to add to the album. Recommended size: 1920x1080 px.
            </div>

            {/* Input to add multiple images */}
            <div className="admin-form-group" style={{ marginBottom: "24px" }}>
              <label className="admin-form-label">ADD IMAGES TO ALBUM</label>
              <input
                type="file"
                className="control-input"
                accept="image/*"
                multiple
                onChange={handleBulkUpload}
                style={{ paddingTop: "8px" }}
              />
            </div>

            {/* Grid of images in the album */}
            <label className="admin-form-label" style={{ marginBottom: "12px", display: "block" }}>ALBUM SLIDES ({albumImages.length})</label>
            {albumImages.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px",
                border: "2px dashed rgba(255,255,255,0.08)",
                borderRadius: "12px",
                color: "rgba(255,255,255,0.3)",
                fontSize: "13px"
              }}>
                No images in album. Upload some images above to get started.
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px"
              }}>
                {albumImages.map((imgUrl, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "12px",
                      padding: "8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px"
                    }}
                  >
                    {/* Index Badge */}
                    <div style={{
                      position: "absolute",
                      top: "14px",
                      left: "14px",
                      background: "rgba(0,0,0,0.75)",
                      color: "#00f2ff",
                      fontSize: "11px",
                      fontWeight: "800",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                      border: "1px solid rgba(0,242,255,0.3)"
                    }}>
                      {index + 1}
                    </div>

                    {/* Image Preview */}
                    <div style={{
                      width: "100%",
                      height: "120px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      background: "#111"
                    }}>
                      <img
                        src={imgUrl}
                        alt={`Slide ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleSwap(index, index - 1)}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "none",
                            borderRadius: "4px",
                            color: "#fff",
                            width: "28px",
                            height: "28px",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                            opacity: index === 0 ? 0.3 : 1
                          }}
                          title="Move Left"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          disabled={index === albumImages.length - 1}
                          onClick={() => handleSwap(index, index + 1)}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "none",
                            borderRadius: "4px",
                            color: "#fff",
                            width: "28px",
                            height: "28px",
                            cursor: index === albumImages.length - 1 ? "not-allowed" : "pointer",
                            opacity: index === albumImages.length - 1 ? 0.3 : 1
                          }}
                          title="Move Right"
                        >
                          ▶
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        {/* Replace Button */}
                        <label
                          style={{
                            background: "rgba(0, 242, 255, 0.1)",
                            border: "1px solid rgba(0, 242, 255, 0.2)",
                            borderRadius: "6px",
                            color: "#00f2ff",
                            padding: "4px 8px",
                            fontSize: "11px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                        >
                          Đổi
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleReplaceImage(index, e)}
                            style={{ display: "none" }}
                          />
                        </label>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(index)}
                          style={{
                            background: "rgba(255, 70, 70, 0.1)",
                            border: "1px solid rgba(255, 70, 70, 0.2)",
                            borderRadius: "6px",
                            color: "#ff4646",
                            padding: "4px 8px",
                            fontSize: "11px",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LOGO CUSTOMIZATION */}
        <div className="admin-card-inner">
          <h4 className="admin-card-inner-title">Logo Configuration</h4>
          <p className="admin-card-inner-desc">Customize the icon logo displayed on the Slideshow header.</p>

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
            ⚠️ <strong>Recommended Size:</strong> 120px – 240px wide (aspect ratio 1:1 or 2:1).
            Images with smaller or larger dimensions will be automatically cropped and scaled to fit the display area.
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">LOGO SOURCE TYPE</label>
              <select
                className="control-input"
                value={logoSourceType}
                onChange={(e) => setLogoSourceType(e.target.value)}
              >
                <option value="default">Default Logo (Assets: logo.png)</option>
                <option value="url">Custom File Path or URL Link</option>
                <option value="upload">Upload New Image File (.png, .jpg)</option>
              </select>
            </div>

            <div className="admin-form-group">
              {logoSourceType === "url" && (
                <>
                  <label className="admin-form-label">CUSTOM LOGO PATH / URL</label>
                  <input
                    type="text"
                    className="control-input"
                    value={customLogoUrl}
                    onChange={(e) => setCustomLogoUrl(e.target.value)}
                    placeholder="http://example.com/logo.png or /src/assets/logo.png"
                  />
                </>
              )}

              {logoSourceType === "upload" && (
                <>
                  <label className="admin-form-label">UPLOAD IMAGE FILE</label>
                  <input
                    type="file"
                    className="control-input"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    style={{ paddingTop: "8px" }}
                  />
                </>
              )}

              {logoSourceType === "default" && (
                <div style={{ display: "flex", alignItems: "center", height: "100%", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                  Using default system resources.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VIDEO BG CUSTOMIZATION */}
        <div className="admin-card-inner">
          <h4 className="admin-card-inner-title">SlideShow Video Background</h4>
          <p className="admin-card-inner-desc">Change the moving video background of the Landing Page slideshow.</p>

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
            ⚠️ <strong>Recommended Resolution:</strong> Full HD (1920x1080 px, aspect ratio 16:9).
            The video uses cover scaling and will be cropped automatically to fill the screen on different device aspect ratios.
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">VIDEO BACKGROUND SOURCE</label>
              <select
                className="control-input"
                value={videoSourceType}
                onChange={(e) => setVideoSourceType(e.target.value)}
              >
                <option value="default">Default Video (Assets: mp_.mp4)</option>
                <option value="url">Custom File Path or URL Link</option>
                <option value="upload">Upload Video File (.mp4)</option>
              </select>
            </div>

            <div className="admin-form-group">
              {videoSourceType === "url" && (
                <>
                  <label className="admin-form-label">CUSTOM VIDEO PATH / URL</label>
                  <input
                    type="text"
                    className="control-input"
                    value={customVideoUrl}
                    onChange={(e) => setCustomVideoUrl(e.target.value)}
                    placeholder="Example: /src/assets/my_video.mp4 or HTTP URL"
                  />
                </>
              )}

              {videoSourceType === "upload" && (
                <>
                  <label className="admin-form-label">SELECT VIDEO FILE</label>
                  <input
                    type="file"
                    className="control-input"
                    accept="video/mp4"
                    onChange={handleVideoFileChange}
                    style={{ paddingTop: "8px" }}
                  />
                </>
              )}

              {videoSourceType === "default" && (
                <div style={{ display: "flex", alignItems: "center", height: "100%", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                  Using default system background video.
                </div>
              )}
            </div>
          </div>

          <div style={{
            marginTop: "16px",
            padding: "12px",
            background: "rgba(0, 242, 255, 0.03)",
            border: "1px solid rgba(0, 242, 255, 0.1)",
            borderRadius: "12px",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.6)",
            lineHeight: "1.6"
          }}>
            <strong>💡 How to Embed Video into Project Assets:</strong><br />
            To permanently store high-quality video files without browser local storage limitations, copy your video file into the
            <code style={{ color: "#00f2ff", margin: "0 4px", fontFamily: "monospace" }}>/web-ui/src/assets/</code> directory.
            Then, select the <strong>"Custom File Path or URL Link"</strong> option above and enter the filename for automatic loading.
          </div>
        </div>
        {/* REPRESENTATIVE IMAGES */}
        <div className="admin-card-inner">
          <h4 className="admin-card-inner-title">Category Representative Images (Landing Page)</h4>
          <p className="admin-card-inner-desc">Configure the representative image displayed for each page section on the landing page grid.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
            {Object.keys(categoryImages).map((key) => {
              const item = categoryImages[key];
              const labelMap = {
                history: "Lịch sử phát triển",
                theory: "Kiến thức (Theory)",
                ai: "AI Solver",
                info: "Thông tin (Info)",
                contact: "Liên hệ (Contact)"
              };

              // Get current preview image
              let previewSrc = "";
              if (item.sourceType === "url") {
                previewSrc = item.customUrl;
              } else if (item.sourceType === "upload") {
                previewSrc = item.value;
              }

              const processFile = (file) => {
                if (!file) return;

                if (file.size > 1.5 * 1024 * 1024) {
                  return;
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                  setCategoryImages(prev => ({
                    ...prev,
                    [key]: {
                      ...prev[key],
                      value: reader.result
                    }
                  }));
                };
                reader.readAsDataURL(file);
              };

              const handleFileChange = (e) => {
                const file = e.target.files[0];
                processFile(file);
              };

              return (
                <div key={key} style={{
                  display: "flex",
                  gap: "20px",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "14px",
                  padding: "16px"
                }}>
                  {/* Image Preview */}
                  <div style={{
                    width: "100px",
                    height: "65px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "#111",
                    flexShrink: 0,
                    border: "1px solid rgba(255,255,255,0.1)",
                    position: "relative"
                  }}>
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={labelMap[key]}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.3)"
                      }}>
                        Default
                      </div>
                    )}

                    {/* Dimension annotation badge in the corner */}
                    <div style={{
                      position: "absolute",
                      bottom: "3px",
                      right: "3px",
                      background: "rgba(0, 0, 0, 0.8)",
                      color: "#00f2ff",
                      fontSize: "8px",
                      padding: "1px 4px",
                      borderRadius: "3px",
                      fontWeight: "800",
                      pointerEvents: "none",
                      border: "1px solid rgba(0, 242, 255, 0.25)",
                      letterSpacing: "0.2px"
                    }} title="Kích thước khuyên dùng: 1080x1920 (9:16)">
                      1080x1920
                    </div>
                  </div>

                  {/* Config Options */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "700", color: "#fff", fontSize: "14px" }}>
                        {labelMap[key].toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      {/* Source Selector */}
                      <select
                        className="control-input"
                        value={item.sourceType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategoryImages(prev => ({
                            ...prev,
                            [key]: {
                              ...prev[key],
                              sourceType: val
                            }
                          }));
                        }}
                        style={{ width: "160px", padding: "8px 12px", fontSize: "12px" }}
                      >
                        <option value="default">Default Image</option>
                        <option value="url">URL Link / File Path</option>
                        <option value="upload">Upload Image File</option>
                      </select>

                      {/* URL input */}
                      {item.sourceType === "url" && (
                        <input
                          type="text"
                          className="control-input"
                          placeholder="Enter image URL..."
                          value={item.customUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategoryImages(prev => ({
                              ...prev,
                              [key]: {
                                ...prev[key],
                                customUrl: val
                              }
                            }));
                          }}
                          style={{ flex: 1, padding: "8px 12px", fontSize: "12px" }}
                        />
                      )}

                      {/* File upload drag & drop box */}
                      {item.sourceType === "upload" && (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.background = "rgba(0, 242, 255, 0.08)";
                            e.currentTarget.style.borderColor = "#00f2ff";
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";

                            const file = e.dataTransfer.files[0];
                            processFile(file);
                          }}
                          onClick={() => {
                            document.getElementById(`file-input-${key}`).click();
                          }}
                          style={{
                            flex: 1,
                            border: "1.5px dashed rgba(255, 255, 255, 0.15)",
                            borderRadius: "10px",
                            padding: "8px 16px",
                            textAlign: "center",
                            background: "rgba(255, 255, 255, 0.02)",
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: "12px",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                          }}
                        >
                          <span>📁 Kéo & thả hoặc click để chọn ảnh</span>
                          <input
                            id={`file-input-${key}`}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                          />
                        </div>
                      )}

                      {item.sourceType === "default" && (
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                          Using default assets.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
