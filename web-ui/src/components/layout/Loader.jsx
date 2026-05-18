import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo.png';

const Loader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((old) => {
        const next = old + Math.random() * 20;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDone(true);
            setTimeout(onComplete, 800);
          }, 500);
          return 100;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100000,
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      opacity: isDone ? 0 : 1,
      pointerEvents: isDone ? 'none' : 'all'
    }}>
      <style>{`
        .loader-logo-anim {
          animation: logoFloat 3.5s ease-in-out infinite;
          will-change: transform, filter;
        }
        @keyframes logoFloat {
          0% {
            transform: translateY(0) scale(0.96);
            filter: drop-shadow(0 8px 15px rgba(0, 242, 255, 0.2));
          }
          50% {
            transform: translateY(-12px) scale(1.02);
            filter: drop-shadow(0 25px 30px rgba(112, 0, 255, 0.32));
          }
          100% {
            transform: translateY(0) scale(0.96);
            filter: drop-shadow(0 8px 15px rgba(0, 242, 255, 0.2));
          }
        }
      `}</style>
      <img
        src={logo}
        alt="Loading..."
        className="loader-logo-anim"
        style={{
          height: '280px',
          margin: 0
        }}
      />
    </div>
  );
};

export default Loader;
