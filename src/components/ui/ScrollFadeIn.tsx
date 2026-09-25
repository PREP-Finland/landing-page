"use client";

import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";
import { springUI } from "@/lib/motion";

interface ScrollFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** How far the element travels on entry; smaller for dense content. */
  distance?: number;
}

export default function ScrollFadeIn({
  children,
  className = "",
  delay = 0,
  distance = 22,
}: ScrollFadeInProps) {
  const reduceMotion = useReducedMotion();

  // Reduced motion keeps the opacity change (it still signals "new content
  // arrived") but drops the travel, which is the vestibular part.
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: distance }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduceMotion ? { duration: 0.25, delay } : { ...springUI, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
