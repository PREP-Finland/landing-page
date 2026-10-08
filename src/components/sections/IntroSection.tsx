"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";
import Section, { Measure } from "@/components/ui/Section";

interface IntroSectionProps {
  onCtaClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function IntroSection({ onCtaClick }: IntroSectionProps) {
  const t = useTranslations("intro");

  return (
    <Section id="intro">
      <Measure className="mx-auto">
        <ScrollFadeIn>
          <h2 className="t-h2 text-[var(--color-text)]">{t("title")}</h2>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.06}>
          <div className="mt-8 space-y-6 t-body text-[var(--color-text-muted)]">
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
            <p>{t("p3")}</p>
            <p>{t("p4")}</p>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.14}>
          <p className="mt-10 t-lead text-[var(--color-text)] font-semibold">{t("p5")}</p>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.16}>
          <div className="mt-12">
            <Button variant="outline" size="lg" onClick={onCtaClick}>
              {t("cta")}
            </Button>
          </div>
        </ScrollFadeIn>
      </Measure>
    </Section>
  );
}
