"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { Eye, EyeOff, ArrowLeft, Sun, Moon, Loader2 } from "lucide-react";

function OforoIcon({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/OFORO_ICON.png"
      alt="Oforo"
      width={size}
      height={size}
      className="object-contain"
      style={{ filter: "var(--logo-filter)" }}
    />
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (mode === "signin") {
        result = await login(email, password);
      } else {
        if (!name.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        result = await register(email, password, name);
      }

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm transition-colors" style={{ color: "var(--text-tertiary)" }}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <button onClick={toggleTheme} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Auth form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <OforoIcon size={48} />
            <h1 className="text-2xl font-bold mt-4">
              {mode === "signin" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
              {mode === "signin"
                ? "Sign in to continue to Oforo AI"
                : "Get started with Oforo AI for free"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (sign up only) */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-transparent focus:outline-none transition-colors"
                  style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm bg-transparent focus:outline-none transition-colors"
                style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Min 6 characters" : "Enter password"}
                  required
                  minLength={mode === "signup" ? 6 : undefined}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-transparent focus:outline-none transition-colors"
                  style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm mt-6" style={{ color: "var(--text-tertiary)" }}>
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              className="font-medium underline underline-offset-2"
              style={{ color: "var(--text-primary)" }}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>

          {/* Footer */}
          <p className="text-center text-[11px] mt-8" style={{ color: "var(--text-tertiary)" }}>
            By continuing, you agree to Oforo&apos;s{" "}
            <Link href="/terms" className="underline">Terms</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
