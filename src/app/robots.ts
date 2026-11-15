import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mylink.kr";

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
