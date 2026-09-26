import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongodb"],
  agentRules: false,
  devIndicators: false,
};

export default nextConfig;
