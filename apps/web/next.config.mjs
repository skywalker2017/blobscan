// Importing env files here to validate on build
import "./src/env.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    /**
     * Redirect Grafana's metrics scrape requests from /metrics to the Next.js
     * standard endpoint at /api/metrics.
     */
    return [
      {
        source: "/metrics",
        destination: "/api/metrics",
      },
    ];
  },
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@blobscan/api",
    "@blobscan/auth",
    "@blobscan/db",
    "echarts",
    "zrender",
  ],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: !!process.env.CI },
  typescript: { ignoreBuildErrors: !!process.env.CI },
  experimental: {
    instrumentationHook:
      !!process.env.TRACES_ENABLED || !!process.env.METRICS_ENABLED,
  },
};

export default config;
