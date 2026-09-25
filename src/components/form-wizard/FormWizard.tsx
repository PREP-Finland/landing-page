"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useFormWizard } from "@/hooks/useFormWizard";
import { submitForm } from "@/app/actions/submit-form";
import { trackEvent } from "@/lib/analytics";
import WizardStep from "./WizardStep";
import Button from "@/components/ui/Button";
import { springUI } from "@/lib/motion";
import type { FormWizardConfig } from "@/types/form";

interface FormWizardProps {
  onClose: () => void;
  formWizardConfig: FormWizardConfig;
  titleId?: string;
}

export default function FormWizard({ onClose, formWizardConfig, titleId }: FormWizardProps) {
  const t = useTranslations("formWizard");
  const { steps } = formWizardConfig;
  const {
    currentStep,
    formData,
    isFirstStep,
    isLastStep,
    setField,
    nextStep,
    prevStep,
    validateCurrentStep,
  } = useFormWizard(steps);

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const step = steps[currentStep];
    trackEvent("form_step_view", {
      form: "contact_wizard",
      step_index: currentStep + 1,
      step_total: steps.length,
      step_id: step.id,
    });
  }, [currentStep, steps]);

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    setStatus("submitting");
    try {
      const result = await submitForm(formData);
      if (result.success) {
        setStatus("success");
        trackEvent("form_submit", { form: "contact_wizard", outcome: "success" });
      } else {
        setStatus("error");
        trackEvent("form_submit", { form: "contact_wizard", outcome: "error" });
      }
    } catch {
      setStatus("error");
      trackEvent("form_submit", { form: "contact_wizard", outcome: "error" });
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-2">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduceMotion ? { duration: 0.2 } : springUI}
        >
          <div
            aria-hidden
            className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-[var(--color-accent)]/10 text-3xl text-[var(--color-accent)]"
          >
            &#10003;
          </div>
          <p id={titleId} className="t-lead font-semibold text-[var(--color-text)] mb-8">
            {t("success")}
          </p>
          <Button onClick={onClose}>OK</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="t-eyebrow text-[var(--color-text-muted)] mb-4">
        {t("stepOf", { current: currentStep + 1, total: steps.length })}
      </div>

      <div
        className="w-full bg-[var(--color-border)] rounded-full h-1 mb-10 overflow-hidden"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
      >
        <motion.div
          className="bg-[var(--color-accent)] h-1 rounded-full"
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={reduceMotion ? { duration: 0.2 } : springUI}
        />
      </div>

      <motion.div layout transition={reduceMotion ? { duration: 0.2 } : springUI}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }}
          >
            <WizardStep
              step={steps[currentStep]}
              formData={formData}
              onFieldChange={setField}
              titleId={titleId}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {status === "error" && (
        <p role="alert" className="text-[var(--color-accent)] text-sm mt-5">
          {t("error")}
        </p>
      )}

      <div className="flex justify-between items-center gap-4 mt-10">
        {!isFirstStep ? (
          <Button variant="outline" onClick={prevStep}>
            {t("previous")}
          </Button>
        ) : (
          <div />
        )}
        <Button onClick={handleNext} disabled={status === "submitting"}>
          {status === "submitting" ? "..." : isLastStep ? t("submit") : t("next")}
        </Button>
      </div>
    </div>
  );
}
