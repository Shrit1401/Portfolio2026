"use server";

import { client } from "@/sanity/lib/client";
import { unstable_noStore as noStore } from "next/cache";

export async function getResearchs() {
  noStore();
  try {
    const data = await client.fetch(
      `*[_type == "research"] | order(date desc) {
        ...,
        "tags": tags[]-> {
          name,
          "slug": slug
        }
      }`,
    );

    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function getResearchFromSlug(slug: string) {
  noStore();
  try {
    const data = await client.fetch(
      `*[_type == "research" && slug.current == "${slug}"] {
        ...,
        "tags": tags[]-> {
          name,
          "slug": slug
        }
      }`,
    );

    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function getAdjacentResearch(slug: string) {
  noStore();
  try {
    // Get all research items ordered by date
    const allResearch = await client.fetch(
      `*[_type == "research"] | order(date desc) {
        "slug": slug.current,
        title,
        image
      }`,
    );

    // Find the current index
    const currentIndex = allResearch.findIndex(
      (item: any) => item.slug === slug,
    );

    // Get previous and next items
    const previous =
      currentIndex < allResearch.length - 1
        ? allResearch[currentIndex + 1]
        : null;
    const next = currentIndex > 0 ? allResearch[currentIndex - 1] : null;

    return { previous, next };
  } catch (error) {
    console.error(error);
    return { previous: null, next: null };
  }
}

export async function getWorks() {
  noStore();
  try {
    const data = await client.fetch(`*[_type == "work"]`);
    data.sort(
      (a: { _createdAt: string }, b: { _createdAt: string }) =>
        new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime(),
    );
    return data;
  } catch (error) {
    console.error(error);
  }
}

