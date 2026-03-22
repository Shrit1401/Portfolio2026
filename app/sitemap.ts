import { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

// Query to get all your published content from Sanity
const query = groq`*[_type in ["research", "work"] && defined(slug.current)] {
  "slug": slug.current,
  _updatedAt,
  _type,
  "tags": tags[]->name
}`;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.shrit.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await client.fetch(query);

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/thoughts`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/past`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/newsletter`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Dynamic routes from Sanity content
  const dynamicRoutes = content
    .map((item: any) => {
      // Determine the base path based on content type
      let basePath = "";
      switch (item._type) {
        case "research":
          basePath = "thoughts";
          break;
        case "work":
          basePath = "work";
          break;
      }

      const routes = [
        {
          url: `${baseUrl}/${basePath}/${item.slug}`,
          lastModified: new Date(item._updatedAt),
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ];

      // Add tag pages for research content
      if (item._type === "research" && item.tags) {
        item.tags.forEach((tag: string) => {
          routes.push({
            url: `${baseUrl}/thoughts/tag/${tag}`,
            lastModified: new Date(item._updatedAt),
            changeFrequency: "weekly",
            priority: 0.6,
          });
        });
      }

      return routes;
    })
    .flat();

  return [...staticRoutes, ...dynamicRoutes];
}
