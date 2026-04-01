export interface FieldOption {
  value: string;
  labelKey: string;
}

export interface FormFieldConfig {
  name: string;
  type: "text" | "email" | "tel" | "textarea" | "radio" | "checkbox" | "checkboxGroup" | "select";
  labelKey: string;
  required: boolean;
  options?: FieldOption[];
  showIf?: string;
  privacyPolicyUrl?: string;
}

export interface WizardStepConfig {
  id: string;
  titleKey: string;
  fields: FormFieldConfig[];
}

export interface FormWizardConfig {
  steps: WizardStepConfig[];
}

export type FormData = Record<string, string | boolean | string[]>;
