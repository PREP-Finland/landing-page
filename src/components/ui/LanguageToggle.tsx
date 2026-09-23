"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";

interface LanguageToggleProps {
  /** Over the hero the control is light-on-dark; once the bar materialises it flips. */
  scrolled?: boolean;
}

export default function LanguageToggle({ scrolled = true }: LanguageToggleProps) {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const newLocale = locale === "fi" ? "en" : "fi";
    startTransition(() => {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className={`h-9 px-3 flex items-center justify-center rounded-[var(--radius-xs)] border text-xs font-semibold tracking-[0.12em] transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.96] disabled:opacity-50 ${
        scrolled
          ? "border-black/15 text-[var(--color-text)] hover:bg-black/[0.05] hover:border-black/25"
          : "border-white/50 text-white hover:bg-white/15 hover:border-white/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]"
      }`}
      aria-label="Toggle language"
    >
      {locale === "fi" ? "EN" : "FI"}
    </button>
  );
}
