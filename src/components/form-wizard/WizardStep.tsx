"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import FormField from "./FormField";
import type { WizardStepConfig, FormData } from "@/types/form";

interface WizardStepProps {
  step: WizardStepConfig;
  formData: FormData;
  onFieldChange: (name: string, value: string | boolean | string[]) => void;
}

export default function WizardStep({ step, formData, onFieldChange }: WizardStepProps) {
  const t = useTranslations();

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">
        {t(step.titleKey)}
        {step.fields.some((f) => f.required && !t(f.labelKey)) && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </h3>
      {step.fields.map((field) => {
        if (field.showIf) {
          const condValue = formData[field.showIf];
          const isVisible = Array.isArray(condValue) ? condValue.length > 0 : !!condValue;
          return (
            <AnimatePresence key={field.name}>
              {isVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                  animate={{ opacity: 1, height: "auto", overflow: "hidden" }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <FormField
                    field={field}
                    value={formData[field.name] as string | boolean | string[] | undefined}
                    onChange={onFieldChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          );
        }
        return (
          <FormField
            key={field.name}
            field={field}
            value={formData[field.name] as string | boolean | string[] | undefined}
            onChange={onFieldChange}
          />
        );
      })}
    </div>
  );
}
