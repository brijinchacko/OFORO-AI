import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Oforo AI",
  description: "Get in touch with Oforo AI. Contact us for support, partnerships, or any inquiries about our AI platform.",
  keywords: ["contact Oforo", "AI company contact", "Oforo support"],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
