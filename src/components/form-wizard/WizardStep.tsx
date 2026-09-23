"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import FormField from "./FormField";
import { springUI } from "@/lib/motion";
import type { WizardStepConfig, FormData } from "@/types/form";

interface WizardStepProps {
  step: WizardStepConfig;
  formData: FormData;
  onFieldChange: (name: string, value: string | boolean | string[]) => void;
  titleId?: string;
}

export default function WizardStep({ step, formData, onFieldChange, titleId }: WizardStepProps) {
  const t = useTranslations();
  const reduceMotion = useReducedMotion();

  // Some steps have a single unlabelled required field, so the requirement is
  // marked on the step title instead.
  const requiredOnTitle = step.fields.some((f) => f.required && !t(f.labelKey));

  return (
    <div>
      <h3 id={titleId} className="t-h3 text-[var(--color-text)] mb-7">
        {t(step.titleKey)}
        {requiredOnTitle && (
          <span aria-hidden className="text-[var(--color-accent)] font-normal ml-1.5 align-super text-base">
            *
          </span>
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
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={reduceMotion ? { duration: 0.2 } : springUI}
                  className="overflow-hidden"
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
