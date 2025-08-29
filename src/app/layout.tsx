import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "../ui";

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
