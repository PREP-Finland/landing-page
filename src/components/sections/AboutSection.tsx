"use client";

import { useTranslations } from "next-intl";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";

export default function AboutSection() {
  const t = useTranslations("about");

  return (
    <section id="about" className="py-24 md:py-32 bg-[var(--color-bg-secondary)]">
      <div className="max-w-3xl mx-auto px-6">
        <ScrollFadeIn>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{t("title")}</h2>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.15}>
          <div className="text-lg leading-relaxed text-[var(--color-text)]/80 whitespace-pre-line">
            {t("text")}
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
