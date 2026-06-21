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

const DEFAULT_EVENTS = [
  {
    year: "2023",
    title: "Major Achievement",
    subtitle: "Organization Name",
    description:
      "Description of the achievement or milestone reached during this time period.",
  },
  {
    year: "2022",
    title: "Important Milestone",
    subtitle: "Organization Name",
    description: "Details about this significant milestone and its impact.",
  },
  {
    year: "2021",
    title: "Key Event",
    subtitle: "Organization Name",
    description: "Information about this key event in the timeline.",
  },
];

export const ScrollTimeline = ({
  events = DEFAULT_EVENTS,
  title = "Timeline",
  subtitle = "Scroll to explore the journey",
  animationOrder = "sequential",
  cardAlignment = "alternating",
  lineColor = "bg-cyan-500/30",
  activeColor = "bg-cyan-400",
  progressIndicator = true,
  cardVariant = "outlined",
  cardEffect = "glow",
  parallaxIntensity = 0.15,
  progressLineWidth = 3,
  progressLineCap = "round",
  dateFormat = "badge",
  revealAnimation = "slide",
  className = "",
  connectorStyle = "line",
  perspective = true,
  darkMode = true,
  smoothScroll = true,
  onOpenArticleModal,
  onImageClick,
  slideImgDefault,
  introImgDefault
}) => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const timelineRefs = useRef([]);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const progressHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const yOffset = useTransform(
    smoothProgress,
    [0, 1],
    [parallaxIntensity * 120, -parallaxIntensity * 120]
  );

  useEffect(() => {
    const handler = (v) => {
      const newIndex = Math.floor(v * events.length);
      if (
        newIndex !== activeIndex &&
        newIndex >= 0 &&
        newIndex < events.length
      ) {
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

  const getCardVariants = (index) => {
    const baseDelay =
      animationOrder === "simultaneous"
        ? 0
        : animationOrder === "staggered"
        ? index * 0.05
        : index * 0.08;

    const initialStates = {
      fade: { opacity: 0, y: 20 },
      slide: {
        x:
          cardAlignment === "left"
            ? -60
            : cardAlignment === "right"
            ? 60
            : index % 2 === 0
            ? -60
            : 60,
        opacity: 0,
        y: 15
      },
      scale: { scale: 0.9, opacity: 0 },
      flip: { rotateY: 30, opacity: 0 },
      none: { opacity: 1 },
    };

    return {
      initial: initialStates[revealAnimation],
      whileInView: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotateY: 0,
        transition: {
          duration: 0.35,
          delay: baseDelay,
          ease: "easeOut",
        },
      },
      viewport: { once: false, margin: "-60px" },
    };
  };

  const getConnectorClasses = () => {
    const baseClasses = cn(
      "absolute left-1/2 transform -translate-x-1/2",
      lineColor
    );
    switch (connectorStyle) {
      case "dots":
        return cn(baseClasses, "w-1 rounded-full");
      case "dashed":
        return cn(
          baseClasses,
          "w-[2px] [mask-image:linear-gradient(to_bottom,black_33%,transparent_33%,transparent_66%,black_66%)] [mask-size:1px_12px]"
        );
      case "line":
      default:
        return cn(baseClasses, "w-[2px]");
    }
  };

  const getCardClasses = (index) => {
    const baseClasses = "relative z-30 rounded-xl transition-all duration-300";
    const variantClasses = {
      default: "bg-[#0f1124] border border-slate-800 shadow-sm",
      elevated: "bg-[#0f1124] border border-slate-700/50 shadow-md",
      outlined: "bg-[#090b18]/85 backdrop-blur border border-cyan-500/20",
      filled: "bg-cyan-500/5 border border-cyan-500/20",
    };
    const effectClasses = {
      none: "",
      glow: "hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-500/40",
      shadow: "hover:shadow-lg hover:-translate-y-1",
      bounce: "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
    };
    const alignmentClassesDesktop =
      cardAlignment === "alternating"
        ? index % 2 === 0
          ? "lg:mr-[calc(50%+30px)]"
          : "lg:ml-[calc(50%+30px)]"
        : cardAlignment === "left"
        ? "lg:mr-auto lg:ml-0"
        : "lg:ml-auto lg:mr-0";
    const perspectiveClass = perspective
      ? "transform transition-transform hover:rotate-y-1 hover:rotate-x-1"
      : "";

    return cn(
      baseClasses,
      variantClasses[cardVariant],
      effectClasses[cardEffect],
      alignmentClassesDesktop,
      perspectiveClass,
      "w-full lg:w-[calc(50%-50px)]"
    );
  };

  return (
    <div
      ref={scrollRef}
      className={cn(
        "relative w-full overflow-hidden py-16",
        darkMode ? "bg-[#030307] text-slate-100" : "bg-white text-slate-900",
        className
      )}
    >
      <div className="text-center py-10 px-4">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
          {title}
        </h2>
        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pb-24">
        <div className="relative mx-auto">
          {/* Main timeline track line */}
          <div
            className={cn(getConnectorClasses(), "h-full absolute top-0 z-10")}
            style={{ width: `${progressLineWidth}px` }}
          />

          {/* Enhanced Progress Indicator with Traveling Glow */}
          {progressIndicator && (
            <>
              {/* The main filled progress line */}
              <motion.div
                className="absolute top-0 z-10"
                style={{
                  height: progressHeight,
                  width: progressLineWidth,
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderRadius:
                    progressLineCap === "round" ? "9999px" : "0px",
                  background: `linear-gradient(to bottom, #22d3ee, #6366f1, #a855f7)`,
                  boxShadow: `
                    0 0 15px rgba(99,102,241,0.5),
                    0 0 25px rgba(168,85,247,0.3)
                  `,
                }}
              />
              {/* The traveling glow "comet" at the head of the line */}
              <motion.div
                className="absolute z-20"
                style={{
                  top: progressHeight,
                  left: "50%",
                  translateX: "-50%",
                  translateY: "-50%", // Center the comet on the line's end point
                }}
              >
                <motion.div
                  className="w-5 h-5 rounded-full" // Size of the comet core
                  style={{
                    background:
                      "radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(99,102,241,0.5) 40%, rgba(34,211,238,0) 70%)",
                    boxShadow: `
                      0 0 15px 4px rgba(168, 85, 247, 0.6),
                      0 0 25px 8px rgba(99, 102, 241, 0.4),
                      0 0 40px 15px rgba(34, 211, 238, 0.2)
                    `,
                  }}
                  animate={{
                    scale: [1, 1.25, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </>
          )}

          <div className="relative z-20">
            {events.map((event, index) => {
              const milestoneImg = event.image || (index % 2 === 0 ? slideImgDefault : introImgDefault);

              return (
                <div
                  key={event.id || index}
                  ref={(el) => {
                    timelineRefs.current[index] = el;
                  }}
                  className={cn(
                    "relative flex items-center mb-24 py-4",
                    "flex-col lg:flex-row",
                    cardAlignment === "alternating"
                      ? index % 2 === 0
                        ? "lg:justify-start"
                        : "lg:flex-row-reverse lg:justify-start"
                      : cardAlignment === "left"
                      ? "lg:justify-start"
                      : "lg:flex-row-reverse lg:justify-start"
                  )}
                >
                  {/* Central Node Indicator */}
                  <div
                    className={cn(
                      "absolute top-1/2 transform -translate-y-1/2 z-30",
                      "left-1/2 -translate-x-1/2"
                    )}
                  >
                    <motion.div
                      className={cn(
                        "w-5 h-5 rounded-full border-4 bg-slate-900 flex items-center justify-center transition-colors duration-300",
                        index <= activeIndex
                          ? "border-cyan-400"
                          : "border-slate-800"
                      )}
                      animate={
                        index <= activeIndex
                          ? {
                              scale: [1, 1.2, 1],
                              boxShadow: [
                                "0 0 0px rgba(34,211,238,0)",
                                "0 0 12px rgba(34,211,238,0.5)",
                                "0 0 0px rgba(34,211,238,0)",
                              ],
                            }
                          : {}
                      }
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut",
                      }}
                    />
                  </div>

                  {/* Milestone Card */}
                  <motion.div
                    className={cn(
                      getCardClasses(index),
                      "mt-12 lg:mt-0"
                    )}
                    variants={getCardVariants(index)}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: false, margin: "-120px" }}
                    style={parallaxIntensity > 0 ? { y: yOffset } : undefined}
                  >
                    <Card className="bg-[#090b18]/80 border border-slate-800/80 hover:border-cyan-500/30 transition-all rounded-2xl overflow-hidden backdrop-blur-md">
                      <CardContent className="p-6">
                        {/* Event Image */}
                        {milestoneImg && (
                          <div
                            className="mb-4 overflow-hidden rounded-xl cursor-zoom-in group active:scale-95 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onImageClick) onImageClick(milestoneImg, event.title);
                            }}
                          >
                            <img
                              src={milestoneImg}
                              alt={event.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                              draggable="false"
                            />
                          </div>
                        )}

                        {dateFormat === "badge" ? (
                          <div className="flex items-center mb-3">
                            <Calendar className="h-4 w-4 mr-2 text-cyan-400" />
                            <span className="text-sm font-black tracking-wider text-cyan-400">
                              {event.year}
                            </span>
                          </div>
                        ) : (
                          <p className="text-lg font-black text-cyan-400 mb-2 tracking-wider">
                            {event.year}
                          </p>
                        )}

                        <h3 className="text-xl font-extrabold mb-2 text-slate-100 tracking-tight">
                          {event.title}
                        </h3>

                        {event.subtitle && (
                          <p className="text-cyan-300/80 font-semibold text-xs mb-3 uppercase tracking-wide">
                            {event.subtitle}
                          </p>
                        )}

                        <p className="text-slate-400 text-sm leading-relaxed mb-5">
                          {event.description || event.desc}
                        </p>

                        {onOpenArticleModal && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenArticleModal(event);
                            }}
                            className="text-xs font-black text-cyan-400 hover:text-cyan-300 hover:underline transition-colors uppercase tracking-wider flex items-center gap-1.5 border-none bg-transparent cursor-pointer p-0"
                          >
                            Xem chi tiết ↗
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
