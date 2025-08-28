import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "../ui";
import Script from "next/script";
import { PREVIEW_HOST_PATTERN } from "../lib/config";

export const metadata: Metadata = {
  title: "Vibes",
  description: "App directory for vibes",
};

export default function RootLayout(
  { children }: { children: React.ReactNode }
) {
  return (
    <html lang="en">
      <body>
        <Script
          src="/preview-token.js"
          strategy="beforeInteractive"
          data-preview-host-pattern={PREVIEW_HOST_PATTERN.source}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
