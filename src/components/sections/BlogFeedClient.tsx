"use client";

import ScrollFadeIn from "@/components/ui/ScrollFadeIn";
import Card from "@/components/ui/Card";
import type { RssItem } from "@/lib/rss";

interface BlogFeedClientProps {
  items: RssItem[];
  readMoreText: string;
}

export default function BlogFeedClient({ items, readMoreText }: BlogFeedClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <ScrollFadeIn key={item.link} delay={index * 0.1}>
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="block h-full">
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              {item.image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <p className="text-sm text-[var(--color-text)]/50 mb-2">
                  {new Date(item.pubDate).toLocaleDateString("fi-FI")}
                </p>
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 normal-case">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--color-text)]/70 mb-4 line-clamp-3">
                  {item.description}
                </p>
                <span className="text-sm font-semibold text-[var(--color-accent)]">
                  {readMoreText} &rarr;
                </span>
              </div>
            </Card>
          </a>
        </ScrollFadeIn>
      ))}
    </div>
  );
}
