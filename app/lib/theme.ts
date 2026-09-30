// Day/night theme: dark from 8pm to 6am (local time), light otherwise.
// A manual toggle overrides the schedule only until the next 8pm/6am switch.

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme-override";
export const DARK_CLASS = "theme-dark";
const DARK_FROM = 20;
const DARK_UNTIL = 6;

/**
 * Resolves the theme (override, else schedule) and applies it to <html> unless `apply` is false.
 * Self-contained (hence the repeated constants) so it can also be inlined as a pre-paint script.
 */
export function applyTheme(apply = true): "light" | "dark" {
  const KEY = "theme-override";
  const FROM = 20;
  const UNTIL = 6;
  const h = new Date().getHours();
  let theme: "light" | "dark" = h >= FROM || h < UNTIL ? "dark" : "light";
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || "null");
    if (o && o.until > Date.now()) theme = o.theme;
    else if (o) localStorage.removeItem(KEY);
  } catch {}
  if (apply) document.documentElement.classList.toggle("theme-dark", theme === "dark");
  return theme;
}

/** The next 6am or 8pm, whichever comes first — when a manual override expires. */
function nextSwitch(now = new Date()): number {
  const candidates = [DARK_UNTIL, DARK_FROM].flatMap((hour) =>
    [0, 1].map((day) => {
      const d = new Date(now);
      d.setDate(d.getDate() + day);
      d.setHours(hour, 0, 0, 0);
      return d.getTime();
    }),
  );
  return Math.min(...candidates.filter((t) => t > now.getTime()));
}

export function setThemeOverride(theme: Theme): Theme {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ theme, until: nextSwitch() }));
  } catch {}
  return applyTheme();
}

/** Inlined into <head> so the right theme is on <html> before first paint. */
export const themeScript = `(${applyTheme.toString()})()`;
