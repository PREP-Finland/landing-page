"use client";

import { useState } from "react";
import HeroSection from "@/components/sections/HeroSection";
import IntroSection from "@/components/sections/IntroSection";
import CoachesSection from "@/components/sections/CoachesSection";
import FormWizardModal from "@/components/form-wizard/FormWizardModal";
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

  return (
    <>
      <HeroSection onCtaClick={() => setWizardOpen(true)} videosConfig={videosConfig} />
      <IntroSection onCtaClick={() => setWizardOpen(true)} />
      <CoachesSection />
      <FormWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} formWizardConfig={formWizardConfig} />
    </>
  );
}
