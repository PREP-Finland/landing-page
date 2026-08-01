import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether the referenced element is currently in the viewport.
 * Used to pause off-screen videos so only the visible one plays.
 */
export function useInView<T extends Element>(threshold = 0.5) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
