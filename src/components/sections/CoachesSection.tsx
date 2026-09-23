"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";
import { springUI } from "@/lib/motion";
import Section from "@/components/ui/Section";

interface CoachRowProps {
  name: string;
  paragraphs: string[];
  readMore: string;
  readLess: string;
  imageSrc: string;
  delay: number;
  priority?: boolean;
  reverse?: boolean;
  flipImage?: boolean;
}

function CoachRow({
  name,
  paragraphs,
  readMore,
  readLess,
  imageSrc,
  delay,
  priority = false,
  reverse = false,
  flipImage = false,
}: CoachRowProps) {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <ScrollFadeIn delay={delay}>
      <div
        className={`flex flex-col items-center gap-10 md:gap-14 ${
          reverse ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        {/* Image block — dominant, ~58% width */}
        <div className="relative w-full md:w-[58%] shrink-0">
          <div className="relative w-full aspect-[4/5] md:aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)]">
            <Image
              src={imageSrc}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              priority={priority}
              className={`object-cover object-top${flipImage ? " -scale-x-100" : ""}`}
            />
          </div>
        </div>

        {/* Text block — ~42% width, optically centred against the image */}
        <div className="w-full md:w-[42%] flex flex-col justify-center">
          <h3 className="t-h3 text-[var(--color-text)]">{name}</h3>

          <p className="mt-5 t-body text-[var(--color-text-muted)]">{paragraphs[0]}</p>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={reduceMotion ? { duration: 0.2 } : springUI}
                className="overflow-hidden"
              >
                <div className="pt-5 space-y-5">
                  {paragraphs.slice(1).map((p, i) => (
                    <p key={i} className="t-body text-[var(--color-text-muted)]">
                      {p}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {paragraphs.length > 1 && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              className="mt-4 -ml-1 self-start inline-flex min-h-11 items-center gap-2 px-1 t-eyebrow text-[var(--color-accent)] cursor-pointer transition-opacity duration-150 ease-out hover:opacity-70 active:opacity-50"
            >
              {expanded ? readLess : readMore}
              <motion.svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={reduceMotion ? { duration: 0.15 } : springUI}
              >
                <path
                  d="M2 4.5 6 8.5 10 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </button>
          )}
        </div>
      </div>
    </ScrollFadeIn>
  );
}

export default function CoachesSection() {
  const t = useTranslations("coaches");

  const coach1Paragraphs = [
    t("coach1.bioP1"),
    t("coach1.bioP2"),
    t("coach1.bioP3"),
    t("coach1.bioP4"),
  ];

  const coach2Paragraphs = [
    t("coach2.bioP1"),
    t("coach2.bioP2"),
    t("coach2.bioP3"),
  ];

  return (
    <Section id="coaches">
      <>
        <ScrollFadeIn>
          <h2 className="t-h2 text-[var(--color-text)] mb-14 md:mb-20">{t("title")}</h2>
        </ScrollFadeIn>

        <div className="flex flex-col gap-20 md:gap-28">
          <CoachRow
            name={t("coach1.name")}
            paragraphs={coach1Paragraphs}
            readMore={t("readMore")}
            readLess={t("readLess")}
            imageSrc="/johanna-hermans.jpg"
            delay={0.05}
            priority
            reverse
          />
          <CoachRow
            name={t("coach2.name")}
            paragraphs={coach2Paragraphs}
            readMore={t("readMore")}
            readLess={t("readLess")}
            imageSrc="/sherko-eliassi.jpg"
            delay={0.05}
            flipImage
          />
        </div>
      </>
    </Section>
  );
}
