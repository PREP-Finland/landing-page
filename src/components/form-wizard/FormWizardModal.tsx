"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import FormWizard from "./FormWizard";
import type { FormWizardConfig } from "@/types/form";

interface FormWizardModalProps {
  open: boolean;
  onClose: () => void;
  formWizardConfig: FormWizardConfig;
}

export default function FormWizardModal({ open, onClose, formWizardConfig }: FormWizardModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
            transition={{ duration: 0.2, layout: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } }}
            className="relative z-10 bg-[var(--color-bg)] rounded-lg p-8 md:p-12 w-full max-w-xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors text-[var(--color-text)]/60 hover:text-[var(--color-text)]"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <FormWizard onClose={onClose} formWizardConfig={formWizardConfig} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
