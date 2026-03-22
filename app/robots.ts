import { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/app/lib/site";

const baseUrl = getSiteBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/private/", "/admin/", "/studio/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
