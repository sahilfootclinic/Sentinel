import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The JSON snapshot fallback is read with fs at runtime; make sure it is
  // bundled into every serverless function output.
  outputFileTracingIncludes: {
    "/**": ["./data/**"],
  },
};

export default nextConfig;
