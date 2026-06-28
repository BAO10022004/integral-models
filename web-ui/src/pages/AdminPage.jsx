import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminDashboardTab from "../components/admin/AdminDashboardTab";
import AdminModelTab from "../components/admin/AdminModelTab";
import AdminLogsTab from "../components/admin/AdminLogsTab";
import AdminSettingsTab from "../components/admin/AdminSettingsTab";
import AdminLandingTab from "../components/admin/AdminLandingTab";
import AdminHistoryTab from "../components/admin/AdminHistoryTab";
import AdminTheoryTab from "../components/admin/AdminTheoryTab";
import "../styles/AdminPage.css";

export default function AdminPage({ onNavigate, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "model" | "landing" | "history"
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
    <div className="admin-page-wrapper-split">
      {/* Floating Settings Cog Button (matches the mockup cogwheel) */}
      <button
        className="floating-settings-btn"
        onClick={() => {
          setActiveTab("model");
          setModelSubTab("settings");
        }}
        title="Cấu hình hệ thống"
      >
        <Settings className="settings-spin-icon" size={20} />
      </button>

      {/* Left Column: Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Right Column: Operations Pane */}
      <div className="admin-operations-pane">
        {/* Header Navbar Component (sticky) */}
        <AdminHeader
          onNavigate={onNavigate}
        />

        {/* Content Workspace Area */}
        <div className="admin-content-pane">
          <div className="admin-glass-card">
            {activeTab === "overview" && <AdminDashboardTab />}

            {activeTab === "model" && (
              <div>
                <div className="admin-subtabs-nav">
                  <button
                    className={`admin-subtab-btn ${modelSubTab === "config" ? "active" : ""}`}
                    onClick={() => setModelSubTab("config")}
                  >
                    ⚙️ Configuration
                  </button>
                  <button
                    className={`admin-subtab-btn ${modelSubTab === "logs" ? "active" : ""}`}
                    onClick={() => setModelSubTab("logs")}
                  >
                    📝 Request Logs
                  </button>
                  <button
                    className={`admin-subtab-btn ${modelSubTab === "settings" ? "active" : ""}`}
                    onClick={() => setModelSubTab("settings")}
                  >
                    🔧 System Settings
                  </button>
                </div>
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

            {activeTab === "theory" && <AdminTheoryTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
