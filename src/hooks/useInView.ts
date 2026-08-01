import { useCallback, useRef, useState } from "react";

/**
 * Tracks whether the referenced element is currently in the viewport.
 * Used to pause off-screen videos so only the visible one plays.
 *
 * Uses a callback ref so the observer attaches whenever the node mounts —
 * important for elements that render after an initial `return null` (e.g. once
 * async data has loaded), where a mount-only effect would miss the element.
 */
export function useInView<T extends Element>(threshold = 0.5, rootMargin = "0px") {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      if (!node) return;
      const observer = new IntersectionObserver(
        ([entry]) => setInView(entry.isIntersecting),
        { threshold, rootMargin }
      );
      observer.observe(node);
      observerRef.current = observer;
    },
    [threshold, rootMargin]
  );

  return { ref, inView };
}
