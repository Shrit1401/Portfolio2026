import type { StructureResolver } from "sanity/structure";
import { BUILD_LOG_LIST_ID } from "./constants";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem().title("Research").child(S.documentTypeList("research")),
      S.listItem().title("Tags").child(S.documentTypeList("tag")),
      S.listItem().title("Work").child(S.documentTypeList("work")),
      S.listItem()
        .title("Build log order")
        .id("buildLogOrder")
        .child(
          S.document()
            .schemaType("buildLogList")
            .documentId(BUILD_LOG_LIST_ID)
            .title("Build log order"),
        ),
      S.listItem()
        .title("Build log entries")
        .child(S.documentTypeList("buildLogEntry")),
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
