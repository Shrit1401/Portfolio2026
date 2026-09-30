# Sanity content guide (for agents)

This file tells an agent how to read and edit the site's content in Sanity.
The site (Next.js) reads everything on each request, so changes appear on
shrit's site as soon as they are saved. No redeploy is needed.

## Connection

| Thing       | Value                                             |
| ----------- | ------------------------------------------------- |
| Project ID  | `2k2xduz5`                                        |
| Dataset     | `production`                                      |
| API version | `2025-05-27`                                      |
| Token       | env var `SANITY_API_WRITE_TOKEN` (Editor role)    |
| Studio (UI) | `/studio` on the site                             |

Never print, commit or paste the token anywhere. Read it from the environment.

```bash
export SANITY_API_WRITE_TOKEN=...   # from .env.local
API=https://2k2xduz5.api.sanity.io/v2025-05-27
```

### Read (GROQ)

```bash
curl -sG "$API/data/query/production" \
  -H "Authorization: Bearer $SANITY_API_WRITE_TOKEN" \
  --data-urlencode 'query=*[_id == "galleryOfThings"][0].items[]{_key, caption}'
```

### Write (mutations)

```bash
curl -s "$API/data/mutate/production?returnIds=true" \
  -H "Authorization: Bearer $SANITY_API_WRITE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mutations":[ ... ]}'
```

Several mutations in one request are applied together (all or nothing).

### Upload an image

```bash
curl -s "$API/assets/images/production?filename=my-photo.jpg" \
  -H "Authorization: Bearer $SANITY_API_WRITE_TOKEN" \
  -H "Content-Type: image/jpeg" \
  --data-binary @my-photo.jpg
# → response.document._id is the asset id, e.g. "image-abc123-1200x800-jpg"
```

Use the asset id in an image field like this:

```json
{ "_type": "image", "asset": { "_type": "reference", "_ref": "image-abc123-1200x800-jpg" } }
```

If you use JS instead of curl: `@sanity/client` is installed.
`createClient({ projectId: "2k2xduz5", dataset: "production", apiVersion: "2025-05-27", token, useCdn: false })`,
then `client.fetch`, `client.patch(id)...commit()`, `client.assets.upload("image", stream)`.

## Rules

1. **Every item in an array needs a unique `_key`** (a random string of about 12 hex
   characters). Without it, items can't be edited or reordered in Studio.
2. **Singletons have fixed `_id`s.** Patch them. Never create a second document of
   the same type.
3. **Array order is display order.** "Add to the top" means insert `before` the
   first item. "Add to the end" means insert `after` the last item.
4. Target a single array item by its key (`items[_key=="abc"]`), never by its
   index. Indexes change when things are reordered.
5. Links: a site path starting with `/` or a full `https://` URL.
6. Read the document before you change it. After you write, run a query to check
   that the change is there.
7. Don't touch `pageViews`. The site updates those counts itself.

## Documents

### 1. Gallery of things: homepage strip

- `_id`: `galleryOfThings` · `_type`: `galleryOfThings` (singleton)
- Shows as two slowly scrolling rows. The **first half** of `items` is the top row
  and the **second half** is the bottom row. Clicking an item opens a modal with
  the story and a "learn more" link.

```jsonc
{
  "_id": "galleryOfThings",
  "_type": "galleryOfThings",
  "items": [
    {
      "_type": "galleryItem",
      "_key": "a1b2c3d4e5f6",
      "image": { "_type": "image", "asset": { "_type": "reference", "_ref": "image-..." }, "alt": "optional alt text" }, // required
      "caption": "mom i won the hackathon 😭",   // required, shown under the photo
      "place": "Bangalore",                      // optional
      "date": "12 Mar 2026",                     // optional, free text
      "story": "longer text shown in the modal", // optional
      "link": "https://…"                        // optional ("/path" or full URL)
    }
  ]
}
```

A tile shows `place · date` under the caption when either is set.

### 2. Inspiration board: `/photos`

- `_id`: `inspirationBoard` · `_type`: `inspirationBoard` (singleton)
- A Pinterest-style masonry board. The order of `pins` is the reading order. Mix
  the three pin types so it never looks like a list.

```jsonc
{
  "_id": "inspirationBoard",
  "_type": "inspirationBoard",
  "pins": [
    // Image pin
    {
      "_type": "imagePin",
      "_key": "…",
      "image": { "_type": "image", "asset": { "_type": "reference", "_ref": "image-..." } }, // required
      "caption": "Shoe Dog, Phil Knight",  // required
      "link": "https://…"                   // optional, must be a full URL
    },
    // Quote pin
    {
      "_type": "quotePin",
      "_key": "…",
      "text": "Live in the future, then build what's missing.", // required
      "by": "Paul Graham",                                      // required: who / where from
      "link": "https://paulgraham.com/startupideas.html"        // optional, full URL
    },
    // Tweet pin
    {
      "_type": "tweetPin",
      "_key": "…",
      "url": "https://x.com/someone/status/1910056676847411662" // required, must contain /status/<id>
    }
  ]
}
```

The image width and height are read from the uploaded asset, so you don't need to
set them.

### 3. Life timeline: `/past`

- `_id`: `pastLifeTimeline` · `_type`: `pastTimeline` (singleton)

```jsonc
{
  "_id": "pastLifeTimeline",
  "_type": "pastTimeline",
  "title": "Life timeline",            // label only shown in Studio
  "chapters": [                         // required, at least 1
    {
      "_type": "pastChapter",
      "_key": "…",
      "slug": { "_type": "slug", "current": "early-days" }, // required
      "title": "early days",                                 // required
      "events": [                                            // required, at least 1
        {
          "_type": "pastEvent",
          "_key": "…",
          "eventType": "start",      // required, one of: start | thread | breakthrough | turn | experiment | big-moment | shift | first
          "date": "2019 - ∞",        // optional date line shown on the card
          "title": "video editing",  // required
          "story": "main text :: optional aside", // optional; text after " :: " becomes an aside
          "image": { "_type": "image", "asset": { "_type": "reference", "_ref": "image-..." } }, // optional
          "imageUrl": "/work/img-1.jpeg"  // optional fallback path on the site, used when image is empty
        }
      ]
    }
  ]
}
```

### 4. Work

- `_type`: `work` (many documents, random `_id`s)

```jsonc
{
  "_type": "work",
  "title": "string",
  "description": "string",
  "year": 2026,
  "image": { "_type": "image", "asset": { "_type": "reference", "_ref": "image-..." }, "alt": "string" },
  "usefullinks": [ { "_key": "…", "name": "GitHub", "link": "https://…" } ]
}
```

### 5. Page views (don't edit)

- `_type`: `pageViews`, fields `slug` (string) and `count` (number). The site
  updates these itself when people read posts.

### Old documents (unused)

`ropePolaroidGallery`, `siteBuildLogList` and `buildLogEntry` documents may still
be in the dataset. Nothing reads them any more, and their schemas have been
removed, so ignore them.

## Recipes

**Add a photo to the end of the gallery**

```json
{"mutations":[{"patch":{"id":"galleryOfThings",
  "insert":{"after":"items[-1]","items":[{
    "_type":"galleryItem","_key":"f00dbabe1234",
    "image":{"_type":"image","asset":{"_type":"reference","_ref":"image-..."}},
    "caption":"new thing","place":"Bangalore","date":"Sep 2026"}]}}}]}
```

**Add a pin to the top of the inspiration board**

```json
{"mutations":[{"patch":{"id":"inspirationBoard",
  "insert":{"before":"pins[0]","items":[{
    "_type":"tweetPin","_key":"c0ffee123456",
    "url":"https://x.com/someone/status/123456789"}]}}}]}
```

**Edit one item**

```json
{"mutations":[{"patch":{"id":"galleryOfThings",
  "set":{"items[_key==\"f00dbabe1234\"].caption":"better caption"}}}]}
```

**Remove one item**

```json
{"mutations":[{"patch":{"id":"inspirationBoard",
  "unset":["pins[_key==\"c0ffee123456\"]"]}}]}
```

**Reorder**

Read the whole array, reorder it locally, then write it back with
`{"set": {"items": [...]}}`. Keep every `_key` the same.

**Check a change**

```bash
curl -sG "$API/data/query/production" -H "Authorization: Bearer $SANITY_API_WRITE_TOKEN" \
  --data-urlencode 'query=*[_id=="inspirationBoard"][0]{"count": count(pins), "first": pins[0]}'
```

## Where the site reads this

| Document           | Code                                                    |
| ------------------ | ------------------------------------------------------- |
| `galleryOfThings`  | `app/lib/gallery.ts` → `app/components/home/Gallery.tsx` |
| `inspirationBoard` | `app/lib/inspiration.ts` → `app/photos/Board.tsx`        |
| `pastLifeTimeline` | `app/lib/pastTimelineServer.ts`                          |
| `work`             | `app/lib/server.ts`                                      |
| `pageViews`        | `app/api/views/[slug]/route.ts`                          |

Schemas are defined in `sanity/schemaTypes/`. If you change a schema, update this
file too.
