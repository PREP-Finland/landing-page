import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getTranslations } from "next-intl/server";
import { stripEmphasis } from "@/lib/emphasis";

export const alt = "PREP";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card. Built from assets already in the repo — the wordmark and the
 * hero headline — so a link pasted into a message renders as the brand rather
 * than a grey box.
 */
export default async function OpengraphImage() {
  const t = await getTranslations("hero");

  // Satori cannot parse variable fonts, so the card uses a static Raleway Bold
  // rather than the variable file the page itself is set in.
  const [logo, font] = await Promise.all([
    readFile(path.join(process.cwd(), "public/logo.svg")),
    readFile(path.join(process.cwd(), "src/lib/fonts/Raleway-Bold.ttf")),
  ]);

  // The wordmark carries the brand red as an inline fill on every path, which
  // would disappear into the red wash — repaint it white for the dark card.
  // Matched by pattern so a future logo swap does not silently break this.
  const logoSvg = logo.toString("utf8").replace(/fill:#[0-9a-fA-F]{6}/g, "fill:#ffffff");
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: "#3B3B3B",
          backgroundImage:
            "radial-gradient(1400px 1000px at 108% 128%, #EA3860 0%, #CA132A 26%, rgba(202,19,42,0.42) 48%, rgba(202,19,42,0.12) 64%, rgba(59,59,59,0) 80%)",
          fontFamily: "Raleway",
        }}
      >
        <img src={logoSrc} alt="PREP" width={260} height={57} />
        <div
          style={{
            display: "flex",
            fontSize: 46,
            lineHeight: 1.16,
            letterSpacing: "-0.022em",
            fontWeight: 700,
            color: "#ffffff",
            maxWidth: 1010,
          }}
        >
          {stripEmphasis(t("headline"))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Raleway", data: font, style: "normal", weight: 700 }],
    }
  );
}
