import React, { useEffect, useRef } from 'react';
import katex from 'katex';

export default function LatexRenderer({ latex, displayMode = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        // Render math formula inside the container
        katex.render(latex, containerRef.current, {
          displayMode,
          throwOnError: false, // Don't crash on invalid latex, instead color it red
        });
      } catch (err) {
        // Fallback to plain text if rendering completely fails
        containerRef.current.textContent = latex;
      }
    }
  }, [latex, displayMode]);

  return <span ref={containerRef} />;
}
