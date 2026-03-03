import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Oforo AI terms of service. Review our terms and conditions for using our platform and services.",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
