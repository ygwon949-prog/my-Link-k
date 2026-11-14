import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Language",
            value: "ko-KR",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
