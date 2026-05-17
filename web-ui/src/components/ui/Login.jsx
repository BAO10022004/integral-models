import React, { useState, useEffect, useRef } from 'react';
import { auth, googleProvider, signInWithPopup } from '../../services/firebase';
import { DOTNET_API_URL } from '../../config';
import '../../styles/Login.css';
import logoImg from '../../assets/logo.png';

const Login = ({ user, onSetUser, onNavigate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.15;
                this.vy = -Math.random() * 0.4 - 0.15; // Drift upwards slowly like sparks/embers
                this.radius = Math.random() * 2 + 0.6;
                this.color = Math.random() > 0.4
                    ? `rgba(184, 147, 42, ${Math.random() * 0.35 + 0.2})` // Warm gold ember
                    : `rgba(232, 201, 106, ${Math.random() * 0.25 + 0.15})`; // Soft bronze spark
                this.angle = Math.random() * Math.PI * 2;
                this.shimmerSpeed = Math.random() * 0.02 + 0.005;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.shimmerSpeed;

                // Gentle left/right float wave
                this.x += Math.sin(this.angle) * 0.12;

                // Reset at bottom when drifting out of top boundary
                if (this.y < -10) {
                    this.y = canvas.height + 10;
                    this.x = Math.random() * canvas.width;
                    this.vy = -Math.random() * 0.4 - 0.15;
                }
                if (this.x < -10) this.x = canvas.width + 10;
                if (this.x > canvas.width + 10) this.x = -10;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
        const particles = Array.from({ length: particleCount }, () => new Particle());

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Login with Google on Firebase Client
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            // 2. Send Token to .NET API
            const response = await fetch(`${DOTNET_API_URL}/Account/google-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: idToken,
                    provider: 'google'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to login with backend API');
            }

            const userData = await response.json();
            onSetUser(userData);
            console.log('Logged in successfully:', userData);

            // Redirect to admin dashboard immediately
            onNavigate("admin");
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        onSetUser(null);
    };

    return (
        <div className="login-page-container">
            {/* Dynamic Background Canvas Particle Network */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />
            {/* Ambient Glow Orbs - Warm Classical Candlelight */}
            <div className="login-glow-orb" style={{ width: 600, height: 600, top: '5%', left: '5%', background: 'rgba(184, 147, 42, 0.05)' }} />
            <div className="login-glow-orb" style={{ width: 500, height: 500, bottom: '10%', right: '8%', background: 'rgba(120, 90, 30, 0.035)' }} />

            {/* Mathematical Floating Notations */}
            <div className="math-decorations math-decor-1">∫</div>
            <div className="math-decorations math-decor-2">∬</div>
            <div className="math-decorations math-decor-3">dx</div>
            <div className="math-decorations math-decor-4">f(x)</div>

            <div className="login-glass-card">
                {/* ===== Roman Frame ===== */}
                <div className="login-frame-outer" />
                <div className="login-frame-inner" />

                {["tl", "tr", "bl", "br"].map(pos => (
                    <svg key={pos} className={`login-frame-corner ${pos}`} viewBox="0 0 36 36" fill="none">
                        <path d="M2 34 L2 8 Q2 2 8 2 L34 2" stroke="rgba(184,147,42,0.9)" strokeWidth="1.5" />
                        <path d="M2 20 L2 8 Q2 2 8 2 L20 2" stroke="rgba(184,147,42,0.4)" strokeWidth="0.5" />
                        <circle cx="2" cy="2" r="2.5" fill="rgba(184,147,42,0.7)" />
                        <rect x="0.5" y="0.5" width="5" height="5" stroke="rgba(184,147,42,0.4)" strokeWidth="0.5" fill="none" />
                        <path d="M8 2 L8 8 L2 8" stroke="rgba(184,147,42,0.35)" strokeWidth="0.5" />
                    </svg>
                ))}
                {["top", "bot"].map(pos => (
                    <svg key={pos} className={`login-frame-ornament ${pos}`} width="60" height="14" viewBox="0 0 60 14" fill="none">
                        <line x1="0" y1="7" x2="20" y2="7" stroke="rgba(184,147,42,0.5)" strokeWidth="0.5" />
                        <polygon points="30,2 34,7 30,12 26,7" fill="rgba(184,147,42,0.6)" stroke="rgba(184,147,42,0.8)" strokeWidth="0.5" />
                        <line x1="40" y1="7" x2="60" y2="7" stroke="rgba(184,147,42,0.5)" strokeWidth="0.5" />
                        <circle cx="10" cy="7" r="1.5" fill="rgba(184,147,42,0.4)" />
                        <circle cx="50" cy="7" r="1.5" fill="rgba(184,147,42,0.4)" />
                    </svg>
                ))}
                <div className="login-frame-side-dot left" />
                <div className="login-frame-side-dot right" />

                {/* ===== Website Logo at Top Center ===== */}
                <div className="login-logo-container">
                    <img
                        src={logoImg}
                        alt="Integral.AI Logo"
                        style={{
                            height: "200px",
                            objectFit: "contain",
                            display: "block",
                            filter: "drop-shadow(0 0 10px rgba(184, 147, 42, 0.45))",
                            position: "relative",
                            zIndex: 10
                        }}
                    />
                </div>

                {user ? (
                    <div className="premium-login-profile">
                        <span className="login-title-badge">Authenticated</span>
                        <div className="premium-avatar-frame">
                            <img src={user.photoUrl} alt="Profile" className="premium-avatar" />
                        </div>
                        <h3 className="premium-welcome-text">Welcome, {user.displayName}</h3>
                        <p className="premium-email-text">{user.email}</p>
                        <button onClick={handleLogout} className="premium-logout-btn">
                            Sign Out Account
                        </button>
                    </div>
                ) : (
                    <div>
                        <h2 className="login-heading">Welcome Back</h2>
                        <p className="login-subheading">
                            Access the high-performance AI math derivation dashboard and admin engine.
                        </p>

                        <button
                            className="google-premium-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleGoogleLogin();
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                'Authenticating...'
                            ) : (
                                <>
                                    <img
                                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                        alt="G"
                                        className="google-btn-icon"
                                    />
                                    Continue with Google
                                </>
                            )}
                        </button>

                        {error && <div className="premium-login-error">{error}</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
