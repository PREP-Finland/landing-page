"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";

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
      <ul key={key} className="list-disc pl-5 my-2 space-y-1">
        {bullets.map((b, i) => (
          <li key={i} className="text-gray-600 text-sm leading-relaxed font-light">
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
        <p key={i} className="text-gray-600 text-sm leading-relaxed font-light mb-2 last:mb-0">
          {line}
        </p>
      );
    }
  });
  flushBullets("ul-end");

  return <>{blocks}</>;
}

function FaqRow({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-[family-name:var(--font-raleway)] text-sm md:text-base font-medium text-gray-900 normal-case">
          {item.q}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 pr-8 md:pr-10">
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
    <section id="faq" className="py-14 md:py-20" style={{ backgroundColor: "#fafaf9" }}>
      <div className="max-w-3xl mx-auto px-6">
        <ScrollFadeIn>
          <div className="text-left md:text-center mb-8 md:mb-10">
            <h2 className="font-[family-name:var(--font-raleway)] text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              {t("title")}
            </h2>
          </div>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.1}>
          <div>
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
      </div>
    </section>
  );
}
