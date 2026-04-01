"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import type { FormFieldConfig } from "@/types/form";

interface FormFieldProps {
  field: FormFieldConfig;
  value: string | boolean | string[] | undefined;
  onChange: (name: string, value: string | boolean | string[]) => void;
}

function GradientBorderWrapper({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div className="relative p-[1px] rounded-[4px]">
      {/* Default border */}
      <div className="absolute inset-0 rounded-[4px] bg-[var(--color-border)]" />
      {/* Gradient border */}
      <motion.div
        className="absolute inset-0 rounded-[4px] bg-gradient-to-r from-[#CA132A] to-[#EA3860]"
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      />
      {/* Inner content area */}
      <div className="relative rounded-[3px] bg-[var(--color-bg)] z-10">
        {children}
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-transparent text-[var(--color-text)] text-xs focus:outline-none rounded-[3px]";

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
    function handleScroll() {
      updateRect();
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, updateRect]);

  if (isMobile) {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-xs font-semibold mb-2">
            {label} {field.required && <span className="text-red-500 text-base font-bold ml-0.5">*</span>}
          </label>
        )}
        <GradientBorderWrapper active={!!value}>
          <select
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            className="w-full px-4 py-3 bg-transparent text-[var(--color-text)] text-xs focus:outline-none rounded-[3px] appearance-none cursor-pointer"
          >
            <option value="" disabled>—</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </GradientBorderWrapper>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold mb-2">
          {label} {field.required && <span className="text-red-500 text-base font-bold ml-0.5">*</span>}
        </label>
      )}
      <GradientBorderWrapper active={open || !!value}>
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className="w-full px-4 py-3 flex items-center justify-between text-left bg-transparent focus:outline-none rounded-[3px] cursor-pointer"
        >
          <span className={selectedOption ? "text-[var(--color-text)]" : "text-[var(--color-text)]/40"}>
            {selectedOption ? t(selectedOption.labelKey) : "—"}
          </span>
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-shrink-0 ml-2 text-[var(--color-text)]/50"
          >
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </button>
      </GradientBorderWrapper>

      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {open && rect && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
              }}
              className="rounded-[4px] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg overflow-y-auto max-h-48"
            >
              {field.options?.map((option) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(field.name, option.value);
                      setOpen(false);
                    }}
                    className="relative w-full px-4 py-3 text-left cursor-pointer focus:outline-none"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#CA132A]/10 to-[#EA3860]/10"
                      animate={{ opacity: isSelected ? 1 : 0 }}
                      transition={{ duration: 0.15 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-[var(--color-text)]/5"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: isSelected ? 0 : 1 }}
                      transition={{ duration: 0.1 }}
                    />
                    <span className="relative z-10 flex items-center justify-between">
                      {t(option.labelKey)}
                      {isSelected && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" className="flex-shrink-0">
                          <path d="M1 5L4.5 8.5L11 1.5" stroke="url(#selectGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <defs>
                            <linearGradient id="selectGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#CA132A" />
                              <stop offset="100%" stopColor="#EA3860" />
                            </linearGradient>
                          </defs>
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
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2">
            {label} {field.required && <span className="text-red-500 text-base font-bold ml-0.5">*</span>}
          </label>
          <GradientBorderWrapper active={focused}>
            <input
              type={field.type}
              value={(value as string) || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={inputClass}
              required={field.required}
            />
          </GradientBorderWrapper>
        </div>
      );

    case "textarea":
      return (
        <div className="mb-4">
          {label && (
            <label className="block text-xs font-semibold mb-2">
              {label} {field.required && <span className="text-red-500 text-base font-bold ml-0.5">*</span>}
            </label>
          )}
          <GradientBorderWrapper active={focused}>
            <textarea
              value={(value as string) || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rows={4}
              className={inputClass}
              required={field.required}
            />
          </GradientBorderWrapper>
        </div>
      );

    case "select":
      return <CustomSelect field={field} value={value as string | undefined} onChange={onChange} />;

    case "radio":
      return (
        <div className="mb-4">
          {label && (
            <label className="block text-xs font-semibold mb-3">
              {label} {field.required && <span className="text-red-500 text-base font-bold ml-0.5">*</span>}
            </label>
          )}
          <div className="space-y-2">
            {field.options?.map((option) => {
              const selected = value === option.value;
              return (
                <GradientBorderWrapper key={option.value} active={selected}>
                  <label className="flex items-center gap-3 p-3 rounded-[3px] cursor-pointer">
                    <motion.div
                      className="absolute inset-0 rounded-[3px] bg-gradient-to-r from-[#CA132A]/10 to-[#EA3860]/10"
                      animate={{ opacity: selected ? 1 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    />
                    <input
                      type="radio"
                      name={field.name}
                      value={option.value}
                      checked={selected}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      className="relative z-10 accent-[#CA132A]"
                    />
                    <span className="relative z-10">{t(option.labelKey)}</span>
                  </label>
                </GradientBorderWrapper>
              );
            })}
          </div>
        </div>
      );

    case "checkboxGroup": {
      const selected = (value as string[] | undefined) || [];
      return (
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-3">
            {label} {field.required && <span className="text-red-500 text-base font-bold ml-0.5">*</span>}
          </label>
          <div className="space-y-2">
            {field.options?.map((option) => {
              const isChecked = selected.includes(option.value);
              return (
                <GradientBorderWrapper key={option.value} active={isChecked}>
                  <label className="flex items-center gap-3 p-3 rounded-[3px] cursor-pointer">
                    <motion.div
                      className="absolute inset-0 rounded-[3px] bg-gradient-to-r from-[#CA132A]/10 to-[#EA3860]/10"
                      animate={{ opacity: isChecked ? 1 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    />
                    <div className="relative z-10 w-5 h-5 flex-shrink-0">
                      <motion.div
                        className="w-5 h-5 rounded-[3px] flex items-center justify-center"
                        animate={
                          isChecked
                            ? { background: "linear-gradient(to right, #CA132A, #EA3860)", borderColor: "transparent" }
                            : { background: "transparent", borderColor: "var(--color-border)" }
                        }
                        style={{ border: "1px solid var(--color-border)" }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                      >
                        <motion.svg
                          width="12"
                          height="10"
                          viewBox="0 0 12 10"
                          fill="none"
                          animate={{ opacity: isChecked ? 1 : 0, scale: isChecked ? 1 : 0.5 }}
                          transition={{ duration: 0.15 }}
                        >
                          <path
                            d="M1 5L4.5 8.5L11 1.5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      </motion.div>
                    </div>
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
                      className="sr-only"
                    />
                    <span className="relative z-10">{t(option.labelKey)}</span>
                  </label>
                </GradientBorderWrapper>
              );
            })}
          </div>
        </div>
      );
    }

    case "checkbox":
      return (
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative w-5 h-5 flex-shrink-0">
              <input
                type="checkbox"
                checked={(value as boolean) || false}
                onChange={(e) => onChange(field.name, e.target.checked)}
                required={field.required}
                className="sr-only"
              />
              <motion.div
                className="w-5 h-5 rounded-[3px] flex items-center justify-center pointer-events-none"
                animate={
                  value
                    ? { background: "linear-gradient(to right, #CA132A, #EA3860)", borderColor: "transparent" }
                    : { background: "transparent", borderColor: "var(--color-border)" }
                }
                style={{ border: "1px solid var(--color-border)" }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
              >
                <motion.svg
                  width="12"
                  height="10"
                  viewBox="0 0 12 10"
                  fill="none"
                  animate={{ opacity: value ? 1 : 0, scale: value ? 1 : 0.5 }}
                  transition={{ duration: 0.15 }}
                >
                  <path
                    d="M1 5L4.5 8.5L11 1.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </motion.div>
            </div>
            <span className="text-xs">
              {label}
              {field.privacyPolicyUrl && (
                <> — <a
                  href={field.privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-70 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("formWizard.step3.dataConsentLink")}
                </a></>
              )}
              {field.required && <span className="text-red-500 text-base font-bold ml-0.5">*</span>}
            </span>
          </label>
        </div>
      );

    default:
      return null;
  }
}
