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
  /** Autofill hint, e.g. "name", "email", "tel". */
  autoComplete?: string;
}

export interface WizardStepConfig {
  id: string;
  titleKey: string;
  fields: FormFieldConfig[];
}

export interface FormWizardConfig {
  steps: WizardStepConfig[];
}

/** Message keys (under `formWizard.errors`) for fields that failed validation. */
export type FormErrors = Record<string, "choose" | "required" | "email" | "consent">;

export type FormData = Record<string, string | boolean | string[]>;
