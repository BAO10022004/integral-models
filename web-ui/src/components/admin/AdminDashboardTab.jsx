import React from "react";
import "../../styles/AdminTabs.css";

export default function AdminDashboardTab() {
  return (
    <div className="admin-tab-container">
      <h3 className="admin-tab-title">📊 Integral Classification Statistics</h3>
      <p className="admin-tab-desc">Distribution of math solution methods classified by the AI model.</p>
      
      <div className="admin-stats-list">
        <div>
          <div className="admin-stat-header">
            <span>U-Substitution</span>
            <span className="admin-stat-percentage">42% (5,984 requests)</span>
          </div>
          <div className="admin-progress-track">
            <div className="admin-progress-fill" style={{ width: "42%" }} />
          </div>
        </div>

        <div>
          <div className="admin-stat-header">
            <span>Integration By Parts</span>
            <span className="admin-stat-percentage">28% (3,989 requests)</span>
          </div>
          <div className="admin-progress-track">
            <div className="admin-progress-fill" style={{ width: "28%" }} />
          </div>
        </div>

        <div>
          <div className="admin-stat-header">
            <span>Trigonometric Simplification</span>
            <span className="admin-stat-percentage">18% (2,564 requests)</span>
          </div>
          <div className="admin-progress-track">
            <div className="admin-progress-fill" style={{ width: "18%" }} />
          </div>
        </div>

        <div>
          <div className="admin-stat-header">
            <span>Power Rule / Direct</span>
            <span className="admin-stat-percentage">12% (1,711 requests)</span>
          </div>
          <div className="admin-progress-track">
            <div className="admin-progress-fill" style={{ width: "12%" }} />
          </div>
        </div>
      </div>

      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-label">Integration Success Rate</div>
          <div className="admin-metric-value admin-metric-value-green">98.2%</div>
        </div>
        <div className="admin-metric-card">
          <div className="admin-metric-label">Avg. Response Time</div>
          <div className="admin-metric-value admin-metric-value-cyan">0.32s</div>
        </div>
      </div>
    </div>
  );
}
