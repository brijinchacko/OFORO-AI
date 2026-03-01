import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import PlanProvider from "@/components/PlanProvider";
import { UpgradePrompt } from "@/components/PlanProvider";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "Oforo AI — Intelligence That Works",
  description:
    "Oforo is an AI company building intelligent agents for industrial automation, global discovery, and career development. Based in Milton Keynes, UK.",
  keywords: [
    "AI",
    "artificial intelligence",
    "PLC programming",
    "AI search",
    "career AI",
    "Oforo",
  ],
  icons: {
    icon: "/OFORO_ICON.png",
    apple: "/OFORO_ICON.png",
  },
  openGraph: {
    title: "Oforo AI — Intelligence That Works",
    description:
      "Building intelligent agents for industrial automation, global discovery, and career development.",
    type: "website",
    url: "https://oforo.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <ThemeProvider>
          <AuthProvider>
            <PlanProvider>
              {children}
              <UpgradePrompt />
              <CookieConsent />
            </PlanProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
