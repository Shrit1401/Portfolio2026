/** Dispatched on `document` when the loader begins its exit (homepage should start revealing). */
export const LOADER_EXIT_START = "site:loader-exit-start" as const;

/** If the loader never fires (e.g. dev without Loader), still reveal the page. */
export const LOADER_EXIT_FALLBACK_MS = 7000;
