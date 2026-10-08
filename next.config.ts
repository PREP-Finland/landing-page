import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Pin the root to this project. Otherwise, when the repo is checked out as a
// worktree inside another copy of it, Next.js walks up to the outer lockfile
// and uses that directory as the root.
const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
};

export default withNextIntl(nextConfig);
