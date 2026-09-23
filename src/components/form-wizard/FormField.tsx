"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { springUI } from "@/lib/motion";
import type { FormFieldConfig } from "@/types/form";

interface FormFieldProps {
  field: FormFieldConfig;
  value: string | boolean | string[] | undefined;
  onChange: (name: string, value: string | boolean | string[]) => void;
}

/** Border that lights up in the accent colour when a control is active. */
function ActiveBorder({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div className="relative p-[1px] rounded-[var(--radius-sm)]">
      <div className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
      <motion.div
        className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--color-accent)]"
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      />
      <div className="relative rounded-[calc(var(--radius-sm)-1px)] bg-[var(--color-bg)] z-10">
        {children}
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3.5 bg-transparent text-[var(--color-text)] text-base rounded-[calc(var(--radius-sm)-1px)]";

const labelClass = "block text-sm font-semibold text-[var(--color-text)] mb-2.5";

function RequiredMark() {
  return (
    <span aria-hidden className="text-[var(--color-accent)] ml-0.5">
      *
    </span>
  );
}

/** Shared tick used by the checkbox and radio indicators. */
function Tick({ shown }: { shown: boolean }) {
  return (
    <motion.svg
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      aria-hidden
      animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.5 }}
      transition={{ duration: 0.15 }}
    >
      <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

function CustomSelect({
  field,
  value,
  onChange,
}: {
  field: FormFieldConfig;
  value: string | undefined;
  onChange: (name: string, value: string) => void;
}) {
  const t = useTranslations();
  const label = t(field.labelKey);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const selectedOption = field.options?.find((o) => o.value === value);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const updateRect = useCallback(() => {
    if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
  }, []);

  const handleOpen = () => {
    updateRect();
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      // Escape closes the dropdown without reaching the modal behind it.
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function handleScroll() {
      updateRect();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, updateRect]);

  if (isMobile) {
    return (
      <div className="mb-5">
        {label && (
          <label className={labelClass}>
            {label} {field.required && <RequiredMark />}
          </label>
        )}
        <ActiveBorder active={!!value}>
          <select
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            className={`${inputClass} appearance-none cursor-pointer`}
          >
            <option value="" disabled>—</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </ActiveBorder>
      </div>
    );
  }

  return (
    <div className="mb-5">
      {label && (
        <label className={labelClass}>
          {label} {field.required && <RequiredMark />}
        </label>
      )}
      <ActiveBorder active={open || !!value}>
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left text-base bg-transparent rounded-[calc(var(--radius-sm)-1px)] cursor-pointer"
        >
          <span className={selectedOption ? "text-[var(--color-text)]" : "text-[var(--color-text-subtle)]"}>
            {selectedOption ? t(selectedOption.labelKey) : "—"}
          </span>
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0.15 } : springUI}
            className="flex-shrink-0 ml-2 text-[var(--color-text-muted)]"
          >
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </button>
      </ActiveBorder>

      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {open && rect && (
            <motion.div
              ref={dropdownRef}
              role="listbox"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
              transition={reduceMotion ? { duration: 0.12 } : springUI}
              style={{
                position: "fixed",
                top: rect.bottom + 6,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
                // Anchored to the trigger, so it grows out of the control.
                transformOrigin: "top center",
              }}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[0_2px_8px_rgba(20,16,16,0.06),0_16px_40px_-16px_rgba(20,16,16,0.3)] overflow-y-auto max-h-56 p-1"
            >
              {field.options?.map((option) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(field.name, option.value);
                      setOpen(false);
                    }}
                    className={`relative w-full px-3 py-2.5 text-left text-base rounded-[var(--radius-xs)] cursor-pointer transition-colors duration-100 focus-visible:outline-offset-[-2px] ${
                      isSelected
                        ? "bg-[var(--color-accent)]/10 text-[var(--color-text)]"
                        : "hover:bg-[var(--color-bg-tertiary)]"
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-between gap-3">
                      {t(option.labelKey)}
                      {isSelected && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden className="flex-shrink-0 text-[var(--color-accent)]">
                          <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default function FormField({ field, value, onChange }: FormFieldProps) {
  const t = useTranslations();
  const label = t(field.labelKey);
  const [focused, setFocused] = useState(false);

  switch (field.type) {
    case "text":
    case "email":
    case "tel":
      return (
        <div className="mb-5">
          <label className={labelClass}>
            {label} {field.required && <RequiredMark />}
          </label>
          <ActiveBorder active={focused}>
            <input
              type={field.type}
              value={(value as string) || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={inputClass}
              required={field.required}
            />
          </ActiveBorder>
        </div>
      );

    case "textarea":
      return (
        <div className="mb-5">
          {label && (
            <label className={labelClass}>
              {label} {field.required && <RequiredMark />}
            </label>
          )}
          <ActiveBorder active={focused}>
            <textarea
              value={(value as string) || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rows={4}
              className={`${inputClass} resize-y`}
              required={field.required}
            />
          </ActiveBorder>
        </div>
      );

    case "select":
      return <CustomSelect field={field} value={value as string | undefined} onChange={onChange} />;

    case "radio":
      return (
        <div className="mb-5">
          {label && (
            <label className={labelClass}>
              {label} {field.required && <RequiredMark />}
            </label>
          )}
          <div className="space-y-2.5">
            {field.options?.map((option) => {
              const selected = value === option.value;
              return (
                <ActiveBorder key={option.value} active={selected}>
                  <label
                    className={`relative flex items-center gap-3.5 px-4 py-3.5 rounded-[calc(var(--radius-sm)-1px)] cursor-pointer text-base transition-colors duration-150 ${
                      selected ? "bg-[var(--color-accent)]/[0.06]" : "hover:bg-[var(--color-bg-tertiary)]"
                    }`}
                  >
                    {/* Custom indicator — the native control is kept for
                        semantics and keyboard behaviour, visually hidden. */}
                    <input
                      type="radio"
                      name={field.name}
                      value={option.value}
                      checked={selected}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className="relative z-10 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-accent)] peer-focus-visible:ring-offset-2"
                      style={{
                        borderColor: selected ? "var(--color-accent)" : "var(--color-border)",
                        backgroundColor: selected ? "var(--color-accent)" : "transparent",
                      }}
                    >
                      <motion.span
                        className="block h-1.5 w-1.5 rounded-full bg-white"
                        animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.4 }}
                        transition={{ duration: 0.15 }}
                      />
                    </span>
                    <span className="relative z-10">{t(option.labelKey)}</span>
                  </label>
                </ActiveBorder>
              );
            })}
          </div>
        </div>
      );

    case "checkboxGroup": {
      const selected = (value as string[] | undefined) || [];
      return (
        <div className="mb-5">
          <label className={labelClass}>
            {label} {field.required && <RequiredMark />}
          </label>
          <div className="space-y-2.5">
            {field.options?.map((option) => {
              const isChecked = selected.includes(option.value);
              return (
                <ActiveBorder key={option.value} active={isChecked}>
                  <label
                    className={`relative flex items-center gap-3.5 px-4 py-3.5 rounded-[calc(var(--radius-sm)-1px)] cursor-pointer text-base transition-colors duration-150 ${
                      isChecked ? "bg-[var(--color-accent)]/[0.06]" : "hover:bg-[var(--color-bg-tertiary)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={isChecked}
                      onChange={() => {
                        const next = isChecked
                          ? selected.filter((v) => v !== option.value)
                          : [...selected, option.value];
                        onChange(field.name, next);
                      }}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className="relative z-10 grid h-5 w-5 flex-shrink-0 place-items-center rounded-[var(--radius-xs)] border transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-accent)] peer-focus-visible:ring-offset-2"
                      style={{
                        borderColor: isChecked ? "var(--color-accent)" : "var(--color-border)",
                        backgroundColor: isChecked ? "var(--color-accent)" : "transparent",
                      }}
                    >
                      <Tick shown={isChecked} />
                    </span>
                    <span className="relative z-10">{t(option.labelKey)}</span>
                  </label>
                </ActiveBorder>
              );
            })}
          </div>
        </div>
      );
    }

    case "checkbox": {
      const isChecked = (value as boolean) || false;
      return (
        <div className="mb-5">
          <label className="flex items-start gap-3.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onChange(field.name, e.target.checked)}
              required={field.required}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-[var(--radius-xs)] border transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-accent)] peer-focus-visible:ring-offset-2"
              style={{
                borderColor: isChecked ? "var(--color-accent)" : "var(--color-border)",
                backgroundColor: isChecked ? "var(--color-accent)" : "transparent",
              }}
            >
              <Tick shown={isChecked} />
            </span>
            <span className="text-sm leading-relaxed text-[var(--color-text-muted)]">
              {label}
              {field.privacyPolicyUrl && (
                <> — <a
                  href={field.privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] underline underline-offset-2 hover:opacity-70 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("formWizard.step3.dataConsentLink")}
                </a></>
              )}
              {field.required && <RequiredMark />}
            </span>
          </label>
        </div>
      );
    }

    default:
      return null;
  }
}
