import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { loadMarkdownConfig } from "@/lib/loadMarkdownConfig";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "fi";

  return {
    locale,
    messages: loadMarkdownConfig(`messages/${locale}.md`),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
});
