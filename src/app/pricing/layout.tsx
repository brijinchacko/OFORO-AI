import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing — Free, Pro & Max AI Plans",
  description: "Oforo AI pricing plans. Start free with 50 messages/day, upgrade to Pro for unlimited access, or choose MAX for all agents and collaboration features.",
  keywords: ["AI pricing", "free AI chatbot", "AI subscription", "Oforo pricing"],
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
    </>
  );
}
