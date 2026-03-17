# Spotify Platform-Aware Links Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static `spotify:` URI links with platform-aware JS that uses universal links on iOS/iPadOS (no prompt), `spotify:` with blur/timer fallback on macOS, and `https://` on all other platforms — without changing the HTML authoring format.

**Architecture:** A single `script.js` IIFE runs on page load, detects the platform, and either rewrites `href` attributes in-place (iOS/other) or attaches a click handler with a blur/timer fallback (macOS). A global Claude skill at `~/.claude/skills/spotify-links.md` documents the pattern for reuse in any future project.

**Tech Stack:** Vanilla JS (ES5-compatible), HTML5, no build step, no dependencies.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `script.js` | Create | Platform detection, URL derivation, link rewriting/interception |
| `index.html` | Modify | Add `<script src="script.js">` before `</body>` |
| `~/.claude/skills/spotify-links.md` | Create | Global reusable skill (not committed to this repo) |

---

### Task 1: Create the global skill file

**Files:**
- Create: `~/.claude/skills/spotify-links.md`

This task has no automated tests — verify by reading the file back after writing.

- [ ] **Step 1: Create `~/.claude/skills/spotify-links.md`** with this exact content:

```markdown
# Spotify Platform-Aware Links

## Trigger

Use this skill when adding Spotify links (`spotify:` URIs) to any web project. Apply whenever a web page needs to link to Spotify playlists, tracks, albums, artists, shows, or episodes.

## The Pattern

### HTML — one URI per link, nothing else needed

```html
<a href="spotify:playlist:37i9dQZF1DXcBWIGoYBM5M">Today's Top Hits</a>
<a href="spotify:track:4iV5W9uYEdYUVa79Axb7Rh">Some Track</a>
```

The `script.js` below handles all platform routing at runtime. No `data-` attributes or extra markup required.

### Supported entity types

`playlist`, `track`, `album`, `artist`, `show`, `episode`

Pattern: `spotify:<type>:<id>` → `https://open.spotify.com/<type>/<id>`

### Per-platform behaviour

| Platform | Behaviour |
|---|---|
| iOS / iPadOS | `href` rewritten to `https://open.spotify.com/…` on page load. iOS universal links route directly into Spotify — no "Open in Spotify?" prompt. |
| macOS | `href` stays as `spotify:`. Click handler navigates to `spotify:` URI, starts 800ms timer. If window loses focus (Spotify launched), timer is cancelled. If timer fires (Spotify not installed), falls back to `https://`. |
| Other | `href` rewritten to `https://open.spotify.com/…` on page load. |

**Known limitation (macOS):** any window focus loss within 800ms (notification, app switch) also cancels the timer. Accepted — silent, harmless edge case.

### Platform detection

```javascript
var ua = navigator.userAgent;
var isIOS = /iPhone|iPad|iPod/.test(ua) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS 13+
var isMac = /Macintosh/.test(ua) && !isIOS;
```

`isMac` uses `userAgent`; the iPadOS check retains `navigator.platform === 'MacIntel'` intentionally — it is the only reliable signal for iPadOS 13+ at runtime.

### script.js — drop into any static page

```javascript
(function () {
  var ua = navigator.userAgent;
  var isIOS = /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isMac = /Macintosh/.test(ua) && !isIOS;

  var SUPPORTED = ['playlist', 'track', 'album', 'artist', 'show', 'episode'];

  function deriveHttpsUrl(uri) {
    var parts = uri.split(':');
    if (parts.length !== 3) return null;
    if (SUPPORTED.indexOf(parts[1]) === -1) return null;
    return 'https://open.spotify.com/' + parts[1] + '/' + parts[2];
  }

  var links = document.querySelectorAll('a[href^="spotify:"]');

  if (!isMac) {
    // iOS/iPadOS and all other non-Mac platforms: rewrite hrefs to https universal links
    links.forEach(function (a) {
      var url = deriveHttpsUrl(a.getAttribute('href'));
      if (url) a.setAttribute('href', url);
    });
  } else {
    // macOS: intercept clicks, try spotify: URI with blur/timer fallback to https
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var uri = a.getAttribute('href');
        var url = deriveHttpsUrl(uri);
        if (!url) return; // malformed/unsupported — let browser handle normally
        e.preventDefault();
        var timer = setTimeout(function () { window.location.href = url; }, 800);
        window.addEventListener('blur', function () { clearTimeout(timer); }, { once: true });
        window.location.href = uri;
      });
    });
  }
})();
```

### index.html — add before `</body>`

```html
  <script src="script.js"></script>
```

No other changes to HTML needed.
```

- [ ] **Step 2: Verify the file was written**

```bash
head -5 ~/.claude/skills/spotify-links.md
```

Expected: first 5 lines of the skill file (starting with `# Spotify Platform-Aware Links`).

---

### Task 2: Create `script.js`

**Files:**
- Create: `script.js`

This project has no test framework (intentionally — it's a static personal launcher). The `deriveHttpsUrl` function is pure and has no browser dependencies, so it can be verified with Node.js. Platform-branch behaviour is verified manually in Task 4.

- [ ] **Step 1: Create `script.js`** in `/Users/bolik/develop/work/Spotify/Playlists/` with this exact content:

```javascript
(function () {
  var ua = navigator.userAgent;
  var isIOS = /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS 13+
  var isMac = /Macintosh/.test(ua) && !isIOS;

  var SUPPORTED = ['playlist', 'track', 'album', 'artist', 'show', 'episode'];

  function deriveHttpsUrl(uri) {
    var parts = uri.split(':');
    if (parts.length !== 3) return null;
    if (SUPPORTED.indexOf(parts[1]) === -1) return null;
    return 'https://open.spotify.com/' + parts[1] + '/' + parts[2];
  }

  var links = document.querySelectorAll('a[href^="spotify:"]');

  if (!isMac) {
    // iOS/iPadOS and all other non-Mac platforms: rewrite hrefs to https universal links
    links.forEach(function (a) {
      var url = deriveHttpsUrl(a.getAttribute('href'));
      if (url) a.setAttribute('href', url);
    });
  } else {
    // macOS: intercept clicks, try spotify: URI with blur/timer fallback to https
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var uri = a.getAttribute('href');
        var url = deriveHttpsUrl(uri);
        if (!url) return; // malformed/unsupported — let browser handle normally
        e.preventDefault();
        var timer = setTimeout(function () { window.location.href = url; }, 800);
        window.addEventListener('blur', function () { clearTimeout(timer); }, { once: true });
        window.location.href = uri;
      });
    });
  }
})();
```

- [ ] **Step 2: Verify `deriveHttpsUrl` logic with Node.js**

```bash
cd /Users/bolik/develop/work/Spotify/Playlists && node -e "
var SUPPORTED = ['playlist','track','album','artist','show','episode'];
function deriveHttpsUrl(uri) {
  var parts = uri.split(':');
  if (parts.length !== 3) return null;
  if (SUPPORTED.indexOf(parts[1]) === -1) return null;
  return 'https://open.spotify.com/' + parts[1] + '/' + parts[2];
}
console.assert(deriveHttpsUrl('spotify:playlist:ABC123') === 'https://open.spotify.com/playlist/ABC123', 'playlist');
console.assert(deriveHttpsUrl('spotify:track:XYZ') === 'https://open.spotify.com/track/XYZ', 'track');
console.assert(deriveHttpsUrl('spotify:album:DEF') === 'https://open.spotify.com/album/DEF', 'album');
console.assert(deriveHttpsUrl('spotify:artist:GHI') === 'https://open.spotify.com/artist/GHI', 'artist');
console.assert(deriveHttpsUrl('spotify:show:JKL') === 'https://open.spotify.com/show/JKL', 'show');
console.assert(deriveHttpsUrl('spotify:episode:MNO') === 'https://open.spotify.com/episode/MNO', 'episode');
console.assert(deriveHttpsUrl('spotify:user:someone') === null, 'unsupported type returns null');
console.assert(deriveHttpsUrl('spotify:playlist:id:extra') === null, 'too many colons returns null');
console.assert(deriveHttpsUrl('notspotify') === null, 'wrong format returns null');
console.log('All assertions passed');
"
```

Expected output: `All assertions passed` (no assertion errors).

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: add platform-aware Spotify link handler"
```

---

### Task 3: Wire `script.js` into `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add `<script src="script.js"></script>` immediately before `</body>` in `index.html`**

The final lines of `<body>` should look like:

```html
  </main>
  <script src="script.js"></script>
</body>
```

- [ ] **Step 2: Verify HTML still parses cleanly**

```bash
cd /Users/bolik/develop/work/Spotify/Playlists && python3 -c "
from html.parser import HTMLParser
class V(HTMLParser): pass
V().feed(open('index.html').read())
print('HTML parses ok')
"
```

Expected: `HTML parses ok`

- [ ] **Step 3: Verify script tag is present in the right place**

```bash
cd /Users/bolik/develop/work/Spotify/Playlists && grep -n "script" index.html
```

Expected: one line showing `<script src="script.js"></script>` near the end of the file, before `</body>`.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: wire script.js into index.html"
```

---

### Task 4: Push and manual verification

**Files:** none

- [ ] **Step 1: Push to GitHub**

```bash
git push
```

Expected: push succeeds, GitHub Pages redeploys (~1 min).

- [ ] **Step 2: Verify on macOS (desktop browser)**

Open `https://cbolik.github.io/Spotify-Playlists/` in Safari or Chrome on macOS.
Open DevTools → Console. Run:

```javascript
document.querySelectorAll('nav a').forEach(a => console.log(a.href))
```

Expected: all `href` values are still `spotify:playlist:…` (not rewritten on macOS).

Click a playlist link. Expected: Spotify opens directly (after the one-time permission grant), no fallback redirect.

- [ ] **Step 3: Verify on iOS/iPadOS**

Open the page in Safari on iPhone or iPad. Open the page source or use DevTools remote inspection to confirm:

```javascript
document.querySelectorAll('nav a').forEach(a => console.log(a.href))
```

Expected: all `href` values are `https://open.spotify.com/playlist/…` (rewritten on load).

Tap a playlist link. Expected: Spotify opens with no "Open in Spotify?" prompt.
