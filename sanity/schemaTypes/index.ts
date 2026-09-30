import { type SchemaTypeDefinition } from "sanity";
import { work } from "./work";
import {
  pastChapter,
  pastEvent,
  pastTimeline,
} from "./pastTimeline";
import { galleryOfThings } from "./galleryOfThings";
import { inspirationBoard } from "./inspiration";
import { pageViews } from "./pageViews";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    work,
    pastChapter,
    pastEvent,
    pastTimeline,
    galleryOfThings,
    inspirationBoard,
    pageViews,
  ],
};
