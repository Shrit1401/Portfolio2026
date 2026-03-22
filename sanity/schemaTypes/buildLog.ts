import { defineField, defineType } from "sanity";

export const buildLogEntry = defineType({
  name: "buildLogEntry",
  title: "Build log entry",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      type: "string",
      title: "Icon",
      description: "Emoji on the card (e.g. 🚀, 🏆).",
    }),
    defineField({
      name: "location",
      type: "string",
      description: "City or context (e.g. Mumbai, Remote).",
    }),
    defineField({
      name: "date",
      type: "string",
      title: "Date line",
      description: "Short label shown on the card (e.g. Jan 2024, 2023).",
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "learnMoreUrl",
      title: "Learn more link",
      type: "string",
      description:
        "URL for the “learn more” button: site path (e.g. /work) or full URL (https://…). Leave empty to hide the button.",
    }),
    defineField({
      name: "story",
      title: "Story / read more",
      type: "text",
      rows: 5,
      description:
        "Shown when someone opens the polaroid view. Optional; if empty, the modal still shows the photo and title.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      location: "location",
      date: "date",
      media: "image",
    },
    prepare({ title, location, date, media }) {
      const subtitle =
        location && date
          ? `${location} · ${date}`
          : (location ?? date ?? "");
      return { title, subtitle, media };
    },
  },
});

/** Singleton: drag references to set homepage + archive order. */
export const buildLogList = defineType({
  name: "buildLogList",
  title: "Build log order",
  type: "document",
  fields: [
    defineField({
      name: "entries",
      title: "Entries",
      description: "Drag rows to change order (top = first on the site).",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "buildLogEntry" }],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Build log order" };
    },
  },
});
