/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd()
  },
  typescript: {
    tsconfigPath: "./tsconfig.next.json"
  },
  async rewrites() {
    return [
      { source: "/styles.css", destination: "/approved-static/styles.css" },
      { source: "/styles/:path*", destination: "/approved-static/styles/:path*" },
      { source: "/public/:path*", destination: "/:path*" }
    ];
  }
};

export default nextConfig;
