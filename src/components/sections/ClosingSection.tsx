"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";

interface ClosingSectionProps {
  onCtaClick: React.MouseEventHandler<HTMLButtonElement>;
}

/**
 * The page used to end on a list of FAQ rows and a copyright line. This closes
 * it deliberately, on the line the intro copy already builds towards.
 */
export default function ClosingSection({ onCtaClick }: ClosingSectionProps) {
  const t = useTranslations("intro");

  return (
    <section
      id="closing"
      className="relative overflow-hidden bg-[var(--color-text)] text-white"
      style={{ paddingTop: "var(--section-y)", paddingBottom: "var(--section-y)" }}
    >
      {/* A single soft brand wash, anchored bottom-right so the type stays clean. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(90rem 45rem at 85% 120%, rgba(234,56,96,0.35) 0%, rgba(202,19,42,0.12) 38%, transparent 70%)",
        }}
      />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <ScrollFadeIn>
          <p className="t-h2 text-white text-balance">{t("p7")}</p>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.08}>
          <div className="mt-12">
            <Button variant="onDark" size="lg" onClick={onCtaClick}>
              {t("cta")}
            </Button>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
