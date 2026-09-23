"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";

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
}: {
  item: PillarItem;
  isActive: boolean;
  isDimmed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isActive}
      aria-controls="pillar-panel"
      className={`group relative flex h-full flex-col overflow-hidden rounded-lg border bg-white p-3.5 sm:p-4 md:p-6 text-left transition-all duration-300 ${
        isActive
          ? "border-gray-200 shadow-md"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      } ${isDimmed ? "opacity-60 hover:opacity-100" : ""}`}
    >
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-[3px] origin-left bg-[var(--color-accent)] transition-transform duration-300 ease-out ${
          isActive ? "scale-x-100" : "scale-x-0"
        }`}
      />
      <span className="font-[family-name:var(--font-futura-pt)] text-xs tracking-[0.15em] text-[var(--color-accent)]">
        {item.number}
      </span>
      <span className="mt-3 block font-[family-name:var(--font-raleway)] text-[13px] sm:text-sm md:text-base font-semibold leading-snug text-gray-900 hyphens-auto [overflow-wrap:anywhere]">
        {item.cardTitle}
      </span>
      <span className="mt-2 block text-xs md:text-sm leading-relaxed font-light text-gray-500">
        {item.cardText}
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
    <div className="rounded-lg border border-gray-200 bg-white p-6 md:p-10">
      <span className="font-[family-name:var(--font-futura-pt)] text-xs tracking-[0.15em] text-[var(--color-accent)]">
        {item.number}
      </span>
      <h3 className="mt-2 font-[family-name:var(--font-raleway)] text-base md:text-lg lg:text-xl font-bold leading-tight text-gray-900 hyphens-auto [overflow-wrap:anywhere]">
        {item.title}
      </h3>
      <p className="mt-3 font-[family-name:var(--font-raleway)] text-sm md:text-base font-normal leading-snug text-[var(--color-accent)]">
        {item.subtitle}
      </p>
      <div className="mt-6 space-y-3 text-xs md:text-sm leading-relaxed font-light text-gray-600">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-8 h-px w-16 bg-[var(--color-accent)]" />
      <p className="mt-6 font-[family-name:var(--font-raleway)] text-sm md:text-base font-semibold leading-relaxed text-gray-900">
        {item.result}
      </p>
    </div>
  );
}

export default function PillarsSection() {
  const t = useTranslations("pillars");
  const items = t.raw("items") as PillarItem[];
  const [active, setActive] = useState<number | null>(null);

  if (!Array.isArray(items) || items.length === 0) return null;

  const activeItem = active !== null ? items[active] : null;

  return (
    <section id="pillars" className="py-14 md:py-20" style={{ backgroundColor: "#fafaf9" }}>
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFadeIn>
          <div className="text-left md:text-center mb-8 md:mb-10">
            <p className="font-[family-name:var(--font-futura-pt)] text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">
              {t("eyebrow")}
            </p>
            <h2 className="font-[family-name:var(--font-raleway)] text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              {t("title")}
            </h2>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {items.map((item, i) => (
              <PillarCard
                key={item.number}
                item={item}
                isActive={active === i}
                isDimmed={active !== null && active !== i}
                onToggle={() => setActive(active === i ? null : i)}
              />
            ))}
          </div>
        </ScrollFadeIn>

        <div id="pillar-panel" aria-live="polite" className="mt-4 md:mt-6">
          <AnimatePresence mode="wait" initial={false}>
            {activeItem ? (
              <motion.div
                key={activeItem.number}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <PillarDetail item={activeItem} />
              </motion.div>
            ) : (
              <motion.p
                key="summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto pt-4 text-left md:text-center text-xs md:text-sm leading-relaxed font-light text-gray-600"
              >
                {t("summary")}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
