"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { springUI } from "@/lib/motion";

const DISPLAY_MS = 7000;

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
  const [held, setHeld] = useState(false);
  const reduceMotion = useReducedMotion();
  const liveRef = useRef<HTMLDivElement>(null);

  const advance = useCallback(() => {
    setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    // Auto-advance stops while the reader is hovering, focused inside, or has
    // asked for reduced motion — nothing should slide out from under them.
    if (held || reduceMotion) return;
    const timer = setInterval(advance, DISPLAY_MS);
    const onVisibility = () => {
      if (document.hidden) clearInterval(timer);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [advance, held, reduceMotion]);

  const current = TESTIMONIALS[index];

  return (
    <section
      aria-label="Testimonials"
      className="relative overflow-hidden bg-[var(--color-bg-tertiary)]"
      style={{ paddingTop: "var(--section-y)", paddingBottom: "var(--section-y)" }}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        {/* Fixed min-height keeps the section from jumping as quotes change. */}
        <div
          ref={liveRef}
          aria-live="polite"
          className="relative flex min-h-[9rem] md:min-h-[10rem] items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.figure
              key={current.id}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
              transition={reduceMotion ? { duration: 0.2 } : springUI}
              className="w-full"
            >
              {/* Wraps freely — a quote you can't finish reading is worse than none. */}
              <blockquote className="t-h3 font-normal italic text-[var(--color-text)] text-balance">
                &ldquo;{current.quote}&rdquo;
              </blockquote>
              <figcaption className="t-eyebrow mt-6 text-[var(--color-text-subtle)]">
                {current.title}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2.5">
          {TESTIMONIALS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Testimonial ${i + 1}`}
              aria-current={i === index}
              className="group p-2 -m-2 cursor-pointer"
            >
              <span
                className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out ${
                  i === index
                    ? "w-7 bg-[var(--color-accent)]"
                    : "w-1.5 bg-black/20 group-hover:bg-black/40"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
