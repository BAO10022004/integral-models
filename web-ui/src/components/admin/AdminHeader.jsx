import React, { useState, useEffect } from "react";
import { Search, RefreshCw, Sun, Moon, Bell, User } from "lucide-react";
import "../../styles/AdminHeader.css";

export default function AdminHeader() {
  const [searchVal, setSearchVal] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    const loadAvatar = () => {
      const storedUser = localStorage.getItem("user");
      const storedAvatar = localStorage.getItem("admin_avatar");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setAvatar(parsed.avatar || storedAvatar || "");
        } catch (e) {
          console.error(e);
        }
      } else if (storedAvatar) {
        setAvatar(storedAvatar);
      }
    };

    loadAvatar();

    window.addEventListener("admin_avatar_updated", loadAvatar);
    return () => {
      window.removeEventListener("admin_avatar_updated", loadAvatar);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="admin-header-nasani">
      {/* Left: User Welcome */}
      <div className="header-left">
        <span className="welcome-text">Xin chào: <strong>Administrator</strong></span>
      </div>

      {/* Center: Search Bar */}
      <div className="header-center">
        <div className="search-bar-container">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="search-input-field"
            placeholder="Tìm kiếm (Ctrl+/)"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="header-right">
        {/* Action Buttons */}
        <div className="action-buttons-group">
          {/* Refresh Action */}
          <button className="header-action-btn" onClick={handleRefresh} title="Tải lại trang">
            <RefreshCw size={16} />
          </button>

          {/* Notification Action */}
          <button className="header-action-btn notification-btn" title="Thông báo">
            <Bell size={16} />
            <span className="notification-badge">0</span>
          </button>
        </div>

        {/* User Profile Avatar */}
        <div className="header-profile-avatar" title="Thông tin cá nhân">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="header-avatar-image" />
          ) : (
            <User size={16} className="avatar-placeholder-icon" />
          )}
        </div>
      </div>
    </div>
  );
}
