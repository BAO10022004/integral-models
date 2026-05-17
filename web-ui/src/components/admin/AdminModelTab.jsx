import React from "react";
import "../../styles/AdminTabs.css";

export default function AdminModelTab({
  modelType,
  setModelType,
  learningRate,
  setLearningRate,
  isRetraining,
  retrainProgress,
  handleRetrain
}) {
  return (
    <div className="admin-tab-container">
      <h3 className="admin-tab-title">⚙️ AI Model Configuration & Retraining</h3>
      <p className="admin-tab-desc">Directly configure classification algorithms and model training parameters.</p>

      <div className="admin-form-group-list">
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">CURRENT CLASSIFICATION MODEL</label>
            <select className="control-input" value={modelType} onChange={(e) => setModelType(e.target.value)}>
              <option value="gradient_boosting">Gradient Boosting Classifier (Recommended)</option>
              <option value="random_forest">Random Forest Classifier</option>
              <option value="xgboost">XGBoost Classifier</option>
              <option value="neural_network">Multi-Layer Perceptron (MLP)</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">LEARNING RATE</label>
            <div className="admin-range-container">
              <input
                type="range"
                className="admin-range-slider"
                min="0.01"
                max="0.5"
                step="0.01"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              />
              <span className="admin-range-value">{learningRate}</span>
            </div>
          </div>
        </div>

        <div className="admin-card-inner">
          <h4 className="admin-card-inner-title">Retrain Model</h4>
          <p className="admin-card-inner-desc">
            Trigger the model retraining process using the latest integral feature datasets stored in the database.
          </p>

          {isRetraining ? (
            <div>
              <div className="admin-retrain-status">
                <span className="admin-retrain-status-text">Optimizing hyperparameters...</span>
                <span>{retrainProgress}%</span>
              </div>
              <div className="admin-retrain-progress-track">
                <div
                  className="admin-retrain-progress-fill"
                  style={{ width: `${retrainProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <button className="btn-primary" onClick={handleRetrain}>
              Start Retraining Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
