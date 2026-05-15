"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import "./cookies-consent.css";
import "./cookie-consent-overrides.css";

export default function CookieConsent() {
  const t = useTranslations("cookies");
  const initialized = useRef(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      const { CookiesConsent, manageGoogleTagManager } = await import(
        "@metamorfosilab/cookies-consent"
      );

      const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

      new CookiesConsent({
        expirationDays: 182,
        sameSite: "lax",
        position: "bottom-right",
        buttons: ["settings", "accept", "reject"],
        animation: true,
        hideDescription: false,
        content: {
          title: t("title"),
          message: t("message"),
          policy: t("policy"),
          policyLink: "/privacy",
          btnAccept: t("btnAccept"),
          btnReject: t("btnReject"),
          btnSettings: t("btnSettings"),
          btnDismiss: t("btnDismiss"),
          btnSettingsAccept: t("btnSettingsAccept"),
          btnSettingsSelectAll: t("btnSettingsSelectAll"),
          btnSettingsUnselectAll: t("btnSettingsUnselectAll"),
          settingsHeader: t("settingsHeader"),
        },
        cookies: [
          {
            name: "essential",
            title: t("essential.title"),
            description: t("essential.description"),
            checked: true,
            disabled: true,
          },
          {
            name: "analytics",
            title: t("analytics.title"),
            description: t("analytics.description"),
            checked: true,
            ...(gtmId
              ? { code: gtmId, manageFunction: manageGoogleTagManager }
              : {}),
          },
        ],
        callback: {
          first_load: () => setPending(true),
          load: () => setPending(false),
          accept: () => setPending(false),
          reject: () => setPending(false),
        },
      });
    })();
  }, [t]);

  return (
    <div
      aria-hidden
      data-cookie-backdrop
      className={`cookie-backdrop${pending ? " cookie-backdrop--visible" : ""}`}
    />
  );
}
