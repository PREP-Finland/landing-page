"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/sections/HeroSection";
import IntroSection from "@/components/sections/IntroSection";
import CoachesSection from "@/components/sections/CoachesSection";
import InstagramCarousel from "@/components/sections/InstagramCarousel";
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

  useEffect(() => {
    trackEvent("page_view_landing", { page: "home" });
  }, []);

  const openWizard = (source: string) => {
    trackEvent("form_open", { form: "contact_wizard", source });
    setWizardOpen(true);
  };

  return (
    <>
      <HeroSection onCtaClick={() => openWizard("hero")} videosConfig={videosConfig} />
      <IntroSection onCtaClick={() => openWizard("intro")} />
      <CoachesSection />
      <InstagramCarousel />
      <FormWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} formWizardConfig={formWizardConfig} />
    </>
  );
}
