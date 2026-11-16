import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders(supabaseUrl, process.env.NODE_ENV !== "production"),
      },
    ];
  },
};

export default nextConfig;
