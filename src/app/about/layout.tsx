import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Oforo AI — AI Company in Milton Keynes & Bangalore",
  description: "Learn about Oforo AI, an artificial intelligence company building specialized AI agents. Based in Milton Keynes, UK & Bangalore, India. A Wartens subsidiary.",
  keywords: ["AI company UK", "about Oforo", "AI startup Milton Keynes", "Wartens subsidiary", "AI company Bangalore"],
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
    </>
  );
}
