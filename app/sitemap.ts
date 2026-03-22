import { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { getSiteBaseUrl } from "@/app/lib/site";

// Research only: work detail routes are not implemented yet (avoid 404s in sitemap).
const query = groq`*[_type == "research" && defined(slug.current)] {
  "slug": slug.current,
  _updatedAt,
  "tags": tags[]->{ "name": name, "slug": slug.current }
}`;

const baseUrl = getSiteBaseUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await client.fetch(query);

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
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
      url: `${baseUrl}/research`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/archive`,
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

  const researchRoutes: MetadataRoute.Sitemap = content.map(
    (item: { slug: string; _updatedAt: string }) => ({
      url: `${baseUrl}/research/${item.slug}`,
      lastModified: new Date(item._updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  const tagSlugs = new Set<string>();
  for (const item of content as Array<{
    tags?: Array<{ slug?: string | null } | null>;
  }>) {
    for (const tag of item.tags ?? []) {
      const s = tag?.slug;
      if (s) tagSlugs.add(s);
    }
  }

  const tagRoutes: MetadataRoute.Sitemap = [...tagSlugs].map((slug) => ({
    url: `${baseUrl}/research/tag/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...researchRoutes, ...tagRoutes];
}
