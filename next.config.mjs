/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd()
  },
  typescript: {
    tsconfigPath: "./tsconfig.next.json"
  }
};

export default nextConfig;
