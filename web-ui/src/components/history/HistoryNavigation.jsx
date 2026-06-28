import React from "react";
import "../../styles/HistoryNavigation.css";

const SECTIONS = [
  { id: "home", label: "Trang chủ", className: "history-hero-section" },
  { id: "intro", label: "Giới thiệu", className: "history-intro-section" },
  { id: "evolution", label: "Tiến trình", className: "history-timeline-section" },
  { id: "application", label: "Ứng dụng thực tế", className: "history-apps-section" },
  { id: "halloffame", label: "Bảng danh vọng", className: "history-hof-section" }
];

export default function HistoryNavigation({ activeSection, onSectionClick }) {
  return (
    <nav className="history-nav-menu">
      <div className="history-nav-links">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.className)}
              className={`history-nav-item ${isActive ? "active" : ""}`}
            >
              <span className="history-nav-label">{section.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
