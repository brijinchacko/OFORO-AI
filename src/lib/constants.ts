// ── Product URLs (external sites) ──
export const PRODUCT_URLS = {
  ladx: "https://ladx.ai/",
  seekof: "https://seekof.cloud/",
  nxted: "https://www.nxted.ai/",
} as const;

// ── Internal product routes ──
export const PRODUCT_ROUTES = {
  ladx: "/products/ladx",
  seekof: "/products/seekof",
  nxted: "/products/nxted",
} as const;

// ── Product metadata ──
export const PRODUCTS = [
  { id: "ladx", name: "LADX AI", description: "PLC Programming Agent", icon: "\u26A1", route: "/products/ladx", url: "https://ladx.ai/" },
  { id: "seekof", name: "SEEKOF AI", description: "AI Discovery Marketplace", icon: "\uD83D\uDD0D", route: "/products/seekof", url: "https://seekof.cloud/" },
  { id: "nxted", name: "NXTED AI", description: "Career Development Agent", icon: "\uD83C\uDFAF", route: "/products/nxted", url: "https://www.nxted.ai/" },
] as const;

// ── Site URLs ──
export const SITE_URL = "https://oforo.ai";
export const COMPANY_NAME = "Oforo Ltd";
export const PARENT_COMPANY = "Wartens";
export const PARENT_COMPANY_URL = "https://www.wartens.com";

// ── Support emails ──
export const SUPPORT_EMAIL = "support@oforo.ai";
export const HELLO_EMAIL = "hello@oforo.ai";
export const SECURITY_EMAIL = "security@oforo.ai";
export const PRIVACY_EMAIL = "privacy@oforo.ai";
export const CAREERS_EMAIL = "careers@oforo.ai";
