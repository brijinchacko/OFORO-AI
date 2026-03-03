import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <h1 className="text-6xl font-bold mb-4 gradient-text">404</h1>
      <p className="text-lg mb-2">Page not found</p>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link href="/" className="px-6 py-3 text-sm font-medium rounded-lg" style={{ background: "var(--accent)", color: "#fff" }}>
        Go to Oforo AI
      </Link>
    </div>
  );
}
