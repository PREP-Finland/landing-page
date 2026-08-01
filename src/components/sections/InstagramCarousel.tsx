"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useInView } from "@/hooks/useInView";
import { useScrollSettled } from "@/hooks/useScrollSettled";

interface InstagramPost {
  shortcode: string;
  permalink: string;
  caption: string;
  taken_at: string;
  video_url: string;
  poster_url?: string;
}

interface InstagramManifest {
  posts: InstagramPost[];
}

const ACCENT = "#CA132A";
const SWIPE_THRESHOLD = 60;
const SPRING = { type: "spring" as const, stiffness: 220, damping: 30, mass: 0.9 };

// Signed shortest-path offset on a ring, so the reel wraps seamlessly both ways.
function ringOffset(i: number, active: number, len: number): number {
  let d = i - active;
  const half = len / 2;
  if (d > half) d -= len;
  if (d < -half) d += len;
  return d;
}

// A clean, hashtag-free one-liner for the caption overlay.
function cleanCaption(caption: string): string {
  const text = caption
    .replace(/#[\p{L}\p{N}_]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  const firstLine = text.split(/[.\n]/)[0]?.trim() || text;
  return firstLine.length > 96 ? firstLine.slice(0, 95).trimEnd() + "…" : firstLine;
}

export default function InstagramCarousel() {
  const t = useTranslations("instagram");
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 of the active video

  const dragStart = useRef<number | null>(null);
  const dragged = useRef(false);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());
  const { ref: sectionRef, inView } = useInView<HTMLElement>(0.4);
  const settled = useScrollSettled();

  useEffect(() => {
    let cancelled = false;
    fetch("/instagram.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: InstagramManifest) => {
        if (cancelled || !Array.isArray(data.posts)) return;
        // Play oldest -> newest.
        const ordered = [...data.posts].sort((a, b) => a.taken_at.localeCompare(b.taken_at));
        setPosts(ordered);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const len = posts.length;

  const go = useCallback(
    (dir: number) => {
      if (!len) return;
      setProgress(0);
      setActive((prev) => (prev + dir + len) % len);
    },
    [len]
  );

  const jumpTo = useCallback((i: number) => {
    setProgress(0);
    setActive(i);
  }, []);

  // Drive playback of the centered clip; pause + rewind the rest. The active
  // clip plays only while the section is in view AND scrolling has settled, so
  // it starts when you land on the section, not while scrolling past.
  useEffect(() => {
    posts.forEach((post, i) => {
      const el = videoRefs.current.get(post.shortcode);
      if (!el) return;
      el.muted = muted;
      if (i === active && inView && settled && !paused) {
        el.play().catch(() => {});
      } else {
        el.pause();
        if (i !== active) el.currentTime = 0;
      }
    });
  }, [active, posts, muted, paused, isMobile, inView, settled]);

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

  const range = isMobile ? 1 : 2;
  const counter = useMemo(
    () => (len ? `${String(active + 1).padStart(2, "0")} / ${String(len).padStart(2, "0")}` : ""),
    [active, len]
  );

  if (len === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="instagram"
      className="relative w-full overflow-hidden flex flex-col justify-center min-h-screen md:min-h-0 md:py-24 py-16"
      style={{ backgroundColor: "#0a0a0b" }}
    >
      {/* Atmosphere: brand-red spotlight, vignette, and film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 50% 42%, ${ACCENT}22 0%, transparent 45%), radial-gradient(140% 120% at 50% 120%, #000 20%, transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Editorial header */}
      <div className="relative z-10 px-6 mb-10 md:mb-14 text-center">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-[10px] md:text-xs tracking-[0.4em] uppercase mb-4"
          style={{ color: ACCENT }}
        >
          {t("subtitle")}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-[family-name:var(--font-raleway)] text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.05]"
        >
          {t("title")}
        </motion.h2>
      </div>

      {/* Stage */}
      <div
        className="relative z-10 flex-1 md:flex-none flex items-center justify-center select-none touch-pan-y"
        style={{ perspective: "1600px" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="relative w-full h-[64vh] max-h-[620px] md:h-[560px]">
          {posts.map((post, i) => {
            const offset = ringOffset(i, active, len);
            if (Math.abs(offset) > range) return null;

            const isCenter = offset === 0;
            const abs = Math.abs(offset);
            // translateX % is relative to the card's own width, so the -50%
            // centering and the offset spacing combine into one percentage.
            const xPct = -50 + (isMobile ? offset * 100 : offset * 58);
            const scale = isCenter ? 1 : isMobile ? 0.9 : 0.78;
            const rotate = isMobile ? 0 : offset * -7;
            const opacity = isCenter ? 1 : isMobile ? 0 : abs === 1 ? 0.5 : 0.22;
            const blur = isCenter ? 0 : isMobile ? 0 : abs === 1 ? 3 : 6;

            return (
              <motion.div
                key={post.shortcode}
                onClick={() => {
                  if (!isCenter) return jumpTo(i);
                }}
                initial={false}
                animate={{
                  x: `${xPct}%`,
                  y: "-50%",
                  scale,
                  rotateY: rotate,
                  opacity,
                  filter: `blur(${blur}px)`,
                }}
                transition={SPRING}
                className="absolute top-1/2 left-1/2 h-full aspect-[9/16] max-w-[86vw] md:max-w-none rounded-[22px] overflow-hidden"
                style={{
                  zIndex: 100 - abs,
                  cursor: isCenter ? "default" : "pointer",
                  pointerEvents: opacity === 0 ? "none" : "auto",
                  boxShadow: isCenter
                    ? "0 30px 80px -20px rgba(0,0,0,0.75), 0 20px 60px -15px rgba(0,0,0,0.85)"
                    : "0 20px 50px -20px rgba(0,0,0,0.7)",
                }}
              >
                {/* Subtle neutral frame on the focused reel */}
                {isCenter && (
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-[22px] z-20 pointer-events-none"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}
                  />
                )}

                {isCenter ? (
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current.set(post.shortcode, el);
                      else videoRefs.current.delete(post.shortcode);
                    }}
                    src={post.video_url}
                    poster={post.poster_url}
                    muted={muted}
                    playsInline
                    preload="auto"
                    onClick={() => {
                      const el = videoRefs.current.get(post.shortcode);
                      if (!el) return;
                      if (el.paused) {
                        el.play().catch(() => {});
                        setPaused(false);
                      } else {
                        el.pause();
                        setPaused(true);
                      }
                    }}
                    onTimeUpdate={(e) => {
                      const v = e.currentTarget;
                      if (v.duration) setProgress(v.currentTime / v.duration);
                    }}
                    onEnded={() => go(1)}
                    className="w-full h-full object-cover bg-black cursor-pointer"
                  />
                ) : post.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.poster_url} alt="" className="w-full h-full object-cover bg-black" />
                ) : (
                  <div className="w-full h-full bg-neutral-900" />
                )}

                {/* Focused-reel overlay: scrim, caption, controls */}
                {isCenter && (
                  <>
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-2/5 z-20 pointer-events-none"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}
                    />
                    {/* Pause indicator */}
                    <AnimatePresence>
                      {paused && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                        >
                          <div className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                            <span className="ml-1 border-y-[10px] border-y-transparent border-l-[16px] border-l-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="absolute inset-x-0 bottom-0 z-30 p-5 md:p-6 flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-[family-name:var(--font-raleway)] text-white text-sm md:text-base font-light leading-snug line-clamp-2">
                          {cleanCaption(post.caption)}
                        </p>
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2 inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-white/60 hover:text-white transition-colors"
                        >
                          {t("subtitle")} ↗
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMuted((m) => !m);
                        }}
                        aria-label={muted ? "Unmute" : "Mute"}
                        className="shrink-0 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
                          {muted ? (
                            <path d="m23 9-6 6M17 9l6 6" />
                          ) : (
                            <>
                              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                              <path d="M18.5 6a9 9 0 0 1 0 12" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Arrows (desktop) */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous"
          className="hidden md:flex absolute left-8 lg:left-16 z-[120] h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white text-xl backdrop-blur-sm hover:bg-white/15 hover:border-white/30 transition-all"
        >
          &#8249;
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next"
          className="hidden md:flex absolute right-8 lg:right-16 z-[120] h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white text-xl backdrop-blur-sm hover:bg-white/15 hover:border-white/30 transition-all"
        >
          &#8250;
        </button>
      </div>

      {/* Story-style segmented progress + counter */}
      <div className="relative z-10 mt-8 md:mt-12 px-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-1.5 w-full max-w-[320px] md:max-w-[420px]">
          {posts.map((post, i) => {
            const state = i < active ? 1 : i === active ? progress : 0;
            return (
              <button
                key={post.shortcode}
                type="button"
                onClick={() => jumpTo(i)}
                aria-label={`Go to reel ${i + 1}`}
                className="group relative flex-1 h-[3px] rounded-full bg-white/15 overflow-hidden"
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${state * 100}%`,
                    backgroundColor: i === active ? ACCENT : "rgba(255,255,255,0.85)",
                    transition: i === active ? "width 0.15s linear" : "width 0.4s ease",
                  }}
                />
              </button>
            );
          })}
        </div>
        <span
          className="font-[family-name:var(--font-futura-pt)] text-xs tracking-[0.3em] text-white/40"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {counter}
        </span>
      </div>
    </section>
  );
}
