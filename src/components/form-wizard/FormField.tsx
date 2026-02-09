"use client";

import { useTranslations } from "next-intl";
import type { FormFieldConfig } from "@/types/form";

interface FormFieldProps {
  field: FormFieldConfig;
  value: string | boolean | undefined;
  onChange: (name: string, value: string | boolean) => void;
}

export default function FormField({ field, value, onChange }: FormFieldProps) {
  const t = useTranslations();

  const label = t(field.labelKey);
  const inputClass =
    "w-full px-4 py-3 rounded-[4px] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors";

  switch (field.type) {
    case "text":
    case "email":
      return (
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            {label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={field.type}
            value={(value as string) || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={inputClass}
            required={field.required}
          />
        </div>
      );

    case "textarea":
      return (
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            {label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            rows={4}
            className={inputClass}
            required={field.required}
          />
        </div>
      );

    case "radio":
      return (
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-3">
            {label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 rounded-[4px] border cursor-pointer transition-colors ${
                  value === option.value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                    : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
                }`}
              >
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  className="accent-[var(--color-accent)]"
                />
                <span>{t(option.labelKey)}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "checkbox":
      return (
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={(value as boolean) || false}
              onChange={(e) => onChange(field.name, e.target.checked)}
              className="w-5 h-5 accent-[var(--color-accent)]"
              required={field.required}
            />
            <span className="text-sm">
              {label} {field.required && <span className="text-red-500">*</span>}
            </span>
          </label>
        </div>
      );

    default:
      return null;
  }
}
