"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useFormWizard } from "@/hooks/useFormWizard";
import { submitForm } from "@/app/actions/submit-form";
import WizardStep from "./WizardStep";
import Button from "@/components/ui/Button";
import formWizardConfig from "../../../config/form-wizard.json";
import type { FormWizardConfig } from "@/types/form";

const config = formWizardConfig as FormWizardConfig;

interface FormWizardProps {
  onClose: () => void;
}

export default function FormWizard({ onClose }: FormWizardProps) {
  const t = useTranslations("formWizard");
  const { steps } = config;
  const {
    currentStep,
    formData,
    direction,
    isFirstStep,
    isLastStep,
    setField,
    nextStep,
    prevStep,
    reset,
    validateCurrentStep,
  } = useFormWizard(steps);

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

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
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-5xl mb-4">&#10003;</div>
          <p className="text-xl font-semibold mb-6">{t("success")}</p>
          <Button variant="outline" onClick={onClose}>
            OK
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-sm text-[var(--color-text)]/50 mb-6">
        {t("stepOf", { current: currentStep + 1, total: steps.length })}
      </div>

      <div className="w-full bg-[var(--color-border)] rounded-full h-1 mb-8">
        <div
          className="bg-[var(--color-accent)] h-1 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <WizardStep
            step={steps[currentStep]}
            formData={formData}
            onFieldChange={setField}
          />
        </motion.div>
      </AnimatePresence>

      {status === "error" && (
        <p className="text-red-500 text-sm mt-4">{t("error")}</p>
      )}

      <div className="flex justify-between mt-8">
        {!isFirstStep ? (
          <Button variant="outline" onClick={prevStep}>
            {t("previous")}
          </Button>
        ) : (
          <div />
        )}
        <Button
          onClick={handleNext}
          disabled={status === "submitting"}
        >
          {status === "submitting"
            ? "..."
            : isLastStep
            ? t("submit")
            : t("next")}
        </Button>
      </div>
    </div>
  );
}
