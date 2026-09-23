"use client";

import { useEffect, useState } from "react";

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
      className={`material fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ease-out ${
        scrolled
          ? "bg-white/70 backdrop-blur-xl backdrop-saturate-150 border-b border-black/[0.06] shadow-[0_1px_20px_-12px_rgba(0,0,0,0.35)]"
          : "bg-transparent border-b border-transparent"
      }`}
      style={{ height: "var(--header-h)" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center">
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
      </div>
    </header>
  );
}
