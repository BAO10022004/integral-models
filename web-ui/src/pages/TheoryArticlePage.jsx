import React from "react";
import LatexRenderer from "../components/ui/LatexRenderer";
import "katex/dist/katex.min.css";

export default function TheoryArticlePage({ articleData, onNavigate }) {
  if (!articleData) {
    onNavigate("theory");
    return null;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0812",
      color: "#fff",
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Grid */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "linear-gradient(rgba(89,46,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(89,46,255,0.04) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Glow orbs */}
      <div style={{
        position: "fixed",
        top: "-10%", left: "20%",
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(89,46,255,0.12) 0%, transparent 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "fixed",
        bottom: "5%", right: "10%",
        width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(46,214,255,0.08) 0%, transparent 70%)",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Nav Bar */}
      <nav style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 5%",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}>
        <button
          onClick={() => onNavigate("theory")}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 99,
            color: "rgba(255,255,255,0.7)",
            padding: "10px 24px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.3s",
            fontFamily: "inherit"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(89,46,255,0.15)";
            e.currentTarget.style.borderColor = "rgba(89,46,255,0.4)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
        >
          ← Quay lại Kiến Thức
        </button>
        <span style={{
          fontSize: 10,
          letterSpacing: "0.3em",
          fontWeight: 800,
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase"
        }}>
          THEORY · ARTICLE
        </span>
      </nav>

      {/* Main Content */}
      <div style={{
        position: "relative",
        zIndex: 10,
        maxWidth: 900,
        margin: "0 auto",
        padding: "48px 5% 80px"
      }}>

        {/* Hero Image */}
        {articleData.image && (
          <div style={{
            width: "100%",
            height: 380,
            borderRadius: 28,
            overflow: "hidden",
            marginBottom: 48,
            position: "relative",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)"
          }}>
            <img
              src={articleData.image}
              alt={articleData.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(10,8,18,0.85) 0%, rgba(10,8,18,0.1) 60%, transparent 100%)"
            }} />
          </div>
        )}

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: 900,
          lineHeight: 1.15,
          color: "#fff",
          marginBottom: 24,
          letterSpacing: "-0.02em"
        }}>
          {articleData.title}
        </h1>

        {/* Description */}
        <p style={{
          fontSize: 17,
          lineHeight: 1.8,
          color: "rgba(255,255,255,0.65)",
          marginBottom: 48,
          maxWidth: 700
        }}>
          {articleData.desc}
        </p>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "linear-gradient(to right, rgba(89,46,255,0.5), transparent)",
          marginBottom: 48
        }} />

        {/* Formula Section */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(89,46,255,0.2)",
          borderLeft: "4px solid #592eff",
          borderRadius: 20,
          padding: "32px 40px",
          marginBottom: 40,
          backdropFilter: "blur(20px)"
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#592eff",
            marginBottom: 20
          }}>
            ✦ Công thức cốt lõi
          </div>
          <div style={{
            fontSize: 22,
            textAlign: "center",
            color: "#fff",
            overflowX: "auto",
            padding: "8px 0"
          }}>
            <LatexRenderer latex={articleData.formula} displayMode={true} />
          </div>
        </div>

        {/* Extra Content */}
        {articleData.content && (() => {
          const containsHtml = /<[a-z][\s\S]*>/i.test(articleData.content);
          if (containsHtml) {
            return (
              <div 
                style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.7)", fontSize: 16 }}
                dangerouslySetInnerHTML={{ __html: articleData.content }}
              />
            );
          } else {
            return (
              <div style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.7)", fontSize: 16 }}>
                {articleData.content.split("\n\n").map((para, i) => (
                  <p key={i} style={{ marginBottom: 20 }}>
                    {para.split("\n").map((line, j) => (
                      <React.Fragment key={j}>
                        {line}
                        {j < para.split("\n").length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                ))}
              </div>
            );
          }
        })()}

        {/* Back CTA */}
        <div style={{ marginTop: 64, textAlign: "center" }}>
          <button
            onClick={() => onNavigate("theory")}
            style={{
              padding: "14px 40px",
              border: "1.5px solid #592eff",
              borderRadius: 14,
              background: "transparent",
              color: "#592eff",
              fontSize: 13,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              cursor: "pointer",
              transition: "all 0.3s",
              fontFamily: "inherit"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#592eff";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(89,46,255,0.4)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#592eff";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ← Quay lại thư viện
          </button>
        </div>
      </div>
    </div>
  );
}
