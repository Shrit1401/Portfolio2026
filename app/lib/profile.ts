import { EMAIL, GITHUB_URL, LINKEDIN_URL, SUBSTACK_URL, TWITTER_URL, YOUTUBE_URL } from "./links";
import { getSiteBaseUrl } from "./site";

export const profile = {
  name: "Shrit Shrivastava",
  shortName: "Shrit",
  description: "Shrit Shrivastava is a developer and maker building Heytappr. He writes about AI, software, and his journey creating things, publishes a weekly newsletter, and shares vlogs on YouTube.",
  summary: "A guy that loves creating things. Building websites and apps since age 12, now building Heytappr to help product managers get their stuck users unstuck.",
  url: getSiteBaseUrl(),
  links: {
    email: `mailto:${EMAIL}`,
    github: GITHUB_URL,
    linkedin: LINKEDIN_URL,
    twitter: TWITTER_URL,
    newsletter: SUBSTACK_URL,
    youtube: YOUTUBE_URL,
  },
  projects: [
    { name: "Heytappr", url: "https://www.heytappr.com", description: "Helping product managers get their stuck users unstuck." },
  ],
  topics: ["Building software", "AI", "Product building", "Learning in public", "Personal essays"],
  contact: "The quickest way to reach Shrit is a Twitter DM at @shrit1401, or email shrit1401@gmail.com.",
};

export const profilePages = [
  { path: "/", title: "Home", description: "Shrit's story, latest writing, videos, and projects." },
  { path: "/posts", title: "Posts", description: "Essays and research notes on AI, software, and life." },
  { path: "/past", title: "Past", description: "A timeline of Shrit's journey and things he has built." },
  { path: "/photos", title: "Inspiration", description: "A visual collection of inspiration." },
  { path: "/agent", title: "Agent view", description: "A structured profile for readers, crawlers, and AI assistants." },
];

export function getAgentProfile() {
  return {
    identity: { name: profile.name, also_known_as: profile.shortName, summary: profile.summary, website: profile.url },
    links: profile.links,
    projects: profile.projects,
    topics: profile.topics,
    contact: profile.contact,
    pages: profilePages.map(({ path, ...page }) => ({ ...page, url: `${profile.url}${path}` })),
    machine_readable: { text: `${profile.url}/llms.txt`, json: `${profile.url}/agent.json`, sitemap: `${profile.url}/sitemap.xml` },
  };
}
