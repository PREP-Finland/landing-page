"use client";

import { useState, ReactNode } from "react";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import FormWizardModal from "@/components/form-wizard/FormWizardModal";
import type { FormWizardConfig } from "@/types/form";

interface VideosConfig {
  hero: { src: string; poster: string };
}

interface PageClientProps {
  blogSection: ReactNode;
  videosConfig: VideosConfig;
  formWizardConfig: FormWizardConfig;
}

export default function PageClient({ blogSection, videosConfig, formWizardConfig }: PageClientProps) {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <>
      <HeroSection onCtaClick={() => setWizardOpen(true)} videosConfig={videosConfig} />
      <AboutSection />
      {blogSection}
      <ContactSection onCtaClick={() => setWizardOpen(true)} />
      <FormWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} formWizardConfig={formWizardConfig} />
    </>
  );
}
