import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { cn } from "../lib/utils";
import { Card, CardContent } from "../ui/card";
import { Calendar } from "lucide-react";

// Standalone component to satisfy the Rules of Hooks
const StackingCard = ({
  event,
  index,
  total,
  progress,
  onOpenArticleModal,
  onImageClick,
  slideImgDefault,
  introImgDefault,
}) => {
  const step = total > 0 ? 1 / total : 1;
  const activePoint = index * step;

  const points = [];
  const yValues = [];
  const scaleValues = [];
  const opacityValues = [];

  // 1. Off-screen (below)
  if (index > 0) {
    points.push(0);
    yValues.push(1000); // Start way below screen
    scaleValues.push(1);
    opacityValues.push(0);

    // Point right before entering
    const startEnter = Math.max(0, (index - 0.9) * step);
    points.push(startEnter);
    yValues.push(1000);
    scaleValues.push(1);
    opacityValues.push(0);
  } else {
    points.push(0);
    yValues.push(0);
    scaleValues.push(1);
    opacityValues.push(1);
  }

  // 2. Fully active
  if (!points.includes(activePoint)) {
    points.push(activePoint);
    yValues.push(0);
    scaleValues.push(1);
    opacityValues.push(1);
  }

  // 3. Stacked underneath subsequent cards
  for (let k = 1; k <= 4; k++) {
    const postPoint = (index + k) * step;
    if (postPoint <= 1) {
      if (!points.includes(postPoint)) {
        points.push(postPoint);
        yValues.push(-12 * k); // stack offset up
        scaleValues.push(1 - 0.04 * k); // scale down slightly
        opacityValues.push(Math.max(0.15, 1 - 0.25 * k)); // fade out partially
      }
    }
  }

  // 4. End point
  if (!points.includes(1)) {
    points.push(1);
    const k = (1 - activePoint) / step;
    yValues.push(-12 * k);
    scaleValues.push(Math.max(0.8, 1 - 0.04 * k));
    opacityValues.push(Math.max(0.15, 1 - 0.25 * k));
  }

  // Sort and deduplicate
  const zipped = points.map((p, idx) => ({
    p,
    y: yValues[idx],
    scale: scaleValues[idx],
    opacity: opacityValues[idx],
  }));
  zipped.sort((a, b) => a.p - b.p);

  const uniqueZipped = [];
  zipped.forEach((item) => {
    if (
      uniqueZipped.length === 0 ||
      uniqueZipped[uniqueZipped.length - 1].p !== item.p
    ) {
      uniqueZipped.push(item);
    }
  });

  const finalPoints = uniqueZipped.map((item) => item.p);
  const finalY = uniqueZipped.map((item) => item.y);
  const finalScale = uniqueZipped.map((item) => item.scale);
  const finalOpacity = uniqueZipped.map((item) => item.opacity);

  const y = useTransform(progress, finalPoints, finalY);
  const scale = useTransform(progress, finalPoints, finalScale);
  const opacity = useTransform(progress, finalPoints, finalOpacity);

  const milestoneImg =
    event.image || (index % 2 === 0 ? slideImgDefault : introImgDefault);

  return (
    <motion.div
      style={{
        y,
        scale,
        opacity,
        zIndex: index,
      }}
      className="absolute w-full max-w-4xl pointer-events-auto"
    >
      <Card className="bg-[#090b18]/85 border border-[#0066FF]/20 hover:border-[#0066FF]/40 transition-all rounded-3xl overflow-hidden backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <CardContent className="p-6 lg:p-10 flex flex-col lg:flex-row gap-8 items-center">
          {/* Left: Image if exists */}
          {milestoneImg && (
            <div
              className="w-full lg:w-80 h-48 lg:h-56 overflow-hidden rounded-2xl cursor-zoom-in group active:scale-95 transition-transform flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                if (onImageClick) onImageClick(milestoneImg, event.title);
              }}
            >
              <img
                src={milestoneImg}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                draggable="false"
              />
            </div>
          )}

          {/* Right: Info */}
          <div className="flex-grow w-full">
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 mr-2 text-[#0066FF]" />
              <span className="text-sm font-black tracking-wider text-[#0066FF]">
                {event.year}
              </span>
            </div>

            <h3 className="text-xl lg:text-2xl font-black mb-2 text-slate-100 tracking-tight">
              {event.title}
            </h3>

            {event.subtitle && (
              <p className="text-[#0066FF]/80 font-bold text-xs mb-3 uppercase tracking-wide">
                {event.subtitle}
              </p>
            )}

            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              {event.description || event.desc}
            </p>

            {onOpenArticleModal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenArticleModal(event);
                }}
                className="detail-koa-btn mt-4 self-start"
              >
                Xem chi tiết
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ScrollTimeline = ({
  events = [],
  title = "Timeline",
  subtitle = "",
  onOpenArticleModal,
  onImageClick,
  slideImgDefault,
  introImgDefault,
  className = "",
  darkMode = true,
}) => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Measure scroll progress over the entire section
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handler = (v) => {
      if (events.length === 0) return;
      const newIndex = Math.min(
        events.length - 1,
        Math.max(0, Math.floor(v * events.length))
      );
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    };

    let unsubscribe;
    if (scrollYProgress.on) {
      unsubscribe = scrollYProgress.on("change", handler);
    } else if (scrollYProgress.onChange) {
      unsubscribe = scrollYProgress.onChange(handler);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [scrollYProgress, events.length, activeIndex]);

  const handleDotClick = (index) => {
    if (!scrollRef.current || events.length <= 1) return;
    const element = scrollRef.current;
    const totalHeight = element.scrollHeight - window.innerHeight;
    const targetScroll = (index * totalHeight) / (events.length - 1);

    // Smooth scroll page to target position
    const rect = element.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;
    window.scrollTo({
      top: absoluteTop + targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <div
      ref={scrollRef}
      className={cn(
        "relative w-full bg-transparent",
        darkMode ? "text-slate-100" : "text-slate-900",
        className
      )}
      style={{ height: `${Math.max(1, events.length) * 100}vh` }}
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden z-20">
        {/* Glowing cyber background accents */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[#0066FF]/5 blur-[120px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        {/* Section Header */}
        <div className="relative text-center mb-12 px-4 select-none z-30">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-widest text-slate-100 uppercase drop-shadow-[0_2px_10px_rgba(0,102,255,0.1)]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-slate-400 mt-2 text-sm lg:text-base max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Stacking Card Deck Container */}
        <div
          className="relative w-full max-w-4xl px-4 flex items-center justify-center"
          style={{ height: "520px" }}
        >
          {events.map((event, index) => (
            <StackingCard
              key={event.id || index}
              event={event}
              index={index}
              total={events.length}
              progress={smoothProgress}
              onOpenArticleModal={onOpenArticleModal}
              onImageClick={onImageClick}
              slideImgDefault={slideImgDefault}
              introImgDefault={introImgDefault}
            />
          ))}
        </div>

        {/* Interactive Side Dots Indicators */}
        {events.length > 0 && (
          <div className="absolute right-6 lg:right-12 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-40 select-none">
            {events.map((event, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className="group relative flex items-center justify-end border-none bg-transparent p-0 cursor-pointer"
              >
                {/* Tooltip on hover */}
                <span className="absolute right-8 text-xs font-bold text-[#0066FF] opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 border border-[#0066FF]/20 px-2.5 py-1 rounded-lg pointer-events-none backdrop-blur uppercase tracking-wider whitespace-nowrap">
                  {event.year} - {event.title}
                </span>

                {/* Dot visual */}
                <div
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    idx <= activeIndex
                      ? "bg-[#0066FF] scale-125 shadow-[0_0_12px_#0066FF]"
                      : "bg-slate-700/60 hover:bg-slate-400"
                  )}
                />
              </button>
            ))}
          </div>
        )}

        <style>{`
          .detail-koa-btn {
            display: inline-block;
            padding: 10px 24px;
            border: 1px solid #0066FF;
            border-radius: 12px;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            text-decoration: none;
            font-size: 0.75rem;
            font-weight: 800;
            background: transparent;
            color: #0066FF;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            z-index: 1;
            transition: color 0.4s, border-color 0.4s, transform 0.3s, box-shadow 0.3s;
          }

          .detail-koa-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: #0066FF;
            transform: scaleX(0);
            transform-origin: left center;
            transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: -1;
          }

          .detail-koa-btn:hover::before {
            transform: scaleX(1);
          }

          .detail-koa-btn:hover {
            color: #ffffff !important;
            border-color: #0066FF;
            transform: translateY(-2px);
            box-shadow: 0 0 20px rgba(0, 102, 255, 0.4);
          }
        `}</style>
      </div>
    </div>
  );
};
