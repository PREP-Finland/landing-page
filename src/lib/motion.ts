/**
 * Shared motion vocabulary.
 *
 * Springs rather than fixed-duration curves, so anything a user can touch stays
 * interruptible and animates from its current on-screen value. `bounce: 0` is
 * the critically damped default; a little bounce is reserved for motion that
 * followed a real gesture (a drag release, a flick).
 */

export const springUI = { type: "spring", bounce: 0, duration: 0.4 } as const;
export const springSnappy = { type: "spring", bounce: 0, duration: 0.3 } as const;
export const springGesture = { type: "spring", bounce: 0.2, duration: 0.4 } as const;
export const springSheet = { type: "spring", bounce: 0.15, duration: 0.35 } as const;

/**
 * Apple's momentum projection (from the Designing Fluid Interfaces sample):
 * where a flick would come to rest, given its release velocity in px/s.
 * 0.998 is scroll-like deceleration; 0.99 is snappier, which suits a carousel
 * whose snap points are only one card apart.
 */
export function projectMomentum(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Longest window we look back over when estimating release velocity. */
const VELOCITY_WINDOW_MS = 60;
/** Below this the sample window is too short to divide by without blowing up. */
const MIN_VELOCITY_WINDOW_MS = 12;
const MAX_VELOCITY = 4000;

/**
 * Release velocity in px/s from a short position history.
 *
 * Measured over a bounded window rather than the first and last samples: a
 * stale point flattens a genuine flick, while two points a millisecond apart
 * (which high-refresh pointers and synthetic events both produce) would
 * otherwise report thousands of px/s for a nudge.
 */
export function releaseVelocity(history: { x: number; t: number }[]): number {
  if (history.length < 2) return 0;
  const last = history[history.length - 1];

  let first = history[0];
  for (let i = history.length - 1; i >= 0; i--) {
    first = history[i];
    if (last.t - history[i].t >= VELOCITY_WINDOW_MS) break;
  }

  const dt = last.t - first.t;
  if (dt < MIN_VELOCITY_WINDOW_MS) return 0;

  const v = ((last.x - first.x) / dt) * 1000;
  if (!Number.isFinite(v)) return 0;
  return Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, v));
}

/**
 * Progressive resistance past a boundary — real things slow before they stop,
 * so an edge reads as "responsive, but there's nothing more here" rather than
 * frozen.
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  const denominator = dimension + constant * Math.abs(overshoot);
  if (denominator === 0) return 0;
  const resisted = (overshoot * dimension * constant) / denominator;
  return Number.isFinite(resisted) ? resisted : 0;
}
