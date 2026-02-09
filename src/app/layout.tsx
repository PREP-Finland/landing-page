import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { roboto, robotoCondensed } from "@/lib/fonts";
import Providers from "@/components/providers/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valmennus | Personal Coaching",
  description: "Henkilökohtaista valmennusta, joka toimii. Personal coaching that works.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${roboto.variable} ${robotoCondensed.variable} antialiased`}>
        <Providers locale={locale} messages={messages as Record<string, unknown>}>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
