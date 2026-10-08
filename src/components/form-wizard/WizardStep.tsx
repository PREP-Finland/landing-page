"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import FormField from "./FormField";
import type { WizardStepConfig, FormData, FormErrors } from "@/types/form";

/** Unlabelled fields point at the step heading by this id. */
export const STEP_TITLE_ID = "wizard-step-title";

interface WizardStepProps {
  step: WizardStepConfig;
  formData: FormData;
  errors: FormErrors;
  onFieldChange: (name: string, value: string | boolean | string[]) => void;
}

/** The heading is the ref, so focus can land on it when the step changes. */
const WizardStep = forwardRef<HTMLHeadingElement, WizardStepProps>(function WizardStep(
  { step, formData, errors, onFieldChange },
  headingRef
) {
  const t = useTranslations();

  // Some steps have a single unlabelled required field, so the requirement is
  // marked on the step title instead.
  const requiredOnTitle = step.fields.some((f) => f.required && !t(f.labelKey));

  const renderField = (field: WizardStepConfig["fields"][number]) => (
    <FormField
      field={field}
      value={formData[field.name] as string | boolean | string[] | undefined}
      onChange={onFieldChange}
      error={errors[field.name] ? t(`formWizard.errors.${errors[field.name]}`) : undefined}
    />
  );

  return (
    <div>
      <h3
        ref={headingRef}
        id={STEP_TITLE_ID}
        tabIndex={-1}
        className="t-h3 text-[var(--color-text)] mb-7 outline-none"
      >
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
          // Fades only: the wizard's height container animates the space it needs.
          return (
            <AnimatePresence key={field.name} initial={false}>
              {isVisible && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.25, delay: 0.08 } }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                >
                  {renderField(field)}
                </motion.div>
              )}
            </AnimatePresence>
          );
        }
        return <div key={field.name}>{renderField(field)}</div>;
      })}
    </div>
  );
});

export default WizardStep;
