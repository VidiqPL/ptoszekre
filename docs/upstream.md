# Upstream review — 2026-11-05

Source: https://github.com/jaczup/ptoszek.pl . Reviewed the three open pull requests via GitHub's file diffs. This is an adaptation, not a claim that the upstream PRs were merged or applied unchanged.

| PR | Author | Result |
| --- | --- | --- |
| [#25](https://github.com/jaczup/ptoszek.pl/pull/25) | Kocmouch | Adapted changing titles, cursor trail, overlay messages and a brief stage wobble into `effects/chaos.js`. One bounded session; Stop clears everything. Keyboard locks, notification prompts, selection hijacking and wake-lock loops omitted. |
| [#28](https://github.com/jaczup/ptoszek.pl/pull/28) | UhcWolfe (diff credits @kubso) | Adapted the browser-information console into `effects/console.js`: local language, timezone, screen, CPU, RAM estimate, touch and theme. No third-party IP lookup, location request, network transmission, or claims of compromise. |
| [#31](https://github.com/jaczup/ptoszek.pl/pull/31) | szymsun | Reviewed, not implemented: this adds forced USOSWEB logout requests to unrelated university accounts. |

The download already includes contributions credited in its `index.js`, such as additional videos and bird images. Those bundled files are retained. The current version restores the original intro HTML wording, white background, typography and GIF from the download, moving styles to a separate CSS file. The downloaded `index.js` matches the upstream `main` blob `a61bdbe09d6868e9cb9bd507ce42f2be8a772780` checked on 2026-11-05.

Original `openWindow`, `moveWindowBounce`, `startVideo`, `speak`, `startTheramin`, URL animation and theme animation were reviewed and adapted into separate modules. Popups open synchronously during user gestures, carry an explicit child/session identifier, share a six-window cap and close together on Stop/Escape. Popup focus does not stop the parent. No popup is automatically reopened after a visitor closes it.

The rewrite omits the original's cross-site logout requests, permission floods, clipboard replacement, history flooding, referrer redirection, unbounded popup multiplication and navigation traps. Videos run in both the main page and child windows and can be stopped together.

Original references:
- https://github.com/jaczup/ptoszek.pl
- https://github.com/feross/TheAnnoyingSite.com

The playback view has no toolbar or native video controls. Clicking the video or pressing Space/Enter opens another popup using that window’s user activation. Each child URL receives a video from a shuffled list, so sibling windows have different films until the playlist is exhausted. Videos autoplay and loop; blocked audio falls back to muted playback, and an interaction retries with sound. The local-only console uses a collapsible white panel to match the original plain page. Escape still stops playback and closes owned windows.

## Automatic windows and movement

The original only called `openWindow()` from input events; opening a new window every five seconds is an explicit addition. One parent-owned interval opens up to six simultaneous windows, retries blocked attempts at the next tick, and is cleared on Escape/page exit. Child windows do not create competing auto-open timers.

Original movement used random positive/negative velocities of 15px and a 50ms interval. The current controller uses those values, starts moving a popup before its scripts load, and clamps/reflects positions using screen coordinates that include secondary-monitor offsets. Movement is not attached to mouse events. Timer-opened videos preload and start muted without waiting on sound autoplay permission; `canplay` retries pending playback. Browser popup permission is still necessary for timer opens, and normal tabs/mobile browsers cannot be moved.

Other intentional differences from upstream remain listed above: no third-party forced logouts, clipboard spam, navigation traps, or permission floods. Source remains organized into separate modules.

## Mouse activation and bundled downloads

The first `mousemove` on `/onlyfans` now starts the session once, without waiting for a click or three spaces. A click/tap or Space/Enter remains available as a fallback. The mouse listener is removed at activation, so Escape is not undone by moving the pointer again.

The original `FILE_DOWNLOADS` contains image paths, and `triggerFileDownload()` clicks an anchor with the `download` attribute. `effects/downloads.js` restores that mechanism and extends the pool to all bundled photos/GIFs and videos. The original `jaczupme.jpg` entry refers to a missing file; the new pool uses the actual `jaczupme.png`. Downloads share a three-attempt budget across the parent and its popup events. No external files, generated payloads, or automatic-download permission bypass is used. Browsers can refuse these download attempts.

Movement limitation: MDN documents that Firefox cannot move ordinary/multi-tab windows, and Wayland may prevent window movement entirely: https://developer.mozilla.org/en-US/docs/Web/API/Window/moveTo . Mouse movement is not a user-activation event, so popup/audio/download permissions remain relevant: https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation .
