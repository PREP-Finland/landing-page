"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface InstagramPost {
  shortcode: string;
  permalink: string;
  caption: string;
  video_url: string;
  poster_url?: string;
}

interface InstagramManifest {
  posts: InstagramPost[];
}

// Signed shortest-path offset of index `i` from `active` on a ring of `len`,
// so the carousel wraps seamlessly in both directions (infinite scroll).
function ringOffset(i: number, active: number, len: number): number {
  let d = i - active;
  const half = len / 2;
  if (d > half) d -= len;
  if (d < -half) d += len;
  return d;
}

const SWIPE_THRESHOLD = 60; // px of horizontal drag to advance one card

export default function InstagramCarousel() {
  const t = useTranslations("instagram");
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const dragStart = useRef<number | null>(null);
  const dragged = useRef(false);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());

  // Load the manifest that the GitHub Action commits to /instagram.json.
  useEffect(() => {
    let cancelled = false;
    fetch("/instagram.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: InstagramManifest) => {
        if (!cancelled && Array.isArray(data.posts)) setPosts(data.posts);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Track viewport so we can switch between coverflow (desktop) and single (mobile).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Only the centered video plays; the rest reset to their first frame.
  useEffect(() => {
    posts.forEach((post, i) => {
      const el = videoRefs.current.get(post.shortcode);
      if (!el) return;
      if (i === active) {
        el.play().catch(() => {});
      } else {
        el.pause();
        el.currentTime = 0;
      }
    });
  }, [active, posts, isMobile]);

  const len = posts.length;
  const go = useCallback(
    (dir: number) => setActive((prev) => (len ? (prev + dir + len) % len : 0)),
    [len]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
    dragged.current = false;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      dragged.current = true;
      go(dx < 0 ? 1 : -1);
    }
  };

  if (len === 0) return null;

  // How many neighbours to render on each side of the centre card.
  const range = isMobile ? 1 : 2;

  return (
    <section
      id="instagram"
      className="relative w-full overflow-hidden py-14 md:py-20 flex flex-col min-h-screen md:min-h-0"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      <div className="text-center px-6 mb-8 md:mb-12">
        <h2 className="font-[family-name:var(--font-raleway)] text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight">
          {t("title")}
        </h2>
        <a
          href="https://www.instagram.com/prepfinland/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs tracking-widest uppercase text-white/50 hover:text-white/80 transition-colors"
        >
          {t("subtitle")}
        </a>
      </div>

      <div
        className="relative flex-1 flex items-center justify-center select-none touch-pan-y"
        style={{ perspective: "1200px" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* Stage: cards are absolutely centred and transformed by their ring offset. */}
        <div className="relative w-full h-[70vh] md:h-[520px]">
          {posts.map((post, i) => {
            const offset = ringOffset(i, active, len);
            if (Math.abs(offset) > range) return null;

            const isCenter = offset === 0;
            const translate = isMobile
              ? `translateX(calc(-50% + ${offset * 100}%))`
              : `translateX(calc(-50% + ${offset * 60}%))`;
            const scale = isCenter ? 1 : isMobile ? 1 : 0.82;
            const rotate = isMobile ? 0 : offset * -6;
            const opacity = isCenter ? 1 : isMobile ? 0 : Math.abs(offset) === 1 ? 0.55 : 0.25;

            return (
              <div
                key={post.shortcode}
                onClick={() => !isCenter && setActive(i)}
                className="absolute top-1/2 left-1/2 h-full aspect-[9/16] max-w-[86vw] md:max-w-none rounded-2xl overflow-hidden shadow-2xl transition-[transform,opacity] duration-500 ease-out"
                style={{
                  transform: `${translate} translateY(-50%) scale(${scale}) rotateY(${rotate}deg)`,
                  opacity,
                  zIndex: 100 - Math.abs(offset),
                  cursor: isCenter ? "default" : "pointer",
                  pointerEvents: opacity === 0 ? "none" : "auto",
                }}
              >
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(post.shortcode, el);
                    else videoRefs.current.delete(post.shortcode);
                  }}
                  src={post.video_url}
                  poster={post.poster_url}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover bg-black"
                />
                {isCenter && (
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (dragged.current) e.preventDefault();
                    }}
                    className="absolute inset-0"
                    aria-label="View on Instagram"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop arrows */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous"
          className="hidden md:flex absolute left-6 z-[200] h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
        >
          &#8249;
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next"
          className="hidden md:flex absolute right-6 z-[200] h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
        >
          &#8250;
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {posts.map((post, i) => (
          <button
            key={post.shortcode}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Go to video ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
