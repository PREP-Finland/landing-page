"use client";

import { useTranslations } from "next-intl";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";
import MarkdownContent from "@/components/ui/MarkdownContent";

export default function AboutSection() {
  const t = useTranslations("about");

  return (
    <section id="about" className="py-10 md:py-12 bg-[var(--color-bg-secondary)]">
      <div className="max-w-3xl mx-auto px-6">
        <ScrollFadeIn>
          <h2 className="font-[family-name:var(--font-raleway)] text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-6">{t("title")}</h2>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.15}>
          <MarkdownContent
            content={t("text")}
            className="text-lg leading-relaxed text-[var(--color-text)]/80"
          />
        </ScrollFadeIn>
      </div>
    </section>
  );
}
