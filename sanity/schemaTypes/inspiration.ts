import { defineArrayMember, defineField, defineType } from "sanity";
import { tweetIdFromUrl } from "../lib/tweet";

const linkField = defineField({
  name: "link",
  type: "url",
  description: "Optional. Opens in a new tab.",
});

/** Singleton: the masonry board on /photos. */
export const inspirationBoard = defineType({
  name: "inspirationBoard",
  title: "Inspiration board",
  type: "document",
  fields: [
    defineField({
      name: "pins",
      title: "Pins",
      description:
        "Reading order across the masonry. Mix images, quotes and tweets so it never feels like a list.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "imagePin",
          title: "Image",
          fields: [
            defineField({
              name: "image",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "caption",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            linkField,
          ],
          preview: {
            select: { title: "caption", media: "image" },
            prepare: ({ title, media }) => ({ title, subtitle: "Image", media }),
          },
        }),
        defineArrayMember({
          type: "object",
          name: "quotePin",
          title: "Quote",
          fields: [
            defineField({
              name: "text",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "by",
              type: "string",
              description: "Who said it / where it's from.",
              validation: (Rule) => Rule.required(),
            }),
            linkField,
          ],
          preview: {
            select: { title: "text", by: "by" },
            prepare: ({ title, by }) => ({ title, subtitle: `Quote · ${by ?? ""}` }),
          },
        }),
        defineArrayMember({
          type: "object",
          name: "tweetPin",
          title: "Tweet",
          fields: [
            defineField({
              name: "url",
              title: "Tweet URL",
              type: "url",
              description: "e.g. https://x.com/someone/status/1910056676847411662",
              validation: (Rule) =>
                Rule.required().custom((v) =>
                  tweetIdFromUrl(v) ? true : "Paste a link to a single post (…/status/123…)",
                ),
            }),
          ],
          preview: {
            select: { url: "url" },
            prepare: ({ url }) => ({ title: url, subtitle: "Tweet" }),
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Inspiration board (/photos)" };
    },
  },
});
