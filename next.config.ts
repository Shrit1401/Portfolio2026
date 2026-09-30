import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["react-icons", "framer-motion"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "substackcdn.com" },
      { protocol: "https", hostname: "substack-post-media.s3.amazonaws.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/research", destination: "/posts", permanent: true },
      // Only the old page routes; /research/<slug>/<file> are article images in public/.
      { source: "/research/tag/:tag", destination: "/posts/tag/:tag", permanent: true },
      { source: "/research/:slug", destination: "/posts/:slug", permanent: true },
      { source: "/archive", destination: "/past", permanent: true },
      { source: "/work", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
