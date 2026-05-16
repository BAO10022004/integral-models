import React from 'react';
import { COLORS } from '../../constants/theme';

const Footer: React.FC = () => {
  const cols = [
    { title: "Company", links: ["Home", "About", "Features", "Integration", "Pricing"] },
    { title: "Support", links: ["Changelog", "Contact", "Blog", "Coming Soon"] },
    { title: "Legal", links: ["Terms of Use", "Privacy Policy", "Cookie Policy", "Security Policy"] },
    { title: "Social", links: ["Twitter", "Instagram", "TikTok", "Facebook"] },
  ];
  return (
    <footer style={{ background: COLORS.bg, borderTop: `1px solid ${COLORS.border}`, padding: "48px 24px 32px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(4,1fr)", gap: 32, marginBottom: 40 }}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-.5px" }}>Callox</span>
            </div>
            <p style={{ color: "#555", fontSize: 13, lineHeight: 1.7, margin: "0 0 16px" }}>
              Callox transforms your meetings with AI-powered note-taking, automatic action item creation, and seamless follow-up management.
            </p>
          </div>
          {cols.map(({ title, links }) => (
            <div key={title}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{title}</div>
              {links.map(l => (
                <div key={l} style={{ marginBottom: 8 }}>
                  <a href="#" style={{ color: "#555", fontSize: 13, textDecoration: "none", transition: "color .2s" }}>{l}</a>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#555", fontSize: 13 }}>©Callox 2026. All Rights Reserved.</span>
          <span style={{ color: "#444", fontSize: 12 }}>Template by Ammar Hassan</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
