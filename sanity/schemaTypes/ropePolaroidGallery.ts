import { defineArrayMember, defineField, defineType } from "sanity";

export const ropePolaroidGallery = defineType({
  name: "ropePolaroidGallery",
  title: "Rope polaroid gallery",
  type: "document",
  fields: [
    defineField({
      name: "frames",
      title: "Polaroid frames",
      description:
        "Order = left to right on the rope. Link is optional — leave empty for a display-only frame.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "polaroidFrame",
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
              name: "subtitle",
              type: "string",
              title: "Caption",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link (optional)",
              type: "string",
              description:
                "If set: site path (e.g. /work) or full URL on click. Leave empty for no link.",
            }),
          ],
          preview: {
            select: { subtitle: "subtitle", media: "image" },
            prepare({ subtitle, media }) {
              return {
                title: subtitle || "Frame",
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
      return { title: "Rope polaroid gallery (home)" };
    },
  },
});
