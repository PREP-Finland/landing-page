import Parser from "rss-parser";

export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image?: string;
}

const parser = new Parser({
  customFields: {
    item: [["enclosure", "enclosure"]],
  },
});

export async function fetchRssFeed(url: string): Promise<RssItem[]> {
  try {
    // Use fetch instead of parser.parseURL to avoid url.parse() deprecation
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const xml = await response.text();
    const feed = await parser.parseString(xml);

    return (feed.items || []).slice(0, 6).map((item) => ({
      title: item.title || "",
      link: item.link || "",
      description: stripHtml(item.contentSnippet || item.content || "").slice(0, 150) + "...",
      pubDate: item.pubDate || "",
      image: (item.enclosure as { url?: string })?.url || extractImageFromContent(item.content || ""),
    }));
  } catch (error) {
    console.error("Failed to fetch RSS feed:", error);
    return [];
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function extractImageFromContent(content: string): string | undefined {
  const match = content.match(/<img[^>]+src="([^"]+)"/);
  return match?.[1];
}
