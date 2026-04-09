"use client";

import { useTranslations } from "next-intl";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";
import Button from "@/components/ui/Button";
import MarkdownContent from "@/components/ui/MarkdownContent";

interface ContactSectionProps {
  onCtaClick: () => void;
}

export default function ContactSection({ onCtaClick }: ContactSectionProps) {
  const t = useTranslations("contact");

  return (
    <section id="contact" className="py-10 md:py-12 bg-[var(--color-bg-secondary)]">
      <div className="max-w-3xl mx-auto px-6 text-left md:text-center">
        <ScrollFadeIn>
          <h2 className="font-[family-name:var(--font-raleway)] text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-6">{t("title")}</h2>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.1}>
          <MarkdownContent content={t("text")} className="text-lg text-[var(--color-text)]/80 mb-4" />
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.2}>
          <div className="flex flex-col items-start md:items-center gap-2 mb-8 text-[var(--color-text)]/60">
            <a href={`mailto:${t("email")}`} className="hover:text-[var(--color-accent)] transition-colors">
              {t("email")}
            </a>
            <a href={`tel:${t("phone")}`} className="hover:text-[var(--color-accent)] transition-colors">
              {t("phone")}
            </a>
          </div>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.3}>
          <Button size="lg" onClick={onCtaClick}>
            {t("cta")}
          </Button>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
