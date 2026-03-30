"use client";

import { useState, useCallback } from "react";
import type { FormData, WizardStepConfig } from "@/types/form";

interface UseFormWizardReturn {
  currentStep: number;
  formData: FormData;
  direction: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  setField: (name: string, value: string | boolean | string[]) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  reset: () => void;
  validateCurrentStep: () => boolean;
}

export function useFormWizard(steps: WizardStepConfig[]): UseFormWizardReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [direction, setDirection] = useState(1);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const setField = useCallback((name: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const validateCurrentStep = useCallback(() => {
    const step = steps[currentStep];
    for (const field of step.fields) {
      if (field.showIf) {
        const condValue = formData[field.showIf];
        const isVisible = Array.isArray(condValue) ? condValue.length > 0 : !!condValue;
        if (!isVisible) continue;
      }
      if (field.required) {
        const value = formData[field.name];
        if (value === undefined || value === "" || value === false || (Array.isArray(value) && value.length === 0)) {
          return false;
        }
      }
    }
    return true;
  }, [currentStep, formData, steps]);

  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) return false;
    if (!isLastStep) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
    return true;
  }, [isLastStep, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setFormData({});
    setDirection(1);
  }, []);

  return {
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
  };
}
