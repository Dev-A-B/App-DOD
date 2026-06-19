# Do or Die — v2

## What's in this package

- `index.html`, `src/` — the app itself (vanilla React + Babel-in-browser + Tailwind CDN, same no-build-step stack as before, so GitHub Pages can serve it directly).
- `manifest.json`, `sw.js` — PWA install + offline shell caching, referencing your existing icon filenames.
- `migrate.py` — the one-time migration script (already run for you; see below).
- `migrated_output.json` — **the new Firebase data**, ready to import. This replaces your entire database.
- `DATA_MODEL.md` — full reference for the new `/days`, `/profiles`, `/splits`, `/exercise_meta` shapes.

**Not included** (you keep your existing ones): `header-logo.png`, `icon-192.png`, `icon-512.png`. Just drop your existing copies of these three files into the same folder as `index.html`.

## 1. Import the new data into Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/) → your `do-or-die-33610` project → Realtime Database.
2. Click the ⋮ (overflow menu) at the top of the data viewer → **Import JSON**.
3. Select `migrated_output.json`.
4. Confirm — **this replaces all existing data at the root** with the new structure. Your old 133 days, profiles, and the C-Bum split are all preserved inside it (converted to the new shape), plus two new draft splits (PPL, Bro Split) you can edit freely in-app.

## 2. Publish to GitHub Pages

1. Create a new repo (or reuse your existing one).
2. Copy in: `index.html`, `manifest.json`, `sw.js`, the `src/` folder, and your three `.png` files.
3. Commit and push.
4. In the repo's Settings → Pages, set the source branch (e.g. `main`) and folder (`/root`).
5. Your app will be live at `https://<username>.github.io/<repo>/`.

## 3. What changed in the data, briefly

- All workout data now lives under `/days/{date}/{user}/exercises/{id}`, with each exercise carrying an explicit `setType` (`standard`, `dropset`, `pyramid`, `superset`, `timed`) and a `sets` object shaped for that type — see `DATA_MODEL.md`.
- Your old logged sets (no type info) were migrated as `setType: "standard"`, per your instruction — nothing was inferred or guessed.
- PRs were fully recomputed from your real history into `/profiles/{user}/prs`, using "heaviest stage counts" for dropset/pyramid going forward.
- Splits moved from per-user `/programs/{user}/{id}` to a shared `/splits/{id}`, since both users draw from the same split library. Your edited C-Bum split came through with set types inferred from its existing exercise tags (e.g. "DROP SET" → `dropset`); review these in the Edit tab since this was a best-effort guess on template data only (not your logged history).
- `exercise_meta` (the AI muscle-engagement library) carried over unchanged — it wasn't used in the old UI but is preserved for future use.

## 4. Known limitations to be aware of

- Old superset pairs (linked by exercise name in the old data) were migrated as two independent standard exercises, since the old linkage wasn't reliable enough to auto-reconnect. New supersets you log going forward will link correctly.
- The PPL and Bro Split day-by-day content are my drafts, meant as a reasonable starting point — fully editable from the Edit tab on each split.
