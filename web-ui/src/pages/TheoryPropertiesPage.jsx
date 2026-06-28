import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/KoaDesign.css";
import "katex/dist/katex.min.css";
import logoDefault from "../assets/logo.png";
import conceptIndefiniteImg from "../assets/concept_indefinite_integral.png";
import defGeometricImg from "../assets/def_geometric_area.png";
import defRiemannImg from "../assets/def_riemann_sum.png";
import { DEFAULT_PROPERTIES, DEFAULT_PROPERTY_GROUPS } from "../constants/theoryData";

const NAV_ITEMS = [
  { id: "home",       label: "Trang chủ",   y: 15 },
  { id: "concept",    label: "Khái niệm",   y: 28 },
  { id: "definition", label: "Định nghĩa",  y: 41 },
  { id: "theorem",    label: "Định lý",     y: 54 },
  { id: "properties", label: "Tính chất",  y: 67 },
  { id: "formulas",   label: "Công thức",   y: 80 },
  { id: "methods",    label: "Phương pháp", y: 93 }
];

export default function TheoryPropertiesPage({ onNavigate }) {
  // Load property groups from localStorage
  const propertyGroups = React.useMemo(() => {
    const stored = localStorage.getItem("theory_property_groups_data");
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return DEFAULT_PROPERTY_GROUPS;
  }, []);

  // Load properties from localStorage
  const propertiesGrouped = React.useMemo(() => {
    const stored = localStorage.getItem("theory_properties_data");
    let list = [];
    if (stored) {
      try { list = JSON.parse(stored); } catch (e) { list = [...DEFAULT_PROPERTIES]; }
    } else {
      list = [...DEFAULT_PROPERTIES];
    }

    const groups = {};
    propertyGroups.forEach(g => { groups[g.id] = { title: g.title, items: [] }; });

    list.forEach(item => {
      if (groups[item.group]) {
        let fallbackImg = defGeometricImg;
        if (item.group === "algebraic") fallbackImg = conceptIndefiniteImg;
        else if (item.group === "symmetry") fallbackImg = defRiemannImg;
        groups[item.group].items.push({ ...item, image: item.image || fallbackImg });
      }
    });
    return groups;
  }, [propertyGroups]);

  const [selectedGroup, setSelectedGroup] = useState(
    () => propertyGroups[0]?.id || "algebraic"
  );

  const handleNavClick = (id) => {
    if (id === "concept") {
      onNavigate("theory-concepts");
    } else if (id === "definition") {
      onNavigate("theory-definitions");
    } else if (id === "properties") {
      document.getElementById("properties-grid")?.scrollIntoView({ behavior: "smooth" });
    } else {
      onNavigate("theory");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f8", fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>

      {/* ====== HERO SLIDE ====== */}
      <section
        className="relative w-full h-screen overflow-hidden z-10 flex items-center justify-center lg:block"
        style={{ background: "#f5f3ee" }}
      >
        <div className="theory-hero-bg" />
        <div className="absolute inset-0 math-blueprint-grid opacity-30 pointer-events-none z-10" />

        {/* Slanted Sidebar (Desktop) */}
        <div className="hidden lg:block absolute inset-0 w-full h-full z-10">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sidebarGradP" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#120c2b" stopOpacity="0.96" />
                <stop offset="100%" stopColor="#2e1a8a" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <polygon points="0,0 26,0 42,100 0,100" fill="url(#sidebarGradP)" />
            <line x1="26" y1="0" x2="42" y2="100" stroke="#592eff" strokeWidth="0.3" opacity="0.8" />
          </svg>

          {NAV_ITEMS.map((item) => {
            const isSelected = item.id === "properties";
            const xPercent = 26 + 0.16 * item.y;
            return (
              <React.Fragment key={item.id}>
                <div
                  className={`absolute rounded-full z-20 transition-all duration-300 ${isSelected
                    ? "w-4 h-4 bg-[#592eff] shadow-[0_0_15px_#592eff] border-2 border-white scale-125"
                    : "w-3.5 h-3.5 bg-[#120c2b] border-2 border-white/50 hover:bg-[#592eff] hover:border-white"
                    }`}
                  style={{ top: `${item.y}%`, left: `${xPercent}%`, transform: "translate(-50%, -50%)", cursor: "pointer" }}
                  onClick={() => handleNavClick(item.id)}
                />
                <button
                  className={`absolute border-none bg-transparent font-sans text-right transition-all duration-300 font-extrabold uppercase tracking-widest cursor-pointer z-20 ${isSelected ? "text-[#ffaae6] scale-105" : "text-white/60 hover:text-white"
                    }`}
                  style={{ top: `${item.y}%`, left: `${xPercent - 2.5}%`, transform: "translate(-100%, -50%)", fontSize: "12px", fontWeight: 900 }}
                  onClick={() => handleNavClick(item.id)}
                >
                  {item.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Logo */}
        <div className="absolute top-[6%] lg:top-[8%] left-1/2 lg:left-[63%] transform -translate-x-1/2 flex flex-col items-center gap-2 z-20 select-none">
          <img src={logoDefault} alt="logo" className="h-[56px] lg:h-[64px] w-auto object-contain" />
          <span style={{ fontSize: "9px", letterSpacing: "0.3em", fontWeight: 900, color: "#5f5f69", textTransform: "uppercase" }}>
            Neural Calculus
          </span>
        </div>

        {/* Hero Text */}
        <div className="relative z-20 max-w-xl mx-auto px-6 py-12 text-center flex flex-col items-center lg:absolute lg:top-[33%] lg:left-[45%] lg:translate-x-0 lg:max-w-xl lg:text-left lg:items-start lg:py-0">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => onNavigate("theory")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#592eff", fontWeight: 700, fontSize: 13, padding: 0, fontFamily: "inherit" }}
            >
              Trang chủ
            </button>
            <span style={{ color: "#aaa" }}>/</span>
            <span style={{ color: "#21164c", fontWeight: 800, fontSize: 13 }}>Tính chất</span>
          </div>

          <h2 className="text-[24px] md:text-[28px] lg:text-[34px] font-black tracking-widest text-[#21164c] uppercase mb-2 leading-none">
            THƯ VIỆN KIẾN THỨC
          </h2>
          <h1 className="text-[44px] md:text-[52px] lg:text-[64px] font-black tracking-wider text-[#592eff] uppercase leading-none mb-6">
            TÍNH CHẤT
          </h1>
          <p className="adora-body text-sm md:text-base leading-[1.6] mb-8 text-[#5f5f69] max-w-md">
            Tổng hợp đầy đủ các tính chất đại số, phân đoạn và đối xứng của tích phân xác định.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => document.getElementById("properties-grid")?.scrollIntoView({ behavior: "smooth" })}
              className="detail-koa-btn hover:-translate-y-0.5 shadow-sm text-center"
              style={{ fontFamily: "inherit" }}
            >
              Khám phá ngay
            </button>
            <button
              onClick={() => onNavigate("theory")}
              style={{
                background: "transparent", border: "1.5px solid #592eff", borderRadius: 12,
                color: "#592eff", padding: "10px 24px", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.25s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#592eff"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#592eff"; }}
            >
              ← Trang chủ
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-8 left-1/2 lg:left-[63%] -translate-x-1/2 z-20 animate-bounce cursor-pointer"
          onClick={() => document.getElementById("properties-grid")?.scrollIntoView({ behavior: "smooth" })}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#592eff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ====== CONTENT AREA ====== */}
      <div id="properties-grid" style={{ background: "#f8f8f8", padding: "64px 5% 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* Level 1 Group Tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginBottom: 48 }}>
            {propertyGroups.map(group => {
              const isSelected = selectedGroup === group.id;
              const cleanTitle = (group.title || "").replace(/\s*\(.*\)/, "");
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 200,
                    fontSize: 12,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    border: isSelected ? "1px solid transparent" : "1px solid #e0e0db",
                    background: isSelected ? "#592eff" : "#fff",
                    color: isSelected ? "#fff" : "#21164c",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 6px 20px rgba(89,46,255,0.25)" : "none",
                    transition: "all 0.2s",
                    fontFamily: "inherit"
                  }}
                >
                  {cleanTitle}
                </button>
              );
            })}
          </div>

          {/* Level 2 Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedGroup}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 24
              }}
            >
              {(propertiesGrouped[selectedGroup]?.items || []).map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  style={{
                    borderRadius: 20, overflow: "hidden", cursor: "pointer",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                    background: "#fff", border: "1px solid #ebebeb"
                  }}
                  whileHover={{ scale: 1.03, boxShadow: "0 12px 40px rgba(89,46,255,0.15)" }}
                  onClick={() => onNavigate("theory-article", item)}
                >
                  {/* Card Image */}
                  <div style={{ width: "100%", aspectRatio: "3/4", position: "relative", overflow: "hidden" }}>
                    <motion.img
                      src={item.image}
                      alt={item.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      whileHover={{ scale: 1.06 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(10,8,18,0.9) 0%, rgba(10,8,18,0.2) 55%, transparent 100%)"
                    }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px 18px" }}>
                      <h3 style={{
                        color: "#fff", fontSize: 15, fontWeight: 800, lineHeight: 1.3,
                        margin: 0, textTransform: "uppercase", letterSpacing: "0.02em"
                      }}>
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={{ padding: "14px 18px 16px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#592eff" }}>
                      Xem chi tiết →
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty state */}
          {(propertiesGrouped[selectedGroup]?.items || []).length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa", fontSize: 15 }}>
              Chưa có tính chất nào trong nhóm này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
