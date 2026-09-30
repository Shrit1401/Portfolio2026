import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Instrument_Serif, Newsreader } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import SiteJsonLd from "./components/SiteJsonLd";
import { metadata as seoMetadata } from "./components/SEO";
import { themeScript } from "./lib/theme";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = seoMetadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      // The theme script adds `theme-dark` before hydration.
      suppressHydrationWarning
      className={`${geist.variable} ${instrumentSerif.variable} ${newsreader.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="369e35b2-80fb-48ed-a840-9a68246a3c68"
        ></script>
      </head>
      <body className="font-sans antialiased">
        <SiteJsonLd />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
