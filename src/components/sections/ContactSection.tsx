"use client";

import { useTranslations } from "next-intl";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";
import Button from "@/components/ui/Button";

interface ContactSectionProps {
  onCtaClick: () => void;
}

export default function ContactSection({ onCtaClick }: ContactSectionProps) {
  const t = useTranslations("contact");

  return (
    <section id="contact" className="py-24 md:py-32 bg-[var(--color-bg-secondary)]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <ScrollFadeIn>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("title")}</h2>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.1}>
          <p className="text-lg text-[var(--color-text)]/80 mb-4">{t("text")}</p>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.2}>
          <div className="flex flex-col items-center gap-2 mb-8 text-[var(--color-text)]/60">
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
