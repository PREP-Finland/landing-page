"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline" | "onDark";
  size?: "default" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  // Feedback lives on the press, not the release: the scale is driven by
  // :active so it lands on pointer-down with no perceptible latency.
  const base =
    "group relative inline-flex items-center justify-center rounded-full font-semibold uppercase cursor-pointer " +
    "transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-out " +
    "active:scale-[0.97] active:duration-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const sizes = {
    default: "px-6 py-3 text-xs tracking-[0.14em]",
    lg: "px-9 py-4 text-sm tracking-[0.14em]",
  };

  const variants = {
    primary:
      "bg-[var(--color-accent)] text-white shadow-[0_2px_10px_-4px_rgba(202,19,42,0.6)] " +
      "hover:bg-[var(--color-accent-light)] hover:shadow-[0_8px_24px_-8px_rgba(202,19,42,0.55)]",
    outline:
      "border border-[var(--color-accent)] text-[var(--color-accent)] bg-transparent " +
      "hover:bg-[var(--color-accent)] hover:text-white",
    onDark:
      "border border-white/70 text-white bg-white/10 backdrop-blur-md material-dark " +
      "hover:bg-white hover:text-[var(--color-text)] hover:border-white",
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
