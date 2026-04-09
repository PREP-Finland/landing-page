"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import ScrollFadeIn from "@/components/ui/ScrollFadeIn";

interface CoachRowProps {
  name: string;
  paragraphs: string[];
  readMore: string;
  readLess: string;
  imageSrc: string;
  delay: number;
  reverse?: boolean;
  flipImage?: boolean;
}

function CoachRow({ name, paragraphs, readMore, readLess, imageSrc, delay, reverse = false, flipImage = false }: CoachRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <ScrollFadeIn delay={delay}>
      <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"}`}>
        {/* Image block — dominant, ~60% width */}
        <div className="relative w-full md:w-[60%] min-h-72 md:min-h-[560px] shrink-0 md:p-6">
          <div className="relative w-full h-full min-h-72 md:min-h-[512px] overflow-hidden md:rounded-xl">
            <Image src={imageSrc} alt={name} fill className={`object-cover object-top${flipImage ? " -scale-x-100" : ""}`} />
          </div>
        </div>

        {/* Text block — ~40% width, top-aligned */}
        <div className="w-full md:w-[40%] flex flex-col justify-start px-8 md:px-12 pt-10 md:pt-6 pb-10">
          <h3 className="font-[family-name:var(--font-raleway)] text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-4">{name}</h3>
          <p className="text-gray-600 text-xs md:text-sm leading-relaxed font-light mb-3">{paragraphs[0]}</p>
          {expanded && paragraphs.slice(1).map((p, i) => (
            <p key={i} className="text-gray-600 text-xs md:text-sm leading-relaxed font-light mb-3 last:mb-0">{p}</p>
          ))}
          {paragraphs.length > 1 && (
            <button
              onClick={() => setExpanded(prev => !prev)}
              className="mt-1 self-start text-xs text-gray-400 hover:text-gray-600 tracking-widest uppercase transition-colors"
            >
              {expanded ? readLess : readMore}
            </button>
          )}
        </div>
      </div>
    </ScrollFadeIn>
  );
}

export default function CoachesSection() {
  const t = useTranslations("coaches");

  const coach1Paragraphs = [
    t("coach1.bioP1"),
    t("coach1.bioP2"),
    t("coach1.bioP3"),
    t("coach1.bioP4"),
  ];

  const coach2Paragraphs = [
    t("coach2.bioP1"),
    t("coach2.bioP2"),
    t("coach2.bioP3"),
  ];

  return (
    <section id="coaches" className="py-10 md:py-12" style={{ backgroundColor: "#fafaf9" }}>
      <ScrollFadeIn>
        <div className="text-left md:text-center mb-6 px-6">
          <h2 className="font-[family-name:var(--font-raleway)] text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">{t("title")}</h2>
        </div>
      </ScrollFadeIn>
      <div className="flex flex-col gap-8 md:gap-0">
        <CoachRow
          name={t("coach1.name")}
          paragraphs={coach1Paragraphs}
          readMore={t("readMore")}
          readLess={t("readLess")}
          imageSrc="/johanna-hermans.jpg"
          delay={0.15}
          reverse
        />
        <CoachRow
          name={t("coach2.name")}
          paragraphs={coach2Paragraphs}
          readMore={t("readMore")}
          readLess={t("readLess")}
          imageSrc="/sherko-eliassi.jpg"
          delay={0.3}
          flipImage
        />
      </div>
    </section>
  );
}
