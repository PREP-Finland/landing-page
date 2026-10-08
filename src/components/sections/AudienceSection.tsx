"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";
import Section, { Measure } from "@/components/ui/Section";

interface AudienceSectionProps {
  onCtaClick: React.MouseEventHandler<HTMLButtonElement>;
}

/** Who PREP is for: the target customer in the reader's own terms. */
export default function AudienceSection({ onCtaClick }: AudienceSectionProps) {
  const t = useTranslations("audience");
  const list = t.raw("list") as string[];

  return (
    <Section id="audience" surface="tertiary">
      <Measure className="mx-auto">
        <ScrollFadeIn>
          <h2 className="t-h2 text-[var(--color-text)]">{t("title")}</h2>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.06}>
          <div className="mt-8 space-y-6 t-body text-[var(--color-text-muted)]">
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.1}>
          <p className="mt-10 t-lead font-semibold text-[var(--color-text)]">{t("listTitle")}</p>
          <ul className="mt-5 space-y-3">
            {list.map((item) => (
              <li key={item} className="flex gap-3 t-body text-[var(--color-text-muted)]">
                <span
                  aria-hidden
                  className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.14}>
          <p className="mt-10 t-body text-[var(--color-text-muted)]">{t("p3")}</p>
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
