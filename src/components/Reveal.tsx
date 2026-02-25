"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  y?: number;
  x?: number;
}

export default function Reveal({ children, width = "100%", delay = 0.2, y = 30, x = 0 }: Props) {
  return (
    <div style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y, x },
          visible: { opacity: 1, y: 0, x: 0 },
        }}
        initial="hidden"
        whileInView="visible"
        // CRUCIAL : once: true évite de recalculer l'animation à chaque scroll
        // margin: "-50px" déclenche l'animation un peu plus tard pour plus de fluidité
        viewport={{ once: true, margin: "-50px" }}
        transition={{ 
          duration: 0.5, 
          delay, 
          ease: [0.215, 0.61, 0.355, 1] // Ease out cubic pour plus de douceur
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}