"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";

interface IntroSectionProps {
  onCtaClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function IntroSection({ onCtaClick }: IntroSectionProps) {
  const t = useTranslations("intro");

  return (
    <section
      id="intro"
      className="relative bg-[var(--color-bg)]"
      style={{ paddingTop: "var(--section-y)", paddingBottom: "var(--section-y)" }}
    >
      <div className="max-w-3xl mx-auto px-6">
        <ScrollFadeIn>
          <h2 className="t-h2 text-[var(--color-text)]">{t("title")}</h2>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.06}>
          <div className="mt-8 space-y-6 t-body text-[var(--color-text-muted)]">
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
          </div>
        </ScrollFadeIn>

        {/* The pivot line, set as a pull quote rather than another paragraph. */}
        <ScrollFadeIn delay={0.1}>
          <blockquote className="mt-12 border-l-2 border-[var(--color-accent)] pl-6 md:pl-8">
            <p className="t-lead text-[var(--color-text)] font-medium">{t("p3")}</p>
          </blockquote>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.12}>
          <div className="mt-12 space-y-6 t-body text-[var(--color-text-muted)]">
            <p>{t("p4")}</p>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.14}>
          <div className="mt-10 space-y-2">
            <p className="t-lead text-[var(--color-text-subtle)]">{t("p5")}</p>
            <p className="t-lead text-[var(--color-text)] font-semibold">{t("p6")}</p>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.16}>
          <div className="mt-12">
            <Button variant="outline" size="lg" onClick={onCtaClick}>
              {t("cta")}
            </Button>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
