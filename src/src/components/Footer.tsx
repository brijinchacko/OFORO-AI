import Link from "next/link";

const footerLinks = {
  Products: [
    { name: "LADX AI", href: "/products/ladx" },
    { name: "SEEKOF AI", href: "/products/seekof" },
    { name: "NXTED AI", href: "/products/nxted" },
    { name: "API Access", href: "/pricing" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  Resources: [
    { name: "Documentation", href: "https://docs.oforo.com" },
    { name: "API Reference", href: "https://api.oforo.com" },
    { name: "Status", href: "https://status.oforo.com" },
    { name: "Changelog", href: "/changelog" },
  ],
  Legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Security", href: "/security" },
  ],
};

function OforoIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="42" height="42" rx="12" stroke="currentColor" strokeWidth="5.5" fill="none" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border-primary)", background: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <OforoIcon />
              <span className="text-lg font-extrabold tracking-wide">OFORO</span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              Building AI agents that transform industries. Milton Keynes, UK.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-medium mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm transition-colors" style={{ color: "var(--text-tertiary)" }}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>© {new Date().getFullYear()} Oforo Ltd. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
