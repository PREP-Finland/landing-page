"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { UseFormWizardReturn } from "@/hooks/useFormWizard";
import { submitForm } from "@/app/actions/submit-form";
import { trackEvent } from "@/lib/analytics";
import WizardStep from "./WizardStep";
import Button from "@/components/ui/Button";
import { springUI } from "@/lib/motion";
import type { FormWizardConfig } from "@/types/form";

export type WizardStatus = "idle" | "submitting" | "success" | "error";

interface FormWizardProps {
  onClose: () => void;
  formWizardConfig: FormWizardConfig;
  /** Owned by the dialog, so answers survive it being closed and reopened. */
  wizard: UseFormWizardReturn;
  status: WizardStatus;
  setStatus: (status: WizardStatus) => void;
  titleId?: string;
  /** Phone bottom sheet: the actions sit in a bar pinned to the bottom. */
  isSheet?: boolean;
}

/**
 * Animates its real height to fit its content, so the sheet and dialog grow
 * and shrink smoothly between steps instead of snapping.
 */
function AutoHeight({ children }: { children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    // The 4px gutter keeps focus rings from being clipped by overflow-hidden.
    <motion.div
      initial={false}
      animate={{ height }}
      transition={reduceMotion ? { duration: 0 } : springUI}
      className="-m-1 overflow-hidden"
    >
      <div ref={innerRef} className="p-1">
        {children}
      </div>
    </motion.div>
  );
}

function Spinner() {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function FormWizard({
  onClose,
  formWizardConfig,
  wizard,
  status,
  setStatus,
  titleId,
  isSheet = false,
}: FormWizardProps) {
  const t = useTranslations("formWizard");
  const { steps } = formWizardConfig;
  const { currentStep, formData, errors, isFirstStep, isLastStep, setField, nextStep, prevStep, validateCurrentStep } =
    wizard;
  const reduceMotion = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  /** Set when the step changes, so the new heading takes focus once it mounts. */
  const focusHeading = useRef(false);
  /** Set when validation fails, so focus moves to the first problem. */
  const focusError = useRef(false);

  useEffect(() => {
    const step = steps[currentStep];
    trackEvent("form_step_view", {
      form: "contact_wizard",
      step_index: currentStep + 1,
      step_total: steps.length,
      step_id: step.id,
    });
  }, [currentStep, steps]);

  // Screen readers and keyboards land on the first field that needs fixing.
  useEffect(() => {
    if (!focusError.current) return;
    focusError.current = false;
    const first = Object.keys(errors)[0];
    if (!first) return;
    const control = formRef.current?.querySelector<HTMLElement>(
      `[data-field="${first}"] :is(input, select, textarea, button)`
    );
    control?.focus();
  }, [errors]);

  // Stable, so React only calls it when a step's heading mounts. A new
  // function each render would be re-run against the outgoing step's heading.
  const headingRef = useCallback((el: HTMLHeadingElement | null) => {
    if (el && focusHeading.current) {
      focusHeading.current = false;
      el.focus({ preventScroll: true });
    }
  }, []);

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      focusError.current = true;
      return;
    }
    setStatus("submitting");
    try {
      const result = await submitForm(formData);
      setStatus(result.success ? "success" : "error");
      trackEvent("form_submit", { form: "contact_wizard", outcome: result.success ? "success" : "error" });
    } catch {
      setStatus("error");
      trackEvent("form_submit", { form: "contact_wizard", outcome: "error" });
    }
  };

  // A real form, so Enter (or "Go" on a phone keyboard) moves on.
  const onFormSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    if (isLastStep) {
      handleSubmit();
    } else if (nextStep()) {
      focusHeading.current = true;
    } else {
      focusError.current = true;
    }
  };

  const onPrevious = () => {
    focusHeading.current = true;
    prevStep();
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-2 pb-8">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduceMotion ? { duration: 0.2 } : springUI}
        >
          <div
            aria-hidden
            className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
          >
            <svg width="24" height="20" viewBox="0 0 12 10" fill="none">
              <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p id={titleId} role="status" className="t-lead font-semibold text-[var(--color-text)] mb-8 text-balance">
            {t("success")}
          </p>
          <Button onClick={onClose}>{t("close")}</Button>
        </motion.div>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form ref={formRef} noValidate onSubmit={onFormSubmit} className="w-full max-w-lg mx-auto">
      {/* What this is and what happens next, before any question is asked. */}
      <header className={isSheet ? "" : "pr-10"}>
        <h2 id={titleId} className="t-eyebrow text-[var(--color-accent)]">
          {t("title")}
        </h2>
        {isFirstStep && (
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-text-muted)]">{t("intro")}</p>
        )}
        <div className="mt-6 flex items-center gap-4">
          <div
            className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]"
            role="progressbar"
            aria-label={t("progress")}
            aria-valuetext={t("stepOf", { current: currentStep + 1, total: steps.length })}
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={steps.length}
          >
            <motion.div
              className="h-1 rounded-full bg-[var(--color-accent)]"
              initial={false}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={reduceMotion ? { duration: 0.2 } : springUI}
            />
          </div>
          <span
            aria-hidden
            className="t-eyebrow text-[var(--color-text-muted)]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {t("stepOf", { current: currentStep + 1, total: steps.length })}
          </span>
        </div>
      </header>

      <div className="mt-8">
        <AutoHeight>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
              exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }}
            >
              <WizardStep
                ref={headingRef}
                step={steps[currentStep]}
                formData={formData}
                errors={errors}
                onFieldChange={setField}
              />
            </motion.div>
          </AnimatePresence>
        </AutoHeight>
      </div>

      {status === "error" && (
        <p role="alert" className="mt-5 text-sm font-medium text-[var(--color-accent)]">
          {t("error")}
        </p>
      )}

      {/* On a phone the actions stay under the thumb, pinned to the sheet's
          bottom edge; the primary action takes the full width. */}
      <div
        className={
          isSheet
            ? "sticky bottom-0 z-10 -mx-6 mt-8 border-t border-[var(--color-border)] bg-[var(--color-bg)] px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            : "mt-10"
        }
      >
        <div className="flex items-center gap-4">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrevious}
              className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 t-eyebrow text-[var(--color-text-muted)] cursor-pointer transition-colors duration-150 hover:text-[var(--color-text)]"
            >
              <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M7.5 2 3.5 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("previous")}
            </button>
          )}
          <Button
            type="submit"
            size={isSheet ? "lg" : "default"}
            disabled={submitting}
            aria-busy={submitting}
            className={`gap-2.5 ${isSheet ? "flex-1" : "ml-auto"}`}
          >
            {submitting && <Spinner />}
            {submitting ? t("submitting") : isLastStep ? t("submit") : t("next")}
          </Button>
        </div>
      </div>
    </form>
  );
}
