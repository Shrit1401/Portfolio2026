export type BuildProofEntry = {
  title: string;
  icon: string;
  location: string;
  date: string;
  image: string;
};

/** Max items in the home “build proof.” preview; /past shows every entry in a grid. */
export const HOME_BUILD_PROOF_LIMIT = 5;

export const BUILD_PROOF_ENTRIES: BuildProofEntry[] = [
  {
    title: "1st Place — TechFest Hackathon",
    icon: "🏆",
    location: "Mumbai",
    date: "Jan 2024",
    image: "/work/img-1.jpeg",
  },
  {
    title: "Shipped: AI Memory Tool",
    icon: "🚀",
    location: "Remote",
    date: "Mar 2024",
    image: "/work/img-2.jpeg",
  },
  {
    title: "Agency — ₹3L Revenue",
    icon: "💰",
    location: "Remote",
    date: "2023",
    image: "/work/img-3.jpeg",
  },
  {
    title: "YouTube Channel Launch",
    icon: "🎥",
    location: "Online",
    date: "2024",
    image: "/work/img-4.jpeg",
  },
  {
    title: "Built Portfolio v2026",
    icon: "⚡",
    location: "Home",
    date: "2026",
    image: "/work/img-5.jpeg",
  },
];

export function getHomeBuildProofEntries(): BuildProofEntry[] {
  return BUILD_PROOF_ENTRIES.slice(0, HOME_BUILD_PROOF_LIMIT);
}
