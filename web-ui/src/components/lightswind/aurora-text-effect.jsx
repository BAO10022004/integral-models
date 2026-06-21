import React from "react";
import { cn } from "@/components/lib/utils";

export function AuroraTextEffect({
  text,
  className,
  textClassName,
  fontSize = "clamp(3rem, 8vw, 7rem)"
}) {
  return (
    <div className={cn("text-center flex justify-center items-center", className)}>
      <h2
        className={cn(
          "font-extrabold tracking-tight relative aurora-text-gradient",
          textClassName
        )}
        style={{
          fontSize,
          animation: "aurora-gradient 4s ease infinite",
          padding: "0.2em 0"
        }}
      >
        {text}
      </h2>
      <style>{`
        @keyframes aurora-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
