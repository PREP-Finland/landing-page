"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";
import { springUI } from "@/lib/motion";

interface PillarItem {
  number: string;
  cardTitle: string;
  cardText: string;
  title: string;
  subtitle: string;
  body: string;
  result: string;
}

function PillarCard({
  item,
  isActive,
  isDimmed,
  onToggle,
  onKeyNav,
  cardRef,
}: {
  item: PillarItem;
  isActive: boolean;
  isDimmed: boolean;
  onToggle: () => void;
  onKeyNav: (e: React.KeyboardEvent) => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onToggle}
      onKeyDown={onKeyNav}
      aria-expanded={isActive}
      aria-controls="pillar-panel"
      className={`group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] border bg-[var(--color-bg)] p-5 md:p-6 text-left cursor-pointer
        transition-[opacity,border-color,box-shadow,transform] duration-200 ease-out
        active:scale-[0.985] active:duration-75
        ${
          isActive
            ? "border-[var(--color-accent)]/25 shadow-[0_2px_6px_rgba(20,16,16,0.04),0_18px_40px_-24px_rgba(20,16,16,0.30)]"
            : "border-[var(--color-border)] hover:border-[var(--color-text-subtle)]/50 shadow-[0_1px_2px_rgba(20,16,16,0.03)] hover:shadow-[0_2px_8px_rgba(20,16,16,0.06)]"
        }
        ${isDimmed ? "opacity-55 hover:opacity-100" : "opacity-100"}`}
    >
      {/* Accent rule wipes in from the left, pointing at the panel it opens. */}
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-[2px] origin-left bg-[var(--color-accent)] transition-transform duration-300 ease-out ${
          isActive ? "scale-x-100" : "scale-x-0"
        }`}
      />
      <span
        className="font-[family-name:var(--font-futura-pt)] text-xs tracking-[0.2em] text-[var(--color-accent)]"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {item.number}
      </span>
      <span className="mt-4 block text-base md:text-[1.0625rem] font-semibold leading-snug tracking-[-0.012em] text-[var(--color-text)] hyphens-auto [overflow-wrap:anywhere]">
        {item.cardTitle}
      </span>
      <span className="mt-2.5 block text-[0.9375rem] leading-relaxed text-[var(--color-text-muted)]">
        {item.cardText}
      </span>

      {/* Affordance that there is more behind the card. */}
      <span
        aria-hidden
        className={`mt-auto pt-5 inline-flex items-center gap-1.5 t-eyebrow transition-colors duration-200 ${
          isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-subtle)] group-hover:text-[var(--color-accent)]"
        }`}
      >
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={springUI}
        >
          <path d="M2 4.5 6 8.5 10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </span>
    </button>
  );
}

function PillarDetail({ item }: { item: PillarItem }) {
  const paragraphs = item.body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-7 md:p-12 shadow-[0_1px_3px_rgba(20,16,16,0.03),0_24px_60px_-36px_rgba(20,16,16,0.25)]">
      <span
        className="font-[family-name:var(--font-futura-pt)] text-xs tracking-[0.2em] text-[var(--color-accent)]"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {item.number}
      </span>
      <h3 className="mt-3 t-h3 text-[var(--color-text)] hyphens-auto [overflow-wrap:anywhere]">
        {item.title}
      </h3>
      <p className="mt-4 t-lead text-[var(--color-accent)]">{item.subtitle}</p>

      <div className="mt-8 space-y-5 t-body text-[var(--color-text-muted)]">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div aria-hidden className="mt-10 h-px w-16 bg-[var(--color-accent)]" />
      <p className="mt-6 t-lead font-semibold text-[var(--color-text)]">{item.result}</p>
    </div>
  );
}

export default function PillarsSection() {
  const t = useTranslations("pillars");
  const items = t.raw("items") as PillarItem[];
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!Array.isArray(items) || items.length === 0) return null;

  const activeItem = active !== null ? items[active] : null;

  // Arrow keys move between the cards, so the group behaves like one control
  // rather than four unrelated buttons.
  const handleKeyNav = (i: number) => (e: React.KeyboardEvent) => {
    const last = items.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i === last ? 0 : i + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i === 0 ? last : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    cardRefs.current[next]?.focus();
  };

  const swap = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: springUI,
      };

  return (
    <section
      id="pillars"
      className="bg-[var(--color-bg-tertiary)]"
      style={{ paddingTop: "var(--section-y)", paddingBottom: "var(--section-y)" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <ScrollFadeIn>
          <div className="mb-12 md:mb-16">
            <p className="t-eyebrow text-[var(--color-accent)]">{t("eyebrow")}</p>
            <h2 className="t-h2 mt-4 text-[var(--color-text)]">{t("title")}</h2>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.06}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {items.map((item, i) => (
              <PillarCard
                key={item.number}
                item={item}
                isActive={active === i}
                isDimmed={active !== null && active !== i}
                onToggle={() => setActive(active === i ? null : i)}
                onKeyNav={handleKeyNav(i)}
                cardRef={(el) => {
                  cardRefs.current[i] = el;
                }}
              />
            ))}
          </div>
        </ScrollFadeIn>

        {/* `layout` lets the sections below settle rather than jump as the
            panel opens and closes. */}
        <motion.div
          id="pillar-panel"
          layout={!reduceMotion}
          transition={springUI}
          className="mt-5 md:mt-6"
        >
          <AnimatePresence mode="wait" initial={false}>
            {activeItem ? (
              <motion.div key={activeItem.number} {...swap}>
                <PillarDetail item={activeItem} />
              </motion.div>
            ) : (
              <motion.p
                key="summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl pt-6 t-body text-[var(--color-text-muted)]"
              >
                {t("summary")}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
