"use client";

import LanguageToggle from "@/components/ui/LanguageToggle";

export default function Header() {

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#">
          <img src="/logo.svg" alt="PREP" className="h-8 w-auto" />
        </a>
        <div className="flex items-center gap-2">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
