import React, { useState, useEffect } from 'react';
import logoDefault from '../../assets/logo.png';
import heroVideoDefault from '../../assets/mp_.mp4';
import '../../styles/Hero.css';

const Hero = ({ onNavigate }) => {
  const [config, setConfig] = useState({
    logoUrl: "",
    videoUrl: "",
    btnText: "Explore Now"
  });

  useEffect(() => {
    const stored = localStorage.getItem("landing_config");
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse landing config", e);
      }
    }
  }, []);

  const logoSrc = config.logoUrl || logoDefault;
  const videoSrc = config.videoUrl || heroVideoDefault;
  const buttonText = config.btnText || "Explore Now";

  return (
    <section className="snap-section koa-hero">
      {/* Logo added here to appear only on the first page */}
      <div className="koa-hero-logo-container">
        <div className="koa-hero-logo-glow" />
        <img
          src={logoSrc}
          alt="Logo"
          className="koa-hero-logo"
          onClick={() => onNavigate('home')}
        />
      </div>

      <video
        key={videoSrc}
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        className="koa-hero-video"
      />
      <div className="koa-hero-content">
        <div className="koa-hero-btn-wrapper">
          <button onClick={() => onNavigate('home')} className="koa-btn">{buttonText}</button>
        </div>
      </div>
      <div className="vertical-text">SCROLL TO DISCOVER</div>
    </section>
  );
};

export default Hero;
