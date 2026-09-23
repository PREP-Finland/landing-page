"use client";

import { useEffect, useRef, useState } from "react";
import HeroSection from "@/components/sections/HeroSection";
import TestimonialCarousel from "@/components/sections/TestimonialCarousel";
import IntroSection from "@/components/sections/IntroSection";
import CoachesSection from "@/components/sections/CoachesSection";
import InstagramCarousel from "@/components/sections/InstagramCarousel";
import FAQSection from "@/components/sections/FAQSection";
import ClosingSection from "@/components/sections/ClosingSection";
import FormWizardModal from "@/components/form-wizard/FormWizardModal";
import { trackEvent } from "@/lib/analytics";
import type { FormWizardConfig } from "@/types/form";

interface VideosConfig {
  hero: { src: string; poster: string };
}

interface PageClientProps {
  videosConfig: VideosConfig;
  formWizardConfig: FormWizardConfig;
}

export default function PageClient({ videosConfig, formWizardConfig }: PageClientProps) {
  const [wizardOpen, setWizardOpen] = useState(false);
  // Remembered so the sheet scales out of the button that opened it.
  const originRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    trackEvent("page_view_landing", { page: "home" });
  }, []);

  const openWizard = (source: string) => (e?: React.MouseEvent) => {
    const el = e?.currentTarget as HTMLElement | undefined;
    if (el) {
      const r = el.getBoundingClientRect();
      originRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    trackEvent("form_open", { form: "contact_wizard", source });
    setWizardOpen(true);
  };

  return (
    <>
      <HeroSection onCtaClick={openWizard("hero")} videosConfig={videosConfig} />
      <TestimonialCarousel />
      <IntroSection onCtaClick={openWizard("intro")} />
      <InstagramCarousel />
      <CoachesSection />
      <FAQSection />
      <ClosingSection onCtaClick={openWizard("closing")} />
      <FormWizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        formWizardConfig={formWizardConfig}
        origin={originRef.current}
      />
    </>
  );
}
