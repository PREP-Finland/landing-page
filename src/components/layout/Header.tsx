"use client";

import LanguageToggle from "@/components/ui/LanguageToggle";

export default function Header() {

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#CA132A] to-[#EA3860] border-b border-[#CA132A]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#">
          <img src="/logo.svg" alt="PREP" className="h-8 w-auto brightness-0 invert" />
        </a>
        <div className="flex items-center gap-2">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
