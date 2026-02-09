import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
