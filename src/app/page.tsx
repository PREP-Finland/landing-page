import PageClient from "./PageClient";
import BlogFeedSection from "@/components/sections/BlogFeedSection";
import { loadMarkdownConfig } from "@/lib/loadMarkdownConfig";
import type { FormWizardConfig } from "@/types/form";

interface VideosConfig {
  hero: { src: string; poster: string };
}

export const revalidate = 3600;

export default function Home() {
  const videosConfig = loadMarkdownConfig<VideosConfig>("config/videos.md");
  const formWizardConfig = loadMarkdownConfig<FormWizardConfig>("config/form-wizard.md");

  return (
    <PageClient
      blogSection={<BlogFeedSection />}
      videosConfig={videosConfig}
      formWizardConfig={formWizardConfig}
    />
  );
}
