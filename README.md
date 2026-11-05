# Ptoszek rewrite

Static, modular rework of [jaczup/ptoszek.pl](https://github.com/jaczup/ptoszek.pl), with its original bundled bird media. The original download and ZIP are preserved outside the published directory.

- `/` — empty home page, top panel, one **ONLYFANS** link.
- `/onlyfans` — Polish bird prank: click to start or press Space three times, original videos, floating birds, cursor trail, changing titles and messages, and a local browser-information console.
- Stop or Escape ends the session. Switching tabs also stops playback and effects. Reduced-motion preferences disable animated effects.

## Run

Node.js 20+; no packages, account, API key, database, or backend needed.

```sh
npm run dev
# http://127.0.0.1:5173
npm run build
npm test
```

## Vercel Hobby

Import this directory as the project root. Select **Other** as the framework. The included `vercel.json` sets `npm run build` and `dist` as the output directory. No environment variables are needed. Only `public/` is copied into the deployment. Do not select the downloaded `ptoszek.pl-main` directory.

This uses static hosting without Functions or paid storage. Vercel Hobby is intended for personal, non-commercial projects and still has usage limits: https://vercel.com/docs/plans/hobby . Video transfer counts against your allowance; playback starts only after interaction and loads one video at a time. The bundled media is about 85 MB. Update media filenames and their references together when replacing cached files.

## Structure

- `public/index.html` and `public/styles/shell.css`: home/navigation.
- `public/onlyfans/index.html` and `public/styles/ptoszek.css`: bird experience and responsive styles.
- `public/js/app.js`: interaction and session orchestration.
- `public/js/session.js`: event, timer, and effect cleanup.
- `public/js/effects/`: visual effects, browser console, media playback.
- `public/js/config.js`: media lists and messages.
- `scripts/`: dependency-free build and local preview.
- `docs/upstream.md`: PR review, attribution, and intentional differences.

The preview server is for local development. Vercel serves the built files and video range requests in production.

Original author: Jaczup; original inspiration: feross/TheAnnoyingSite.com. See the preserved upstream README and source for media contributors. The downloaded source has no LICENSE file; this rewrite does not assign a license to upstream code or media.
