import React, { useState, useEffect } from "react";
import "../../styles/AdminHeader.css";
import defaultLogo from "../../assets/logo.png";

export default function AdminHeader({ onNavigate }) {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const storedFavicon = localStorage.getItem("website_favicon");
    if (storedFavicon) {
      setLogoUrl(storedFavicon);
    }
  }, []);

  return (
    <div className="admin-header">
      <div>
        <div className="admin-header-title-container">
          <img
            src={logoUrl || defaultLogo}
            alt="Logo"
            style={{
              height: "100px",
              maxWidth: "200px",
              objectFit: "contain",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.03)",
              padding: "4px",
              display: "block"
            }}
          />
          <span className="admin-header-badge">ADMIN</span>
        </div>
      </div>
      <div className="admin-header-actions">
        <button
          onClick={() => onNavigate("intro")}
          className="admin-header-btn admin-header-btn-home"
        >
          Home Page
        </button>
        <button
          onClick={() => onNavigate("tester")}
          className="admin-header-btn admin-header-btn-tester"
        >
          Model Tester
        </button>
      </div>
    </div>
  );
}
