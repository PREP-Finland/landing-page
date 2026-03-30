import PageClient from "./PageClient";
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
      videosConfig={videosConfig}
      formWizardConfig={formWizardConfig}
    />
  );
}
