import React from "react";

export function AuroraTextEffect({
  text,
  className = "",
  textClassName = "",
  fontSize = "clamp(3rem, 8vw, 7rem)",
  colors = {
    first: "#22d3ee",
    second: "#facc15",
    third: "#4ade80",
    fourth: "#6366f1",
  },
  blurAmount = "16px",
  animationSpeed = {
    border: 6,
    first: 5,
    second: 5,
    third: 3,
    fourth: 13,
  },
}) {
  // Define keyframes as a style object
  const keyframes = `
    @keyframes aurora-1 {
      0% { top: 0; right: 0; }
      50% { top: 100%; right: 75%; }
      75% { top: 100%; right: 25%; }
      100% { top: 0; right: 0; }
    }
    @keyframes aurora-2 {
      0% { top: -50%; left: 0%; }
      60% { top: 100%; left: 75%; }
      85% { top: 100%; left: 25%; }
      100% { top: -50%; left: 0%; }
    }
    @keyframes aurora-3 {
      0% { bottom: 0; left: 0; }
      40% { bottom: 100%; left: 75%; }
      65% { bottom: 40%; left: 50%; }
      100% { bottom: 0; left: 0; }
    }
    @keyframes aurora-4 {
      0% { bottom: -50%; right: 0; }
      50% { bottom: 0%; right: 40%; }
      90% { bottom: 50%; right: 25%; }
      100% { bottom: -50%; right: 0; }
    }
    @keyframes aurora-border {
      0% { border-radius: 37% 29% 27% 27% / 28% 25% 41% 37%; }
      25% { border-radius: 47% 29% 39% 49% / 61% 19% 66% 26%; }
      50% { border-radius: 57% 23% 47% 72% / 63% 17% 66% 33%; }
      75% { border-radius: 28% 49% 29% 100% / 93% 20% 64% 25%; }
      100% { border-radius: 37% 29% 27% 27% / 28% 25% 41% 37%; }
    }
  `;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <style>{keyframes}</style>
      <div style={{ textAlign: "center" }}>
        <h2
          className={textClassName}
          style={{
            fontSize,
            fontWeight: 900,
            letterSpacing: "-0.5px",
            position: "relative",
            overflow: "hidden",
            color: "#ffffff",
            margin: "0 0 16px 0",
            lineHeight: 1.1,
          }}
        >
          {text}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 10,
              mixBlendMode: "darken",
              pointerEvents: "none",
            }}
          >
            {/* First Aurora Layer */}
            <div
              style={{
                position: "absolute",
                width: "60vw",
                height: "60vw",
                borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%",
                filter: `blur(${blurAmount})`,
                mixBlendMode: "overlay",
                backgroundColor: colors.first,
                animationName: "aurora-border, aurora-1",
                animationDuration: `${animationSpeed.border}s, ${animationSpeed.first}s`,
                animationTimingFunction: "ease-in-out, ease-in-out",
                animationIterationCount: "infinite, infinite",
                animationDirection: "normal, alternate",
              }}
            />

            {/* Second Aurora Layer */}
            <div
              style={{
                position: "absolute",
                width: "60vw",
                height: "60vw",
                borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%",
                filter: `blur(${blurAmount})`,
                mixBlendMode: "overlay",
                backgroundColor: colors.second,
                animationName: "aurora-border, aurora-2",
                animationDuration: `${animationSpeed.border}s, ${animationSpeed.second}s`,
                animationTimingFunction: "ease-in-out, ease-in-out",
                animationIterationCount: "infinite, infinite",
                animationDirection: "normal, alternate",
              }}
            />

            {/* Third Aurora Layer */}
            <div
              style={{
                position: "absolute",
                width: "60vw",
                height: "60vw",
                borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%",
                filter: `blur(${blurAmount})`,
                mixBlendMode: "overlay",
                backgroundColor: colors.third,
                animationName: "aurora-border, aurora-3",
                animationDuration: `${animationSpeed.border}s, ${animationSpeed.third}s`,
                animationTimingFunction: "ease-in-out, ease-in-out",
                animationIterationCount: "infinite, infinite",
                animationDirection: "normal, alternate",
              }}
            />

            {/* Fourth Aurora Layer */}
            <div
              style={{
                position: "absolute",
                width: "60vw",
                height: "60vw",
                borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%",
                filter: `blur(${blurAmount})`,
                mixBlendMode: "overlay",
                backgroundColor: colors.fourth,
                animationName: "aurora-border, aurora-4",
                animationDuration: `${animationSpeed.border}s, ${animationSpeed.fourth}s`,
                animationTimingFunction: "ease-in-out, ease-in-out",
                animationIterationCount: "infinite, infinite",
                animationDirection: "normal, alternate",
              }}
            />
          </div>
        </h2>
      </div>
    </div>
  );
}
