import React from "react";
import "../../styles/AdminHeader.css";

export default function AdminHeader({ onNavigate }) {
  return (
    <div className="admin-header">
      <div>
        <div className="admin-header-title-container">
          <span className="admin-header-logo-text">INTEGRAL SYSTEM</span>
          <span className="admin-header-badge">ADMIN</span>
        </div>
        <p className="admin-header-subtitle">Manage calculus analysis & fraction integration system</p>
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
