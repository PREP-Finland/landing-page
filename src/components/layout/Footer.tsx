import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text)]/60">
        <p>{t("copyright")}</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[var(--color-text)] transition-colors">{t("privacy")}</a>
          <a href="#" className="hover:text-[var(--color-text)] transition-colors">{t("terms")}</a>
        </div>
      </div>
    </footer>
  );
}
