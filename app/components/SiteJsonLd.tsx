import { getSiteBaseUrl } from "@/app/lib/site";

const sameAs = [
  "https://github.com/shrit1401",
  "https://twitter.com/shrit1401",
  "https://www.linkedin.com/in/shrit1401/",
];

export default function SiteJsonLd() {
  const baseUrl = getSiteBaseUrl();

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Shrit",
        description:
          "Shrit — developer and maker. Portfolio, research, projects, and writing.",
        publisher: { "@id": `${baseUrl}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${baseUrl}/#person`,
        name: "Shrit",
        url: baseUrl,
        sameAs,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
