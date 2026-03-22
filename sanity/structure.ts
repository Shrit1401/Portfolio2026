import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem().title("Research").child(S.documentTypeList("research")),
      S.listItem().title("Tags").child(S.documentTypeList("tag")),
      S.listItem().title("Work").child(S.documentTypeList("work")),
      S.listItem()
        .title("Life timeline")
        .id("lifeTimeline")
        .child(
          S.document()
            .schemaType("pastTimeline")
            .documentId("pastLifeTimeline")
            .title("Life timeline"),
        ),
    ]);
