"use client";

import React, { useEffect, useRef, useState } from "react";

const InteractiveGridBackground = ({
  gridSize = 50,
  gridColor = "#cbcbcb",
  darkGridColor = "#303030",
  effectColor = "rgba(0, 0, 0, 0.6)",
  darkEffectColor = "rgba(255, 255, 255, 0.6)",
  trailLength = 3,
  width,
  height,
  idleSpeed = 0.2,
  glow = true,
  glowRadius = 20,
  children,
  showFade = true,
  fadeIntensity = 20,
  idleRandomCount = 5,
  className,
  style,
  ...props
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const trailRef = useRef([]);
  const idleTargetsRef = useRef([]);
  const idlePositionsRef = useRef([]);
  const mouseActiveRef = useRef(false);
  const lastMouseTimeRef = useRef(Date.now());

  // Detect dark mode
  useEffect(() => {
    const updateDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    updateDarkMode();
    const observer = new MutationObserver(() => updateDarkMode());
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

      if (rawX < 0 || rawY < 0 || rawX > rect.width || rawY > rect.height)
        return;

      mouseActiveRef.current = true;
      lastMouseTimeRef.current = Date.now();

      const snappedX = Math.floor(rawX / gridSize);
      const snappedY = Math.floor(rawY / gridSize);

      const last = trailRef.current[0];
      if (!last || last.x !== snappedX || last.y !== snappedY) {
        trailRef.current.unshift({ x: snappedX, y: snappedY });
        if (trailRef.current.length > trailLength) trailRef.current.pop();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [gridSize, trailLength]);

  // Drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasWidth = width || container.offsetWidth || window.innerWidth;
    const canvasHeight = height || container.offsetHeight || window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const cols = Math.floor(canvasWidth / gridSize);
    const rows = Math.floor(canvasHeight / gridSize);

    const lineColor = isDarkMode ? darkGridColor : gridColor;
    const glowColor = isDarkMode ? darkEffectColor : effectColor;

    // Initialize idle positions
    idleTargetsRef.current = Array.from({ length: idleRandomCount }, () => ({
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    }));
    idlePositionsRef.current = idleTargetsRef.current.map((p) => ({ ...p }));

    let rafId;

    const draw = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw grid lines
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }

      // Idle animation logic
      const idleThreshold = 2000;
      if (Date.now() - lastMouseTimeRef.current > idleThreshold) {
        mouseActiveRef.current = false;

        idlePositionsRef.current.forEach((pos, i) => {
          const target = idleTargetsRef.current[i];
          const dx = target.x - pos.x;
          const dy = target.y - pos.y;

          if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
            idleTargetsRef.current[i] = {
              x: Math.floor(Math.random() * cols),
              y: Math.floor(Math.random() * rows),
            };
          } else {
            pos.x += dx * idleSpeed;
            pos.y += dy * idleSpeed;
          }

          const roundedX = Math.round(pos.x);
          const roundedY = Math.round(pos.y);
          const last = trailRef.current[0];
          if (!last || last.x !== roundedX || last.y !== roundedY) {
            trailRef.current.unshift({ x: roundedX, y: roundedY });
            if (trailRef.current.length > trailLength * idleRandomCount)
              trailRef.current.pop();
          }
        });
      }

      // Draw trail glow
      trailRef.current.forEach((cell, idx) => {
        const alpha = 1 - idx * (1 / (trailLength + 1));
        const rgbaColor = glowColor.replace(/[\d.]+\)$/, `${alpha})`);

        ctx.fillStyle = rgbaColor;
        if (glow) {
          ctx.shadowColor = rgbaColor;
          ctx.shadowBlur = glowRadius;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize, gridSize);
      });

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [
    gridSize,
    width,
    height,
    gridColor,
    darkGridColor,
    effectColor,
    darkEffectColor,
    isDarkMode,
    trailLength,
    idleSpeed,
    glow,
    glowRadius,
    idleRandomCount,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className || ""}`}
      style={{ width: width || "100%", height: height || "100%", ...style }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-0 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />

      {showFade && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "white",
            maskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, white)`,
            WebkitMaskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, white)`,
          }}
        />
      )}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export default InteractiveGridBackground;
