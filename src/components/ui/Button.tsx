"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "motion/react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline";
  size?: "default" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-semibold rounded-full cursor-pointer uppercase tracking-[2.5px] disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    default: "px-4 py-2.5 text-xs",
    lg: "px-6 py-3 text-xs",
  };

  if (variant === "outline") {
    return (
      <motion.button
        className={`relative overflow-hidden border-2 border-[#CA132A] text-[#CA132A] ${base} ${sizes[size]} ${className}`}
        whileHover="hover"
        initial="rest"
        animate="rest"
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-[#CA132A] to-[#EA3860]"
          variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        />
        <motion.span
          className="relative z-10"
          variants={{ rest: { color: "#CA132A" }, hover: { color: "#ffffff" } }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {children}
        </motion.span>
      </motion.button>
    );
  }

  return (
    <button
      className={`bg-gradient-to-r from-[#CA132A] to-[#EA3860] text-white transition-opacity duration-200 hover:opacity-90 ${base} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
