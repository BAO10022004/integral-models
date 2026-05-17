import React from "react";
import "../../styles/HistoryTimelineSection.css";

export default function HistoryTimelineSection({
  timelineRef,
  handleMouseDown,
  handleMouseUp,
  handleMouseLeave,
  handleMouseMove,
  milestones,
  slideImgDefault,
  introImgDefault,
  onOpenArticleModal,
  activeIndex,
  onScroll,
  onCardClick
}) {
  return (
    <section className="history-snap-section history-timeline-section">
      {/* Subtle drag navigation instruction overlay */}
      <div className="timeline-scroll-hint">
        <span>Swipe / Drag horizontally to explore eras ↔</span>
      </div>

      {/* Horizontal Drag-to-Scroll Container */}
      <div
        ref={timelineRef}
        className="timeline-scroll-container"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onScroll={onScroll}
      >
        {milestones.map((milestone, idx) => {
          const milestoneImg = milestone.image || (idx % 2 === 0 ? slideImgDefault : introImgDefault);
          const hasPrev = idx > 0;
          const hasNext = idx < milestones.length - 1;
          const isActive = idx === activeIndex;

          return (
            <div 
              key={milestone.id} 
              className={`timeline-card-item ${isActive ? "active" : ""}`}
              onClick={() => onCardClick(idx)}
              style={{ cursor: "pointer" }}
            >
              {/* Unified dividing line absolute-positioned at the vertical center (layered behind image) */}
              <div className={`timeline-divide-line ${hasPrev ? "extend-left" : ""} ${hasNext ? "extend-right" : ""}`} />
              <div className="timeline-divide-dot" />

              <div className="timeline-slide-layout">
                {/* Left Column: Symbolic Image (layered on top of line) */}
                <div className="timeline-image-col">
                  <div className="timeline-image-frame">
                    <img
                      src={milestoneImg}
                      alt={milestone.title}
                      className="timeline-image-el"
                      draggable="false"
                    />
                  </div>
                </div>

                {/* Right Column: Year above line, Title & Desc below line */}
                <div className="timeline-content-col">
                  {/* Above the line: Year */}
                  <div className="timeline-year-above">
                    <span className="timeline-glowing-year">{milestone.year}</span>
                  </div>

                  {/* Below the line: Details */}
                  <div className="timeline-details-below">
                    <h3 className="timeline-details-title">{milestone.title}</h3>
                    <p className="timeline-details-desc">{milestone.desc}</p>
                    <button
                      className="timeline-detail-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenArticleModal(milestone);
                      }}
                    >
                      Xem chi tiết ↗
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
