# Favicon & App Icon Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add a browser favicon and iOS/iPadOS home-screen icon to the Spotify Playlists static page using a playlist-with-play-button SVG styled with a black background and Spotify-green (#1DB954) foreground.

**Architecture:** Three icon files (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`) are generated from a single source SVG. A one-off Python script rasterises the SVG to PNG/ICO and is deleted after use. `index.html` gets three `<link>` tags in `<head>`. No build step is added to the project.

**Tech Stack:** SVG (hand-authored), Python 3 + `cairosvg` + `Pillow` (icon generation, run once), HTML5 `<link>` tags

---

### Task 1: Create `favicon.svg`

**Files:**
- Create: `favicon.svg`

**Step 1: Create `favicon.svg` with this exact content**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" fill="#0d0d0d"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M2.25 6C2.25 5.58579 2.58579 5.25 3 5.25H21C21.4142 5.25 21.75 5.58579 21.75 6C21.75 6.41421 21.4142 6.75 21 6.75H3C2.58579 6.75 2.25 6.41421 2.25 6ZM2.25 10C2.25 9.58579 2.58579 9.25 3 9.25H21C21.4142 9.25 21.75 9.58579 21.75 10C21.75 10.4142 21.4142 10.75 21 10.75H3C2.58579 10.75 2.25 10.4142 2.25 10ZM2.25 14C2.25 13.5858 2.58579 13.25 3 13.25H11C11.4142 13.25 11.75 13.5858 11.75 14C11.75 14.4142 11.4142 14.75 11 14.75H3C2.58579 14.75 2.25 14.4142 2.25 14ZM2.25 18C2.25 17.5858 2.58579 17.25 3 17.25H11C11.4142 17.25 11.75 17.5858 11.75 18C11.75 18.4142 11.4142 18.75 11 18.75H3C2.58579 18.75 2.25 18.4142 2.25 18Z" fill="#1DB954"/>
  <path d="M18.875 14.1184C20.5288 15.0733 21.3558 15.5507 21.4772 16.2395C21.5076 16.4118 21.5076 16.5882 21.4772 16.7605C21.3558 17.4493 20.5288 17.9267 18.875 18.8816C17.2212 19.8364 16.3942 20.3138 15.737 20.0746C15.5725 20.0148 15.4199 19.9266 15.2858 19.8141C14.75 19.3645 14.75 18.4097 14.75 16.5C14.75 14.5903 14.75 13.6355 15.2858 13.1859C15.4199 13.0734 15.5725 12.9852 15.737 12.9254C16.3942 12.6862 17.2212 13.1636 18.875 14.1184Z" fill="#1DB954"/>
</svg>
```

**Step 2: Verify file exists and is valid XML**

```bash
python3 -c "import xml.etree.ElementTree as ET; ET.parse('favicon.svg'); print('valid XML')"
```

Expected: `valid XML`

**Step 3: Commit**

```bash
git add favicon.svg
git commit -m "feat: add favicon SVG source"
```

---

### Task 2: Generate `apple-touch-icon.png` and `favicon.ico`

**Files:**
- Create (temporary): `generate-icons.py`
- Create: `apple-touch-icon.png`
- Create: `favicon.ico`

**Step 1: Install required Python packages**

```bash
pip3 install cairosvg Pillow
```

Expected: both packages install without error. `cairosvg` requires `libcairo` — on macOS this is typically already present. If not: `brew install cairo`.

**Step 2: Create `generate-icons.py`**

```python
#!/usr/bin/env python3
"""One-off script: generates apple-touch-icon.png and favicon.ico from favicon.svg.
Run once, then delete this file."""
import io
import os
import cairosvg
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
svg_path = os.path.join(here, "favicon.svg")

# --- apple-touch-icon.png (180x180) ---
print("Generating apple-touch-icon.png …")
cairosvg.svg2png(
    url=svg_path,
    write_to=os.path.join(here, "apple-touch-icon.png"),
    output_width=180,
    output_height=180,
)

# --- favicon.ico (32x32 source, saves 16x16 + 32x32 into ICO) ---
print("Generating favicon.ico …")
buf = io.BytesIO()
cairosvg.svg2png(url=svg_path, write_to=buf, output_width=32, output_height=32)
buf.seek(0)
img = Image.open(buf).convert("RGBA")
img.save(
    os.path.join(here, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32)],
)

print("Done — apple-touch-icon.png and favicon.ico created.")
```

**Step 3: Run the script**

```bash
python3 generate-icons.py
```

Expected output:
```
Generating apple-touch-icon.png …
Generating favicon.ico …
Done — apple-touch-icon.png and favicon.ico created.
```

**Step 4: Verify the generated files**

```bash
python3 - <<'EOF'
from PIL import Image
img = Image.open("apple-touch-icon.png")
assert img.size == (180, 180), f"Expected 180x180, got {img.size}"
print(f"apple-touch-icon.png: {img.size} {img.mode} ✓")

ico = Image.open("favicon.ico")
print(f"favicon.ico ok ✓")
EOF
```

Expected: both lines print with ✓, no assertion errors.

**Step 5: Commit**

```bash
git add apple-touch-icon.png favicon.ico
git commit -m "feat: add rasterised apple-touch-icon and favicon.ico"
```

---

### Task 3: Wire up `<link>` tags in `index.html`

**Files:**
- Modify: `index.html`

**Step 1: Add three `<link>` tags to `<head>` in `index.html`**

Insert these three lines immediately after the existing `<meta name="theme-color" ...>` line (line 6) and before `<title>`:

```html
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="icon" href="favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />
```

The `<head>` block should now look like:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0d0d0d" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="icon" href="favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />
  <title>Playlists</title>
  ...
</head>
```

Tag order rationale:
- SVG first — modern browsers prefer it (vector, sharp)
- ICO second — picked up by Safari desktop and legacy browsers that skip SVG
- apple-touch-icon last — iOS/iPadOS only

**Step 2: Verify HTML is still valid**

```bash
python3 -c "
from html.parser import HTMLParser
class V(HTMLParser): pass
V().feed(open('index.html').read())
print('HTML parses ok')
"
```

Expected: `HTML parses ok`

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: wire up favicon and apple-touch-icon link tags"
```

---

### Task 4: Cleanup and push

**Files:**
- Delete: `generate-icons.py`
- Delete: `icon-preview.html`

**Step 1: Delete temporary files**

```bash
rm generate-icons.py icon-preview.html
```

**Step 2: Verify they are gone**

```bash
ls generate-icons.py icon-preview.html 2>&1
```

Expected: `ls: ... No such file or directory` for both.

**Step 3: Commit and push**

```bash
git add -u
git commit -m "chore: remove icon generation script and preview file"
git push
```

Expected: push succeeds, GitHub Pages redeploys automatically (~1 min).

---

## Done

The live site at https://cbolik.github.io/Spotify-Playlists/ now has:
- A favicon in browser tabs (SVG for modern browsers, ICO fallback for Safari)
- An app icon when added to the iOS/iPadOS home screen via Safari → Share → Add to Home Screen
