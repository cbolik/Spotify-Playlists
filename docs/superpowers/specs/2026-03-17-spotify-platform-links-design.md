# Spotify Platform-Aware Links — Design Spec

**Date:** 2026-03-17
**Project:** Spotify Playlists static page + reusable global skill

---

## Problem

`spotify:` URI scheme links work well on macOS (launches Spotify after one-time permission grant) but trigger a native "Open in Spotify?" confirmation dialog on every tap on iOS/iPadOS. The correct fix on iOS/iPadOS is to use `https://open.spotify.com/…` universal links, which the OS routes directly into the Spotify app without any prompt.

---

## Goals

1. Eliminate the iOS/iPadOS confirmation prompt.
2. Keep macOS working as-is (direct `spotify:` launch, https fallback if Spotify isn't installed).
3. Keep the HTML authoring experience as simple as today — one `spotify:` URI per link, nothing extra.
4. Capture the pattern as a reusable global Claude skill for use in any future project.

---

## Design

### HTML (no change to authoring)

Links continue to use `spotify:` URIs as `href`. No additional attributes required. Example:

```html
<a href="spotify:playlist:0NF8qR0UBjP7BMDepv3AVi">Current Tracks</a>
```

This is the only thing an author needs to write. The JS layer handles everything else at runtime.

### URL derivation

The mapping between URI scheme and HTTPS URL is mechanical:

```
spotify:<type>:<id>  →  https://open.spotify.com/<type>/<id>
```

Supported entity types: `playlist`, `track`, `album`, `artist`, `show`, `episode`.

`deriveHttpsUrl(spotifyUri)` input contract:
- Valid input: a string matching `spotify:<supportedType>:<id>` with exactly two colons.
- If the input is malformed (wrong number of segments) or the type is not in the supported list, return `null`. The caller must treat a `null` return as "leave `href` unchanged" — the link stays as the original `spotify:` URI and is not rewritten or intercepted.

### Platform detection

```javascript
const ua = navigator.userAgent;
const isIOS = /iPhone|iPad|iPod/.test(ua) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS 13+
const isMac = /Macintosh/.test(ua) && !isIOS;
```

`isMac` uses `navigator.userAgent`; the `isIOS` iPadOS branch retains `navigator.platform === 'MacIntel'` intentionally, as it is the only reliable runtime signal for distinguishing iPadOS 13+ from macOS — a known quirk, accepted. For a personal launcher of this scope, both heuristics are considered stable enough.

All other platforms (Android, Windows, Linux) fall into the "other" bucket.

### Per-platform behaviour

| Platform     | Strategy                                                                 |
|--------------|--------------------------------------------------------------------------|
| iOS / iPadOS | Rewrite `href` to derived `https://` URL on page load. Universal links route directly into Spotify app, no prompt. |
| macOS        | Keep `href` as `spotify:`. On click: call `event.preventDefault()`, navigate to `spotify:` URI programmatically, start 800ms timer. Cancel timer if `window` loses focus (interpreted as Spotify launching). If timer fires, redirect to derived `https://` URL. **Known limitation:** any window focus loss (OS notification, app switch) within 800ms also cancels the timer, leaving the user on the page. This is accepted — the failure mode is silent and harmless for a personal launcher. |
| Other        | Rewrite `href` to derived `https://` URL on page load.                   |

### script.js structure

```javascript
(function () {
  // 1. Platform detection
  // 2. deriveHttpsUrl(spotifyUri) helper
  // 3. If iOS/iPadOS or other: rewrite all nav a[href^="spotify:"] hrefs to https
  // 4. If macOS: attach click handler with blur/timer fallback
})();
```

The script is an IIFE to avoid polluting global scope. It targets `a[href^="spotify:"]` so it is safe to drop into any page that uses `spotify:` links — not just this project.

### index.html change

Add one line before `</body>`:

```html
  <script src="script.js"></script>
```

No other changes to `index.html`.

---

## Reusable Skill

A global skill file is created at `~/.claude/skills/spotify-links.md`. It documents:

- When to apply this pattern (any web project with Spotify links)
- The HTML authoring convention (`spotify:` URI as `href`, nothing else needed)
- The full platform detection and URL derivation logic
- The macOS blur/timer fallback pattern
- The supported entity types

The skill enables Claude to correctly implement this pattern in any future project without re-deriving it from scratch.

---

## Files Changed

| File | Change |
|------|--------|
| `script.js` | New — platform detection + link rewriting/interception |
| `index.html` | Add `<script src="script.js"></script>` before `</body>` |
| `~/.claude/skills/spotify-links.md` | New global skill (not committed to this repo) |

---

## Non-Goals

- No changes to the HTML authoring format.
- No server-side logic.
- No support for Spotify URIs with context parameters (e.g. `spotify:track:id:play`) — plain `spotify:<type>:<id>` only.
- No polyfilling for very old browsers.
