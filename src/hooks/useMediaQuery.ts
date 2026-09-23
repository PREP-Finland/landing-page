import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query without a mount-time setState, so the value is
 * correct on the first client render instead of flipping a frame later.
 * Returns `false` during SSR, where no viewport exists to measure.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
