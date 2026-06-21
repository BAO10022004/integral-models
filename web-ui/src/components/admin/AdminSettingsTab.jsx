import React, { useState, useEffect } from "react";
import { AI_API_URL, DOTNET_API_URL } from "../../config";
import "../../styles/AdminTabs.css";

export default function AdminSettingsTab() {
  const [selectedFont, setSelectedFont] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [websiteTitle, setWebsiteTitle] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  // Gemini API Key States
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiStatus, setGeminiStatus] = useState({ configured: false, key_preview: "" });
  const [showKey, setShowKey] = useState(false);
  const [geminiSaveStatus, setGeminiSaveStatus] = useState("");

  // Load custom font and identity settings on mount
  useEffect(() => {
    const storedFont = localStorage.getItem("navbar_font");
    if (storedFont) {
      setSelectedFont(storedFont);
    }
    const storedTitle = localStorage.getItem("website_title") || "Integral.AI — High-Performance AI Calculus Solver";
    setWebsiteTitle(storedTitle);

    const storedFavicon = localStorage.getItem("website_favicon") || "";
    setFaviconUrl(storedFavicon);

    // Fetch Gemini config status from backend
    fetch(`${AI_API_URL}/chat/config`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        setGeminiStatus(data);
      })
      .catch(() => {});
  }, []);

  const handleFontChange = (fontValue) => {
    setSelectedFont(fontValue);
    if (fontValue) {
      localStorage.setItem("navbar_font", fontValue);
      document.documentElement.style.setProperty('--koa-nav-font', fontValue);
      document.documentElement.style.setProperty('--navbar-font', fontValue);
      document.documentElement.style.setProperty('--font-sans', fontValue);
      document.documentElement.style.setProperty('--global-font', fontValue);
      document.documentElement.style.setProperty('--koa-sans', fontValue);
      document.documentElement.style.setProperty('--koa-serif', fontValue);
    } else {
      localStorage.removeItem("navbar_font");
      document.documentElement.style.removeProperty('--koa-nav-font');
      document.documentElement.style.removeProperty('--navbar-font');
      document.documentElement.style.removeProperty('--font-sans');
      document.documentElement.style.removeProperty('--global-font');
      document.documentElement.style.removeProperty('--koa-sans');
      document.documentElement.style.removeProperty('--koa-serif');
    }
    setSaveStatus("Global website font updated successfully!");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const handleSaveGeminiKey = async (e) => {
    e.preventDefault();
    if (!geminiKey.trim()) return;
    
    setGeminiSaveStatus("Saving...");
    try {
      const res = await fetch(`${AI_API_URL}/chat/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: geminiKey.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Server error");
      setGeminiStatus(data);
      setGeminiKey("");
      setGeminiSaveStatus("Gemini API Key updated successfully!");
      setTimeout(() => setGeminiSaveStatus(""), 3000);
    } catch (err) {
      setGeminiSaveStatus(`Error: ${err.message}`);
    }
  };

  const handleTitleChange = (val) => {
    setWebsiteTitle(val);
  };

  const handleFaviconUrlChange = (val) => {
    setFaviconUrl(val);
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveIdentitySettings = () => {
    localStorage.setItem("website_title", websiteTitle);
    localStorage.setItem("website_favicon", faviconUrl);

    // Apply immediately to the current window
    document.title = websiteTitle;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;

    setSaveStatus("Website title and favicon updated successfully!");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  return (
    <div className="admin-tab-container">
      <h3 className="admin-tab-title">🔧 System Configuration & Settings</h3>
      <p className="admin-tab-desc">Manage API connections, custom navigation typography, and cloud credentials.</p>

      <div className="admin-form-group-list">

        {/* CONNECTION SETTINGS */}
        <div className="admin-card-inner" style={{ marginTop: 0 }}>
          <h4 className="admin-card-inner-title">API Connection Settings</h4>
          <p className="admin-card-inner-desc">Endpoints configured dynamically inside the environment variables.</p>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">AI API ENDPOINT ADDRESS</label>
              <input type="text" className="control-input" value={AI_API_URL} disabled />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">DATABASE CONNECTION (.NET API)</label>
              <input type="text" className="control-input" value={DOTNET_API_URL} disabled />
            </div>
          </div>
        </div>

        {/* GEMINI API SETTINGS */}
        <div className="admin-card-inner">
          <h4 className="admin-card-inner-title">Google Gemini AI Configuration</h4>
          <p className="admin-card-inner-desc">Configure your Gemini API Key to enable the Calculus Chat Assistant chatbot.</p>

          <form onSubmit={handleSaveGeminiKey}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">GEMINI API KEY STATUS</label>
                <div className="admin-status-pill">
                  <span 
                    className="admin-status-pill-dot" 
                    style={{ 
                      backgroundColor: geminiStatus.configured ? "#00ff88" : "#fca5a5", 
                      boxShadow: geminiStatus.configured ? "0 0 8px #00ff88" : "0 0 8px #fca5a5" 
                    }} 
                  />
                  <span className="admin-status-pill-text">
                    {geminiStatus.configured 
                      ? `Active (${geminiStatus.key_preview || "Configured"})` 
                      : "Not Configured (Chat Assistant will display setup instruction)"
                    }
                  </span>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">SET / UPDATE GEMINI API KEY</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type={showKey ? "text" : "password"}
                    className="control-input"
                    placeholder="Enter your Gemini API key (AIzaSy...)"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    className="btn-glass" 
                    onClick={() => setShowKey(!showKey)}
                    style={{ padding: "10px 14px", fontSize: "11px", borderRadius: "12px", margin: 0 }}
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                  <button
                    type="submit"
                    className="btn-glass"
                    disabled={!geminiKey.trim()}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "700",
                      background: geminiKey.trim() ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(255,255,255,0.05)",
                      border: "none",
                      color: geminiKey.trim() ? "#000" : "rgba(255,255,255,0.3)",
                      cursor: geminiKey.trim() ? "pointer" : "default"
                    }}
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>

            {geminiSaveStatus && (
              <div style={{ 
                color: geminiSaveStatus.startsWith("Error") ? "#fca5a5" : geminiSaveStatus === "Saving..." ? "#a5b4fc" : "#00ff88", 
                fontWeight: "700", 
                fontSize: "13px", 
                marginTop: "12px", 
                transition: "all 0.3s" 
              }}>
                {geminiSaveStatus.startsWith("Error") ? "❌" : geminiSaveStatus === "Saving..." ? "⏳" : "✓"} {geminiSaveStatus}
              </div>
            )}
          </form>
        </div>

        {/* SECURITY & SDK CLOUD */}
        <div className="admin-card-inner">
          <h4 className="admin-card-inner-title">Cloud Services & Policies</h4>
          <p className="admin-card-inner-desc">Security policies and identity configuration systems status.</p>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">FIREBASE AUTH STATUS</label>
              <div className="admin-status-pill">
                <span className="admin-status-pill-dot" />
                <span className="admin-status-pill-text">Firebase SDK Configured</span>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">CORS POLICY STATUS</label>
              <div className="admin-status-pill">
                <span className="admin-status-pill-dot" />
                <span className="admin-status-pill-text">Allowing localhost:5173</span>
              </div>
            </div>
          </div>
        </div>

        {/* WEBSITE IDENTITY (TITLE & FAVICON) */}
        <div className="admin-card-inner">
          <h4 className="admin-card-inner-title">Website Identity Settings</h4>
          <p className="admin-card-inner-desc">Customize the browser tab title and the favicon icon shown in your web browser.</p>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">WEBSITE TITLE</label>
              <input
                type="text"
                className="control-input"
                placeholder="e.g. Calculus Solver"
                value={websiteTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">WEBSITE FAVICON (URL OR UPLOAD)</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  className="control-input"
                  placeholder="Paste favicon image URL..."
                  value={faviconUrl}
                  onChange={(e) => handleFaviconUrlChange(e.target.value)}
                  style={{ flex: 1 }}
                />
                <span style={{ color: "rgba(255, 255, 255, 0.3)", fontSize: "11px", fontWeight: "700" }}>OR</span>
                <label className="btn-glass" style={{
                  padding: "10px 16px",
                  fontSize: "12px",
                  borderRadius: "12px",
                  margin: 0,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                  fontWeight: "600"
                }}>
                  Upload Icon
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {faviconUrl && (
                <>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", fontWeight: "600" }}>Live Favicon Preview:</span>
                  <img
                    src={faviconUrl}
                    alt="Favicon Preview"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      objectFit: "contain",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      padding: "2px"
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </>
              )}
            </div>

            <button
              className="btn-glass"
              onClick={saveIdentitySettings}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "700",
                background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                border: "none",
                boxShadow: "0 0 15px var(--primary-glow)",
                cursor: "pointer",
                color: "#000"
              }}
            >
              Apply Identity Settings
            </button>
          </div>
        </div>

        {/* FONT CUSTOMIZATION CARD */}
        <div className="admin-card-inner">
          <h4 className="admin-card-inner-title">UI & Global Font Configuration</h4>
          <p className="admin-card-inner-desc">Customize the typography and fonts used across the entire website, including all pages, mathematical solvers, inputs, forms, and headers.</p>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">GLOBAL WEBSITE FONT FAMILY</label>
              <select
                className="control-input"
                value={selectedFont}
                onChange={(e) => handleFontChange(e.target.value)}
              >
                <option value="">Default System Font (Manrope / Inter)</option>
                <option value="Arial, sans-serif">Arial (Classic & Ultra-Clean)</option>
                <option value="'Outfit', sans-serif">Outfit (Modern & Minimalist)</option>
                <option value="'Manrope', sans-serif">Manrope (Clean & Professional)</option>
                <option value="'Cinzel', serif">Cinzel (Classic Serif / Elegant)</option>
                <option value="'JetBrains Mono', monospace">JetBrains Mono (Technical / Code)</option>
                <option value="'Inter', sans-serif">Inter (Clean / High-legibility)</option>
                <option value="'Bodoni Moda', serif">Bodoni Moda (Artistic Serif)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">LIVE PREVIEW FONT TEXT</label>
              <div style={{
                fontFamily: selectedFont || "inherit",
                fontSize: "16px",
                letterSpacing: "0.15em",
                color: "#00f2ff",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                height: "100%",
                paddingLeft: "4px",
                fontWeight: "700",
                transition: "all 0.3s"
              }}>
                Home Landing &bull; Model Tester &bull; Admin
              </div>
            </div>
          </div>

          {saveStatus && (
            <div style={{ color: "#00ff88", fontWeight: "700", fontSize: "13px", marginTop: "12px", transition: "all 0.3s" }}>
              ✓ {saveStatus}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
