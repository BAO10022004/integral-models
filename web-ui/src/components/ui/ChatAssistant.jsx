import React, { useState, useRef, useEffect } from 'react';
import '../../styles/ChatAssistant.css';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'assistant', text: 'Xin chào! Tôi là trợ lý ảo giải tích. Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Thêm tin nhắn của user
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: inputValue }]);
    setInputValue('');

    // Logic xử lý phản hồi sẽ được tích hợp sau
    // Tạm thời mô phỏng phản hồi
    /*
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'assistant', 
        text: 'Tôi đã nhận được câu hỏi của bạn. Tính năng giải đáp tự động đang được cập nhật.' 
      }]);
    }, 1000);
    */
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
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="chat-send-btn" title="Gửi tin nhắn">
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
