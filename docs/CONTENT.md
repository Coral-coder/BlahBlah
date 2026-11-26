# Content: over-the-air updates

Course content is decoupled from app releases. You can edit lessons, add units, or
even add whole languages and have them reach installed apps **without a new
TestFlight/App Store/Play build** — reserve app builds for engine/UI changes
("major versions").

## How it works

```
blueprints (src/curriculum/blueprints/**)         ← the editable content (data)
        │  buildContentBundle.run.js (serialize)
        ▼
content-bundle.json  ──published──▶  GitHub Release "content"  (public, CDN)
        ▲                                   │  fetched on launch
        │                                   ▼
   bundled in the app (offline fallback)   app: cache to disk → regenerate courses
```

- The bundle is **pure blueprint data**. The generator that expands blueprints
  into lessons lives in the app binary, so the bundle stays small (~270 KB) and an
  in-progress generator refactor never goes out over the air.
- On launch the app applies the disk-cached bundle instantly, then fetches the
  latest in the background (`src/lib/remoteContent.ts`). A content swap re-renders
  the app via `onContentChange`.
- Offline or first run with no network → the content baked into the binary is used.

## Schema gate (don't skip this)

`CONTENT_SCHEMA` in `src/curriculum/index.ts` is carried in every bundle. The app
**ignores a bundle whose schema doesn't match** and keeps using its baked-in
content. So:

- **Pure content edits** (new words/units/sentences using existing exercise
  types): leave `CONTENT_SCHEMA` as-is. They flow to all current installs.
- **Engine changes** (new exercise type, changed blueprint shape, generator
  changes that alter output structure): **bump `CONTENT_SCHEMA`** in the same
  change that ships the new app build. Old installs ignore the new bundle (no
  crash); the new app version picks it up.

## Publishing

`content-bundle.yml` runs on pushes to the dreaming branch that touch
`src/curriculum/blueprints/**`. It validates content (`validate:content`), builds
the bundle stamped with the commit SHA, and uploads it to the `content` release
(`--clobber`). This is automatic and validator-gated — broken content can't go
live. The vocab pipeline commits to `blueprints/generated/**`, so new
auto-generated words publish on their own too.

Manual build for inspection:

```bash
npm run build:content-bundle           # writes content-bundle.json
```

## Limits

- New **exercise types** or engine behavior still require an app build (+ a schema
  bump). Everything expressible with the existing blueprint/exercise types is OTA.
- The `content` release must not be deleted — it's the live content source.
