/**
 * Lightweight emphasis markers for headline copy.
 *
 * Copy lives in `messages/*.md` as a single sentence with `**…**` around the
 * phrases to stress, so the words and their emphasis stay in one place and the
 * translator edits one string. Plain-text consumers (page metadata, the share
 * card) strip the markers instead of keeping a duplicate copy of the sentence.
 */

export interface EmphasisSegment {
  text: string;
  emphasised: boolean;
}

/** Splits `a **b** c` into alternating plain and emphasised segments. */
export function splitEmphasis(text: string): EmphasisSegment[] {
  return text
    .split("**")
    .map((part, i) => ({ text: part, emphasised: i % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);
}

/** The same string with the markers removed. */
export function stripEmphasis(text: string): string {
  return text.replaceAll("**", "");
}
