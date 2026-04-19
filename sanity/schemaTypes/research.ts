import { defineField, defineType } from "sanity";

export const research = defineType({
  title: "Research",
  name: "research",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
    }),
    defineField({
      name: "description",
      type: "text",
      description: "one linear",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
      description: "Add tags to categorize this research",
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: "markdown",
      type: "markdown",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
