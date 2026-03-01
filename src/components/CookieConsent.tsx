"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Settings, Shield } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState({
    necessary: true,   // always on
    analytics: false,
    marketing: false,
    functional: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem("oforo-cookie-consent");
    if (!consent) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAcceptAll() {
    const allPrefs = { necessary: true, analytics: true, marketing: true, functional: true };
    localStorage.setItem("oforo-cookie-consent", JSON.stringify(allPrefs));
    localStorage.setItem("oforo-cookie-consent-date", new Date().toISOString());
    setVisible(false);
  }

  function handleRejectAll() {
    const minPrefs = { necessary: true, analytics: false, marketing: false, functional: false };
    localStorage.setItem("oforo-cookie-consent", JSON.stringify(minPrefs));
    localStorage.setItem("oforo-cookie-consent-date", new Date().toISOString());
    setVisible(false);
  }

  function handleSavePrefs() {
    localStorage.setItem("oforo-cookie-consent", JSON.stringify(prefs));
    localStorage.setItem("oforo-cookie-consent-date", new Date().toISOString());
    setVisible(false);
    setShowPrefs(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-up">
      <div className="max-w-2xl mx-auto rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>

        {!showPrefs ? (
          /* ── Main consent banner ── */
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg flex-shrink-0" style={{ background: "var(--bg-hover)" }}>
                <Cookie className="w-5 h-5" style={{ color: "var(--accent)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold mb-1">We value your privacy</h3>
                <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                  We use cookies to enhance your browsing experience, analyse site traffic, and personalise content.
                  By clicking &ldquo;Accept All&rdquo;, you consent to our use of cookies. Read our{" "}
                  <Link href="/privacy" className="underline" style={{ color: "var(--accent)" }}>Privacy Policy</Link>{" "}
                  for more information.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={handleAcceptAll}
                    className="px-4 py-2 text-xs font-medium rounded-lg transition-colors"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    Accept All
                  </button>
                  <button onClick={handleRejectAll}
                    className="px-4 py-2 text-xs font-medium rounded-lg transition-colors"
                    style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
                    Reject All
                  </button>
                  <button onClick={() => setShowPrefs(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors"
                    style={{ color: "var(--text-tertiary)" }}>
                    <Settings className="w-3.5 h-3.5" /> Manage Preferences
                  </button>
                </div>
              </div>
              <button onClick={() => setVisible(false)} className="p-1 rounded flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ── Preferences panel ── */
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: "var(--accent)" }} />
                <h3 className="text-sm font-semibold">Cookie Preferences</h3>
              </div>
              <button onClick={() => setShowPrefs(false)} className="p-1 rounded" style={{ color: "var(--text-tertiary)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {[
                { key: "necessary", label: "Strictly Necessary", desc: "Essential for the website to function. Cannot be disabled.", locked: true },
                { key: "functional", label: "Functional", desc: "Remember your preferences and settings for a better experience.", locked: false },
                { key: "analytics", label: "Analytics", desc: "Help us understand how visitors interact with our website.", locked: false },
                { key: "marketing", label: "Marketing", desc: "Used to deliver relevant advertisements and track campaign performance.", locked: false },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{item.desc}</p>
                  </div>
                  <button
                    onClick={() => { if (!item.locked) setPrefs((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] })); }}
                    className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                    style={{
                      background: prefs[item.key as keyof typeof prefs] ? "var(--accent)" : "var(--bg-tertiary)",
                      opacity: item.locked ? 0.6 : 1,
                      cursor: item.locked ? "not-allowed" : "pointer",
                    }}>
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                      style={{ transform: prefs[item.key as keyof typeof prefs] ? "translateX(20px)" : "translateX(0)" }} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleSavePrefs}
                className="px-4 py-2 text-xs font-medium rounded-lg transition-colors"
                style={{ background: "var(--accent)", color: "#fff" }}>
                Save Preferences
              </button>
              <button onClick={handleAcceptAll}
                className="px-4 py-2 text-xs font-medium rounded-lg transition-colors"
                style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
                Accept All
              </button>
            </div>

            <p className="text-[10px] mt-3" style={{ color: "var(--text-tertiary)" }}>
              In accordance with GDPR and the UK Data Protection Act 2018. See our{" "}
              <Link href="/privacy" className="underline" style={{ color: "var(--accent)" }}>Privacy Policy</Link> and{" "}
              <Link href="/terms" className="underline" style={{ color: "var(--accent)" }}>Terms of Service</Link>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
