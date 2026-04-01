"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

const DISPLAY_MS = 5000;

interface Testimonial {
  id: number;
  quote: string;
  title: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote: "Tunnen oloni kehossani paremmaksi kuin koskaan ennen.",
    title: "Näyttelijä",
  },
  {
    id: 2,
    quote: "Olin kokeillut kaikkea, mutta vasta nyt kehoni toimii kuten olen aina toivonut",
    title: "Liiketoimintajohtaja",
  },
  {
    id: 3,
    quote: "Sain vihdoin tuloksiani pysyvästi parannettua",
    title: "Kilpaurheilija",
  },
  {
    id: 4,
    quote: "Unelmani maailmanmestaruudesta toteutui",
    title: "Kilpaurheilija",
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const advance = () => setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    let timer = setInterval(advance, DISPLAY_MS);

    const onVisibility = () => {
      if (!document.hidden) {
        clearInterval(timer);
        timer = setInterval(advance, DISPLAY_MS);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const current = TESTIMONIALS[index];

  return (
    <section className="sticky top-16 z-20 py-3 overflow-hidden" style={{ backgroundColor: "#E7E3E3" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%", transition: { duration: 0.15, ease: "easeIn" } }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0.3, 1] }}
          className="px-6 text-center whitespace-nowrap overflow-hidden text-ellipsis"
        >
          <span className="font-[family-name:var(--font-raleway)] text-xs font-extralight italic text-gray-600">
            &ldquo;{current.quote}&rdquo;
          </span>
          <span className="font-[family-name:var(--font-raleway)] text-xs text-gray-400 font-extralight not-italic ml-3">
            — {current.title}
          </span>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
