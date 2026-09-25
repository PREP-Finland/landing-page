import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("footer");
  const ti = await getTranslations("instagram");

  // The brand name stays PREP; only the surrounding wording is localised.
  const rights = t("copyright").replace(/^©\s*\d{4}\s*[^.]*\.\s*/, "");

  return (
    <footer className="relative z-30 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="PREP" className="h-6 w-auto opacity-80" />

        <nav className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <a
            href="https://www.instagram.com/prepfinland/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center t-eyebrow text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            {ti("subtitle")}
          </a>
          <a
            href="/privacy"
            className="inline-flex min-h-11 items-center t-eyebrow text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            {t("privacy")}
          </a>
        </nav>

        <p className="text-sm text-[var(--color-text-muted)]">
          &copy; {new Date().getFullYear()} PREP. {rights}
        </p>
      </div>
    </footer>
  );
}
