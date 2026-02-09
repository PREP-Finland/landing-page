"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";

export default function LanguageToggle() {
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
      className="w-9 h-9 flex items-center justify-center rounded-md border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors text-sm font-semibold"
      aria-label="Toggle language"
    >
      {locale === "fi" ? "EN" : "FI"}
    </button>
  );
}
