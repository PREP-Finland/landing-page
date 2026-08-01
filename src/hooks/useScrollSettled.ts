import { useEffect, useState } from "react";

/**
 * True when the user is not actively scrolling. Flips to false on scroll and
 * back to true after `delay` ms of stillness — so videos start once you land
 * on a section rather than while scrolling past it.
 */
export function useScrollSettled(delay = 200) {
  const [settled, setSettled] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setSettled(false);
      clearTimeout(timer);
      timer = setTimeout(() => setSettled(true), delay);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [delay]);

  return settled;
}
