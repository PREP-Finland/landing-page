"use client";

import { useState, ReactNode } from "react";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import FormWizardModal from "@/components/form-wizard/FormWizardModal";

interface PageClientProps {
  blogSection: ReactNode;
}

export default function PageClient({ blogSection }: PageClientProps) {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <>
      <HeroSection onCtaClick={() => setWizardOpen(true)} />
      <AboutSection />
      {blogSection}
      <ContactSection onCtaClick={() => setWizardOpen(true)} />
      <FormWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  );
}
