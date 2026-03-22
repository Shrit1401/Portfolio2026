export type PastTimelineEventType =
  | "start"
  | "thread"
  | "breakthrough"
  | "turn"
  | "experiment"
  | "big-moment"
  | "shift"
  | "first";

export interface PastTimelineEvent {
  type: PastTimelineEventType;
  date: string;
  title: string;
  story: string;
}

export interface PastTimelineChapter {
  id: string;
  title: string;
  events: PastTimelineEvent[];
}

export const PAST_CHAPTERS: PastTimelineChapter[] = [
  {
    id: "early-days",
    title: "early days",
    events: [
      {
        type: "start",
        date: "2019 - ∞",
        title: "video editing",
        story:
          "i didn’t really start with coding. i started with editing random youtube videos, just messing around with cuts and transitions. nothing serious. but that was the first time i realized i liked making things, not consuming them.",
      },
    ],
  },
  {
    id: "exploration",
    title: "exploration",
    events: [
      {
        type: "thread",
        date: "2020 (covid) - 2020 nov",
        title: "og games",
        story:
          "i spent a lot of time playing games like call of duty, halo, and fallout. at some point, just playing wasn’t enough. i wanted to understand how they were made.",
      },
      {
        type: "breakthrough",
        date: "2020 nov - 2022 aug",
        title: "building games",
        story:
          "after playing so many games, i tried building my own. it wasn’t great, but that curiosity stuck. it was the first time i moved from playing to creating.",
      },
      {
        type: "turn",
        date: "4 feb 2023",
        title: "first $",
        story:
          "i made my first dollar on the internet through fiverr. it was small, but it changed how i saw things. making money online suddenly felt real.",
      },
    ],
  },
  {
    id: "shift",
    title: "the shift",
    events: [
      {
        type: "experiment",
        date: "2023 march - 2023 aug",
        title: "learning react",
        story:
          "i got into react, next, and different libraries. not because of money, but because it felt interesting. i kept building without really thinking about outcomes.",
      },
      {
        type: "big-moment",
        date: "2023 march end",
        title: "₹40,000",
        story:
          "out of nowhere, i earned ₹40,000 through fiverr. i bought a phone and gave the rest to my parents. that moment hit different. it stopped feeling like a hobby.",
      },
    ],
  },
  {
    id: "real-world",
    title: "real world",
    events: [
      {
        type: "experiment",
        date: "2024 jun - 2024 oct",
        title: "agency work",
        story:
          "i worked with an agency, helped them grow, and made around ₹5 lakh. it taught me how real work actually works. not just building, but solving real problems.",
      },
      {
        type: "shift",
        date: "2021 - 2023",
        title: "valorant phase",
        story:
          "i was heavily addicted to valorant. it took a lot of time and focus away. but it also taught me discipline the hard way.",
      },
      {
        type: "first",
        date: "8 aug 2024",
        title: "macbook",
        story:
          "i always wanted a macbook as a kid. after years, i finally got one. it felt like a small but meaningful achievement.",
      },
    ],
  },
  {
    id: "now",
    title: "now",
    events: [
      {
        type: "turn",
        date: "2019 jan - ∞",
        title: "building websites",
        story:
          "somewhere along the way, i started learning html and css. simple websites, nothing fancy, but real things i could build and improve.",
      },
      {
        type: "breakthrough",
        date: "2021 - ∞",
        title: "micro tools",
        story:
          "with a better laptop, i started building small tools and micro websites. things people could actually use. simple, but useful.",
      },
      {
        type: "thread",
        date: "3 nov 2023",
        title: "mindset shift",
        story:
          "i learned things the hard way. motivation fades, people change, but showing up and working consistently is what actually stays.",
      },
    ],
  },
];

export interface PastTimelineRow {
  chapter: PastTimelineChapter;
  event: PastTimelineEvent;
  globalIdx: number;
  isFirstInChapter: boolean;
}

export const PAST_TIMELINE_ROWS: PastTimelineRow[] = PAST_CHAPTERS.flatMap(
  (chapter) =>
    chapter.events.map((event, eventIdx) => ({
      chapter,
      event,
      isFirstInChapter: eventIdx === 0,
    })),
).map((row, globalIdx) => ({ ...row, globalIdx }));

export const PAST_STEP_COUNT = PAST_TIMELINE_ROWS.length;
