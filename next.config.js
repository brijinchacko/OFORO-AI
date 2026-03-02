/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  // Mark native modules as external so they're not bundled
  serverExternalPackages: ["better-sqlite3"],
};

module.exports = nextConfig;
