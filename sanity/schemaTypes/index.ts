import { type SchemaTypeDefinition } from "sanity";
import { work } from "./work";
import {
  pastChapter,
  pastEvent,
  pastTimeline,
} from "./pastTimeline";
import { research } from "./research";
import { tag } from "./tag";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [work, pastChapter, pastEvent, pastTimeline, research, tag],
};
