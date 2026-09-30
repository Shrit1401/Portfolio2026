export interface Research {
  title: string;
  description: string;
  date: string;
  markdown: string;
  /** Cover still shown on cards, e.g. /covers/<slug>.jpg */
  cover?: string;
  /** Where the cover still is from, shown as a small caption. */
  coverCredit?: string;
  /** CSS aspect ratio for the article's cover, e.g. "5 / 2". Defaults to 16 / 8.7. */
  coverAspect?: string;
  tags?: Array<{
    name: string;
    slug: {
      current: string;
    };
  }>;
  slug: {
    current: string;
  };
}

export interface Work {
  title: string;
  description: string;
  year: number;
  image: string;
  usefullinks?: Array<{
    name: string;
    link: string;
  }>;
}

export interface Past {
  title: string;
  description: string;
  year: string;
}
