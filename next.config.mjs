import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const {
  computeRuntimeSourceIdentity,
  resolveBuildId
} = require("./scripts/runtime/runtime-source-identity.cjs");
const runtimeSourceIdentity = computeRuntimeSourceIdentity({
  root: fileURLToPath(new URL(".", import.meta.url))
});

const securityPolicy = JSON.parse(
  readFileSync(new URL("./config/security-headers.json", import.meta.url), "utf8")
);
const globalSecurityHeaders = [
  ...securityPolicy.headers,
  ...(process.env.TEOYUBE_DEPLOYMENT_TARGET === "production"
    ? securityPolicy.productionOnlyHeaders
    : [])
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/approved-static/*": ["./styles.css", "./styles/**/*"]
  },
  generateBuildId: async () => resolveBuildId(runtimeSourceIdentity),
  turbopack: {
    root: process.cwd()
  },
  typescript: {
    tsconfigPath: "./tsconfig.next.json"
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: globalSecurityHeaders
      },
      {
        source: "/media/teoyubeworld/pilot-v1/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" }
        ]
      },
      {
        source: "/media/teoyubeworld/pilot-v1/runtime-manifest.json",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Content-Type-Options", value: "nosniff" }
        ]
      }
    ];
  },
  async rewrites() {
    return [
      { source: "/styles.css", destination: "/approved-static/styles.css" },
      { source: "/styles/:path*", destination: "/approved-static/styles/:path*" },
      { source: "/public/:path*", destination: "/:path*" }
    ];
  },
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
