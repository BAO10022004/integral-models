import React from "react";
import { ScrollTimeline } from "../lightswind/ScrollTimeline";

export default function HistoryTimelineSection({
  milestones,
  slideImgDefault,
  introImgDefault,
  onOpenArticleModal,
  onImageClick,
  container
}) {
  return (
    <section className="history-snap-section history-timeline-section" style={{ height: "auto", minHeight: "100vh", aspectRatio: "auto", overflow: "visible" }}>
      <ScrollTimeline
        events={milestones}
        title="LỊCH SỬ PHÁT TRIỂN VI TÍCH PHÂN"
        subtitle=""
        onOpenArticleModal={onOpenArticleModal}
        onImageClick={onImageClick}
        slideImgDefault={slideImgDefault}
        introImgDefault={introImgDefault}
        container={container}
        cardVariant="outlined"
        cardEffect="glow"
      />
    </section>
  );
}
