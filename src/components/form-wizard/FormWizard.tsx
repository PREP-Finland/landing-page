"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useFormWizard } from "@/hooks/useFormWizard";
import { submitForm } from "@/app/actions/submit-form";
import WizardStep from "./WizardStep";
import Button from "@/components/ui/Button";
import type { FormWizardConfig } from "@/types/form";

interface FormWizardProps {
  onClose: () => void;
  formWizardConfig: FormWizardConfig;
}

export default function FormWizard({ onClose, formWizardConfig }: FormWizardProps) {
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
          <p className="text-base md:text-lg font-semibold mb-6">{t("success")}</p>
          <Button onClick={onClose}>
            OK
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-xs text-[var(--color-text)]/50 mb-6">
        {t("stepOf", { current: currentStep + 1, total: steps.length })}
      </div>

      <div className="w-full bg-[var(--color-border)] rounded-full h-1 mb-8">
        <div
          className="bg-gradient-to-r from-[#CA132A] to-[#EA3860] h-1 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      <motion.div layout transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
          >
            <WizardStep
              step={steps[currentStep]}
              formData={formData}
              onFieldChange={setField}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

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
