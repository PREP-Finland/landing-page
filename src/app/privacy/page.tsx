import path from "path";
import fs from "fs";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import MarkdownContent from "@/components/ui/MarkdownContent";

export default async function PrivacyPage() {
  const locale = await getLocale();
  const filename = locale === "fi" ? "privacy-notice-fi.md" : "privacy-notice-en.md";
  const filePath = path.join(process.cwd(), "content", filename);
  const content = fs.readFileSync(filePath, "utf-8");

  return (
    <div className="max-w-3xl mx-auto pt-8 pb-24 px-6">
      <Link
        href="/"
        className="text-xs font-light text-gray-400 hover:text-gray-600 transition-colors mb-10 inline-block tracking-widest uppercase"
      >
        ← Back
      </Link>
      <MarkdownContent content={content} className="prose" />
    </div>
  );
}
