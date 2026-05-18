import React from 'react';
import '../../styles/ChatAssitantButton.css';

export default function ChatAssistantButton({ onClick }) {
  return (
    <button 
      className="greek-btn" 
      onClick={onClick} 
      aria-label="Open AI Assistant"
      title="Open AI Assistant"
    >
      <div className="btn-pillar">
        <div className="pillar-cap"></div>
        <div className="pillar-shaft"></div>
        <div className="pillar-base"></div>
      </div>
      <div className="btn-body">
        <div className="btn-frieze">
          <svg className="meander-svg" viewBox="0 0 200 12" preserveAspectRatio="xMidYMid meet">
            <rect width="200" height="12" fill="#2E6090" />
            <path d="M0 9 L4 9 L4 3 L8 3 L8 6 L12 6 L12 3 L20 3 L20 9 L16 9 L16 6 L24 6 L24 9
               M28 9 L32 9 L32 3 L36 3 L36 6 L40 6 L40 3 L48 3 L48 9 L44 9 L44 6 L52 6 L52 9
               M56 9 L60 9 L60 3 L64 3 L64 6 L68 6 L68 3 L76 3 L76 9 L72 9 L72 6 L80 6 L80 9
               M84 9 L88 9 L88 3 L92 3 L92 6 L96 6 L96 3 L104 3 L104 9 L100 9 L100 6 L108 6 L108 9
               M112 9 L116 9 L116 3 L120 3 L120 6 L124 6 L124 3 L132 3 L132 9 L128 9 L128 6 L136 6 L136 9
               M140 9 L144 9 L144 3 L148 3 L148 6 L152 6 L152 3 L160 3 L160 9 L156 9 L156 6 L164 6 L164 9
               M168 9 L172 9 L172 3 L176 3 L176 6 L180 6 L180 3 L188 3 L188 9 L184 9 L184 6 L192 6 L192 9"
                  fill="none" stroke="#F5F0E8" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="btn-inner">
          <div className="owl-circle">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9" fill="#C9BAA0" stroke="#D4AF5A" strokeWidth="1" />
              <circle cx="8" cy="9" r="3" fill="#F5F0E8" stroke="#8B6A1A" strokeWidth="1" />
              <circle cx="14" cy="9" r="3" fill="#F5F0E8" stroke="#8B6A1A" strokeWidth="1" />
              <circle cx="8" cy="9" r="1.5" fill="#2A1F10" />
              <circle cx="14" cy="9" r="1.5" fill="#2A1F10" />
              <circle cx="8.6" cy="8.4" r="0.5" fill="#F5F0E8" />
              <circle cx="14.6" cy="8.4" r="0.5" fill="#F5F0E8" />
              <path d="M8 13 Q11 15.5 14 13" stroke="#8B6A1A" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M9 5 L8 7 M13 5 L14 7" stroke="#8B6A1A" strokeWidth="1" strokeLinecap="round" />
              <path d="M9.5 11.5 L12.5 11.5" stroke="#8B6A1A" strokeWidth="0.8" />
            </svg>
          </div>
          <div className="btn-text-block">
            <span className="btn-title">ΣΟΦΙΑ</span>
            <span className="btn-sub">AI · ΒΟΗΘΟΣ</span>
          </div>
        </div>
        <div className="btn-frieze-bot"></div>
      </div>
      <div className="btn-pillar">
        <div className="pillar-cap"></div>
        <div className="pillar-shaft"></div>
        <div className="pillar-base"></div>
      </div>
    </button>
  );
}
