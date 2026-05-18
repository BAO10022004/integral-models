import React, { useEffect, useRef, useState } from 'react';
import '../styles/KoaDesign.css';
import Loader from '../components/layout/Loader';
import Hero from '../components/landing/Hero';
import CategoryGrid from '../components/landing/CategoryGrid';
import MenuOverlay from '../components/common/MenuOverlay';

const IntroPage = ({ user, onLogout, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const revealRefs = useRef([]);

  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [loading]);

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}

      <div className={`koa-container ${loading ? 'is-loading' : 'is-ready'}`}>
        <nav className="koa-nav" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', opacity: 0.6 }}>EST. 2026</div>
          <button className="koa-menu-btn" onClick={() => setMenuOpen(true)}>
            <span className="koa-menu-line"></span>
            <span className="koa-menu-line"></span>
          </button>
        </nav>

        {/* Menu Overlay */}
        <MenuOverlay menuOpen={menuOpen} setMenuOpen={setMenuOpen} onNavigate={onNavigate} user={user} onLogout={onLogout} />

        <div className="snap-container">
          {/* SECTION 1: HERO */}
          <Hero onNavigate={onNavigate} />

          {/* SECTION 2: CATEGORY GRID */}
          <CategoryGrid onNavigate={onNavigate} />
        </div>
      </div >
    </>
  );
};

export default IntroPage;
