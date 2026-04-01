"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import TestimonialCarousel from "@/components/sections/TestimonialCarousel";

interface IntroSectionProps {
  onCtaClick: () => void;
}

export default function IntroSection({ onCtaClick }: IntroSectionProps) {
  const t = useTranslations("intro");

  return (
    <section className="relative bg-white">
      <TestimonialCarousel />
      <div className="max-w-3xl mx-auto pt-8 pb-24 px-6">
        <h2 className="font-[family-name:var(--font-raleway)] text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-10 leading-tight">
          {t("title")}
        </h2>
        <div className="space-y-3 text-gray-600 text-xs md:text-sm leading-relaxed font-light">
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
          <p>{t("p4")}</p>
          <p>{t("p5")}</p>
          <p>{t("p6")}</p>
          <p>{t("p7")}</p>
        </div>
        <div className="mt-12 flex justify-center">
          <Button variant="outline" size="lg" onClick={onCtaClick}>
            {t("cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
