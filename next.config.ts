import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone", // required for optimized Docker image
}

export default nextConfig
