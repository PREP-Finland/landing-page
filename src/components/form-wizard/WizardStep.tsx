"use client";

import { useTranslations } from "next-intl";
import FormField from "./FormField";
import type { WizardStepConfig, FormData } from "@/types/form";

interface WizardStepProps {
  step: WizardStepConfig;
  formData: FormData;
  onFieldChange: (name: string, value: string | boolean) => void;
}

export default function WizardStep({ step, formData, onFieldChange }: WizardStepProps) {
  const t = useTranslations();

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">{t(step.titleKey)}</h3>
      {step.fields.map((field) => (
        <FormField
          key={field.name}
          field={field}
          value={formData[field.name]}
          onChange={onFieldChange}
        />
      ))}
    </div>
  );
}
