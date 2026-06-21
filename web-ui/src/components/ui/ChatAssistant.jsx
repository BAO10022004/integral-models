import React, { useState, useRef, useEffect } from 'react';
import '../../styles/ChatAssistant.css';
import { AI_API_URL } from '../../config';
import LatexRenderer from './LatexRenderer';

// Helper component to parse and render text with LaTeX formula blocks
function MessageContent({ text }) {
  if (!text) return null;

  // Split by block equations first ($$...$$)
  const blocks = text.split(/(\$\$.*?\$\$)/gs);

  return (
    <div className="message-text-content">
      {blocks.map((block, idx) => {
        if (block.startsWith('$$') && block.endsWith('$$')) {
          const formula = block.slice(2, -2).trim();
          return (
            <div key={idx} className="math-block" style={{ margin: '8px 0', overflowX: 'auto', textAlign: 'center' }}>
              <LatexRenderer latex={formula} displayMode={true} />
            </div>
          );
        }

        // Parse inline math ($...$)
        const inlineParts = block.split(/(\$.*?\$)/g);
        return (
          <span key={idx}>
            {inlineParts.map((part, pIdx) => {
              if (part.startsWith('$') && part.endsWith('$')) {
                const formula = part.slice(1, -1).trim();
                return <LatexRenderer key={pIdx} latex={formula} displayMode={false} />;
              }

              // Parse bold text (**bold**)
              const boldParts = part.split(/(\*\*.*?\*\*)/g);
              return (
                <span key={pIdx}>
                  {boldParts.map((subPart, sIdx) => {
                    if (subPart.startsWith('**') && subPart.endsWith('**')) {
                      return <strong key={sIdx}>{subPart.slice(2, -2)}</strong>;
                    }
                    // Handle plain text with line breaks
                    return subPart.split('\n').map((line, lIdx, arr) => (
                      <React.Fragment key={lIdx}>
                        {line}
                        {lIdx < arr.length - 1 && <br />}
                      </React.Fragment>
                    ));
                  })}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'assistant', text: 'Xin chào! Tôi là trợ lý ảo giải tích. Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue.trim();
    const newUserMessage = { id: Date.now(), sender: 'user', text: userMessageText };
    
    // Add user message to state
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build chat history for backend (limit to last 10 messages to avoid large payload)
      // Map roles: 'user' -> 'user', 'assistant' -> 'assistant'
      const historyPayload = messages
        .filter(msg => msg.id !== 1) // skip the initial greeting
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
        .slice(-10);

      const response = await fetch(`${AI_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageText,
          history: historyPayload
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối đến máy chủ.');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'assistant',
        text: data.response
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'assistant',
        text: `⚠️ **Lỗi kết nối:** Không thể gửi tin nhắn. Vui lòng kiểm tra xem server backend đã chạy chưa.\n\nChi tiết: ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-assistant-container">
      {/* Nút trigger khi chatbox đóng */}
      {!isOpen && (
        <button className="chat-trigger-btn" onClick={toggleChat} title="Mở trợ lý ảo">
          <div className="assistant-avatar-mini">
            🤖
          </div>
          <span className="trigger-text">Trợ lý ảo</span>
        </button>
      )}

      {/* Cửa sổ chat khi mở */}
      {isOpen && (
        <div className="chat-window fade-in-up">
          <div className="chat-header">
            <div className="header-info">
              <div className="assistant-avatar">🤖</div>
              <div>
                <h3 className="assistant-name">Trợ lý Giải tích</h3>
                <span className="online-status">Trực tuyến</span>
              </div>
            </div>
            <button className="close-chat-btn" onClick={toggleChat} title="Đóng">
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                {msg.sender === 'assistant' && (
                  <div className="message-avatar">🤖</div>
                )}
                <div className={`message-bubble ${msg.sender}`}>
                  <MessageContent text={msg.text} />
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-wrapper assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-bubble assistant">
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="chat-input"
              disabled={isLoading}
            />
            <button type="submit" className="chat-send-btn" title="Gửi tin nhắn" disabled={isLoading || !inputValue.trim()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
