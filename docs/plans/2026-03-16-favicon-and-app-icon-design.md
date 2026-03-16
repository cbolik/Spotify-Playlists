# Favicon & App Icon — Design Doc

**Date:** 2026-03-16
**Status:** Approved

---

## Goal

Add a favicon for browser tabs and an Apple Touch Icon for the iOS/iPadOS home screen, using a playlist-with-play-button SVG icon styled with a black background and Spotify-green foreground.

---

## Icon Design

**Source SVG:** https://www.svgrepo.com/show/526112/playlist.svg
**ViewBox:** `0 0 24 24`
**Background:** `#0d0d0d` (matches page background)
**Foreground:** `#1DB954` (official Spotify green)
**Padding:** natural — the original SVG paths already sit ~2.25 units inset within the 24×24 viewBox (~9-10% margin each side), which was approved as-is.

The icon consists of:
- Four horizontal lines (top two full-width, bottom two shorter) representing a playlist
- A play-button triangle in the bottom-right quadrant

Design was previewed and approved at 180×180, 32×32, 16×16, browser-tab simulation, and iOS home-screen simulation (with iOS rounded corners).

---

## Deliverables

| File | Size | Purpose |
|------|------|---------|
| `favicon.svg` | vector | Browser tab favicon (Chrome, Firefox, Edge) |
| `favicon.ico` | 16×16 + 32×32 | Fallback favicon (Safari desktop, older browsers) |
| `apple-touch-icon.png` | 180×180 | iOS/iPadOS home screen icon |

---

## Approach (Option A)

1. **`favicon.svg`** — the modified SVG with black `<rect>` background and Spotify-green paths. Added directly to the repo; referenced via `<link rel="icon" type="image/svg+xml" href="favicon.svg">`.

2. **`apple-touch-icon.png`** — 180×180 PNG rasterized from the SVG. Referenced via `<link rel="apple-touch-icon" href="apple-touch-icon.png">`. iOS auto-applies its rounded-corner mask; no need to bake corners into the image.

3. **`favicon.ico`** — multi-size ICO (16×16 + 32×32) for Safari desktop and any browser that ignores SVG favicons. Referenced via `<link rel="icon" href="favicon.ico" sizes="any">`.

4. **`index.html`** updated with the three `<link>` tags in `<head>`.

### PNG generation

Use Python with the `cairosvg` library (or fallback to Pillow + `cairosvg`) to rasterize the SVG to PNG at 180×180. ICO generated from the PNG using Pillow's `ICO` save format with explicit sizes `[(16,16),(32,32)]`.

### Link tag order in `<head>`

```html
<link rel="icon" type="image/svg+xml" href="favicon.svg" />
<link rel="icon" href="favicon.ico" sizes="any" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
```

---

## Cleanup

`icon-preview.html` is a temporary design artifact and should be deleted after implementation.

---

## Out of Scope

- Android/PWA manifest icons
- maskable icons
- Any size other than 16, 32, 180px
