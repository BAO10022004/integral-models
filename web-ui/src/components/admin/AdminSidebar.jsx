import React from "react";
import "../../styles/AdminSidebar.css";

export default function AdminSidebar({ activeTab, setActiveTab, onNavigate, onLogout }) {
  return (
    <div className="admin-glass-card admin-sidebar">
      <div className="sidebar-menu">
        <button
          className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <span className="sidebar-icon">📊</span>
          <span className="sidebar-label">Overview</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "model" ? "active" : ""}`}
          onClick={() => setActiveTab("model")}
        >
          <span className="sidebar-icon">⚙️</span>
          <span className="sidebar-label">Model</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "landing" ? "active" : ""}`}
          onClick={() => setActiveTab("landing")}
        >
          <span className="sidebar-icon">🏠</span>
          <span className="sidebar-label">Landing Page</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <span className="sidebar-icon">📜</span>
          <span className="sidebar-label">History</span>
        </button>

        <button
          className="admin-tab-btn"
          onClick={() => onNavigate("theory")}
        >
          <span className="sidebar-icon">📚</span>
          <span className="sidebar-label">Knowledge</span>
        </button>

        <button
          className="admin-tab-btn"
          onClick={() => onNavigate("tester")}
        >
          <span className="sidebar-icon">🤖</span>
          <span className="sidebar-label">AI Page</span>
        </button>

        <button
          className="admin-tab-btn"
          onClick={() => onNavigate("info")}
        >
          <span className="sidebar-icon">ℹ️</span>
          <span className="sidebar-label">Information</span>
        </button>

        <button
          className="admin-tab-btn"
          onClick={() => onNavigate("contact")}
        >
          <span className="sidebar-icon">📞</span>
          <span className="sidebar-label">Contact</span>
        </button>
      </div>

      <button className="sidebar-logout-btn" onClick={onLogout}>
        <span className="sidebar-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </span>
        <span className="sidebar-label">Sign Out</span>
      </button>
    </div>
  );
}
