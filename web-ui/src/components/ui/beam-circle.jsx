import React from "react";
import { motion } from "framer-motion";

const BeamCircle = ({ size = 500, orbits = [], centerIcon }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Center Icon */}
      <div className="z-10 bg-white rounded-full p-4 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
        {centerIcon}
      </div>

      {/* Orbits */}
      {orbits.map((orbit) => (
        <motion.div
          key={orbit.id}
          className="absolute rounded-full border border-indigo-100"
          style={{
            width: size * orbit.radiusFactor,
            height: size * orbit.radiusFactor,
            borderWidth: orbit.orbitThickness,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: orbit.speed,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Orbiting Icon */}
          <div
            className="absolute bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100"
            style={{
              top: "0%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: orbit.iconSize,
              height: orbit.iconSize,
            }}
          >
            {React.cloneElement(orbit.icon, { size: orbit.iconSize * 0.6 })}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default BeamCircle;
