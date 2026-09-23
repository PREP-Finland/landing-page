"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import FormWizard from "./FormWizard";
import { springSheet } from "@/lib/motion";
import type { FormWizardConfig } from "@/types/form";

interface FormWizardModalProps {
  open: boolean;
  onClose: () => void;
  formWizardConfig: FormWizardConfig;
  /** Where the sheet came from, so it scales out of the button that opened it. */
  origin?: { x: number; y: number } | null;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function FormWizardModal({
  open,
  onClose,
  formWizardConfig,
  origin = null,
}: FormWizardModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const reduceMotion = useReducedMotion();

  // Lock the page behind the sheet, without the content jumping as the
  // scrollbar disappears.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [open]);

  // Escape closes, Tab stays inside, and focus returns to whatever opened it.
  useEffect(() => {
    if (!open) return;
    restoreFocusTo.current = document.activeElement as HTMLElement | null;

    const focusFirst = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panelRef.current)?.focus();
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const list = Array.from(nodes).filter((n) => n.offsetParent !== null);
      if (list.length === 0) return;

      const first = list[0];
      const last = list[list.length - 1];
      const activeEl = document.activeElement;

      if (e.shiftKey && (activeEl === first || !panelRef.current?.contains(activeEl))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusFirst);
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusTo.current?.focus?.();
    };
  }, [open, onClose]);

  // Scale out of the trigger rather than the middle of the screen, so the
  // relationship between the button and the sheet stays obvious.
  const transformOrigin = origin
    ? `${(origin.x / window.innerWidth) * 100}% ${(origin.y / window.innerHeight) * 100}%`
    : "50% 50%";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Dim to focus: the task is modal, so the page behind recedes. */}
          <div
            className="material-dark absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            layout
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { ...springSheet, layout: springSheet }
            }
            style={{ transformOrigin }}
            className="relative z-10 bg-[var(--color-bg)] rounded-[var(--radius-lg)] w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto shadow-[0_4px_16px_rgba(20,16,16,0.08),0_32px_80px_-24px_rgba(20,16,16,0.45)] outline-none"
          >
            <div className="sticky top-0 right-0 z-10 flex justify-end bg-[var(--color-bg)] pt-4 pr-4">
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--color-text-subtle)] cursor-pointer transition-[background-color,color,transform] duration-150 ease-out hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text)] active:scale-95"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-8 pb-10 md:px-12 md:pb-12">
              <FormWizard onClose={onClose} formWizardConfig={formWizardConfig} titleId={titleId} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
