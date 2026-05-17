import React, { useState, useEffect } from "react";
import { AI_API_URL, DOTNET_API_URL } from "../../config";
import "../../styles/AdminTabs.css";

export default function AdminSettingsTab() {
  const [selectedFont, setSelectedFont] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  // Load custom font on mount
  useEffect(() => {
    const stored = localStorage.getItem("navbar_font");
    if (stored) {
      setSelectedFont(stored);
    }
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

  return (
    <div className="admin-tab-container">
      <h3 className="admin-tab-title">🔧 System Configuration & Settings</h3>
      <p className="admin-tab-desc">Manage API connections, custom navigation typography, and cloud credentials.</p>

      <div className="admin-form-group-list">
        
        {/* CONNECTION SETTINGS */}
        <div className="admin-card-inner" style={{ marginTop: 0 }}>
          <h4 className="admin-card-inner-title">API Connection Settings</h4>
          <p className="admin-card-inner-desc">Endpoints configured dynamically inside the environment environment variables.</p>
          
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
