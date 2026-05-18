import React from 'react';
import logoDefault from '../../assets/logo.png';

const Footer = ({ onNavigate }) => {
    return (
        <footer className="history-footer">
            <div className="footer-container">
                <div className="footer-main-grid">
                    <div className="footer-brand-col">
                        <div className="footer-brand-logo">
                            <img src={logoDefault} alt="Integral.AI Logo" className="footer-logo-img" />
                        </div>
                        <p className="footer-brand-tagline">
                            Bridging classical mathematics and advanced neural intelligence.
                        </p>
                        <div className="footer-dedication">
                            Dedicated to the pioneer thinkers of calculus—from Newtonian fluxions to Schrödinger wavefields.
                        </div>
                    </div>

                    <div className="footer-links-col">
                        <h4 className="footer-col-title">Navigation</h4>
                        <ul className="footer-links-list">
                            <li><a href="/" onClick={(e) => { e.preventDefault(); onNavigate("intro"); }}>Home</a></li>
                            <li><a href="/history" onClick={(e) => { e.preventDefault(); onNavigate("history"); }}>History & Milestones</a></li>
                            <li><a href="/theory" onClick={(e) => { e.preventDefault(); onNavigate("theory"); }}>Theory & Knowledge</a></li>
                            <li><a href="/tester" onClick={(e) => { e.preventDefault(); onNavigate("tester"); }}>AI Engine</a></li>
                        </ul>
                    </div>

                    <div className="footer-tech-col">
                        <h4 className="footer-col-title">Math Core</h4>
                        <div className="footer-equations-showcase">
                            <div className="footer-eq-item">
                                <span className="eq-label">Leibniz Integral Notation:</span>
                                <span className="eq-code">{"\u222B f(x) dx"}</span>
                            </div>
                            <div className="footer-eq-item">
                                <span className="eq-label">Fundamental Theorem:</span>
                                <span className="eq-code">{"\u222B [a\u2192b] f(x)dx = F(b)-F(a)"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom-bar">
                    <p className="footer-copyright">
                        &copy; {new Date().getFullYear()} Integral.AI. All rights reserved. Created for educational exploration.
                    </p>
                    <div className="footer-socials">
                        <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="social-icon-btn">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                            </svg>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="social-icon-btn">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
