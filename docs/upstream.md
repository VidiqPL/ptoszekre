# Upstream review — 2026-11-05

Source: https://github.com/jaczup/ptoszek.pl . Reviewed the three open pull requests via GitHub's file diffs. This is an adaptation, not a claim that the upstream PRs were merged or applied unchanged.

| PR | Author | Result |
| --- | --- | --- |
| [#25](https://github.com/jaczup/ptoszek.pl/pull/25) | Kocmouch | Adapted changing titles, cursor trail, overlay messages and a brief stage wobble into `effects/chaos.js`. One bounded session; Stop clears everything. Keyboard locks, notification prompts, selection hijacking and wake-lock loops omitted. |
| [#28](https://github.com/jaczup/ptoszek.pl/pull/28) | UhcWolfe (diff credits @kubso) | Adapted the browser-information console into `effects/console.js`: local language, timezone, screen, CPU, RAM estimate, touch and theme. No third-party IP lookup, location request, network transmission, or claims of compromise. |
| [#31](https://github.com/jaczup/ptoszek.pl/pull/31) | szymsun | Reviewed, not implemented: this adds forced USOSWEB logout requests to unrelated university accounts. |

The download already includes contributions credited in its `index.js`, such as additional videos and bird images. Those bundled files are retained. The current version restores the original intro HTML wording, white background, typography and GIF from the download, moving styles to a separate CSS file. The downloaded `index.js` matches the upstream `main` blob `a61bdbe09d6868e9cb9bd507ce42f2be8a772780` checked on 2026-11-05.

Original `openWindow`, `moveWindowBounce`, `startVideo`, `speak`, `startTheramin`, URL animation and theme animation were reviewed and adapted into separate modules. Popups open synchronously during user gestures, carry an explicit child/session identifier, share a six-window cap and close together on Stop/Escape. Popup focus does not stop the parent. No popup is automatically reopened after a visitor closes it.

The rewrite omits the original's forced downloads, cross-site logout requests, permission floods, clipboard replacement, history flooding, referrer redirection, unbounded popup multiplication and navigation traps. Videos run in both the main page and child windows and can be stopped together.

Original references:
- https://github.com/jaczup/ptoszek.pl
- https://github.com/feross/TheAnnoyingSite.com

The playback view has no toolbar or native video controls. Clicking the video or pressing Space/Enter opens another popup using that window’s user activation. Each child URL receives a video from a shuffled list, so sibling windows have different films until the playlist is exhausted. Videos autoplay and loop; blocked audio falls back to muted playback, and an interaction retries with sound. The local-only console uses a collapsible white panel to match the original plain page. Escape still stops playback and closes owned windows.
