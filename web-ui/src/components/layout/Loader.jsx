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
      zIndex: 1000,
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      opacity: isDone ? 0 : 1,
      pointerEvents: isDone ? 'none' : 'all'
    }}>
      <img 
        src={logo} 
        alt="Loading..." 
        style={{
          height: '280px',
          marginBottom: '2rem'
        }} 
      />
      
      <div style={{
        width: '200px',
        height: '1px',
        background: 'rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          background: '#d2a425',
          width: `${progress}%`,
          transition: 'width 0.4s ease'
        }} />
      </div>
      
      <div style={{
        marginTop: '1rem',
        fontSize: '10px',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.2em'
      }}>
        LOADING {Math.floor(progress)}%
      </div>
    </div>
  );
};

export default Loader;
