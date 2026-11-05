# Upstream review — 2026-11-05

Based on the downloaded `ptoszek.pl-main/index.js` and `index.html`, from https://github.com/jaczup/ptoszek.pl . The entire 1,174-line script was reread for the current audio change. Its blob matches upstream `main`: `a61bdbe09d6868e9cb9bd507ce42f2be8a772780`.

## Activation and audio

The original `interceptUserInput` responds to mouse presses, touch and key events; it does not activate on mouse movement. The site now restores click/tap activation and the original Space ×3 prompt/fallback. Mere mouse movement leaves the intro visible and does not create an AudioContext or spawn windows.

The original audio path combines these mechanisms:

- `startInvisiblePictureInPictureVideo`: a muted looping video is prepared before interaction in a 1px offscreen area. The modular version retains this warmup and moves that same player to the stage without resetting its source.
- `enablePictureInPicture` / `startVideo`: unmuted media is started inside the input handler. The modular version unmutes the prepared player immediately on the first native press, before opening popups; it does not force Picture-in-Picture.
- `speak`: the original phrase list and speech synthesis are retained, including “To był błąd”.
- `startTheramin`: the periodic wave is copied from the original cosine/sine arrays, along with the 50 Hz pitch base, 4000 Hz pitch range, default initial gain and mouse-position gain multiplied by three. The prior simplified quiet sawtooth has been removed. Audio no longer depends on a reduced-motion preference.

Unlike the original's repeated `startTheramin()` on every input event, the modular version keeps one audio graph per window/session and closes it on Escape. Media playback is attempted with sound immediately; browser refusal alone triggers a muted fallback. A second film click is not required for the initial sound.

Verified with native input in Firefox and Chromium under normal autoplay restrictions: moving to the bird leaves the intro intact; the first mousedown produces an unmuted playing film and a running AudioContext with nonzero audio samples; mouseup does not create duplicate contexts. Escape closes audio and popups. Space ×3 also starts the session.

## Popup windows and bundled downloads

`openWindow`, `moveWindowBounce` and `startVideo` were adapted into separate modules. Each child receives a random video from a shuffled list and loops it. Windows move at 15px per 50ms in randomized directions and bounce within display coordinates, including secondary monitors. The first click opens one popup. The requested automatic five-second interval runs only in the parent, with at most six open windows, and is canceled on Escape/page exit. Closed windows are not immediately recreated; the next scheduled open may use a free slot.

The original `triggerFileDownload` clicks a link with the `download` attribute. The rewrite uses that same mechanism for bundled photos/GIFs and videos, with a shared maximum of three attempts per session. The original missing `jaczupme.jpg` path is corrected to the actual `jaczupme.png`. Browser download and popup permissions apply normally.

Firefox cannot move ordinary/multi-tab windows, and Wayland may disallow movement entirely: https://developer.mozilla.org/en-US/docs/Web/API/Window/moveTo . Browser autoplay policy: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay .

## Pull requests

These are adaptations, not claims that the upstream PRs were merged or applied unchanged.

| PR | Author | Result |
| --- | --- | --- |
| [#25](https://github.com/jaczup/ptoszek.pl/pull/25) | Kocmouch | Adapted titles, cursor trails, overlays and stage wobble. Effects are cleaned up on Stop; keyboard locks, notification prompts, selection hijacking and wake-lock loops omitted. |
| [#28](https://github.com/jaczup/ptoszek.pl/pull/28) | UhcWolfe (diff credits @kubso) | Local browser console with 30+ facts and optional GPU/battery/storage estimates. Values use textContent; no external lookup, IP collection or location prompt. |
| [#31](https://github.com/jaczup/ptoszek.pl/pull/31) | szymsun | Reviewed, not implemented: forced USOSWEB logout requests to unrelated university accounts. |

## Intentional differences

No cross-site logout requests, camera/microphone/device permission floods, clipboard replacement, navigation/history traps, forced referrer redirects, print/alert loops or unbounded popup spawning. The original intro appearance and media are retained. Source is split into modules, and Escape ends the session.

Original authors and contributors remain credited in the preserved download. Original inspiration: https://github.com/feross/TheAnnoyingSite.com .

## Popup audio and click-counter prank

Upstream child windows only call `startVideo()` with autoplay and loop; they have no special audio-permission mechanism. The new `effects/popup-audio.js` plays each popup’s audio in the main document that the visitor already activated. Popup video stays muted to avoid duplicate sound, while the parent track follows source changes, time, pause, seek, playback rate and looping. Closed windows release their audio and event listeners; Escape releases every parent track. Only known same-origin bundled video URLs can be attached. If the relay is unavailable, the child falls back to its local media player. Browser refusal is reported, not bypassed.

Verified in Firefox and Chromium with normal autoplay restrictions and popup permission enabled: audio for both the first popup and the five-second timer popup plays without clicking the children, tracks video time, and stops when the child closes.

Only the main video displays the centered red label “Kliknij film 10 razy aby zamknąć ptoszka” and a film-click counter. The count deliberately exceeds ten (tested at 10/10 and 33/10) without stopping the session. Escape remains functional. Console interactions do not count, and the initial bird press does not increment the film counter.
