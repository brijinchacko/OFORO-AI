"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const products = [
  { name: "LADX AI", description: "PLC Programming Agent", href: "/products/ladx", icon: "⚡" },
  { name: "SEEKOF AI", description: "AI Discovery Marketplace", href: "/products/seekof", icon: "🔍" },
  { name: "NXTED AI", description: "Career Development Agent", href: "/products/nxted", icon: "🎯" },
];

function OforoNavLogo() {
  const { theme } = useTheme();
  return (
    <img src={theme === "dark" ? "/OFORO_LOGO_LIGHT.png" : "/OFORO_LOGO_DARK.png"} alt="OFORO" height={22} className="object-contain h-[22px]" />
  );
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: isScrolled ? "var(--bg-primary)" : "transparent",
        borderBottom: isScrolled ? "1px solid var(--border-primary)" : "1px solid transparent",
        backdropFilter: isScrolled ? "blur(16px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <OforoNavLogo />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <div className="relative" onMouseEnter={() => setProductsOpen(true)} onMouseLeave={() => setProductsOpen(false)}>
              <button className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors" style={{ color: "var(--text-secondary)" }}>
                Products
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${productsOpen ? "rotate-180" : ""}`} />
              </button>
              {productsOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
                  <div className="p-2">
                    {products.map((p) => (
                      <Link key={p.name} href={p.href} className="flex items-start gap-3 p-3 rounded-lg transition-colors">
                        <span className="text-xl">{p.icon}</span>
                        <div>
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{p.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/pricing" className="px-3 py-2 text-sm rounded-lg" style={{ color: "var(--text-secondary)" }}>Pricing</Link>
            <Link href="/about" className="px-3 py-2 text-sm rounded-lg" style={{ color: "var(--text-secondary)" }}>About</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
              style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}>
              <Sparkles className="w-3.5 h-3.5" /> Try Oforo AI
            </Link>
          </div>

          <button className="md:hidden p-2" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden animate-fade-in" style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--border-primary)" }}>
          <div className="px-4 py-4 space-y-1">
            {products.map((p) => (
              <Link key={p.name} href={p.href} className="flex items-center gap-3 px-3 py-3 rounded-lg" onClick={() => setMobileOpen(false)}>
                <span>{p.icon}</span>
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{p.description}</div>
                </div>
              </Link>
            ))}
            <Link href="/pricing" className="block px-3 py-2 text-sm" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link href="/about" className="block px-3 py-2 text-sm" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileOpen(false)}>About</Link>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={toggleTheme} className="p-2 rounded-lg" style={{ color: "var(--text-tertiary)" }}>
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link href="/" className="flex-1 text-center px-4 py-2.5 text-sm font-medium rounded-lg"
                style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }} onClick={() => setMobileOpen(false)}>
                Try Oforo AI
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
