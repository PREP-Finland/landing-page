import { getTranslations } from "next-intl/server";
import { fetchRssFeed } from "@/lib/rss";
import Card from "@/components/ui/Card";
import BlogFeedClient from "./BlogFeedClient";

export default async function BlogFeedSection() {
  const t = await getTranslations("blog");
  const items = await fetchRssFeed("https://www.twopct.com/feed");

  return (
    <section id="blog" className="py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="font-[family-name:var(--font-raleway)] text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-6">{t("title")}</h2>
        {items.length === 0 ? (
          <p className="text-[var(--color-text)]/60">{t("noArticles")}</p>
        ) : (
          <BlogFeedClient items={items} readMoreText={t("readMore")} />
        )}
      </div>
    </section>
  );
}
