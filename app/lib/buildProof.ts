export type BuildProofEntry = {
  /** Sanity document id when loaded from CMS (stable React key). */
  id?: string;
  title: string;
  icon: string;
  location: string;
  date: string;
  image: string;
  /** Longer copy shown in the polaroid “read more” view. */
  story?: string;
  /** Site path or full URL; “learn more” hidden when unset. */
  learnMoreUrl?: string;
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
    story:
      "48 hours of caffeine, whiteboards, and a demo that barely held together until the judges smiled. We shipped a full stack prototype and walked away with first place — proof that speed and clarity beat perfection.",
  },
  {
    title: "Shipped: AI Memory Tool",
    icon: "🚀",
    location: "Remote",
    date: "Mar 2024",
    image: "/work/img-2.jpeg",
    story:
      "Turned a messy idea into something people could actually use: semantic recall, clean UX, and infra that didn’t fall over on day two. The kind of project that reminds me why I build.",
  },
  {
    title: "Agency — ₹3L Revenue",
    icon: "💰",
    location: "Remote",
    date: "2023",
    image: "/work/img-3.jpeg",
    story:
      "Small team, sharp scope, repeat clients. Learned pricing, delivery, and how to say no — the unglamorous stuff that makes creative work sustainable.",
  },
  {
    title: "YouTube Channel Launch",
    icon: "🎥",
    location: "Online",
    date: "2024",
    image: "/work/img-4.jpeg",
    story:
      "Pressed record before I felt ready. The first videos were rough; the habit mattered more. Sharing build logs in public changed how I think about teaching and shipping.",
  },
  {
    title: "Built Portfolio v2026",
    icon: "⚡",
    location: "Home",
    date: "2026",
    image: "/work/img-5.jpeg",
    story:
      "This site: motion, CMS, and the tiny details that make a portfolio feel alive. If you’re reading this in the polaroid view — meta achieved.",
  },
];
