/** Polaroid strip — fallback when Sanity has no frames yet. Images in `public/work/`. */
export type WorkGalleryItem = {
  img: string;
  subtitle: string;
  /** When omitted, the polaroid is display-only (no click / navigation). */
  href?: string;
};

export const workGalleryItems: WorkGalleryItem[] = [
  {
    img: "/work/img-1.jpeg",
    subtitle: "late night experiments",
    href: "/work",
  },
  {
    img: "/work/img-2.jpeg",
    subtitle: "sketches that stuck",
    href: "/work",
  },
  {
    img: "/work/img-3.jpeg",
    subtitle: "color and noise",
    href: "/archive",
  },
  {
    img: "/work/img-4.jpeg",
    subtitle: "build logs & scraps",
    href: "/archive",
  },
  {
    img: "/work/img-5.jpeg",
    subtitle: "tools on the desk",
    href: "/work",
  },
  {
    img: "/work/img-6.jpeg",
    subtitle: "still figuring it out",
    href: "/research",
  },
];
