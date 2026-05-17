import React from "react";
import "../../styles/AdminTabs.css";

export default function AdminLogsTab({ logs }) {
  const getStatusColor = (status) => {
    if (status === "success") return "#00ff88";
    if (status === "warning") return "#ffb700";
    return "#ff4d4d";
  };

  return (
    <div className="admin-tab-container">
      <h3 className="admin-tab-title">📝 Recent Request Logs</h3>
      <p className="admin-tab-desc">Real-time user integral queries and predictive analysis of the AI model.</p>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Expression (LaTeX)</th>
              <th>Predicted Method</th>
              <th>Confidence</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td className="admin-table-time">{log.time}</td>
                <td className="admin-table-latex">{log.latex}</td>
                <td>{log.action}</td>
                <td className="admin-table-confidence">{log.confidence}%</td>
                <td>
                  <span 
                    className="admin-status-badge" 
                    style={{ color: getStatusColor(log.status) }}
                  >
                    <span 
                      className="admin-status-dot" 
                      style={{ background: getStatusColor(log.status) }} 
                    />
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
