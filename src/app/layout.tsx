import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import PlanProvider from "@/components/PlanProvider";
import { UpgradePrompt } from "@/components/PlanProvider";
import CookieConsent from "@/components/CookieConsent";
import { Toaster } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://oforo.ai"),
  title: {
    default: "Oforo AI — Intelligence That Works | AI Company UK & India",
    template: "%s | Oforo AI",
  },
  description:
    "Oforo is an AI company building intelligent agents for chat, search, industrial automation, and career development. Free AI chatbot with 8+ models including GPT-4o, Claude, Gemini & DeepSeek. Features auto model routing, side-by-side comparison, voice chat, canvas whiteboard, task hub, file analysis, and web search. Based in Milton Keynes, UK & Bangalore, India.",
  keywords: [
    "Oforo", "Oforo AI", "Oforo chatbot", "oforo.ai",
    "AI company UK", "AI company Milton Keynes", "AI startup UK",
    "AI company Bangalore", "AI company India", "AI company in Bangalore",
    "artificial intelligence company United Kingdom",
    "ChatGPT alternative", "Perplexity alternative", "Claude alternative", "Gemini alternative",
    "free AI chatbot", "best AI chatbot 2026", "AI chat online",
    "AI search engine", "AI-powered search", "AI chat with web search",
    "AI voice chat", "AI file analysis", "AI canvas whiteboard",
    "AI task manager", "AI agents", "AI automation tools",
    "multi-model AI platform", "real-time AI chat", "AI streaming responses",
    "industrial automation AI", "PLC programming AI", "career development AI",
    "AI for manufacturing", "AI discovery platform",
    "AI API", "AI developer tools", "enterprise AI platform", "AI SaaS platform",
    "AI chatbot with file upload", "AI chatbot with voice support",
    "AI platform with multiple models", "best free AI chatbot",
    "AI model comparison tool", "compare AI models side by side",
    "auto model routing AI", "smart AI model selection",
    "AI personalization", "AI that learns your preferences",
    "AI canvas drawing tool", "AI whiteboard collaboration",
    "AI import ChatGPT conversations", "switch from ChatGPT to Oforo",
    "GPT-4o alternative", "Claude alternative chat", "DeepSeek alternative",
    "Gemini alternative chat", "Llama chat online",
    "Wartens", "LADX", "SEEKOF", "NXTED",
  ],
  icons: {
    icon: "/OFORO_ICON.png",
    apple: "/OFORO_ICON.png",
  },
  openGraph: {
    title: "Oforo AI — Intelligence That Works",
    description:
      "Free AI chatbot with 6 models, voice chat, web search, file analysis, and collaborative workspaces. Built by Oforo, an AI company in Milton Keynes, UK & Bangalore, India.",
    type: "website",
    url: "https://oforo.ai",
    siteName: "Oforo AI",
    locale: "en_GB",
    images: [
      {
        url: "/OFORO_ICON.png",
        width: 512,
        height: 512,
        alt: "Oforo AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oforo AI — Intelligence That Works",
    description:
      "Free AI chatbot with multiple models, voice chat, web search & file analysis. ChatGPT & Perplexity alternative.",
    images: ["/OFORO_ICON.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://oforo.ai",
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Oforo AI",
              alternateName: "Oforo",
              url: "https://oforo.ai",
              logo: "https://oforo.ai/OFORO_ICON.png",
              description:
                "AI company building intelligent agents for chat, search, industrial automation, and career development.",
              foundingLocation: {
                "@type": "Place",
                name: "Milton Keynes, United Kingdom",
              },
              parentOrganization: {
                "@type": "Organization",
                name: "Wartens",
              },
              sameAs: ["https://github.com/brijinchacko/oforo-website"],
              address: [
                {
                  "@type": "PostalAddress",
                  addressLocality: "Milton Keynes",
                  addressCountry: "GB",
                },
                {
                  "@type": "PostalAddress",
                  addressLocality: "Bangalore",
                  addressCountry: "IN",
                },
              ],
              offers: {
                "@type": "AggregateOffer",
                lowPrice: "0",
                highPrice: "30",
                priceCurrency: "GBP",
                offerCount: "3",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Oforo AI Chat",
              url: "https://oforo.ai",
              applicationCategory: "Artificial Intelligence",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "GBP",
              },
              featureList:
                "AI Chat, Auto Model Routing, Side-by-Side Model Comparison, Web Search, Voice Chat, File Analysis, Canvas Whiteboard, Task Hub & Scheduler, Local File Browser, Personalized Learning, ChatGPT Import, Multiple AI Models (GPT-4o Claude Gemini DeepSeek Llama Mistral), Friends & Collaboration, Multi-Language Support, Direct Messaging",
            }),
          }}
        />
      </head>
      <body className="antialiased" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <ThemeProvider>
          <AuthProvider>
            <PlanProvider>
              {children}
              <UpgradePrompt />
              <CookieConsent />
              <Toaster />
            </PlanProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
