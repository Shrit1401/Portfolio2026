export const wayoutZones = [
  {
    href: "/archive",
    img: "/wayout/CHAOS.png",
    title: "Archive",
    subtitle: "everything I tried",
  },
  {
    href: "/work",
    img: "/wayout/focus.png",
    title: "Work",
    subtitle: "building things",
  },
  {
    href: "/research",
    img: "/wayout/quiet.png",
    title: "Research",
    subtitle: "what I think",
  },
] as const;

export type WayoutZone = (typeof wayoutZones)[number];
