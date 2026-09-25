import type { ReactNode } from "react";

type Surface = "base" | "secondary" | "tertiary" | "dark";

const surfaces: Record<Surface, string> = {
  base: "bg-[var(--color-bg)] text-[var(--color-text)]",
  secondary: "bg-[var(--color-bg-secondary)] text-[var(--color-text)]",
  tertiary: "bg-[var(--color-bg-tertiary)] text-[var(--color-text)]",
  dark: "bg-[var(--color-text)] text-white",
};

interface SectionProps {
  id?: string;
  surface?: Surface;
  children: ReactNode;
  /** Escapes the inner gutter for full-bleed content such as the reel stage. */
  bleed?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Every section shares one outer rail, so headings line up down the page
 * instead of sliding left and right as the measure changes. Sections that read
 * (prose, FAQ) narrow their *content* with `<Measure>` rather than re-centring
 * a narrower container, which would shift their left edge.
 */
export default function Section({
  id,
  surface = "base",
  children,
  bleed = false,
  className = "",
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${surfaces[surface]} ${className}`}
      style={{ paddingTop: "var(--section-y)", paddingBottom: "var(--section-y)" }}
      {...rest}
    >
      <div className={bleed ? "" : "max-w-6xl mx-auto px-6"}>{children}</div>
    </section>
  );
}

/** A reading measure that keeps the shared left edge. */
export function Measure({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`max-w-3xl ${className}`}>{children}</div>;
}
