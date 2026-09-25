"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";
import { springUI } from "@/lib/motion";
import Section from "@/components/ui/Section";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface PillarItem {
  number: string;
  cardTitle: string;
  cardText: string;
  title: string;
  subtitle: string;
  body: string;
  result: string;
}

/**
 * Document-relative top via the offset chain rather than getBoundingClientRect,
 * which would include the section's entrance transform and land the scroll
 * short if a card is clicked while that animation is still running.
 */
function documentTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

function PillarNumber({ children }: { children: string }) {
  return (
    <span
      className="font-[family-name:var(--font-futura-pt)] text-xs tracking-[0.2em] text-[var(--color-accent)]"
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {children}
    </span>
  );
}

/** The essay itself, shared by the in-card panel and the desktop panel. */
function PillarBody({ item, showTitle }: { item: PillarItem; showTitle: boolean }) {
  const paragraphs = item.body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <>
      {showTitle && (
        <>
          <PillarNumber>{item.number}</PillarNumber>
          <h3 className="mt-3 t-h3 text-[var(--color-text)] hyphens-auto [overflow-wrap:anywhere]">
            {item.title}
          </h3>
        </>
      )}
      <p className={`${showTitle ? "mt-4" : ""} t-lead text-[var(--color-accent)]`}>
        {item.subtitle}
      </p>

      <div className="mt-6 md:mt-8 space-y-5 t-body text-[var(--color-text-muted)]">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div aria-hidden className="mt-8 md:mt-10 h-px w-16 bg-[var(--color-accent)]" />
      <p className="mt-6 t-lead font-semibold text-[var(--color-text)]">{item.result}</p>
    </>
  );
}

function PillarCard({
  item,
  isActive,
  isDimmed,
  inline,
  onToggle,
  onKeyNav,
  cardRef,
}: {
  item: PillarItem;
  isActive: boolean;
  isDimmed: boolean;
  /** Phone layout: the card opens in place rather than into a shared panel. */
  inline: boolean;
  onToggle: () => void;
  onKeyNav: (e: React.KeyboardEvent) => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}) {
  const reduceMotion = useReducedMotion();
  const panelId = useId();

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] border bg-[var(--color-bg)]
        transition-[opacity,border-color,box-shadow,transform] duration-200 ease-out
        has-[button:active]:scale-[0.985] has-[button:active]:duration-75
        ${
          isActive
            ? "border-[var(--color-accent)]/25 shadow-[0_2px_6px_rgba(20,16,16,0.04),0_18px_40px_-24px_rgba(20,16,16,0.30)]"
            : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]/50 shadow-[0_1px_2px_rgba(20,16,16,0.03)] hover:shadow-[0_2px_8px_rgba(20,16,16,0.06)]"
        }
        ${isDimmed ? "opacity-55 hover:opacity-100" : "opacity-100"}`}
    >
      {/* Accent rule wipes in from the left, marking the open card. */}
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 z-10 h-[2px] origin-left bg-[var(--color-accent)] transition-transform duration-300 ease-out ${
          isActive ? "scale-x-100" : "scale-x-0"
        }`}
      />

      <button
        ref={cardRef}
        type="button"
        onClick={onToggle}
        onKeyDown={onKeyNav}
        aria-expanded={isActive}
        aria-controls={inline ? panelId : "pillar-panel"}
        className="flex flex-1 flex-col p-5 md:p-6 text-left cursor-pointer"
      >
        <PillarNumber>{item.number}</PillarNumber>
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
            isActive
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]"
          }`}
        >
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            animate={{ rotate: isActive ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0.15 } : springUI}
          >
            <path d="M2 4.5 6 8.5 10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </span>
      </button>

      {/* Phones open the essay inside the card, so the answer stays attached to
          the question instead of appearing below a stack of four. */}
      {inline && (
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              id={panelId}
              role="region"
              initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={reduceMotion ? { duration: 0.2 } : springUI}
              className="overflow-hidden"
            >
              <div className="border-t border-[var(--color-border)] px-5 pb-6 pt-5">
                <PillarBody item={item} showTitle={false} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

function PillarDetail({ item }: { item: PillarItem }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-7 md:p-12 shadow-[0_1px_3px_rgba(20,16,16,0.03),0_24px_60px_-36px_rgba(20,16,16,0.25)]">
      <PillarBody item={item} showTitle />
    </div>
  );
}

export default function PillarsSection() {
  const t = useTranslations("pillars");
  const items = t.raw("items") as PillarItem[];
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  /** Set when a card is opened, so the effect below can put it under the header. */
  const pendingScroll = useRef<number | null>(null);
  const scrollFrame = useRef<number | null>(null);
  // Single-column layout: a shared panel under a one-card-wide stack would sit
  // detached from the card whose answer it is.
  const inline = useMediaQuery("(max-width: 639px)");

  const hasItems = Array.isArray(items) && items.length > 0;
  const activeItem = hasItems && active !== null ? items[active] : null;

  const toggle = (i: number) => {
    const opening = active !== i;
    // Only on open. Closing should leave the reader where they are.
    if (opening) pendingScroll.current = i;
    setActive(opening ? i : null);
  };

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

  // Opening a card changes the height of the section, which used to move
  // everything under the reader. Put the card they just clicked in a fixed
  // place instead, so the section reads as stationary.
  useLayoutEffect(() => {
    const index = pendingScroll.current;
    if (index === null) return;
    pendingScroll.current = null;

    const btn = cardRefs.current[index];
    const grid = gridRef.current;
    if (!btn || !grid) return;

    const header = document.querySelector("header");
    const offset = (header?.offsetHeight ?? 64) + 20;

    let targetTop: number;
    if (inline) {
      /*
       * Single column: the cards above will all be collapsed once the
       * animation settles, so the final position is the grid top plus their
       * collapsed heights. Measuring the live rect here would read a
       * mid-animation layout and land in the wrong place.
       */
      const gap = parseFloat(getComputedStyle(grid).rowGap) || 16;
      targetTop = documentTop(grid);
      for (let k = 0; k < index; k++) {
        const above = cardRefs.current[k];
        // +2 for the card's top and bottom border.
        if (above) targetTop += above.offsetHeight + 2 + gap;
      }
    } else {
      // The cards sit above the panel, so their position does not move.
      targetTop = documentTop(btn);
    }

    const top = Math.max(0, targetTop - offset);
    if (Math.abs(top - window.scrollY) < 4) return;

    /*
     * Motion measures the `height: auto` keyframe on the following frame, and
     * saves and restores window scroll around that measurement. A smooth
     * scroll started here would still be at its origin when that snapshot is
     * taken, so Motion would restore it and cancel the scroll outright. Wait
     * for the measurement pass before moving.
     */
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = requestAnimationFrame(() => {
        scrollFrame.current = null;
        window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }, [active, inline, reduceMotion]);

  useEffect(
    () => () => {
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    },
    []
  );

  if (!hasItems) return null;

  const swap = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: springUI,
      };

  return (
    <Section id="pillars" surface="tertiary">
      <>
        <ScrollFadeIn>
          <div className="mb-12 md:mb-16 text-left md:text-center">
            <p className="t-eyebrow text-[var(--color-accent)]">{t("eyebrow")}</p>
            <h2 className="t-h2 mt-4 text-[var(--color-text)]">{t("title")}</h2>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.06}>
          {/* items-start so an expanded card grows on its own rather than
              stretching the cards beside it. */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 items-start sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {items.map((item, i) => (
              <PillarCard
                key={item.number}
                item={item}
                isActive={active === i}
                isDimmed={!inline && active !== null && active !== i}
                inline={inline}
                onToggle={() => toggle(i)}
                onKeyNav={handleKeyNav(i)}
                cardRef={(el) => {
                  cardRefs.current[i] = el;
                }}
              />
            ))}
          </div>
        </ScrollFadeIn>

        {inline ? (
          <p className="mt-8 t-body text-[var(--color-text-muted)]">{t("summary")}</p>
        ) : (
          /* `layout` lets the sections below settle rather than jump as the
             panel opens and closes. */
          <motion.div
            id="pillar-panel"
            layout={!reduceMotion}
            transition={springUI}
            className="mt-5 md:mt-6"
          >
            <AnimatePresence mode="popLayout" initial={false}>
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
                  className="max-w-3xl mx-auto pt-6 t-body text-left md:text-center text-[var(--color-text-muted)]"
                >
                  {t("summary")}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </>
    </Section>
  );
}
