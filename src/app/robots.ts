import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/links", "/stats", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/links", "/stats", "/api/"],
      },
      {
        userAgent: "Yeti", // 네이버 검색엔진 로봇
        allow: "/",
        disallow: ["/links", "/stats", "/api/"],
      },
      {
        userAgent: "Daumoa", // 다음/카카오 검색엔진 로봇
        allow: "/",
        disallow: ["/links", "/stats", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
