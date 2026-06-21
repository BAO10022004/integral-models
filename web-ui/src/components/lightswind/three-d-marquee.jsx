"use client";

import { motion } from "framer-motion";
import React from "react";

export function ThreeDMarquee({
  images = [],
  className = "",
  cols = 4,
  onImageClick,
}) {
  // Clone the image list multiple times to fill a dense grid (6x = ~10 rows per column)
  const duplicatedImages = [...images, ...images, ...images, ...images, ...images, ...images];

  const groupSize = Math.ceil(duplicatedImages.length / cols);
  const imageGroups = Array.from({ length: cols }, (_, index) =>
    duplicatedImages.slice(index * groupSize, (index + 1) * groupSize)
  );

  const handleImageClick = (image, globalIndex) => {
    if (onImageClick) {
      onImageClick(image, globalIndex);
    } else if (image.href) {
      window.open(image.href, image.target || "_self");
    }
  };

  return (
    <section
      className={`w-full h-full overflow-hidden relative ${className}`}
    >
      {/* Decorative dark background mesh */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(205,198,174,0.3), rgba(205,198,174,0.05))" }} />
      
      <div
        className="flex w-full h-full items-center justify-center relative z-10"
        style={{
          transform: "rotateX(55deg) rotateY(0deg) rotateZ(45deg)",
          perspective: "1000px"
        }}
      >
        <div className="w-full overflow-hidden scale-90 sm:scale-100">
          <div
            className="relative grid h-full w-full origin-center gap-4 transform"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
            }}
          >
            {imageGroups.map((imagesInGroup, idx) => (
              <motion.div
                key={`column-${idx}`}
                animate={{ y: idx % 2 === 0 ? 120 : -120 }}
                transition={{
                  duration: idx % 2 === 0 ? 14 : 18,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear"
                }}
                className="flex flex-col items-center gap-6 relative"
              >
                <div className="absolute left-0 top-0 h-full w-px bg-white/10 dark:bg-white/5" />
                {imagesInGroup.map((image, imgIdx) => {
                  const globalIndex = idx * groupSize + imgIdx;
                  const isClickable = image.href || onImageClick;

                  return (
                    <div key={`img-${imgIdx}`} className="relative group">
                      <div className="absolute top-0 left-0 w-full h-px bg-white/10 dark:bg-white/5" />
                      <motion.img
                        whileHover={{ y: -10, scale: 1.05 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        src={image.src}
                        alt={image.alt}
                        width={970}
                        height={700}
                        className={`aspect-[970/700] w-full max-w-[280px] rounded-xl object-cover ring ring-white/10 shadow-2xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.3)] transition-all duration-300 ${
                          isClickable ? "cursor-pointer" : ""
                        }`}
                        onClick={() => handleImageClick(image, globalIndex)}
                      />
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
