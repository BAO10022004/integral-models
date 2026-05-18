import React, { useRef, useState, useEffect } from "react";
import "../styles/HistoryPage.css";
import slideImgDefault from "../assets/history/slide.png";
import introImgDefault from "../assets/history.webp";
import logoDefault from "../assets/logo.png";
import { DOTNET_API_URL } from "../config";

// Import Modularized Sections
import HistoryHeroSection from "../components/history/HistoryHeroSection";
import HistoryIntroSection from "../components/history/HistoryIntroSection";
import HistoryTimelineSection from "../components/history/HistoryTimelineSection";
import HistoryApplicationsSection from "../components/history/HistoryApplicationsSection";
import HistoryHallOfFameSection from "../components/history/HistoryHallOfFameSection";
import Footer from "../components/common/Footer";

export default function HistoryPage({ onNavigate }) {

  const containerRef = useRef(null);
  const nextSectionRef = useRef(null);

  const [config, setConfig] = useState({
    heroImgUrl: "",
    showcaseImgUrl: "",
    headline: "The Journey of AI Innovation",
    introText: "The intelligent calculus solver system was born from a desire to bridge the gap between complex mathematical theories and real-world digital applications.\n\nThrough numerous cycles of research and algorithmic optimization, we developed a state-of-the-art action classification model powered by Deep Learning. Today, any integral problem—from fundamental concepts to highly complex derivations—is processed in the blink of an eye with absolute precision."
  });

  const timelineRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    fetch(`${DOTNET_API_URL}/HistoryTimeline`)
      .then(res => {
        if (!res.ok) throw new Error("Server response not OK");
        return res.json();
      })
      .then(data => {
        if (data && data.config) {
          setConfig(data.config);
        }
        if (data && data.milestones) {
          setMilestones(data.milestones);
        }
      })
      .catch(err => {
        console.warn("Failed to load history timeline from API, using localStorage fallback:", err);
        // Fallback to localStorage
        const stored = localStorage.getItem("history_page_config");
        if (stored) {
          try {
            setConfig(JSON.parse(stored));
          } catch (e) {
            console.error("Failed to parse history config", e);
          }
        }

        const storedMilestones = localStorage.getItem("history_timeline_milestones");
        if (storedMilestones) {
          try {
            setMilestones(JSON.parse(storedMilestones));
          } catch (e) {
            console.error("Failed to parse timeline milestones", e);
          }
        }
      });
  }, []);

  // Intersection Observer for smooth scrolling slide-up active transitions
  useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      threshold: 0.2, // Triggers when 20% of the section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        } else {
          entry.target.classList.remove("in-view");
        }
      });
    }, observerOptions);

    const sections = containerRef.current?.querySelectorAll(".history-snap-section");
    sections?.forEach((section) => observer.observe(section));

    return () => {
      sections?.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const handleScrollToNext = () => {

    if (nextSectionRef.current) {
      nextSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Draggable Scroll Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - timelineRef.current.offsetLeft);
    setScrollLeftState(timelineRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - timelineRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    timelineRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Auto-advance slideshow every 5 seconds (5000ms)
  useEffect(() => {
    if (milestones.length === 0 || isDragging) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % milestones.length;
        if (timelineRef.current) {
          const container = timelineRef.current;
          container.scrollTo({
            left: container.clientWidth * next,
            behavior: "smooth"
          });
        }
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [milestones.length, isDragging]);

  // Synchronize activeIndex state during scroll dragging
  const handleScroll = () => {
    if (!timelineRef.current) return;
    const container = timelineRef.current;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    if (index >= 0 && index < milestones.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  // Allow clicking on any timeline card to instantly slide to it
  const handleCardClick = (index) => {
    setActiveIndex(index);
    if (timelineRef.current) {
      const container = timelineRef.current;
      container.scrollTo({
        left: container.clientWidth * index,
        behavior: "smooth"
      });
    }
  };

  const heroImgSrc = config.heroImgUrl || slideImgDefault;
  const showcaseImgSrc = config.showcaseImgUrl || introImgDefault;
  const headlineText = config.headline || "The Journey of AI Innovation";
  const introductionText = config.introText || "The intelligent calculus solver system was born from a desire to bridge the gap between complex mathematical theories and real-world digital applications.\n\nThrough numerous cycles of research and algorithmic optimization, we developed a state-of-the-art action classification model powered by Deep Learning. Today, any integral problem—from fundamental concepts to highly complex derivations—is processed in the blink of an eye with absolute precision.";

  return (
    <div ref={containerRef} className="history-snap-container">
      <div className="history-bg-noise" />

      {/* Navigation Header overlay */}
      <div style={{ position: "absolute", top: 40, left: 0, width: "100%", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, boxSizing: "border-box" }}>
        <button
          onClick={() => onNavigate("intro")}
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            transition: "all 0.3s",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(255,255,255,0.01)",
            backdropFilter: "blur(4px)"
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.01)"; }}
        >
          ← Go Back
        </button>
        <span style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>
          SYSTEM EVOLUTION
        </span>
      </div>

      {/* ================= SECTION 1: HERO IMAGE BANNER ================= */}
      <HistoryHeroSection
        heroImgSrc={heroImgSrc}
        onScrollToNext={handleScrollToNext}
      />

      {/* ================= SECTION 2: CUSTOM CONTENT PLACEHOLDER ================= */}
      <HistoryIntroSection
        nextSectionRef={nextSectionRef}
        headlineText={headlineText}
        introductionText={introductionText}
        showcaseImgSrc={showcaseImgSrc}
      />

      {/* ================= SECTION 3: DRAGGABLE TIMELINE CAROUSEL ================= */}
      <HistoryTimelineSection
        timelineRef={timelineRef}
        handleMouseDown={handleMouseDown}
        handleMouseUp={handleMouseUp}
        handleMouseLeave={handleMouseLeave}
        handleMouseMove={handleMouseMove}
        milestones={milestones}
        slideImgDefault={slideImgDefault}
        introImgDefault={introImgDefault}
        onOpenArticleModal={(milestone) => {
          onNavigate("history-article", milestone);
        }}
        activeIndex={activeIndex}
        onScroll={handleScroll}
        onCardClick={handleCardClick}
      />
      {/* ================= SECTION 4: INTEGRAL APPLICATIONS SHOWCASE ================= */}
      <HistoryApplicationsSection />

      {/* ================= SECTION 5: HALL OF FAME ================= */}
      <HistoryHallOfFameSection />

      {/* ================= HISTORY FOOTER ================= */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

