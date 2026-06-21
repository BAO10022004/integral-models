import React from "react";
import { ArrowLeft } from "lucide-react";

/**
 * Shared Go Back button — fixed top-left, same style as /ai (ModelTester).
 * @param {() => void} onClick - Navigation callback
 * @param {string} [label="Go Back"] - Button text
 */
export default function GoBackButton({ onClick, label = "Go Back" }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all border border-white/10 shadow-lg cursor-pointer"
      style={{
        fontWeight: 700,
        fontSize: "14px",
        color: "#00d2ff",
        textShadow: "0 0 10px rgba(0, 210, 255, 0.6)",
      }}
    >
      <ArrowLeft size={18} style={{ filter: "drop-shadow(0 0 5px rgba(0,210,255,0.8))" }} />
      <span>{label}</span>
    </button>
  );
}
