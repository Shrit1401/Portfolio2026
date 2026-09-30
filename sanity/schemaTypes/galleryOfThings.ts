import { defineArrayMember, defineField, defineType } from "sanity";

/** Singleton: the "gallery of things" strip on the homepage. */
export const galleryOfThings = defineType({
  name: "galleryOfThings",
  title: "Gallery of things",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Items",
      description:
        "Drag to reorder. The first half is the top row, the second half the bottom row.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "galleryItem",
          title: "Item",
          fields: [
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
              name: "caption",
              type: "string",
              description: "Shown under the photo, e.g. “my dog”.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "place",
              type: "string",
              description: "Optional, e.g. Bangalore.",
            }),
            defineField({
              name: "date",
              type: "string",
              description: "Optional, free text, e.g. 12 Mar 2026.",
            }),
            defineField({
              name: "story",
              type: "text",
              rows: 4,
              description: "Optional. Shown when someone opens the photo.",
            }),
            defineField({
              name: "link",
              type: "string",
              description:
                "Optional “learn more” link: a site path (/posts) or a full URL.",
              validation: (Rule) =>
                Rule.custom((v) =>
                  !v || v.startsWith("/") || /^https?:\/\//.test(v)
                    ? true
                    : "Use a path starting with / or a full https:// URL",
                ),
            }),
          ],
          preview: {
            select: { title: "caption", place: "place", date: "date", media: "image" },
            prepare({ title, place, date, media }) {
              return {
                title: title || "Untitled",
                subtitle: [place, date].filter(Boolean).join(" · "),
                media,
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Gallery of things (home)" };
    },
  },
});
