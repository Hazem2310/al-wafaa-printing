import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "/*": ["./.wafaa-data/**/*", "./.env*"],
  },
};

export default nextConfig;
