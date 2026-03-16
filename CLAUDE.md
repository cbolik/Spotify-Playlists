# Spotify Playlists — Project Context

## What this is
A minimalist, dark-themed static HTML page that lists 6 Spotify playlists as tappable `spotify:` deep links. Deployed to GitHub Pages. No build step, no framework — just `index.html` + `style.css`.

**Live URL:** https://cbolik.github.io/Spotify-Playlists/
**Repo:** https://github.com/cbolik/Spotify-Playlists

## Design decisions (agreed in session)
- Dark background `#0d0d0d`, typography-only (no graphics/icons)
- Google Font: Inter (weights 300 + 400)
- Primary target: iPhone 17 (~390px wide); also works on iPad and desktop
- Font sized so 6 items fit without scrolling on iPhone (uses `clamp()`)
- Links open via `spotify:playlist:<id>` deep links
- No underlines; subtle white color shift on hover/focus/active

## Current state
Implementation is complete and live. The 6 playlists are currently **placeholders** — they need to be replaced with real playlist names and Spotify IDs.

## How to update playlists
Edit the clearly marked block in `index.html` (lines ~20–27):

```html
<!-- =============================================
     PLAYLIST DATA — edit names and spotify URIs here
     ============================================= -->
<nav>
  <a href="spotify:playlist:REPLACE_WITH_REAL_ID">Playlist Name</a>
  ...
</nav>
```

To find a Spotify playlist ID: right-click a playlist in Spotify → Share → Copy link.
The ID is the part after `playlist/` and before `?` in the URL.
Then commit and push — GitHub Pages redeploys automatically.

## File structure
```
index.html   — markup + playlist data block
style.css    — all styles (reset, layout, typography, responsive)
.gitignore   — .DS_Store only
CLAUDE.md    — this file
```

## Pending / nice to have
- Replace placeholder playlists with real ones (main remaining task)
- Optionally: `<meta name="apple-mobile-web-app-capable">` if you want to add it to your iPhone home screen as a PWA-lite launcher
