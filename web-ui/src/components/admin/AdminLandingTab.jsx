import React, { useState, useEffect } from "react";
import "../../styles/AdminTabs.css";

export default function AdminLandingTab() {
  const [config, setConfig] = useState({
    logoUrl: "",
    videoUrl: "",
    btnText: "Explore Now"
  });

  const [logoSourceType, setLogoSourceType] = useState("default"); // "default" | "url" | "upload"
  const [videoSourceType, setVideoSourceType] = useState("default"); // "default" | "url" | "upload"
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [customVideoUrl, setCustomVideoUrl] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  // Load configuration from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("landing_config");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig(parsed);

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

  const handleSave = () => {
    let finalConfig = { ...config };

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
      setSaveStatus("Configuration saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (e) {
      alert("❌ Storage Error: Data is too large! Please switch to using a URL path or copy the video file into the project assets folder.");
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore the default Landing Page layout?")) {
      localStorage.removeItem("landing_config");
      setConfig({ logoUrl: "", videoUrl: "", btnText: "Explore Now" });
      setLogoSourceType("default");
      setVideoSourceType("default");
      setCustomLogoUrl("");
      setCustomVideoUrl("");
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
