"use client";

import { useRef, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { springUI } from "@/lib/motion";
import { splitEmphasis } from "@/lib/emphasis";
const isDev = process.env.NODE_ENV === "development";

function getVideoSrc(src: string) {
  if (isDev) {
    return `/api/video-proxy?url=${encodeURIComponent(src)}`;
  }
  return src;
}

interface HeroSectionProps {
  onCtaClick: React.MouseEventHandler<HTMLButtonElement>;
  videosConfig: { hero: { src: string; poster: string } };
}

export default function HeroSection({ onCtaClick, videosConfig }: HeroSectionProps) {
  const t = useTranslations("hero");
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    // A looping full-viewport video is exactly what prefers-reduced-motion is
    // for. There is no poster in the config, so hold the first frame instead:
    // the image still sets the scene, nothing moves.
    if (reduceMotion) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    // Play while on-screen and the tab is visible; pause when scrolled away.
    let inView = true;
    const update = () => {
      if (inView && !document.hidden) video.play().catch(() => {});
      else video.pause();
    };

    const onLoaded = () => update();
    if (video.readyState >= 2) update();
    else video.addEventListener("loadeddata", onLoaded, { once: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
      },
      { threshold: 0.25 }
    );
    observer.observe(video);

    const handleVisibilityChange = () => update();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      video.removeEventListener("loadeddata", onLoaded);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reduceMotion]);

  const rise = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

  return (
    // Full-bleed: the header floats over the video rather than cropping it, and
    // the stage is a full viewport height on phones too (svh, so a mobile
    // browser's collapsing chrome doesn't clip it).
    <section className="relative h-[100svh] w-full flex items-end overflow-hidden bg-black">
      <video
        ref={videoRef}
        aria-hidden
        autoPlay={!reduceMotion}
        muted
        loop
        playsInline
        preload="auto"
        poster={videosConfig.hero.poster || undefined}
        className="absolute inset-0 w-full h-full object-cover"
        src={getVideoSrc(videosConfig.hero.src)}
      />

      {/* Bottom-weighted scrim: separates the text without dulling the frame. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.60) 22%, rgba(0,0,0,0.30) 46%, rgba(0,0,0,0.08) 68%, rgba(0,0,0,0.26) 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16 md:pb-24">
        <div>
          <motion.h1
            {...rise}
            transition={{ ...springUI, delay: 0.05 }}
            className="t-hero text-white/80"
          >
            {splitEmphasis(t("headline")).map((segment, i) =>
              segment.emphasised ? (
                <em key={i} className="text-white">
                  {segment.text}
                </em>
              ) : (
                <span key={i}>{segment.text}</span>
              )
            )}
          </motion.h1>
          <motion.div {...rise} transition={{ ...springUI, delay: 0.14 }} className="mt-10 md:mt-12">
            <Button variant="onDark" size="lg" onClick={onCtaClick}>
              {t("cta")}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
