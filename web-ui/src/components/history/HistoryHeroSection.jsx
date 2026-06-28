import React from "react";
import "../../styles/HistoryHeroSection.css";

export default function HistoryHeroSection({ heroImgSrc, onScrollToNext }) {
  return (
    <section className="history-snap-section history-hero-section">
      <div className="history-hero-img-wrap">
        <img
          className="history-hero-img"
          src={heroImgSrc}
          alt="AI Mathematics Evolution"
        />
      </div>

      {/* Torn paper overlay at the bottom of hero */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        zIndex: 5,
        lineHeight: 0,
        pointerEvents: "none",
        filter: "drop-shadow(0 -6px 8px rgba(0,0,0,0.4))"
      }}>
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "clamp(40px, 5vw, 90px)", display: "block" }}
        >
          {/* Edge path can be styled dynamically in the container */}
        </svg>
      </div>

      <div className="history-scroll-indicator" onClick={onScrollToNext}>
        <span className="history-scroll-text">Cuộn xuống để khám phá</span>
        <div className="history-scroll-mouse">
          <div className="history-scroll-wheel" />
        </div>
      </div>
    </section>
  );
}
