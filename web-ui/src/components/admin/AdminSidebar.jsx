import React, { useState, useEffect } from "react";
import {
  FileText, History, BookOpen, Cpu, Info, PhoneCall, LogOut, Layers,
  ChevronDown, ChevronRight, LayoutDashboard, Users, Clock, Image, Calculator
} from "lucide-react";
import defaultLogo from "../../assets/logo.png";
import "../../styles/AdminSidebar.css";

export default function AdminSidebar({ activeTab, setActiveTab, onNavigate, onLogout }) {
  const [logoUrl, setLogoUrl] = useState("");
  const [openGroup, setOpenGroup] = useState("history"); // auto-open the history group

  useEffect(() => {
    const storedFavicon = localStorage.getItem("website_favicon");
    if (storedFavicon) setLogoUrl(storedFavicon);
  }, []);

  // ─── Menu structure ─────────────────────────────────────────────────────
  // type: "tab"      → calls setActiveTab(target)
  // type: "navigate" → calls onNavigate(target)
  // type: "group"    → collapsible parent with children[]
  const menuItems = [
    {
      label: "Cấu hình chung",
      type: "tab",
      target: "landing",
      icon: <FileText size={16} />
    },
    {
      label: "Quản lý lịch sử",
      type: "group",
      key: "history",
      icon: <History size={16} />,
      children: [
        {
          label: "Home",
          type: "tab",
          target: "history",
          subTab: "general",
          icon: <LayoutDashboard size={14} />
        },
        {
          label: "About us",
          type: "tab",
          target: "history",
          subTab: "about",
          icon: <Users size={14} />
        },
        {
          label: "Lịch sử phát triển",
          type: "tab",
          target: "history",
          subTab: "milestones",
          icon: <Clock size={14} />
        },
        {
          label: "Marquee Album",
          type: "tab",
          target: "history",
          subTab: "marquee",
          icon: <Image size={14} />
        }
      ]
    },
    {
      label: "Quản lý Kiến thức",
      type: "group",
      key: "theory",
      icon: <BookOpen size={16} />,
      children: [
        {
          label: "Home",
          type: "tab",
          target: "theory",
          subTab: "general",
          icon: <LayoutDashboard size={14} />
        },
        {
          label: "Khái niệm",
          type: "tab",
          target: "theory",
          subTab: "concepts",
          icon: <BookOpen size={14} />
        },
        {
          label: "Định nghĩa",
          type: "tab",
          target: "theory",
          subTab: "definitions",
          icon: <Layers size={14} />
        },
        {
          label: "Định lý",
          type: "tab",
          target: "theory",
          subTab: "theorems",
          icon: <FileText size={14} />
        },
        {
          label: "Tính chất",
          type: "tab",
          target: "theory",
          subTab: "properties",
          icon: <Calculator size={14} />
        }
      ]
    },
    {
      label: "Quản lý AI",
      type: "tab",
      target: "model",
      icon: <Cpu size={16} />
    }
  ];

  // ─── Handlers ────────────────────────────────────────────────────────────
  const [activeSubTab, setActiveSubTabLocal] = useState("general");

  // Expose activeSubTab upward via a callback if needed; here we store it
  // in localStorage so AdminHistoryTab and AdminTheoryTab can read it without prop-drilling.
  const handleChildClick = (child) => {
    setActiveTab(child.target);
    if (child.subTab) {
      setActiveSubTabLocal(child.subTab);
      const storageKey = child.target === "theory" ? "admin_theory_subtab" : "admin_history_subtab";
      localStorage.setItem(storageKey, child.subTab);
    }
  };

  const handleItemClick = (item) => {
    if (item.type === "tab") {
      setActiveTab(item.target);
    } else if (item.type === "navigate") {
      onNavigate(item.target);
    } else if (item.type === "group") {
      setOpenGroup(prev => prev === item.key ? null : item.key);
      // when opening the group, also activate the first child tab
      if (openGroup !== item.key && item.children?.length > 0) {
        const first = item.children[0];
        setActiveTab(first.target);
        if (first.subTab) {
          setActiveSubTabLocal(first.subTab);
          const storageKey = first.target === "theory" ? "admin_theory_subtab" : "admin_history_subtab";
          localStorage.setItem(storageKey, first.subTab);
        }
      }
    }
  };

  // Sync activeSubTab and openGroup state when activeTab changes
  useEffect(() => {
    if (activeTab === "history") {
      setActiveSubTabLocal(localStorage.getItem("admin_history_subtab") || "general");
      setOpenGroup("history");
    } else if (activeTab === "theory") {
      setActiveSubTabLocal(localStorage.getItem("admin_theory_subtab") || "general");
      setOpenGroup("theory");
    }
  }, [activeTab]);

  const isTabActive  = (target) => activeTab === target;
  const isChildActive = (child) =>
    activeTab === child.target && activeSubTab === child.subTab;
  const isGroupActive = (item) =>
    item.children?.some(c => isChildActive(c));

  return (
    <div className="admin-sidebar-square">
      {/* ── Brand / Logo ── */}
      <div
        className="sidebar-brand-container-square"
        onClick={() => setActiveTab("overview")}
        title="Trang chủ Thống kê"
      >
        <img src={logoUrl || defaultLogo} alt="Logo" className="sidebar-program-logo" />
        <span className="sidebar-program-title">ADMIN CONTROL</span>
      </div>

      {/* ── Navigation ── */}
      <div className="sidebar-menu-square">
        {menuItems.map((item, idx) => {

          /* ── GROUP (collapsible) ── */
          if (item.type === "group") {
            const isOpen   = openGroup === item.key;
            const isActive = isGroupActive(item);
            return (
              <div key={idx}>
                {/* Group header button */}
                <button
                  className={`sidebar-menu-item-btn-square ${isActive && !isOpen ? "active" : ""}`}
                  onClick={() => handleItemClick(item)}
                  style={{ justifyContent: "space-between" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="item-icon-square">{item.icon}</span>
                    <span className="item-label-square">{item.label}</span>
                  </span>
                  <span className="item-chevron" style={{
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform .2s",
                    color: "var(--admin-text-secondary)",
                    display: "flex", alignItems: "center"
                  }}>
                    <ChevronRight size={14} />
                  </span>
                </button>

                {/* Children (slide-down when open) */}
                <div className={`sidebar-submenu ${isOpen ? "open" : ""}`}>
                  {item.children.map((child, cidx) => {
                    const childActive = isChildActive(child);
                    return (
                      <button
                        key={cidx}
                        className={`sidebar-submenu-item ${childActive ? "active" : ""}`}
                        onClick={() => handleChildClick(child)}
                      >
                        <span className="submenu-item-icon">{child.icon}</span>
                        <span className="submenu-item-label">{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          /* ── Regular item ── */
          const active = item.type === "tab" && isTabActive(item.target);
          return (
            <button
              key={idx}
              className={`sidebar-menu-item-btn-square ${active ? "active" : ""}`}
              onClick={() => handleItemClick(item)}
            >
              <span className="item-icon-square">{item.icon}</span>
              <span className="item-label-square">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Footer / Logout ── */}
      <div className="sidebar-footer-square">
        <button className="sidebar-logout-btn-square" onClick={onLogout}>
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
