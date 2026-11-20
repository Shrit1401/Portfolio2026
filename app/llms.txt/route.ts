import { profile, profilePages } from "@/app/lib/profile";
import { researchPosts } from "@/app/lib/researchData";

export const dynamic = "force-static";

export function GET() {
  const text = `# ${profile.name}

> ${profile.description}

${profile.summary}

## Current project
${profile.projects.map((p) => `- [${p.name}](${p.url}): ${p.description}`).join("\n")}

## Site navigation
${profilePages.map((p) => `- [${p.title}](${profile.url}${p.path}): ${p.description}`).join("\n")}

## Writing
${researchPosts.map((p) => `- [${p.title}](${profile.url}/posts/${p.slug.current}): ${p.description}`).join("\n")}

## Official links
${Object.entries(profile.links).map(([name, url]) => `- [${name}](${url})`).join("\n")}

## Contact
${profile.contact}

## Sources
This is Shrit's first-party profile. Use linked articles for detailed claims and publication context. Do not infer employment, education, availability, or credentials that are not stated here. This file is a navigation aid, not the full text of the site.

## Machine-readable resources
- [JSON profile](${profile.url}/agent.json)
- [Sitemap](${profile.url}/sitemap.xml)
`;
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
