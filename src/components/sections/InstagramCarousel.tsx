"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useInView } from "@/hooks/useInView";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";
import { projectMomentum, releaseVelocity, rubberband, springGesture, springUI } from "@/lib/motion";

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

/** Movement before a horizontal drag commits, so vertical scrolls aren't stolen. */
const DIRECTION_LOCK = 10;
/** Release speed that counts as a deliberate flick rather than a nudge, px/s. */
const FLICK_VELOCITY = 500;
/** Fraction of a card you must drag past for a slow, deliberate drag to commit. */
const COMMIT_FRACTION = 0.35;
/** Snap points are one card apart, so momentum decays faster than page scroll. */
const CAROUSEL_DECELERATION = 0.99;

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
  /** Live drag distance in px — the stage follows the finger 1:1 while held. */
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);

  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  // Mirrors `drag` so the release handler reads the true final offset even if
  // the last state update has not flushed yet.
  const dragRef = useRef(0);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());

  // Pointer tracking: a short position history gives us release velocity, and
  // pointer capture keeps the drag alive when the finger leaves the stage.
  const pointer = useRef<{
    id: number;
    startX: number;
    startY: number;
    axis: "none" | "x" | "y";
    history: { x: number; t: number }[];
  } | null>(null);
  const suppressClick = useRef(false);

  // "In view" once the section reaches the middle band of the viewport —
  // robust even though the section is taller than the screen.
  const { ref: sectionRef, inView } = useInView<HTMLElement>(0, "-25% 0px -25% 0px");

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
  // clip plays while the section is in view, and pauses when scrolled away.
  useEffect(() => {
    posts.forEach((post, i) => {
      const el = videoRefs.current.get(post.shortcode);
      if (!el) return;
      el.muted = muted;
      if (i === active && inView && !paused) {
        el.play().catch(() => {});
      } else {
        el.pause();
        if (i !== active) el.currentTime = 0;
      }
    });
  }, [active, posts, muted, paused, isMobile, inView]);

  /**
   * Distance the reel travels when it advances by one card. Measured from the
   * card's layout width (offsetWidth ignores the scale transform) and the same
   * percentage the cards are laid out with, so the drag tracks the finger 1:1.
   */
  const stepPx = useCallback(() => {
    const card = stageRef.current?.querySelector<HTMLElement>("[data-reel-card]");
    const w = card?.offsetWidth ?? 0;
    if (!w) return 200;
    return w * (isMobile ? 1 : 0.58);
  }, [isMobile]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointer.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      axis: "none",
      history: [{ x: e.clientX, t: e.timeStamp }],
    };
    suppressClick.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;

    const dx = e.clientX - p.startX;
    const dy = e.clientY - p.startY;

    // Detect both plausible gestures, then commit once intent is clear.
    if (p.axis === "none") {
      if (Math.abs(dx) < DIRECTION_LOCK && Math.abs(dy) < DIRECTION_LOCK) return;
      p.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (p.axis === "x") {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      }
    }
    if (p.axis !== "x") return;

    p.history.push({ x: e.clientX, t: e.timeStamp });
    if (p.history.length > 6) p.history.shift();

    // Track the finger 1:1. At the ends of a non-wrapping reel there is no
    // boundary to resist against — the ring wraps — so resistance only kicks
    // in past a full step, which keeps a hard flick from skipping ahead.
    const step = stepPx();
    const over = Math.abs(dx) - step;
    const next = over > 0 ? Math.sign(dx) * (step + rubberband(over, step)) : dx;
    dragRef.current = next;
    setDrag(next);
    suppressClick.current = true;
  };

  const endDrag = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    pointer.current = null;

    const dragged = dragRef.current;
    dragRef.current = 0;

    if (p.axis !== "x") {
      setDrag(0);
      setDragging(false);
      return;
    }

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const step = stepPx();
    const velocity = releaseVelocity(p.history);

    // Two ways to commit: a deliberate flick, or a slow drag taken far enough.
    // Without this a stray few pixels would count as a swipe.
    const flicked = Math.abs(velocity) > FLICK_VELOCITY && Math.abs(dragged) > DIRECTION_LOCK;
    const committed = Math.abs(dragged) > step * COMMIT_FRACTION;

    let steps = 0;
    if (flicked || committed) {
      // Land where the gesture was going, not where the finger stopped.
      const projected = dragged + projectMomentum(velocity, CAROUSEL_DECELERATION);
      steps = Math.round(projected / step) || Math.sign(projected) || Math.sign(dragged);
      steps = Math.max(-1, Math.min(1, steps));
    }

    setDrag(0);
    setDragging(false);
    if (steps !== 0) go(-steps);
  };

  const range = isMobile ? 1 : 2;
  const counter = useMemo(
    () => (len ? `${String(active + 1).padStart(2, "0")} / ${String(len).padStart(2, "0")}` : ""),
    [active, len]
  );

  if (len === 0) return null;

  // While the finger is down the stage follows it exactly; on release the
  // spring takes over from that position, carrying the gesture's momentum.
  const dragFraction = drag / stepPx();
  const transition = dragging ? { duration: 0 } : reduceMotion ? { duration: 0.2 } : springGesture;

  return (
    <section
      ref={sectionRef}
      id="instagram"
      className="relative w-full overflow-hidden bg-[var(--color-bg-secondary)]"
      style={{ paddingTop: "var(--section-y)", paddingBottom: "var(--section-y)" }}
    >
      {/* Editorial header */}
      <div className="relative z-10 px-6 mb-12 md:mb-16 max-w-6xl mx-auto">
        <ScrollFadeIn>
          <a
            href="https://www.instagram.com/prepfinland/"
            target="_blank"
            rel="noopener noreferrer"
            className="t-eyebrow inline-block text-[var(--color-accent)] transition-opacity duration-150 hover:opacity-70"
          >
            {t("subtitle")}
          </a>
          <h2 className="t-h2 mt-4 text-[var(--color-text)]">{t("title")}</h2>
        </ScrollFadeIn>
      </div>

      {/* Stage */}
      <div
        className="relative z-10 flex items-center justify-center select-none touch-pan-y"
        style={{ perspective: "1600px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={stageRef} className="relative w-full h-[62vh] max-h-[620px] md:h-[560px]">
          {posts.map((post, i) => {
            const rendered = ringOffset(i, active, len);
            const offset = rendered + dragFraction;
            if (Math.abs(rendered) > range) return null;

            const abs = Math.abs(offset);
            const isCenter = rendered === 0;
            // translateX % is relative to the card's own width, so the -50%
            // centering and the offset spacing combine into one percentage.
            const xPct = -50 + (isMobile ? offset * 100 : offset * 58);
            // Interpolate against the live drag so depth tracks the finger too.
            const t01 = Math.min(1, abs);
            const scale = 1 - t01 * (isMobile ? 0.1 : 0.22);
            const rotate = isMobile ? 0 : offset * -7;
            const opacity = isMobile ? Math.max(0, 1 - t01 * 1.6) : 1 - t01 * 0.5;
            const blur = isCenter && !dragging ? 0 : isMobile ? 0 : t01 * 3;

            return (
              <motion.div
                key={post.shortcode}
                onClick={() => {
                  if (suppressClick.current) return;
                  if (rendered !== 0) jumpTo(i);
                }}
                data-reel-card={isCenter ? "center" : undefined}
                initial={false}
                animate={{
                  x: `${xPct}%`,
                  y: "-50%",
                  scale,
                  rotateY: rotate,
                  opacity,
                  filter: `blur(${blur.toFixed(2)}px)`,
                }}
                transition={transition}
                className="absolute top-1/2 left-1/2 h-full aspect-[9/16] max-w-[86vw] md:max-w-none rounded-[var(--radius-xl)] overflow-hidden bg-neutral-900"
                style={{
                  zIndex: 100 - Math.abs(rendered),
                  cursor: isCenter ? (dragging ? "grabbing" : "grab") : "pointer",
                  pointerEvents: opacity <= 0.02 ? "none" : "auto",
                  willChange: "transform",
                  // Light, wide shadows rather than a dark smudge on an
                  // off-white ground; the focused card sits deeper.
                  boxShadow: isCenter
                    ? "0 2px 6px rgba(20,16,16,0.05), 0 18px 40px -18px rgba(20,16,16,0.28), 0 44px 90px -40px rgba(20,16,16,0.30)"
                    : "0 2px 6px rgba(20,16,16,0.04), 0 14px 32px -18px rgba(20,16,16,0.20)",
                }}
              >
                {/* Subtle neutral frame on the focused reel */}
                {isCenter && (
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-[var(--radius-xl)] z-20 pointer-events-none"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)" }}
                  />
                )}

                {isCenter ? (
                  <video
                    ref={(el) => {
                      if (el) {
                        // Set muted as a property (the React attribute is
                        // unreliable) so muted autoplay is allowed.
                        el.muted = muted;
                        videoRefs.current.set(post.shortcode, el);
                      } else {
                        videoRefs.current.delete(post.shortcode);
                      }
                    }}
                    src={post.video_url}
                    poster={post.poster_url}
                    muted={muted}
                    autoPlay
                    playsInline
                    preload="auto"
                    onClick={() => {
                      if (suppressClick.current) return;
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
                    className="w-full h-full object-cover bg-black"
                  />
                ) : post.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.poster_url}
                    alt={cleanCaption(post.caption)}
                    className="w-full h-full object-cover bg-black"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900" />
                )}

                {/* Focused-reel overlay: scrim, caption, controls */}
                {isCenter && (
                  <>
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-2/5 z-20 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.35) 45%, transparent)",
                      }}
                    />
                    {/* Pause indicator */}
                    <AnimatePresence>
                      {paused && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={reduceMotion ? { duration: 0.15 } : springUI}
                          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                        >
                          <div className="material-dark h-16 w-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                            <span className="ml-1 border-y-[10px] border-y-transparent border-l-[16px] border-l-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="absolute inset-x-0 bottom-0 z-30 p-5 md:p-6 flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-white text-sm md:text-base font-normal leading-snug tracking-[-0.011em] line-clamp-2">
                          {cleanCaption(post.caption)}
                        </p>
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="t-eyebrow mt-2.5 inline-flex items-center gap-1.5 text-white/75 hover:text-white transition-colors"
                        >
                          {t("subtitle")} ↗
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = !muted;
                          setMuted(next);
                          // Apply + resume synchronously so the browser keeps
                          // playing (unmuting via effect would pause it).
                          const el = videoRefs.current.get(post.shortcode);
                          if (el) {
                            el.muted = next;
                            if (!next) el.play().catch(() => {});
                          }
                        }}
                        aria-label={muted ? "Unmute" : "Mute"}
                        className="material-dark shrink-0 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center cursor-pointer transition-[background-color,transform] duration-150 ease-out hover:bg-white/20 active:scale-95"
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
          className="material hidden md:flex absolute left-8 lg:left-16 z-[120] h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/60 backdrop-blur-md text-[var(--color-text)] text-xl cursor-pointer transition-[background-color,border-color,transform] duration-150 ease-out hover:bg-white hover:border-black/20 active:scale-95"
        >
          &#8249;
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next"
          className="material hidden md:flex absolute right-8 lg:right-16 z-[120] h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/60 backdrop-blur-md text-[var(--color-text)] text-xl cursor-pointer transition-[background-color,border-color,transform] duration-150 ease-out hover:bg-white hover:border-black/20 active:scale-95"
        >
          &#8250;
        </button>
      </div>

      {/* Story-style segmented progress + counter */}
      <div className="relative z-10 mt-10 md:mt-14 px-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-1.5 w-full max-w-[320px] md:max-w-[420px]">
          {posts.map((post, i) => {
            const state = i < active ? 1 : i === active ? progress : 0;
            return (
              <button
                key={post.shortcode}
                type="button"
                onClick={() => jumpTo(i)}
                aria-label={`Go to reel ${i + 1}`}
                aria-current={i === active}
                className="group relative flex-1 h-[3px] rounded-full bg-black/10 overflow-hidden cursor-pointer"
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${state * 100}%`,
                    backgroundColor: i === active ? "var(--color-accent)" : "rgba(0,0,0,0.35)",
                    transition: i === active ? "width 0.15s linear" : "width 0.4s ease",
                  }}
                />
              </button>
            );
          })}
        </div>
        <span
          className="font-[family-name:var(--font-futura-pt)] text-xs tracking-[0.3em] text-[var(--color-text-subtle)]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {counter}
        </span>
      </div>
    </section>
  );
}
