/**
 * Creates or replaces the singleton `pastLifeTimeline` document in Sanity.
 *
 * Requires:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_WRITE_TOKEN (Editor token with write access)
 *
 * Run: npm run seed:past
 * Or:  node --env-file=.env scripts/seed-past-timeline.mjs
 */

import { createClient } from "@sanity/client";
import { randomBytes } from "crypto";

const key = () => randomBytes(5).toString("hex");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-05-27";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

/** Mirrors app/lib/pastTimeline.ts — polaroids use static paths via imageUrl. */
const CHAPTERS = [
  {
    slug: "early-days",
    title: "early days",
    events: [
      {
        eventType: "start",
        date: "2019 - ∞",
        title: "video editing",
        story:
          "i didn’t really start with coding. i started with editing random youtube videos, just messing around with cuts and transitions. nothing serious. but that was the first time i realized i liked making things, not consuming them.",
        imageUrl: "/work/img-1.jpeg",
      },
    ],
  },
  {
    slug: "exploration",
    title: "exploration",
    events: [
      {
        eventType: "thread",
        date: "2020 (covid) - 2020 nov",
        title: "og games",
        story:
          "i spent a lot of time playing games like call of duty, halo, and fallout. at some point, just playing wasn’t enough. i wanted to understand how they were made.",
        imageUrl: "/work/img-2.jpeg",
      },
      {
        eventType: "breakthrough",
        date: "2020 nov - 2022 aug",
        title: "building games",
        story:
          "after playing so many games, i tried building my own. it wasn’t great, but that curiosity stuck. it was the first time i moved from playing to creating.",
        imageUrl: "/work/img-3.jpeg",
      },
      {
        eventType: "shift",
        date: "2021 - 2023",
        title: "valorant phase",
        story:
          "i was heavily addicted to valorant. it took a lot of time and focus away. but it also taught me discipline the hard way.",
        imageUrl: "/work/img-4.jpeg",
      },
      {
        eventType: "turn",
        date: "4 feb 2023",
        title: "first $",
        story:
          "i made my first dollar on the internet through fiverr. it was small, but it changed how i saw things. making money online suddenly felt real.",
        imageUrl: "/work/img-5.jpeg",
      },
    ],
  },
  {
    slug: "shift",
    title: "the shift",
    events: [
      {
        eventType: "experiment",
        date: "2023 march - 2023 aug",
        title: "learning react",
        story:
          "i got into react, next, and different libraries. not because of money, but because it felt interesting. i kept building without really thinking about outcomes.",
        imageUrl: "/work/img-1.jpeg",
      },
      {
        eventType: "big-moment",
        date: "2023 march end",
        title: "₹40,000",
        story:
          "out of nowhere, i earned ₹40,000 through fiverr. i bought a phone and gave the rest to my parents. that moment hit different. it stopped feeling like a hobby.",
        imageUrl: "/work/img-2.jpeg",
      },
      {
        eventType: "thread",
        date: "3 nov 2023",
        title: "mindset shift",
        story:
          "i learned things the hard way. motivation fades, people change, but showing up and working consistently is what actually stays.",
        imageUrl: "/work/img-3.jpeg",
      },
    ],
  },
  {
    slug: "real-world",
    title: "real world",
    events: [
      {
        eventType: "experiment",
        date: "2024 jun - 2024 oct",
        title: "agency work",
        story:
          "i worked with an agency, helped them grow, and made around ₹5 lakh. it taught me how real work actually works. not just building, but solving real problems.",
        imageUrl: "/work/img-4.jpeg",
      },
      {
        eventType: "first",
        date: "8 aug 2024",
        title: "macbook",
        story:
          "i always wanted a macbook as a kid. after years, i finally got one. it felt like a small but meaningful achievement.",
        imageUrl: "/work/img-5.jpeg",
      },
    ],
  },
  {
    slug: "now",
    title: "now",
    events: [
      {
        eventType: "turn",
        date: "2019 jan - ∞",
        title: "building websites",
        story:
          "somewhere along the way, i started learning html and css. simple websites, nothing fancy, but real things i could build and improve.",
        imageUrl: "/work/img-1.jpeg",
      },
      {
        eventType: "breakthrough",
        date: "2021 - ∞",
        title: "micro tools",
        story:
          "with a better laptop, i started building small tools and micro websites. things people could actually use. simple, but useful.",
        imageUrl: "/work/img-2.jpeg",
      },
      {
        eventType: "experiment",
        date: "march 2026 - present",
        title: "researching ai",
        story:
          "right now, i’m in college and exploring ai more seriously. trying to understand how things work at a deeper level and slowly moving towards research.",
        imageUrl: "/work/img-3.jpeg",
      },
    ],
  },
];

const doc = {
  _id: "pastLifeTimeline",
  _type: "pastTimeline",
  title: "Life timeline",
  chapters: CHAPTERS.map((ch) => ({
    _key: key(),
    _type: "pastChapter",
    slug: { _type: "slug", current: ch.slug },
    title: ch.title,
    events: ch.events.map((ev) => ({
      _key: key(),
      _type: "pastEvent",
      eventType: ev.eventType,
      date: ev.date,
      title: ev.title,
      story: ev.story,
      ...(ev.imageUrl ? { imageUrl: ev.imageUrl } : {}),
    })),
  })),
};

await client.createOrReplace(doc);
console.log("Seeded pastLifeTimeline (type pastTimeline).");
