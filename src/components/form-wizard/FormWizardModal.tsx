"use client";

import { useEffect, useId, useRef } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import FormWizard from "./FormWizard";
import { projectMomentum, releaseVelocity, rubberband, springSheet } from "@/lib/motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
  const isSheet = useMediaQuery("(max-width: 767px), (pointer: coarse)");

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

  // The sheet follows the thumb 1:1 while held, and the scrim lightens with it
  // so the dismissal reads as continuous rather than binary.
  const dragY = useMotionValue(0);
  const scrimOpacity = useTransform(dragY, [0, 400], [1, 0.25], { clamp: true });
  const grab = useRef<{ id: number; startY: number; history: { x: number; t: number }[] } | null>(null);

  const onGrabDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    grab.current = { id: e.pointerId, startY: e.clientY, history: [{ x: e.clientY, t: e.timeStamp }] };
  };

  const onGrabMove = (e: React.PointerEvent) => {
    const g = grab.current;
    if (!g || g.id !== e.pointerId) return;
    const dy = e.clientY - g.startY;
    g.history.push({ x: e.clientY, t: e.timeStamp });
    if (g.history.length > 6) g.history.shift();
    // Downward is free; upward resists, because there is nothing above.
    const h = panelRef.current?.offsetHeight ?? 600;
    dragY.set(dy >= 0 ? dy : -rubberband(-dy, h));
  };

  const onGrabEnd = (e: React.PointerEvent) => {
    const g = grab.current;
    if (!g || g.id !== e.pointerId) return;
    grab.current = null;
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }

    const velocity = releaseVelocity(g.history);
    const h = panelRef.current?.offsetHeight ?? 600;
    // Dismiss on where the throw is going, not where the thumb stopped.
    const projected = dragY.get() + projectMomentum(velocity, 0.99);

    if (projected > h * 0.4 || velocity > 700) {
      onClose();
    } else {
      // Settle home carrying the gesture's own velocity, so there is no seam.
      animate(dragY, 0, { type: "spring", bounce: 0.1, duration: 0.4, velocity });
    }
  };

  // On a phone the wizard is a bottom sheet you can throw away with your
  // thumb; on a pointer device it stays a centred dialog anchored to its
  // trigger. The sheet enters and leaves along the same axis it is dragged.
  const sheetEnter = isSheet
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
    : {
        initial: reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 },
        animate: reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 },
        exit: reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.2 }}
          className={`fixed inset-0 z-[100] flex justify-center ${
            isSheet ? "items-end" : "items-center"
          }`}
        >
          {/* Dim to focus: the task is modal, so the page behind recedes. */}
          <motion.div
            className="material-dark absolute inset-0 bg-black/60 backdrop-blur-md"
            style={isSheet ? { opacity: scrimOpacity } : undefined}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            {...sheetEnter}
            layout={!isSheet}
            transition={reduceMotion ? { duration: 0.15 } : { ...springSheet, layout: springSheet }}
            style={{ transformOrigin, y: isSheet ? dragY : undefined }}
            className={
              isSheet
                ? "relative z-10 w-full bg-[var(--color-bg)] rounded-t-[var(--radius-xl)] max-h-[92svh] overflow-y-auto shadow-[0_-8px_40px_-12px_rgba(20,16,16,0.45)] outline-none"
                : "relative z-10 bg-[var(--color-bg)] rounded-[var(--radius-lg)] w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto shadow-[0_4px_16px_rgba(20,16,16,0.08),0_32px_80px_-24px_rgba(20,16,16,0.45)] outline-none"
            }
          >
            {isSheet && (
              // Grab handle: the whole strip is the drag surface, so the sheet
              // can be thrown down without fighting the content's scroll.
              <div
                onPointerDown={onGrabDown}
                onPointerMove={onGrabMove}
                onPointerUp={onGrabEnd}
                onPointerCancel={onGrabEnd}
                className="sticky top-0 z-20 flex h-11 cursor-grab touch-none items-center justify-center bg-[var(--color-bg)] active:cursor-grabbing"
              >
                <span aria-hidden className="h-1 w-10 rounded-full bg-[var(--color-border)]" />
              </div>
            )}
            <div
              className={`sticky z-10 flex justify-end bg-[var(--color-bg)] pr-4 ${
                isSheet ? "top-11 pt-1" : "top-0 pt-4"
              }`}
            >
              <button
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center rounded-full text-[var(--color-text-muted)] cursor-pointer transition-[background-color,color,transform] duration-150 ease-out hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text)] active:scale-95"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-6 pb-12 md:px-12 md:pb-12">
              <FormWizard onClose={onClose} formWizardConfig={formWizardConfig} titleId={titleId} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
