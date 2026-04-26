import { useEffect, useRef, useCallback, useState } from "react";
import "../../styles/Navbar.css";
/* ─── CONSTANTS ─────────────────────────────────────── */
const C = {
  bg: "#0a0a0a",
  border: "#222",
  text: "#f0f0f0",
  muted: "#777",
  yellow: "#f5c842",
};

/* ─── LIGHTNING ENGINE ──────────────────────────────── */
class Bolt {
  constructor(x, y, intensity = 1) {
    this.life = 1;
    this.decay = 0.055 + Math.random() * 0.05;
    this.segments = this.#build(x, y, intensity);
  }

  #build(sx, sy, intensity) {
    return Array.from({ length: Math.floor(3 + Math.random() * 4) }, () => {
      const angle = Math.random() * Math.PI * 2;
      const len = (20 + Math.random() * 55) * intensity;
      let px = sx, py = sy;
      const steps = 4 + Math.floor(Math.random() * 5);
      const pts = [{ x: px, y: py }];
      for (let i = 0; i < steps; i++) {
        px += Math.cos(angle + (Math.random() - 0.5) * 2.4) * (len / steps);
        py += Math.sin(angle + (Math.random() - 0.5) * 2.4) * (len / steps);
        pts.push({ x: px, y: py });
      }
      return pts;
    });
  }

  draw(ctx) {
    if (this.life <= 0) return;
    this.segments.forEach((pts) => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = `rgba(245,200,66,${this.life * 0.9})`;
      ctx.lineWidth = this.life * 1.8;
      ctx.shadowColor = C.yellow;
      ctx.shadowBlur = 10 * this.life;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = `rgba(255,255,255,${this.life * 0.55})`;
      ctx.lineWidth = this.life * 0.6;
      ctx.shadowBlur = 0;
      ctx.stroke();
    });
    this.life -= this.decay;
  }
}

/* ─── HOOK ──────────────────────────────────────────── */
function useLightning() {
  const canvasRef = useRef(null);
  const boltsRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      boltsRef.current = boltsRef.current.filter((b) => {
        b.draw(ctx);
        return b.life > 0;
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const spawn = useCallback((el, count = 6, intensity = 1) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (let i = 0; i < count; i++) {
      const ox = (Math.random() - 0.5) * r.width * 0.8;
      const oy = (Math.random() - 0.5) * r.height * 0.8;
      boltsRef.current.push(new Bolt(cx + ox, cy + oy, intensity));
    }
  }, []);

  return { canvasRef, spawn };
}

/* ─── COMPONENTS ────────────────────────────────────── */
function NavLink({ label, spawn }) {
  const ref = useRef(null);

  return (
    <a
      ref={ref}
      href="#"
      className="nav-link-el"
      onMouseEnter={() => spawn(ref.current, 5, 0.7)}
      onMouseMove={() => Math.random() < 0.25 && spawn(ref.current, 2, 0.4)}
    >
      {label}
      <span className="elec-underline" />
    </a>
  );
}

function CtaButton({ onClick, spawn }) {
  const ref = useRef(null);

  return (
    <button
      ref={ref}
      className="cta-electric"
      onMouseEnter={() => spawn(ref.current, 14, 1.5)}
      onMouseMove={() => Math.random() < 0.3 && spawn(ref.current, 3, 0.9)}
      onClick={(e) => {
        spawn(ref.current, 22, 2.2);
        onClick?.(e);
      }}
    >
      Try Integral Solver
    </button>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────── */
export default function Navbar({ onOpenSolver }) {
  const { canvasRef, spawn } = useLightning();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      <div className="liquid-bg" />
      <canvas ref={canvasRef} className="lightning-canvas" />

      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="logo-3d">
          <img
            src="https://framerusercontent.com/images/tqSkXK27vQUcATL7U6woOESNjQ.svg"
            alt="Callox"
            className="logo-img"
          />
          <div className="logo-light" />
        </div>

        <div className="nav-right">
          {["Home", "Features", "Pricing", "Blog"].map((l) => (
            <NavLink key={l} label={l} spawn={spawn} />
          ))}
          <CtaButton onClick={onOpenSolver} spawn={spawn} />
        </div>
      </nav>
    </>
  );
}