import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Access — Integrate Oforo AI",
  description: "Get started with Oforo AI APIs. REST API, WebSocket, and SDK access for developers building with Oforo AI.",
  keywords: ["AI API", "Oforo API", "AI developer tools", "AI integration"],
};

export default function ApiAccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
