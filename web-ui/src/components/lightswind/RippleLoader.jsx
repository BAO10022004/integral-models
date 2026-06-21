import React from 'react';
import { cn } from '@/components/lib/utils';

export default function RippleLoader({
  icon,
  size = 200,
  duration = "3s",
  logoColor = "dodgerblue",
  className
}) {
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <style>{`
        @keyframes ripple-wave {
          0% {
            transform: scale(0.3);
            opacity: 1;
            border-width: 3px;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
            border-width: 0px;
          }
        }
        @keyframes pulse-core {
          0%, 100% { transform: scale(0.8); opacity: 0.3; filter: drop-shadow(0 0 15px ${logoColor}); }
          50% { transform: scale(1.2); opacity: 0.6; filter: drop-shadow(0 0 35px ${logoColor}); }
        }
        @keyframes spin-slow {
          100% { transform: rotate(360deg); }
        }
        
        .ripple-ring {
          position: absolute;
          inset: 35%;
          border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, ${logoColor} 20%, transparent) 0%, transparent 60%);
          border: solid color-mix(in srgb, ${logoColor} 80%, transparent);
          box-shadow: 0 0 20px color-mix(in srgb, ${logoColor} 50%, transparent), 
                      inset 0 0 15px color-mix(in srgb, ${logoColor} 30%, transparent);
          animation: ripple-wave ${duration} cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        
        .ripple-ring:nth-child(1) { animation-delay: 0s; }
        .ripple-ring:nth-child(2) { animation-delay: calc(-${duration} * 0.25); }
        .ripple-ring:nth-child(3) { animation-delay: calc(-${duration} * 0.5); }
        .ripple-ring:nth-child(4) { animation-delay: calc(-${duration} * 0.75); }
        
        .ripple-core {
          position: absolute;
          inset: 35%;
          border-radius: 50%;
          background: ${logoColor};
          filter: blur(25px);
          animation: pulse-core 2s ease-in-out infinite;
        }
        
        .ripple-icon {
          animation: pulse-core 2s ease-in-out infinite;
        }
        .ripple-icon-spin {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: spin-slow 8s linear infinite;
        }
      `}</style>

      {/* Background Glowing Core */}
      <div className="ripple-core"></div>

      {/* Expanding Ripple Rings */}
      <div className="ripple-ring"></div>
      <div className="ripple-ring"></div>
      <div className="ripple-ring"></div>
      <div className="ripple-ring"></div>

      {/* Icon Container */}
      <div
        className="ripple-icon relative z-10 flex items-center justify-center rounded-full"
        style={{ width: '35%', height: '35%', color: logoColor }}
      >
        <div className="ripple-icon-spin">
          {icon}
        </div>
      </div>
    </div>
  );
}
