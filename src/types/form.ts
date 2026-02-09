export interface FieldOption {
  value: string;
  labelKey: string;
}

export interface FormFieldConfig {
  name: string;
  type: "text" | "email" | "textarea" | "radio" | "checkbox";
  labelKey: string;
  required: boolean;
  options?: FieldOption[];
}

export interface WizardStepConfig {
  id: string;
  titleKey: string;
  fields: FormFieldConfig[];
}

export interface FormWizardConfig {
  steps: WizardStepConfig[];
}

export type FormData = Record<string, string | boolean>;
