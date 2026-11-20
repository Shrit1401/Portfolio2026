import { getSiteBaseUrl } from "@/app/lib/site";
import { profile } from "@/app/lib/profile";

const sameAs = Object.values(profile.links).filter((url) => url.startsWith("https://"));

export default function SiteJsonLd() {
  const baseUrl = getSiteBaseUrl();

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: profile.name,
        description: profile.description,
        publisher: { "@id": `${baseUrl}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${baseUrl}/#person`,
        name: profile.name,
        url: baseUrl,
        alternateName: profile.shortName,
        description: profile.description,
        sameAs,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
