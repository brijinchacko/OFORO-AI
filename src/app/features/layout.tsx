import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Features — Oforo AI | Multi-Model Chat, Voice, Canvas & More",
  description: "Explore all Oforo AI features: Auto Model Routing, Side-by-Side Comparison, Voice Mode, Canvas Whiteboard, Task Hub, Web Search, and more. One platform, many AI models.",
  keywords: ["Oforo AI features", "AI chat features", "multi-model AI", "AI comparison tool", "voice AI", "AI canvas", "AI task manager"],
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
    </>
  );
}
