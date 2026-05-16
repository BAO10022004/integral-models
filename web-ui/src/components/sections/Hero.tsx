import React from 'react';
import { COLORS } from '../../constants/theme';

interface HeroProps {
  onOpenSolver?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenSolver }) => {
  return (
    <section style={{
      padding: "80px 24px 60px", textAlign: "center",
      background: COLORS.bg, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, #1a1400 0%, transparent 70%)`,
      }} />
      <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
        <a href="#" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: COLORS.surface, border: `1px solid ${COLORS.border2}`,
          borderRadius: 100, padding: "6px 14px",
          color: COLORS.muted2, fontSize: 13, textDecoration: "none", marginBottom: 28,
        }}>
          <span style={{
            background: COLORS.yellow, color: COLORS.bg,
            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
          }}>New</span>
          Smart Meeting Notes
        </a>

        <h1 style={{
          fontSize: "clamp(32px,6vw,58px)", fontWeight: 800,
          letterSpacing: "-1.5px", lineHeight: 1.1,
          color: "#fff", margin: "0 0 20px",
        }}>
          Stop Taking Meeting Notes<br />
          <span style={{ color: COLORS.yellow }}>During Important Calls</span>
        </h1>

        <p style={{ color: COLORS.muted, fontSize: 17, lineHeight: 1.7, margin: "0 0 36px", maxWidth: 520, marginInline: "auto" }}>
          AI joins your calls, transcribes conversations, and generates action items
          so you can focus entirely on participating and making decisions.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{
            background: COLORS.yellow, border: "none", borderRadius: 100,
            color: COLORS.bg, fontWeight: 700, fontSize: 15,
            padding: "14px 28px", cursor: "pointer", fontFamily: "Manrope,sans-serif",
          }}>Start 14-Day Trial</button>
          <button 
            onClick={onOpenSolver}
            style={{
              background: "transparent", border: `1px solid ${COLORS.border2}`,
              borderRadius: 100, color: COLORS.muted2, fontSize: 15,
              padding: "14px 28px", cursor: "pointer", fontFamily: "Manrope,sans-serif",
            }}>Watch Demo</button>
        </div>

        <p style={{ color: "#555", fontSize: 13, marginTop: 28 }}>
          Trusted by the world's most innovative teams
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 16, flexWrap: "wrap" }}>
          {["Zoom", "Slack", "Notion", "Linear", "Figma", "Jira", "Loom"].map(b => (
            <span key={b} style={{ color: "#444", fontSize: 13, fontWeight: 600, letterSpacing: ".04em" }}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
