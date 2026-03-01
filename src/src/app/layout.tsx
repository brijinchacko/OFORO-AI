import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
