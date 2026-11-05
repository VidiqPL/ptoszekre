# Ptoszek rewrite

Static, modular version of [jaczup/ptoszek.pl](https://github.com/jaczup/ptoszek.pl), with its original bundled bird media. The original download and ZIP are preserved outside the published directory.

- `/` — empty home page, top panel, one **ONLYFANS** link.
- `/onlyfans` — original white Ptoszek page, original plain layout and 300px GIF, with the prompt updated to “We no rusz myszką.” The first mouse movement starts the experience immediately; clicking/tapping the bird or Space/Enter remains a fallback. After activation, the parent attempts to open another bird window every 5 seconds, up to six simultaneous windows. No further input is needed once popups are allowed. Clicking a playing video or pressing Space/Enter can also open another window. Each popup receives a random video from a shuffled list, with no repeats until the list is exhausted; videos autoplay and loop. Timer-opened windows start muted immediately when they have no user activation, so playback does not wait for a hover or click. If other autoplay with audio is blocked, playback retries muted; a click attempts to enable sound. There is no control toolbar or native video controls. The browser-information console is a small white panel that can be collapsed by clicking its heading. The parent immediately starts moving popup windows in random directions at 15 pixels per 50ms and bounces them off the screen edges, including secondary displays. Moving windows requires real browser popups; ordinary tabs and mobile browsers cannot be moved. Wayland may disallow movement entirely even for real popups (https://developer.mozilla.org/en-US/docs/Web/API/Window/moveTo). Reduced-motion settings disable movement. Speech, a mouse-controlled theremin, animated URL/theme color, title messages, cursor trails and a browser-information console run after activation.
- Random bundled photos and videos are downloaded with the original anchor/download mechanism: one attempt at activation and another when a new popup opens, with at most three attempts across the session. Browser automatic-download permissions still apply.
- Escape ends the session and closes its child windows. Further mouse movement does not restart a session stopped with Escape. Popup focus and switching tabs do not stop the parent. Up to six popups can be open at once; closed slots can be reused. Reduced-motion preferences disable animated effects and moving windows.
- Browsers may require permission for popups and audio. A blocked popup displays a message; enable popups for the site; the next automatic attempt is within five seconds. The site does not bypass browser permissions. Mobile browsers may open tabs instead of movable windows.

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

This uses static hosting without Functions or paid storage. Vercel Hobby is intended for personal, non-commercial projects and still has usage limits: https://vercel.com/docs/plans/hobby . Video transfer counts against your allowance; playback starts on the first mouse movement or fallback interaction and loads one video at a time. The bundled media is about 85 MB. Update media filenames and their references together when replacing cached files.

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
