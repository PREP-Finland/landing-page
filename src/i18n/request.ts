import { getRequestConfig } from "next-intl/server";
import { loadMarkdownConfig } from "@/lib/loadMarkdownConfig";

/**
 * Finnish only for now. The English copy is being rewritten, so the language
 * toggle is removed and the locale is pinned rather than read from the
 * `locale` cookie — otherwise anyone who had already switched would be stuck
 * on a half-finished translation with no way back.
 *
 * To restore: read the cookie again here and put <LanguageToggle /> back in
 * the header (see git history).
 */
const LOCALE = "fi";

export default getRequestConfig(async () => ({
  locale: LOCALE,
  messages: loadMarkdownConfig(`messages/${LOCALE}.md`),
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}));
