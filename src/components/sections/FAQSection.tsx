"use client";

import { useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";
import { springUI } from "@/lib/motion";
import Section, { Measure } from "@/components/ui/Section";

interface FaqItem {
  q: string;
  a: string;
}

// Render an answer string: newline-separated paragraphs, with consecutive
// "- " lines grouped into a bulleted list.
function Answer({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (key: string) => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={key} className="list-disc pl-5 my-3 space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="t-body text-[var(--color-text-muted)]">
            {b}
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((line, i) => {
    if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
    } else {
      flushBullets(`ul-${i}`);
      blocks.push(
        <p key={i} className="t-body text-[var(--color-text-muted)] mb-3 last:mb-0">
          {line}
        </p>
      );
    }
  });
  flushBullets("ul-end");

  return <>{blocks}</>;
}

function FaqRow({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="border-b border-[var(--color-border)]">
      <button
        type="button"
        id={buttonId}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group w-full flex items-center justify-between gap-6 py-6 text-left cursor-pointer"
      >
        <span className="text-base md:text-lg font-medium tracking-[-0.011em] text-[var(--color-text)] transition-colors duration-150 group-hover:text-[var(--color-accent)]">
          {item.q}
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={reduceMotion ? { duration: 0.15 } : springUI}
          className="shrink-0 grid place-items-center h-8 w-8 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors duration-150 group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)]"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0.2 } : springUI}
            className="overflow-hidden"
          >
            <div className="pb-7 pr-10 md:pr-16">
              <Answer text={item.a} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const t = useTranslations("faq");
  const items = t.raw("items") as FaqItem[];
  const [open, setOpen] = useState<number | null>(null);

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <Section id="faq" surface="secondary">
      <Measure className="mx-auto">
        <ScrollFadeIn>
          <h2 className="t-h2 text-left md:text-center text-[var(--color-text)] mb-12 md:mb-16">
            {t("title")}
          </h2>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.06}>
          <div className="border-t border-[var(--color-border)]">
            {items.map((item, i) => (
              <FaqRow
                key={i}
                item={item}
                isOpen={open === i}
                onToggle={() => setOpen(open === i ? null : i)}
              />
            ))}
          </div>
        </ScrollFadeIn>
      </Measure>
    </Section>
  );
}
