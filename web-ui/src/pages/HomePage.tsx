import React, { useState } from 'react';
import { COLORS } from '../constants/theme';
import { SectionBadge } from '../components/common/UIComponents';
import Hero from '../components/sections/Hero';
import IntegralSolverSection from '../components/solver/IntegralSolverSection';
import Footer from '../components/layout/Footer';

// Small sections can stay here or be further extracted
const Stats: React.FC = () => {
  const items = [
    { num: "50k+", label: "Teams using our AI" },
    { num: "20+", label: "Languages supported" },
    { num: "140+", label: "Countries served" },
    { num: "80+", label: "Platform integrations" },
  ];
  return (
    <section style={{ padding: "60px 24px", background: COLORS.bg }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <SectionBadge label="Stats" />
        <h2 style={{ color: "#fff", fontSize: 36, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>
          Numbers That Matter
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
          {items.map(({ num, label }) => (
            <div key={label} style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 18, padding: "28px 20px",
            }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: "#fff", letterSpacing: "-2px" }}>{num}</div>
              <div style={{ color: COLORS.muted, fontSize: 14, marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  const scrollToSolver = () => {
    document.getElementById("integral-solver")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: COLORS.bg }}>
      <Hero onOpenSolver={scrollToSolver} />
      <Stats />
      <IntegralSolverSection />
      {/* Thêm các section khác tương tự... */}
      <Footer />
    </div>
  );
};

export default HomePage;
