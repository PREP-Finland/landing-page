import PageClient from "./PageClient";
import BlogFeedSection from "@/components/sections/BlogFeedSection";

export const revalidate = 3600;

export default function Home() {
  return (
    <PageClient blogSection={<BlogFeedSection />} />
  );
}
