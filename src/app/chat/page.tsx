"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Chat is now the homepage — redirect /chat to /
export default function ChatRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}
