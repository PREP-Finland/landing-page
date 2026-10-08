"use client";

import { useState, useCallback } from "react";
import type { FormData, FormErrors, FormFieldConfig, WizardStepConfig } from "@/types/form";

export interface UseFormWizardReturn {
  currentStep: number;
  formData: FormData;
  /** Errors for the current step, set when the reader tries to move on. */
  errors: FormErrors;
  isFirstStep: boolean;
  isLastStep: boolean;
  setField: (name: string, value: string | boolean | string[]) => void;
  /** Validates the current step and advances; returns false if it is incomplete. */
  nextStep: () => boolean;
  prevStep: () => void;
  reset: () => void;
  validateCurrentStep: () => boolean;
}

// Mirrors the server-side check in submit-form.ts.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isVisible(field: FormFieldConfig, data: FormData): boolean {
  if (!field.showIf) return true;
  const cond = data[field.showIf];
  return Array.isArray(cond) ? cond.length > 0 : !!cond;
}

function isEmpty(value: FormData[string] | undefined): boolean {
  if (typeof value === "string") return value.trim() === "";
  return value === undefined || value === false || (Array.isArray(value) && value.length === 0);
}

function errorFor(field: FormFieldConfig, value: FormData[string] | undefined): FormErrors[string] | null {
  if (isEmpty(value)) {
    if (!field.required) return null;
    if (field.type === "checkbox") return "consent";
    if (field.type === "radio" || field.type === "select" || field.type === "checkboxGroup") return "choose";
    return "required";
  }
  if (field.type === "email" && !EMAIL.test(String(value).trim())) return "email";
  return null;
}

/**
 * Wizard state lives here rather than in the form itself, so the owner can
 * keep it alive across the dialog closing and reopening.
 */
export function useFormWizard(steps: WizardStepConfig[]): UseFormWizardReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const setField = useCallback((name: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Answering a field clears its complaint straight away.
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validateCurrentStep = useCallback(() => {
    const found: FormErrors = {};
    for (const field of steps[currentStep].fields) {
      if (!isVisible(field, formData)) continue;
      const error = errorFor(field, formData[field.name]);
      if (error) found[field.name] = error;
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  }, [currentStep, formData, steps]);

  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) return false;
    if (!isLastStep) setCurrentStep((prev) => prev + 1);
    return true;
  }, [isLastStep, validateCurrentStep]);

  const prevStep = useCallback(() => {
    setErrors({});
    if (!isFirstStep) setCurrentStep((prev) => prev - 1);
  }, [isFirstStep]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setFormData({});
    setErrors({});
  }, []);

  return {
    currentStep,
    formData,
    errors,
    isFirstStep,
    isLastStep,
    setField,
    nextStep,
    prevStep,
    reset,
    validateCurrentStep,
  };
}
