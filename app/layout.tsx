import type { Metadata } from "next";
import type { FC, ReactNode } from "react";
import { DM_Sans, EB_Garamond, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import { metadata as seoMetadata } from "./components/SEO";
import TransitionProvider from "./hooks/TransitionProvider";

// Font configurations
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = seoMetadata;

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=UnifrakturCook:wght@700&display=swap"
        />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="369e35b2-80fb-48ed-a840-9a68246a3c68"
        ></script>
      </head>
      <html
        lang="en"
        className={`${dmSans.variable} ${ebGaramond.variable} ${instrumentSerif.variable}`}
      >
        <body className="font-sans antialiased">
          <TransitionProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </TransitionProvider>
        </body>
      </html>
    </>
  );
};

export default RootLayout;
