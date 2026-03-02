"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { Eye, EyeOff, ArrowLeft, Sun, Moon, Loader2, Mail, ArrowRight } from "lucide-react";

function OforoIcon({ size = 32 }: { size?: number }) {
  return (
    <img src="/OFORO_ICON.png" alt="Oforo" width={size} height={size}
      className="object-contain" style={{ filter: "var(--logo-filter)" }} />
  );
}

type Step = "email" | "otp" | "details";

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ── Send OTP ──
  async function handleSendOTP() {
    if (!email.trim()) { setError("Please enter your email"); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), type: mode === "signin" ? "login" : "signup" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send code");
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Handle OTP input ──
  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      const code = otp.join("");
      if (code.length === 6) handleVerifyOTP();
    }
  }

  // ── Verify OTP ──
  async function handleVerifyOTP() {
    const code = otp.join("");
    if (code.length !== 6) { setError("Please enter the 6-digit code"); return; }
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        // For signup, go to details step to collect name + password
        setStep("details");
        setLoading(false);
        return;
      }

      // For login, verify OTP and log in
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code, type: "login" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code");
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else {
        // Force auth context refresh
        window.location.href = "/";
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Complete signup (after OTP + details) ──
  async function handleCompleteSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your name"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError("");
    setLoading(true);

    try {
      const code = otp.join("");
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code, type: "signup", name: name.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Handle password-based sign in (fallback) ──
  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
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

  // ── Reset ──
  function resetFlow() {
    setStep("email");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setOtpSent(false);
  }

  function switchMode(newMode: "signin" | "signup") {
    setMode(newMode);
    resetFlow();
    setPassword("");
    setName("");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <button onClick={() => step === "email" ? router.push("/") : resetFlow()}
          className="flex items-center gap-2 text-sm transition-colors" style={{ color: "var(--text-tertiary)" }}>
          <ArrowLeft className="w-4 h-4" />
          {step === "email" ? "Back" : "Change email"}
        </button>
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
              {step === "email" && (mode === "signin" ? "Welcome back" : "Create an account")}
              {step === "otp" && "Check your email"}
              {step === "details" && "Complete your profile"}
            </h1>
            <p className="text-sm mt-1 text-center" style={{ color: "var(--text-tertiary)" }}>
              {step === "email" && (mode === "signin" ? "Sign in to continue to Oforo AI" : "Get started with Oforo AI for free")}
              {step === "otp" && (
                <>We sent a 6-digit code to <strong style={{ color: "var(--text-secondary)" }}>{email}</strong></>
              )}
              {step === "details" && "Set your name and password to finish"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400"
              style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              {error}
            </div>
          )}

          {/* ═══ STEP 1: Email ═══ */}
          {step === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoFocus
                  className="w-full px-4 py-3 rounded-xl text-sm bg-transparent focus:outline-none transition-colors"
                  style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
                  autoComplete="email"
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendOTP(); }}
                />
              </div>

              <button onClick={handleSendOTP} disabled={loading || !email.trim()}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Send verification code
              </button>

              {/* Divider */}
              {mode === "signin" && (
                <>
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>or sign in with password</span>
                    <div className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
                  </div>

                  <form onSubmit={handlePasswordSignIn} className="space-y-3">
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password" required
                        className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-transparent focus:outline-none transition-colors"
                        style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
                        autoComplete="current-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: "var(--text-tertiary)" }}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button type="submit" disabled={loading || !email.trim() || !password}
                      className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}>
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Sign in with password
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* ═══ STEP 2: OTP Verification ═══ */}
          {step === "otp" && (
            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input key={i} ref={(el) => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-transparent focus:outline-none transition-all"
                    style={{
                      border: digit ? "2px solid var(--accent)" : "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                ))}
              </div>

              <button onClick={handleVerifyOTP} disabled={loading || otp.join("").length !== 6}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {mode === "signup" ? "Verify & continue" : "Verify & sign in"}
              </button>

              <p className="text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
                Didn&apos;t receive the code?{" "}
                {resendTimer > 0 ? (
                  <span>Resend in {resendTimer}s</span>
                ) : (
                  <button onClick={handleSendOTP} disabled={loading}
                    className="font-medium underline underline-offset-2" style={{ color: "var(--text-primary)" }}>
                    Resend code
                  </button>
                )}
              </p>
            </div>
          )}

          {/* ═══ STEP 3: Signup details (name + password) ═══ */}
          {step === "details" && (
            <form onSubmit={handleCompleteSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Full name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" autoFocus required
                  className="w-full px-4 py-3 rounded-xl text-sm bg-transparent focus:outline-none transition-colors"
                  style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
                  autoComplete="name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters" required minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-transparent focus:outline-none transition-colors"
                    style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
                    autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: "var(--text-tertiary)" }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create account
              </button>
            </form>
          )}

          {/* Toggle mode */}
          {step === "email" && (
            <p className="text-center text-sm mt-6" style={{ color: "var(--text-tertiary)" }}>
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                className="font-medium underline underline-offset-2" style={{ color: "var(--text-primary)" }}>
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          )}

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
