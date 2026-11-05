# Upstream review — 2026-11-05

Source: https://github.com/jaczup/ptoszek.pl . Reviewed the three open pull requests via GitHub's file diffs. This is an adaptation, not a claim that the upstream PRs were merged or applied unchanged.

| PR | Author | Result |
| --- | --- | --- |
| [#25](https://github.com/jaczup/ptoszek.pl/pull/25) | Kocmouch | Adapted changing titles, cursor trail, overlay messages and a brief stage wobble into `effects/chaos.js`. One bounded session; Stop clears everything. Keyboard locks, notification prompts, selection hijacking and wake-lock loops omitted. |
| [#28](https://github.com/jaczup/ptoszek.pl/pull/28) | UhcWolfe (diff credits @kubso) | Adapted the browser-information console into `effects/console.js`: local language, timezone, screen, CPU, RAM estimate, touch and theme. No third-party IP lookup, location request, network transmission, or claims of compromise. |
| [#31](https://github.com/jaczup/ptoszek.pl/pull/31) | szymsun | Reviewed, not implemented: this adds forced USOSWEB logout requests to unrelated university accounts. |

The download already includes contributions credited in its `index.js`, such as additional videos and bird images. Those bundled files are retained. The rewrite additionally omits the original's forced downloads, cross-site logout requests, permission floods, clipboard replacement, history flooding, referrer redirection, popup multiplication and navigation traps. Bird videos and visual prank behavior remain within the page and can be stopped.

Original references:
- https://github.com/jaczup/ptoszek.pl
- https://github.com/feross/TheAnnoyingSite.com
