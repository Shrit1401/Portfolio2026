import type { StructureResolver } from "sanity/structure";
import { GALLERY_ID, INSPIRATION_ID } from "./constants";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem().title("Work").child(S.documentTypeList("work")),
      S.listItem()
        .title("Gallery of things (home)")
        .id("galleryOfThingsNav")
        .child(
          S.document()
            .schemaType("galleryOfThings")
            .documentId(GALLERY_ID)
            .title("Gallery of things"),
        ),
      S.listItem()
        .title("Inspiration board (/photos)")
        .id("inspirationBoardNav")
        .child(
          S.document()
            .schemaType("inspirationBoard")
            .documentId(INSPIRATION_ID)
            .title("Inspiration board"),
        ),
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
