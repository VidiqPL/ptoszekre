# Ptoszek rewrite

Static, modular version of [jaczup/ptoszek.pl](https://github.com/jaczup/ptoszek.pl), with its original bundled bird media. The original download and ZIP are preserved outside the published directory.

- `/` — empty home page, top panel, one **ONLYFANS** link.
- `/onlyfans` — original white Ptoszek page, original Polish headings and 300px GIF. Click/tap the bird to start immediately, or press Space three times. Moving the mouse alone does not start anything. After activation, the parent attempts to open another bird window every 5 seconds, up to six simultaneous windows. No further input is needed once popups are allowed. Clicking a playing video or pressing Space/Enter can also open another window. Each popup receives a random video from a shuffled list, with no repeats until the list is exhausted; videos autoplay and loop. Popup audio is played in hidden audio elements in the already-activated main document and synchronized to each popup’s playback time, pause/seek/rate and loop. Popup videos stay muted to avoid double sound. Closing a popup removes its audio; Escape removes every track. Like the original `startInvisiblePictureInPictureVideo`, the parent prepares a muted looping video in a 1px offscreen area before activation. Activation moves that same player into the stage and unmutes it without resetting its source. Media/Web Audio are resumed before popup creation, directly inside the starting mouse/touch/key handler. Every active video, including timer-opened windows, attempts to play with sound at full media volume. If browser autoplay policy denies sound, the film continues muted and a separate message explains the restriction. Any real click/tap or key interaction can retry audio; it need not target the film. The first native press starts audible media and Web Audio under default browser autoplay policy; no second click on the film is needed. Browser permission cannot be bypassed by the page. There is no control toolbar or native video controls. The browser-information console is a small white panel that can be collapsed by clicking its heading. It shows 30+ local facts: declared browser/platform, languages/timezone, display/viewport/pixel density, CPU/RAM estimates, pointer/touch capabilities, privacy/accessibility settings, network estimates, GPU, battery and site storage usage/quota. Unsupported APIs are marked unavailable; no IP or location service is called. The parent immediately starts moving popup windows in random directions at 15 pixels per 50ms and bounces them off the screen edges, including secondary displays. Moving windows requires real browser popups; ordinary tabs and mobile browsers cannot be moved. Wayland may disallow movement entirely even for real popups (https://developer.mozilla.org/en-US/docs/Web/API/Window/moveTo). Reduced-motion settings disable movement. Speech using the original phrase list and a theremin copied from the original (periodic waveform, 50/4000 pitch mapping and mouse-dependent gain), animated URL/theme color, title messages, cursor trails and a browser-information console run after activation.
- The main film has a centered red “Kliknij film 10 razy aby zamknąć ptoszka” label and click counter. The counter deliberately continues beyond 10/10 without ending the session; Escape remains the real exit. Popup windows do not display this counter.
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

This uses static hosting without Functions or paid storage. Vercel Hobby is intended for personal, non-commercial projects and still has usage limits: https://vercel.com/docs/plans/hobby . Video transfer counts against your allowance; one video preloads silently as soon as `/onlyfans` opens; the visible session starts on a native click/tap or Space ×3. Each popup loads one video and the main page loads its matching audio track from the same bundled file. All playback remains browser-side; there are no server functions. The bundled media is about 85 MB. Update media filenames and their references together when replacing cached files.

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
