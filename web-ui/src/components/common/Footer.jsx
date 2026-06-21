import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import InteractiveGridBackground from "../lightswind/InteractiveGridBackground";

// Inline SVG icons for socials (lucide-react version doesn't export brand icons)
const IconTwitterX = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconGithub = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
  </svg>
);
const IconLinkedin = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const IconYoutube = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoDefault from "../../assets/logo.png";

const LINKS_PRODUCT = ["AI Engine", "Theory & Knowledge", "History & Milestones", "Information", "Contact"];
const LINKS_LEARN   = ["Calculus Fundamentals", "Neural Networks", "Integration Methods", "Hall of Fame", "Research Papers"];

const SOCIALS = [
  { Icon: IconTwitterX, href: "https://twitter.com",  label: "Twitter" },
  { Icon: IconGithub,   href: "https://github.com",   label: "GitHub" },
  { Icon: IconLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { Icon: IconYoutube,  href: "https://youtube.com",  label: "YouTube" },
];

const EQUATIONS = [
  { label: "Leibniz", expr: "∫ f(x) dx" },
  { label: "FTC",     expr: "F(b) − F(a)" },
  { label: "Quantum", expr: "P = ∫|Ψ|² dx" },
];

export default function Footer({ onNavigate, theme = "light" }) {
  const [logoSrc, setLogoSrc] = useState(logoDefault);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const year = new Date().getFullYear();

  const isSepia = theme === "sepia";
  const isDark = theme === "dark";

  // Dynamic values based on theme
  const bgColor = isSepia 
    ? "linear-gradient(160deg, #D1CAB1 0%, #C5BFA7 100%)" 
    : isDark 
      ? "linear-gradient(160deg, #0f172a 0%, #020205 100%)" 
      : "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 60%, #e8edf5 100%)";

  const borderColor = isSepia 
    ? "1px dashed rgba(140, 127, 104, 0.4)" 
    : isDark 
      ? "1px solid rgba(255, 255, 255, 0.05)" 
      : "1px solid #e2e8f0";

  const gridColor = isSepia 
    ? "rgba(140, 127, 104, 0.12)" 
    : isDark 
      ? "rgba(255, 255, 255, 0.03)" 
      : "#d1d5db";

  const effectColor = isSepia 
    ? "rgba(140, 127, 104, 0.18)" 
    : isDark 
      ? "rgba(0, 242, 255, 0.2)" 
      : "rgba(99, 102, 241, 0.55)";

  const brandTitleColor = isSepia 
    ? "#1c1a17" 
    : isDark 
      ? "#ffffff" 
      : "#0f172a";

  const textColor = isSepia 
    ? "#5a4732" 
    : isDark 
      ? "#94a3b8" 
      : "#64748b";

  const subTitleColor = isSepia 
    ? "#8c7f68" 
    : isDark 
      ? "#475569" 
      : "#94a3b8";

  const linkColor = isSepia 
    ? "#1c1a17" 
    : isDark 
      ? "#94a3b8" 
      : "#64748b";

  const inputBg = isSepia 
    ? "rgba(255, 255, 255, 0.45)" 
    : isDark 
      ? "rgba(15, 23, 42, 0.6)" 
      : "rgba(255, 255, 255, 0.8)";

  const inputBorder = isSepia 
    ? "1px solid rgba(140, 127, 104, 0.5)" 
    : isDark 
      ? "1px solid rgba(255, 255, 255, 0.1)" 
      : "1px solid #e2e8f0";

  const inputTextColor = isSepia 
    ? "#1c1a17" 
    : isDark 
      ? "#ffffff" 
      : "#0f172a";

  useEffect(() => {
    // 1. Try to get logo from website_favicon (general logo)
    const storedFavicon = localStorage.getItem("website_favicon");
    if (storedFavicon) {
      setLogoSrc(storedFavicon);
      return;
    }

    // 2. Try to get logo from landing_config (slideshow logo)
    const storedLanding = localStorage.getItem("landing_config");
    if (storedLanding) {
      try {
        const parsed = JSON.parse(storedLanding);
        if (parsed.logoUrl) {
          setLogoSrc(parsed.logoUrl);
          return;
        }
      } catch (e) {
        console.error("Failed to parse landing config", e);
      }
    }

    // 3. Fallback to default logo
    setLogoSrc(logoDefault);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setEmail("");
  };

  const navMap = {
    "AI Engine":              "tester",
    "Theory & Knowledge":     "theory",
    "History & Milestones":   "history",
    "Information":            "info",
    "Contact":                "contact",
  };

  return (
    <footer
      className="history-footer"
      style={{
        position: "relative",
        overflow: "hidden",
        background: bgColor,
      }}
    >
      <InteractiveGridBackground
        gridSize={52}
        gridColor={gridColor}
        effectColor={effectColor}
        darkEffectColor={effectColor}
        trailLength={5}
        idleSpeed={0.18}
        glow={true}
        glowRadius={22}
        idleRandomCount={6}
        showFade={true}
        fadeIntensity={18}
        style={{
          background: bgColor,
          borderTop: borderColor,
          padding: "96px 0 0",
          minHeight: "100%",
          position: "relative",
        }}
      >

        {/* ── Main container ── */}
        <div className="relative z-10" style={{ maxWidth: 1300, margin: "0 auto", padding: "0 5% 0" }}>

        {/* ──────── Top grid ──────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1.4fr",
          gap: "clamp(32px, 5vw, 80px)",
          marginBottom: 72,
        }}>

          {/* Brand column */}
          <div style={{ gridColumn: "span 1" }}>
            {/* Logo mark */}
            <motion.div
              className="flex items-center gap-3 mb-6 cursor-default"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.3s",
              }}>
                <img
                  src={logoSrc}
                  alt="logo"
                  style={{
                    height: 38,
                    width: "auto",
                    objectFit: "contain"
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.04em", color: brandTitleColor, lineHeight: 1.1 }}>
                  Integral<span style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>.AI</span>
                </div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.25em", color: subTitleColor, textTransform: "uppercase" }}>Neural Calculus</div>
              </div>
            </motion.div>

            <p style={{ fontSize: 13, color: textColor, lineHeight: 1.8, marginBottom: 24, fontStyle: "italic" }}>
              The world's first deep-learning integral solver. From classical calculus to quantum mechanics — solved in milliseconds.
            </p>

            {/* Floating equations badge strip */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
              {EQUATIONS.map(eq => (
                <div key={eq.label} style={{
                  background: isSepia ? "rgba(140, 127, 104, 0.08)" : "rgba(99,102,241,0.06)",
                  border: isSepia ? "1px solid rgba(140, 127, 104, 0.3)" : "1px solid rgba(99,102,241,0.18)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  fontSize: 10,
                  fontFamily: "Georgia, serif",
                  color: isSepia ? "#8c7f68" : "#7c3aed",
                  fontWeight: 700,
                }}>
                  <span style={{ color: subTitleColor, marginRight: 4, fontSize: 9 }}>{eq.label}</span>
                  {eq.expr}
                </div>
              ))}
            </div>

            {/* Social buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              {SOCIALS.map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: isSepia ? "1px solid rgba(140, 127, 104, 0.3)" : "1px solid #e2e8f0",
                    color: isSepia ? "#8c7f68" : "#94a3b8",
                    transition: "all 0.25s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = isSepia ? "#1c1a17" : "#3b82f6"; e.currentTarget.style.borderColor = isSepia ? "rgba(140,127,104,0.6)" : "rgba(59,130,246,0.4)"; e.currentTarget.style.background = isSepia ? "rgba(140,127,104,0.15)" : "rgba(59,130,246,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = isSepia ? "#8c7f68" : "#94a3b8"; e.currentTarget.style.borderColor = isSepia ? "rgba(140,127,104,0.3)" : "#e2e8f0"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "none"; }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", color: subTitleColor, marginBottom: 24, margin: "0 0 24px" }}>
              Navigate
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 13 }}>
              {LINKS_PRODUCT.map(link => (
                <li key={link}>
                  <a href="#"
                    onClick={e => { e.preventDefault(); if (navMap[link] && onNavigate) onNavigate(navMap[link]); }}
                    style={{ fontSize: 13, fontWeight: 600, color: linkColor, textDecoration: "none", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 6 }}
                    onMouseEnter={e => { e.currentTarget.style.color = isSepia ? "#8c7f68" : isDark ? "#00f2ff" : "#3b82f6"; e.currentTarget.style.paddingLeft = "4px"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = linkColor; e.currentTarget.style.paddingLeft = "0"; }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn links */}
          <div>
            <h4 style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", color: subTitleColor, margin: "0 0 24px" }}>
              Learn
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 13 }}>
              {LINKS_LEARN.map(link => (
                <li key={link}>
                  <a href="#"
                    style={{ fontSize: 13, fontWeight: 600, color: linkColor, textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = isSepia ? "#8c7f68" : isDark ? "#8b5cf6" : "#8b5cf6"; e.currentTarget.style.paddingLeft = "4px"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = linkColor; e.currentTarget.style.paddingLeft = "0"; }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", color: subTitleColor, margin: "0 0 24px" }}>
              Stay Updated
            </h4>
            <p style={{ fontSize: 12, color: textColor, lineHeight: 1.7, marginBottom: 20 }}>
              Get periodic updates on new AI model releases, research breakthroughs, and mathematical discoveries.
            </p>

            <form onSubmit={handleSubscribe} style={{ position: "relative", marginBottom: 16 }}>
              <Input
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  background: inputBg,
                  border: inputBorder,
                  borderRadius: 12,
                  height: 52,
                  paddingRight: 56,
                  fontSize: 13,
                  color: inputTextColor,
                  width: "100%",
                  boxSizing: "border-box",
                  outline: "none"
                }}
              />
              <button type="submit" style={{
                position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                width: 38, height: 38,
                background: submitted ? "linear-gradient(135deg,#10b981,#059669)" : isSepia ? "linear-gradient(135deg,#8c7f68,#5a4732)" : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                border: "none", borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.3s",
                boxShadow: isSepia ? "0 4px 12px rgba(140,127,104,0.3)" : "0 4px 12px rgba(59,130,246,0.3)",
              }}>
                {submitted
                  ? <CheckCircle2 size={16} color="#fff" />
                  : <ArrowRight size={16} color="#fff" />
                }
              </button>
            </form>

            {/* Subscriber count badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: isSepia ? "#8c7f68" : "#3b82f6",
                animation: "pulse 2s infinite",
              }} />
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", color: isSepia ? "#8c7f68" : "#3b82f6" }}>
                AI • Math • Science community
              </span>
            </div>
          </div>

        </div>

        {/* ──────── Bottom bar ──────── */}
        <div style={{
          borderTop: borderColor,
          padding: "28px 0 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: subTitleColor, margin: 0, letterSpacing: "0.04em" }}>
            © {year} Integral.AI — All rights reserved. Built for educational exploration.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            {/* Status indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} />
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", color: subTitleColor }}>
                All Systems Operational
              </span>
            </div>

            {/* Email */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Mail size={12} color={subTitleColor} />
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: subTitleColor }}>
                integral.ai@research.edu
              </span>
            </div>

            {/* Version badge */}
            <div style={{
              fontSize: 9, fontWeight: 900,
              letterSpacing: "0.15em", textTransform: "uppercase",
              color: isSepia ? "rgba(140, 127, 104, 0.9)" : "rgba(59,130,246,0.7)",
              background: isSepia ? "rgba(140, 127, 104, 0.08)" : "rgba(59,130,246,0.08)",
              border: isSepia ? "1px solid rgba(140, 127, 104, 0.2)" : "1px solid rgba(59,130,246,0.15)",
              borderRadius: 20, padding: "4px 12px",
            }}>
              v2.0 NEURAL
            </div>
          </div>
        </div>

      </div>
      </InteractiveGridBackground>
    </footer>
  );
}
