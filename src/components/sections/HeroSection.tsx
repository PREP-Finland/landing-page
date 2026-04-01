"use client";

import { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
const isDev = process.env.NODE_ENV === "development";

function getVideoSrc(src: string) {
  if (isDev) {
    return `/api/video-proxy?url=${encodeURIComponent(src)}`;
  }
  return src;
}

interface HeroSectionProps {
  onCtaClick: () => void;
  videosConfig: { hero: { src: string; poster: string } };
}

export default function HeroSection({ onCtaClick, videosConfig }: HeroSectionProps) {
  const t = useTranslations("hero");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    // If already enough data, play immediately
    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("loadeddata", tryPlay, { once: true });
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <section className="relative h-screen w-full flex items-end justify-start md:justify-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        src={getVideoSrc(videosConfig.hero.src)}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 px-10 pb-16 self-end text-left md:text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-[family-name:var(--font-raleway)] text-lg md:text-xl lg:text-2xl font-bold text-white uppercase md:whitespace-nowrap"
          style={{ letterSpacing: "2.5px" }}
        >
          {t("subheadline")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-8"
        >
          <Button size="lg" onClick={onCtaClick}>
            {t("cta")}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
