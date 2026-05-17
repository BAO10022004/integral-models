import React, { useState, useEffect } from "react";
import AdminHeader from "../components/admin/AdminHeader";
// import AdminStats from "..//admin/AdminStats";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminDashboardTab from "../components/admin/AdminDashboardTab";
import AdminModelTab from "../components/admin/AdminModelTab";
import AdminLogsTab from "../components/admin/AdminLogsTab";
import AdminSettingsTab from "../components/admin/AdminSettingsTab";
import AdminLandingTab from "../components/admin/AdminLandingTab";
import AdminHistoryTab from "../components/admin/AdminHistoryTab";
import "../styles/AdminPage.css";

export default function AdminPage({ onNavigate, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "model"
  const [modelSubTab, setModelSubTab] = useState("config"); // "config" | "logs" | "settings"
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainProgress, setRetrainProgress] = useState(0);
  const [modelType, setModelType] = useState("gradient_boosting");
  const [learningRate, setLearningRate] = useState(0.1);
  const [apiLatency, setApiLatency] = useState(118);
  const [logs, setLogs] = useState([
    { id: 1, time: "11:34:12", latex: "\\int x^2 \\cos(x) dx", action: "Integration By Parts", confidence: 94.2, status: "success" },
    { id: 2, time: "11:32:05", latex: "\\int \\frac{2x}{x^2+1} dx", action: "U-Substitution", confidence: 98.7, status: "success" },
    { id: 3, time: "11:28:44", latex: "\\int 3x^2 + 5 dx", action: "Power Rule / Additive", confidence: 99.4, status: "success" },
    { id: 4, time: "11:25:10", latex: "\\int e^{2x} \\sin(x) dx", action: "Integration By Parts", confidence: 87.5, status: "success" },
    { id: 5, time: "11:20:19", latex: "\\int \\tan(x) dx", action: "Trigonometric / U-sub", confidence: 91.1, status: "success" },
  ]);

  // Simulate real-time API latency fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setApiLatency(prev => {
        const change = Math.floor(Math.random() * 11) - 5;
        const newVal = prev + change;
        return newVal > 80 && newVal < 180 ? newVal : prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRetrain = () => {
    if (isRetraining) return;
    setIsRetraining(true);
    setRetrainProgress(0);
    const interval = setInterval(() => {
      setRetrainProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRetraining(false);
            alert("Model retrained successfully! Validation F1-Score improved to 96.14%!");
          }, 500);
          return 100;
        }
        return p + 5;
      });
    }, 150);
  };

  return (
    <div className="admin-page-wrapper">


      {/* Decorative Orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div className="admin-glow-orb" style={{ width: 600, height: 600, top: "-15%", left: "-10%", background: "rgba(112,0,255,0.12)" }} />
        <div className="admin-glow-orb" style={{ width: 500, height: 500, bottom: "-10%", right: "-5%", background: "rgba(0,242,255,0.1)" }} />
      </div>

      <div className="admin-container">
        {/* Header Component */}
        <AdminHeader onNavigate={onNavigate} />

        {/* Stats Component */}
        {/* <AdminStats apiLatency={apiLatency} /> */}

        {/* Main Content Layout */}
        <div className="admin-main-layout">

          {/* Navigation Sidebar Component with integrated Logout */}
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onNavigate={onNavigate} onLogout={onLogout} />

          {/* Details Tab Content */}
          <div className="admin-glass-card" style={{ minHeight: 400 }}>
            {activeTab === "overview" && <AdminDashboardTab />}

            {activeTab === "model" && (
              <div>
                {/* Sub-tabs header for Model Group */}
                <div className="admin-subtabs-nav" style={{ 
                  display: "flex", 
                  gap: "10px", 
                  marginBottom: "24px", 
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)", 
                  paddingBottom: "12px",
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  touchAction: "pan-x",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none"
                }}>
                  <button 
                    className={`admin-subtab-btn ${modelSubTab === "config" ? "active" : ""}`}
                    onClick={() => setModelSubTab("config")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: modelSubTab === "config" ? "rgba(0, 242, 255, 0.1)" : "transparent",
                      border: "1px solid " + (modelSubTab === "config" ? "rgba(0, 242, 255, 0.2)" : "transparent"),
                      color: modelSubTab === "config" ? "#00f2ff" : "rgba(255, 255, 255, 0.6)",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
                      transition: "all 0.3s",
                      flexShrink: 0
                    }}
                  >
                    ⚙️ Configuration
                  </button>
                  <button 
                    className={`admin-subtab-btn ${modelSubTab === "logs" ? "active" : ""}`}
                    onClick={() => setModelSubTab("logs")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: modelSubTab === "logs" ? "rgba(0, 242, 255, 0.1)" : "transparent",
                      border: "1px solid " + (modelSubTab === "logs" ? "rgba(0, 242, 255, 0.2)" : "transparent"),
                      color: modelSubTab === "logs" ? "#00f2ff" : "rgba(255, 255, 255, 0.6)",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
                      transition: "all 0.3s",
                      flexShrink: 0
                    }}
                  >
                    📝 Request Logs
                  </button>
                  <button 
                    className={`admin-subtab-btn ${modelSubTab === "settings" ? "active" : ""}`}
                    onClick={() => setModelSubTab("settings")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: modelSubTab === "settings" ? "rgba(0, 242, 255, 0.1)" : "transparent",
                      border: "1px solid " + (modelSubTab === "settings" ? "rgba(0, 242, 255, 0.2)" : "transparent"),
                      color: modelSubTab === "settings" ? "#00f2ff" : "rgba(255, 255, 255, 0.6)",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
                      transition: "all 0.3s",
                      flexShrink: 0
                    }}
                  >
                    🔧 System Settings
                  </button>
                </div>

                {/* Sub-tab actual content */}
                {modelSubTab === "config" && (
                  <AdminModelTab
                    modelType={modelType}
                    setModelType={setModelType}
                    learningRate={learningRate}
                    setLearningRate={setLearningRate}
                    isRetraining={isRetraining}
                    retrainProgress={retrainProgress}
                    handleRetrain={handleRetrain}
                  />
                )}

                {modelSubTab === "logs" && <AdminLogsTab logs={logs} />}

                {modelSubTab === "settings" && <AdminSettingsTab />}
              </div>
            )}

            {activeTab === "landing" && <AdminLandingTab />}

            {activeTab === "history" && <AdminHistoryTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
