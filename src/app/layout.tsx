import type { Metadata } from "next";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { futuraPtLight, raleway } from "@/lib/fonts";
import { stripEmphasis } from "@/lib/emphasis";
import Providers from "@/components/providers/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/layout/CookieConsent";
import "./globals.css";

const SITE_NAME = "PREP";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("hero");

  // Title and description follow the active locale rather than being a single
  // static bilingual string.
  const title = `${SITE_NAME} | ${t("subheadline")}`;
  const description = stripEmphasis(t("headline"));

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://prep.fi"),
    title,
    description,
    applicationName: SITE_NAME,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "fi" ? "fi_FI" : "en_US",
      title,
      description,
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <html lang={locale}>
      <body className={`${futuraPtLight.variable} ${raleway.variable} antialiased`}>
        <Providers locale={locale} messages={messages as Record<string, unknown>} timeZone={timeZone}>
          <Header />
          <main>{children}</main>
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
