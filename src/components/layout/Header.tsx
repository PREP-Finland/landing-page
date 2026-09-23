"use client";

import { useEffect, useState } from "react";
import LanguageToggle from "@/components/ui/LanguageToggle";

export default function Header() {
  // Transparent over the hero so the video runs edge to edge; once content is
  // scrolling underneath, the bar materialises as a translucent layer instead
  // of an opaque strip cutting across the page.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      style={{ height: "var(--header-h)" }}
    >
      {/*
       * The material itself. Blur radius and background ramp together so the
       * bar reads as glass arriving rather than a colour cross-fade, and it
       * ends in a soft scroll edge instead of a hard 1px divider.
       */}
      <div
        aria-hidden
        className={`material absolute inset-0 transition-[opacity,backdrop-filter] duration-300 ease-out ${
          scrolled ? "opacity-100 backdrop-blur-xl backdrop-saturate-150" : "opacity-0 backdrop-blur-none"
        }`}
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.72) 62%, rgba(255,255,255,0) 100%)",
          // Fade the material out at its lower edge rather than cutting it.
          maskImage: "linear-gradient(to bottom, #000 0%, #000 64%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 64%, transparent 100%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 h-full flex items-center justify-between pointer-events-auto">
        <a href="#" aria-label="PREP" className="inline-flex min-h-11 items-center pr-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="PREP"
            className={`h-8 w-auto transition-[filter] duration-300 ease-out ${
              scrolled ? "" : "brightness-0 invert drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)]"
            }`}
          />
        </a>
        <div className="flex items-center gap-2">
          <LanguageToggle scrolled={scrolled} />
        </div>
      </div>
    </header>
  );
}
