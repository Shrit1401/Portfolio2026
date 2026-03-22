import type { Metadata } from "next";
import { getSiteBaseUrl, getSiteOriginUrl } from "@/app/lib/site";

const baseUrl = getSiteBaseUrl();
const defaultDescription =
  "Shrit — developer and maker. Portfolio, projects, research notes, and writing on building software and creative tech.";

const defaultOgImagePath = "./opengraph-image.png";

export const metadata: Metadata = {
  metadataBase: getSiteOriginUrl(),
  title: {
    default: "Shrit",
    template: "%s | Shrit",
  },
  description: defaultDescription,
  authors: [{ name: "Shrit", url: baseUrl }],
  creator: "Shrit",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        sizes: "any",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Shrit",
    url: baseUrl,
    title: "Shrit",
    description: defaultDescription,
    images: [
      {
        url: defaultOgImagePath,
        width: 1200,
        height: 630,
        alt: "Shrit — portfolio and research",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@shrit1401",
    creator: "@shrit1401",
    title: "Shrit",
    description: defaultDescription,
    images: [
      {
        url: defaultOgImagePath,
        alt: "Shrit — portfolio and research",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};
