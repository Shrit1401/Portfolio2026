export interface Research {
  title: string;
  description: string;
  date: string;
  markdown: string;
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
