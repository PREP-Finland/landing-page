"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";
import Section, { Measure } from "@/components/ui/Section";

interface InviteSectionProps {
  onCtaClick: React.MouseEventHandler<HTMLButtonElement>;
}

/**
 * A short invitation straight after the hero, so the free planning call is
 * offered before the reader has to scroll through the rest of the story.
 */
export default function InviteSection({ onCtaClick }: InviteSectionProps) {
  const t = useTranslations("invite");

  return (
    <Section id="invite">
      <Measure className="mx-auto text-center">
        <ScrollFadeIn>
          <h2 className="t-h2 text-[var(--color-text)] text-balance">{t("title")}</h2>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.06}>
          <p className="mt-6 t-lead text-[var(--color-text-muted)] text-pretty">{t("text")}</p>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.1}>
          <div className="mt-10">
            <Button variant="primary" size="lg" onClick={onCtaClick}>
              {t("cta")}
            </Button>
          </div>
        </ScrollFadeIn>
      </Measure>
    </Section>
  );
}
