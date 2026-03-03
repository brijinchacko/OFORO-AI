"use client";

import { useTheme } from "@/components/ThemeProvider";

export function OforoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img src="/OFORO_ICON.png" alt="Oforo" width={size} height={size}
      className={`${className} object-contain`} style={{ filter: "var(--logo-filter)" }} />
  );
}

export function OforoLogo({ className = "" }: { className?: string }) {
  const { theme } = useTheme();
  return (
    <img src={theme === "dark" ? "/OFORO_LOGO_LIGHT.png" : "/OFORO_LOGO_DARK.png"}
      alt="OFORO" height={22} className={`object-contain h-[22px] ${className}`} />
  );
}

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="hero-blur absolute" style={{ width: "500px", height: "500px", background: "var(--accent)", top: "-15%", left: "-10%", opacity: 0.06 }} />
      <div className="hero-blur absolute animate-float-slow" style={{ width: "400px", height: "400px", background: "#8b5cf6", top: "20%", right: "-5%", opacity: 0.04 }} />
      <div className="hero-blur absolute animate-float-slower" style={{ width: "350px", height: "350px", background: "#06b6d4", bottom: "10%", left: "30%", opacity: 0.04 }} />
      {/* Subtle grid pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(var(--border-primary) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        opacity: 0.3,
      }} />
    </div>
  );
}
