import { defineField, defineType } from "sanity";

const EVENT_TYPE_OPTIONS = [
  { title: "Start", value: "start" },
  { title: "Thread", value: "thread" },
  { title: "Breakthrough", value: "breakthrough" },
  { title: "Turn", value: "turn" },
  { title: "Experiment", value: "experiment" },
  { title: "Big moment", value: "big-moment" },
  { title: "Shift", value: "shift" },
  { title: "First", value: "first" },
] as const;

export const pastEvent = defineType({
  name: "pastEvent",
  title: "Timeline event",
  type: "object",
  fields: [
    defineField({
      name: "eventType",
      title: "Type",
      type: "string",
      options: {
        list: [...EVENT_TYPE_OPTIONS],
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      type: "string",
      title: "Date line",
      description: "Shown on the card (e.g. 2023 march - 2023 aug).",
    }),
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "story",
      type: "text",
      rows: 8,
      description:
        "Main text. Optional aside after :: (same as the site: body :: aside).",
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      title: "Polaroid image",
    }),
    defineField({
      name: "imageUrl",
      title: "Static image path (fallback)",
      type: "string",
      description:
        "If no Sanity image, use a path on this site (e.g. /work/img-1.jpeg).",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "date", media: "image" },
  },
});

export const pastChapter = defineType({
  name: "pastChapter",
  title: "Chapter",
  type: "object",
  fields: [
    defineField({
      name: "slug",
      type: "slug",
      title: "Chapter id",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "events",
      type: "array",
      of: [{ type: "pastEvent" }],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare({ title, slug }) {
      return {
        title: title || "Chapter",
        subtitle: slug ? String(slug) : undefined,
      };
    },
  },
});

export const pastTimeline = defineType({
  name: "pastTimeline",
  title: "Life timeline",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Label (studio only)",
      initialValue: "Life timeline",
    }),
    defineField({
      name: "chapters",
      type: "array",
      of: [{ type: "pastChapter" }],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
});
