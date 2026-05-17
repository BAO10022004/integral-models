import React from "react";
import "../../styles/HistoryIntroSection.css";

export default function HistoryIntroSection({ 
  nextSectionRef, 
  headlineText, 
  introductionText, 
  showcaseImgSrc 
}) {
  return (
    <section 
      ref={nextSectionRef} 
      className="history-snap-section history-intro-section"
    >
      {/* Realistically Torn Paper Transition Effect */}
      <div
        style={{
          position: "absolute",
          top: "-49px",
          left: 0,
          width: "100%",
          height: "50px",
          zIndex: 5,
          pointerEvents: "none",
          filter: "drop-shadow(0 -8px 6px rgba(0, 0, 0, 0.35))"
        }}
      >
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <path
            d="M0,100 L0,30 L15,35 L32,22 L48,28 L65,15 L82,25 L98,12 L115,22 L132,15 L148,27 L165,18 L182,32 L198,12 L215,22 L232,8 L248,25 L265,14 L282,27 L298,12 L315,22 L332,8 L348,20 L365,15 L382,28 L398,5 L415,18 L432,12 L448,25 L465,10 L482,22 L498,15 L515,28 L532,8 L548,20 L565,14 L582,27 L598,12 L615,22 L632,5 L648,18 L665,12 L682,25 L698,8 L715,20 L732,14 L748,27 L765,12 L782,22 L798,8 L815,20 L832,12 L848,25 L865,10 L882,22 L898,15 L915,28 L932,8 L948,20 L965,14 L982,27 L998,12 L1015,22 L1032,5 L1048,18 L1065,12 L1082,25 L1098,8 L1115,20 L1132,14 L1148,27 L1165,12 L1182,22 L1198,8 L1215,20 L1232,12 L1248,25 L1265,10 L1282,22 L1298,15 L1315,28 L1332,8 L1348,20 L1365,14 L1382,27 L1398,12 L1415,22 L1430,10 L1440,15 L1440,100 Z"
            fill="#D1CAB1"
          />
        </svg>
      </div>

      <div className="intro-split-container">
        {/* Left Column: Text Content */}
        <div className="intro-left-col">
          <span className="intro-label">Introduction</span>
          <h2 className="intro-headline">{headlineText}</h2>
          <p className="intro-text" style={{ whiteSpace: "pre-line" }}>
            {introductionText}
          </p>
        </div>

        {/* Right Column: Image Showcase */}
        <div className="intro-right-col">
          <div className="intro-img-frame">
            <img
              className="intro-img"
              src={showcaseImgSrc}
              alt="AI Solver Introduction"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
