/** Hero accents — shared by HeroText + page transition grid */
export const HERO_COLORS = {
  burgundy: "#7B3737",
  olive: "#3B4F1B",
  ochre: "#B89B2B",
  purple: "#6B46C1",
  teal: "#2C7A7B",
  coral: "#E53E3E",
} as const;

export const HERO_COLOR_VALUES: readonly string[] =
  Object.values(HERO_COLORS);
