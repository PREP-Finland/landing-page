import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/**
 * Flat config. `next lint` was removed in Next 16, so `npm run lint` calls
 * eslint directly and this file replaces the old .eslintrc.json.
 */
const config = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
];

export default config;
