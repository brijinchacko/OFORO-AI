/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "oforo.ai",
      "res.cloudinary.com",
    ],
  },
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    "bindings",
    "file-uri-to-path",
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize native modules that can't be bundled by webpack
      config.externals = config.externals || [];
      config.externals.push({
        "better-sqlite3": "commonjs better-sqlite3",
        "bindings": "commonjs bindings",
        "file-uri-to-path": "commonjs file-uri-to-path",
      });
    }
    return config;
  },
};

module.exports = nextConfig;
