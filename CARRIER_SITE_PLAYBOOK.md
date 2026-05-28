# Carrier Site Playbook

A repeatable process for spinning up a clean, single-page marketing website for a
freight carrier (or similar small business) in a fresh Claude Code session — one
session per client. Built and proven on the JBD Transit LLC, Andrew P Jacobs
Transport, and Faster Transport Inc sites; use those as reference implementations.

**Reference deployment:** https://championwes.github.io/faster-transport/

---

## TL;DR — kickoff prompt for a new session

Paste this into a new Claude Code session (fill in the brackets), then follow
Claude's lead. It front-loads the things that otherwise cost a few round-trips.

```
I need a marketing website for [COMPANY NAME], a freight carrier (USDOT [NUMBER]).
Build a polished single-page static site (HTML/CSS/JS, no build step) following the
conventions in CARRIER_SITE_PLAYBOOK.md.

Source of truth for company facts: I'll provide the FMCSA SAFER "Company Snapshot"
screenshots (legal name, address, phone, power units, drivers, cargo carried,
safety/inspection record). Build the copy and services around the cargo types and
lean on the safety record if it's clean.

Branding: The logo and photos are in the assets/ directory. Pull brand colors from
the logo or a provided color palette image.

Compress images, build the site, verify with browser preview on desktop + mobile,
then create a GitHub repo and publish to Pages.
```

---

## Read first — gotchas that waste time

These are the things that are not obvious and cost the most rework:

1. **Images pasted into the chat are NOT files Claude can open.** Claude can *see*
   them, but cannot read the bytes to compress/embed them. The client must provide
   the logo + photos as **files on disk or committed to the repo** (or uploaded via
   GitHub's web UI: *Add file → Upload files*). Tell them this up front.
2. **FMCSA SAFER and carrier-data aggregators (carriersource, otrucking,
   brokersnapshot, etc.) return HTTP 403 to automated fetches.** Don't burn turns
   trying to `WebFetch`/`curl` them. Web *search* snippets sometimes leak a few
   facts, but the reliable path is a **client-provided SAFER screenshot**.
3. **There are often multiple carriers with the same name.** Confirm the exact
   **USDOT number** before building — names, addresses, and services differ.
4. **Raw photos are huge** (2–8 MB phone/AI images). Always compress (see snippet
   below) — target ~200–350 KB each, ~4 MB total. Logos are often multi-MB PNGs with
   wasted transparent borders; trim + resize. **Compress images FIRST** before
   writing any HTML — it's wasted effort to build the site against unprocessed assets.
5. **Verify before claiming done.** Use Chrome browser automation with a local
   `python3 -m http.server` to render desktop **and** mobile views. Scroll through
   every section — don't just check the hero.
6. **Match copy to the real operation.** Cargo "oilfield equipment / lumber / steel
   coils / building materials" = a *flatbed/open-deck* carrier, not dry van. Read
   the SAFER cargo list and position accordingly. Don't assume reefer just because
   photos show enclosed trailers — the SAFER cargo list is the source of truth.
7. **Service card counts matter.** Aim for an even number of service cards (4 or 6)
   to avoid an orphaned card on the last row. Merge closely related cargo types
   (e.g., "Heavy Machinery" + "Construction Equipment" → "Heavy Equipment") to
   hit a clean grid.
8. **Hero background image: use `object-fit: cover` + `object-position`, not
   oversized widths.** Setting `width: 135%` with a `left` offset leaves a visible
   gap on the left edge. Instead use `inset: 0; width: 100%; height: 100%;
   object-fit: cover; object-position: 70% center;` — the `object-position`
   controls where the subject sits without any gaps.
9. **Nav button color inheritance.** `.nav a` (class + element) has higher
   specificity than `.btn-primary` (class alone). Use `!important` on the
   `.btn-primary` color or add `.nav .btn-primary { color: #fff; }` so the
   "Get a Quote" button text stays white.
10. **Footer logo sizing.** Set both `height` AND `width: auto` on the footer logo
    image. Without `width: auto`, the HTML `width` attribute fights the CSS `height`
    and the logo blows up to full size. 85px height works well.
11. **GitHub push with large images.** The default HTTP post buffer is too small for
    repos with several compressed JPEGs. Use
    `git -c http.postBuffer=524288000 push` to avoid HTTP 400 errors.
12. **GitHub Pages first build.** After enabling Pages via the API, poll for
    completion with an until-loop (see deployment section below). Push an empty
    commit if the build never triggers.
13. **macOS case-insensitive `.gitignore` trap.** On macOS (HFS+/APFS), the
    filesystem is case-insensitive by default. A `.gitignore` entry for
    `assets/Logo/` will ALSO match `assets/logo/`. If raw originals live in
    `assets/Logo/` and processed files in `assets/logo/`, they're the **same
    directory**. Fix: ignore specific filenames (`assets/logo/FT_Logo-Raw.png`)
    instead of the directory, or use `git add -f` to force-stage processed files.
14. **Gallery grid math.** In a 3-column CSS grid, wide items (`grid-column: span 2`)
    consume 2 cells. The total cell count across all items must be a **multiple of 3**
    or you'll have a visible gap. Plan the layout before placing photos — see the
    gallery math section below.
15. **Scroll-triggered animations and instant scrolling.** If you use
    `IntersectionObserver` for fade-in animations and then jump to a section with
    `scrollIntoView({behavior: 'instant'})`, the observer may not fire. Scroll
    slightly (1-2 ticks) after jumping to trigger the animations.
16. **Gold accent on cream background = low contrast.** If your palette has a
    gold/amber accent and a cream background, the standard gold reads poorly as text
    on cream. Use the **navy brand color** for headings and a **darker gold** for
    eyebrow text on light sections. Reserve the bright gold for dark backgrounds.
17. **Safety section: frame the positives.** If the carrier has any crashes (even
    minor), don't put "2 total incidents" in prominent display text. Lead with
    "0 Fatal Crashes" as the big number and add "24-month reporting period" as the
    footnote. Keep the attention on the perfect OOS rate.

---

## What to collect from the client

- [ ] **USDOT number** (disambiguates the carrier) — and a SAFER Company Snapshot
      screenshot: legal name, DBA, physical + mailing address, phone, power units,
      drivers, operation type, cargo carried, inspections/crashes/safety rating.
      **Get all tabs**: ID/Operations, Inspections/Crashes in US, Safety Rating.
- [ ] **Logo** file (PNG preferred, vector/SVG ideal).
- [ ] **Photos** (trucks, drivers, equipment, dispatch center, office exterior).
- [ ] **Color palette** if available (client may have a brand guide or palette image).
- [ ] **Real contact email** for the quote form (SAFER usually has phone, rarely email).
- [ ] Any service/positioning notes the SAFER data doesn't capture.

---

## SAFER data extraction checklist

When the client provides SAFER screenshots, extract and confirm. **Zoom into the
screenshots** — SAFER screenshots are often low-resolution and numbers can be
hard to read at standard zoom.

- [ ] Legal name and DBA (use DBA as brand name if it exists)
- [ ] USDOT number and MC number
- [ ] Physical address, phone
- [ ] Power units and driver count
- [ ] Non-CMV units count (if any)
- [ ] MCS-150 mileage (for "X miles/year" stat)
- [ ] Operation classification (Auth. For Hire, Interstate, etc.)
- [ ] Cargo Carried checkboxes → these define the services section
- [ ] Vehicle inspections count + OOS count + OOS % + national average
- [ ] Driver inspections count + OOS count + OOS % + national average
- [ ] Hazmat inspections count + OOS count (if any)
- [ ] Crash record (fatal, injury, tow, total)
- [ ] Safety rating (if any — many small carriers show "None")

A **perfect safety record** (0% OOS, 0 crashes) is the strongest selling point —
give it a dedicated section with big numbers vs. national averages.

If the carrier has some crashes but 0 fatal: lead with "0 Fatal Crashes" and keep
total incidents in small footnote text.

---

## Step-by-step build order

This is the order that minimizes rework. **Do not skip straight to HTML** — asset
processing first avoids broken images and layout surprises.

1. **Gather data** — Read the SAFER snapshot screenshots; zoom in to read exact
   numbers. Confirm the USDOT. Derive services from the cargo list; note the safety
   record. Read the logo and color palette to determine brand colors.

2. **Compress assets** — Run the batch Pillow script (below) to:
   - Compress all photos to ~200-350 KB progressive JPEGs (max 1920px wide)
   - Trim, resize, and optimize the logo PNG (~760px wide)
   - Verify/create the white logo variant for dark backgrounds
   - Map source filenames to descriptive names (e.g., `hero-truck-sunset.jpg`)
   - Organize into `assets/img/` and `assets/logo/`

3. **Build all three files** — Write `index.html`, `styles.css`, and `script.js` in
   rapid succession. Use the section structure and design tokens below. **Write all
   the copy using real SAFER data** — don't use placeholder text.

4. **Verify** — Start `python3 -m http.server 8765` and use Chrome browser
   automation to scroll through every section. Check the review checklist below.
   Fix any issues before moving on.

5. **Ship** — Create `.gitignore`, init repo, commit, create GitHub repo with `gh`,
   push, enable Pages, poll until built.

---

## Site structure (sections)

Sticky header (logo + nav + "Get a Quote") → **Hero** (headline + sub + CTAs + trust
stats over a photo) → **Trust strip** (4 quick value props) → **Services** (card grid
built from the cargo types — **keep to 4 or 6 cards, merge related types to avoid
orphans**) → **About** (photo + story + stat row: power units, drivers, miles/yr) →
**Fleet gallery** (photo mosaic — see grid math below) → **Safety** (big stats vs
national averages + compliance badges) → **Coverage** (copy + photo, HQ badge) →
**Contact** (info + quote form) → Footer (white logo, nav, USDOT/MC).

### Section-specific notes

- **Hero**: The `em` tag on the key word (e.g., "Moves *Faster*") gets the gold
  accent color. Trust stats at the bottom: 0% OOS, power units, drivers, 24/7.
- **Trust strip**: 4 items max. Good defaults: FMCSA Authorized, On-Time Delivery,
  Perfect Inspections, Nationwide Reach.
- **Services**: 6 cards in a 3×2 grid. Group from the SAFER cargo list:
  - General Freight (catch-all for standard dry goods)
  - Refrigerated & Fresh (fresh produce + refrigerated food + beverages)
  - Construction & Building (building materials + lumber + coal/coke + construction)
  - Metal & Machinery (metal sheets/coils + machinery + oilfield equipment)
  - Household & Vehicles (household goods + motor vehicles + drive/tow-away)
  - Grain & Agriculture (grain/feed/hay + farm supplies + dry bulk)
- **About**: Don't include crash count in the stat row — it belongs in Safety.
  Stat row: power units, drivers, miles/yr.
- **Safety**: 4 cards in a grid. Card 1: Vehicle OOS 0% (with bar showing nat'l
  avg). Card 2: Driver OOS 0% (same). Card 3: Total Inspections. Card 4: Fatal
  Crashes = 0 (footnote: "24-month reporting period").
- **Coverage**: Use the office/HQ exterior photo here if available.
- **Contact**: Two-column: info (phone as `tel:` link, address, hours) + form.
  Form fields: name, company, email, phone, freight type dropdown (matching service
  cards), shipment details textarea.

---

## Photo assignment guide

Map client photos to sections by content:

| Photo type | Best section | Notes |
|---|---|---|
| Truck on highway / action shot | **Hero background** | Use `object-position` to keep subject visible |
| Driver portrait | **About** | Humanizes the company; works best beside the story text |
| Truck at dock / yard | **Fleet gallery** | Shows real equipment |
| Truck door/logo close-up | **Fleet gallery** | Brand reinforcement |
| Dispatch / operations center | **Fleet gallery** or **Trust strip** | Great differentiator |
| Sunset / atmospheric shot | **Coverage** or **Fleet gallery** | Mood / texture |
| Steering wheel / cab interior | **Coverage** | Behind-the-wheel feel |
| Office / HQ exterior | **Coverage** | Professional presence; also works in gallery |
| Warehouse / loading dock | **Fleet gallery** | Shows operational capability |
| Night driving shot | **Fleet gallery** | Dramatic lighting, shows 24/7 capability |
| Truck grille / detail close-up | **Fleet gallery** | Texture and visual variety |
| Driver doing pre-trip inspection | **Fleet gallery** or **Safety** | Safety-conscious imagery |
| Landscape with truck (aerial/drone) | **Hero** or **Coverage** | Wide shots work great for hero with gradient overlay |

---

## Fleet gallery grid math

The gallery uses a 3-column CSS grid. Wide items (`grid-column: span 2`) consume
2 cells. The total cell count must be a **multiple of 3** or there will be a gap.

**Formula:** `(num_wide × 2) + num_single = 3n`

Common clean layouts:

| Photos | Wide | Single | Cells | Rows | Layout |
|--------|------|--------|-------|------|--------|
| 3 | 0 | 3 | 3 | 1 | `1+1+1` |
| 4 | 1 | 3 | 5 | — | **BAD** (5 ≠ 3n) |
| 5 | 1 | 4 | 6 | 2 | `W+1 / 1+1+1` or `1+1+1 / 1+W` |
| 6 | 0 | 6 | 6 | 2 | `1+1+1 / 1+1+1` |
| 6 | 3 | 3 | 9 | 3 | `W+1 / 1+W / W+1` — but 3 wides look odd |
| 7 | 2 | 5 | 9 | 3 | `W+1 / 1+1+1 / 1+W` ← **best for 7 photos** |
| 8 | 1 | 7 | 9 | 3 | `W+1 / 1+1+1 / 1+1+1` |
| 9 | 0 | 9 | 9 | 3 | `1+1+1 / 1+1+1 / 1+1+1` |

**Recommended for most builds:** 7 photos with 2 wide items (one at start, one at
end). This gives visual variety with the wide bookends and fills all 3 rows cleanly.

CSS grid auto-flow handles placement automatically — just put wide items in the
right positions in the HTML. The first wide item takes row 1 cols 1-2, singles
fill row 2, and the last wide item takes row 3 cols 2-3.

---

## Tech & conventions

- **Stack:** plain HTML + CSS + vanilla JS. **No build step** — opens via `file://`
  and deploys to any static host. Fonts via Google Fonts.
- **Font pairing:** **Barlow Condensed** (headings — bold, condensed, authoritative)
  + **DM Sans** (body — clean, more distinctive than Inter). Both available on
  Google Fonts. Avoid Inter — it's overused and reads as generic.
- **File layout:**
  ```
  index.html
  styles.css
  script.js
  .gitignore
  assets/
    logo/   ft-logo-blue.png, ft-logo-white.png
    img/    descriptive-names.jpg  (e.g. hero-truck-sunset.jpg)
  ```
  Keep raw/uncompressed originals **outside** the committed tree via `.gitignore`.
- **Design tokens** — rebrand by editing these in `:root`:
  ```css
  :root {
      --brand:        #0B2545;   /* primary — darkest brand tone (headings, nav) */
      --brand-dark:   #081C36;   /* hover state for brand */
      --brand-bright: #1A3A6B;   /* lighter brand for gradients */
      --gold:         #C8982C;   /* accent — buttons, icons, CTAs */
      --gold-dark:    #A67B1E;   /* hover state for gold */
      --gold-light:   #D4AD4A;   /* gold on dark backgrounds */
      --cream:        #EDE8DB;   /* light section backgrounds */
      --cream-dark:   #E0D9C8;   /* borders on cream sections */
      --warm-gray:    #8A7E72;   /* secondary text, captions */
      --deep:         #1B1F24;   /* darkest bg (fleet gallery, footer) */
      --charcoal:     #2A2F36;   /* slightly lighter dark */
      --pop:          #EDE8DB;   /* text on dark backgrounds — must be light! */
      --white:        #FFFFFF;
      --text:         #2A2F36;   /* default body text */
      --text-light:   #5A5A5A;   /* secondary body text */
  }
  ```
  On dark backgrounds use `--pop` or `--gold-light` for text — never `--brand`
  (mid-tone navy on dark charcoal is unreadable) or `--gold` (mid-tone gold on
  dark is borderline). There's an `.eyebrow.light` helper for exactly this.
- **Logo:** trim transparent border, resize to ~760px wide PNG. Make a **white
  variant** for the dark footer by painting RGB white where alpha > 0.
- **Hero photo technique:** use `position: absolute; inset: 0; width: 100%;
  height: 100%; object-fit: cover; object-position: 70% center;` — then lay a
  **multi-stop directional gradient** over it for headline legibility:
  ```css
  .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
          100deg,
          rgba(11, 37, 69, 0.92) 0%,
          rgba(11, 37, 69, 0.85) 30%,
          rgba(11, 37, 69, 0.6) 55%,
          rgba(11, 37, 69, 0.25) 80%,
          rgba(11, 37, 69, 0.1) 100%
      );
  }
  ```
  Adjust the RGBA values per brand color — the key is heavy opacity on the left
  (where text lives) fading to near-transparent on the right (where the truck is).
  **Do NOT use oversized width + left offset** — it leaves edge gaps.
- **Quote form:** `script.js` builds a `mailto:` with the fields prefilled. Swap in a
  real backend (Formspree / Netlify Forms / Web3Forms) for production so submissions
  send without opening a mail client. Set the real recipient email in the `mailto:`.
- **Responsive:** mobile nav toggle; grids collapse at 940 / 720 / 520px.
  **Add horizontal padding to hero content on mobile** (`padding: 120px 24px 60px`)
  so text doesn't touch screen edges. Set `scroll-behavior: smooth` and
  `scroll-padding-top: 80px` on `html` to offset the sticky header on anchor jumps.
- **Accessibility:** alt text on photos (decorative hero img `alt=""`), `loading="lazy"`
  on below-the-fold images, sufficient contrast on dark sections.
- **Nav specificity:** `.nav a` outranks `.btn-primary` — use `!important` or a
  compound selector to keep CTA button text white.
- **Footer logo:** always set `height: Xpx; width: auto;` — omitting `width: auto`
  lets the HTML `width` attribute override the height constraint. 85px is a good
  default.

### Service card icon suggestions

Use simple SVG stroke icons (Heroicons-style). Good mappings:

| Service | Icon | SVG path description |
|---|---|---|
| General Freight | Briefcase/box | Rectangle with handle, divider line |
| Refrigerated & Fresh | Shopping cart | Cart with wheel, angled handle |
| Construction & Building | Building/office | Building facade with windows and door |
| Metal & Machinery | Gear/cog | Settings gear with center circle |
| Household & Vehicles | House | House outline with door |
| Grain & Agriculture | Folder/crop | Folder with plus, or wheat/plant |

**Don't use:** sun/snowflake for refrigerated (confusing), wrench for machinery
(too generic), truck for everything (already on the page as photos).

### Scroll animations

Use `IntersectionObserver` to add a `.visible` class that transitions from
`opacity: 0; transform: translateY(24px)` to full visibility. Apply staggered
`transitionDelay` to grid children for a cascade effect:

```javascript
function staggerChildren(selector) {
    document.querySelectorAll(selector).forEach(function (parent) {
        var children = parent.children;
        for (var i = 0; i < children.length; i++) {
            children[i].style.transitionDelay = (i * 80) + 'ms';
        }
    });
}
staggerChildren('.services-grid');
staggerChildren('.safety-grid');
staggerChildren('.gallery');
```

Observer settings: `{ threshold: 0.15, rootMargin: '0px 0px -40px 0px' }` —
the negative bottom margin ensures elements trigger slightly before they're
fully in view, which feels more responsive.

---

## Image compression (Pillow)

`pip install Pillow` is available in the cloud env. Run this as a **single batch
script** before writing any HTML. Map source filenames to descriptive names:

```python
from PIL import Image, ImageOps
import os

base = "/path/to/project"
img_in = os.path.join(base, "assets/Imagery")   # raw photos directory
img_out = os.path.join(base, "assets/img")       # processed output
logo_in = os.path.join(base, "assets/Logo")      # raw logo directory
logo_out = os.path.join(base, "assets/logo")     # processed logo output

os.makedirs(img_out, exist_ok=True)
os.makedirs(logo_out, exist_ok=True)

# Map source filenames -> descriptive names
photo_map = {
    "source_hero_shot.jpeg":     "hero-truck-sunset.jpg",
    "source_driver.jpeg":        "driver-portrait.jpg",
    "source_highway.jpeg":       "truck-highway-fields.jpg",
    # ... add all photos
}

for src_name, dst_name in photo_map.items():
    src = os.path.join(img_in, src_name)
    dst = os.path.join(img_out, dst_name)
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if im.width > 1920:
        im = im.resize((1920, round(im.height * 1920 / im.width)), Image.LANCZOS)
    im.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
    size_kb = os.path.getsize(dst) / 1024
    print(f"{dst_name}: {im.width}x{im.height} -> {size_kb:.0f} KB")

# Logo -> trim transparent border, resize, optimize
for logo_name in ["Logo-Blue.png", "Logo-White.png"]:
    src = os.path.join(logo_in, logo_name)
    if not os.path.exists(src):
        continue
    logo = Image.open(src).convert("RGBA")
    bbox = logo.split()[3].getbbox()
    if bbox:
        logo = logo.crop(bbox)
    if logo.width > 760:
        logo = logo.resize((760, round(logo.height * 760 / logo.width)), Image.LANCZOS)
    out_name = "ft-logo-blue.png" if "Blue" in logo_name else "ft-logo-white.png"
    dst = os.path.join(logo_out, out_name)
    logo.save(dst, "PNG", optimize=True)
    size_kb = os.path.getsize(dst) / 1024
    print(f"{out_name}: {logo.width}x{logo.height} -> {size_kb:.0f} KB")

# If no white variant exists, create from the blue logo
blue_path = os.path.join(logo_out, "ft-logo-blue.png")
white_path = os.path.join(logo_out, "ft-logo-white.png")
if not os.path.exists(white_path) and os.path.exists(blue_path):
    blue = Image.open(blue_path).convert("RGBA")
    r, g, b, a = blue.split()
    white_logo = Image.merge("RGBA", tuple(a.point(lambda _: 255) for _ in range(3)) + (a,))
    white_logo.save(white_path, "PNG", optimize=True)
    print(f"Created white variant from blue logo")

# Report total size
total = sum(
    os.path.getsize(os.path.join(d, f))
    for d in [img_out, logo_out]
    for f in os.listdir(d)
    if not f.startswith('.')
)
print(f"\nTotal asset size: {total/1024/1024:.1f} MB")
```

Typical result: ~30 MB of raw uploads → ~2–4 MB compressed.

---

## Verify with browser preview

Start a local server and use Chrome browser automation to check every section:

```bash
# Start local server
cd /path/to/project && python3 -m http.server 8765 &
```

**Do NOT use `file://` URLs** — Chrome browser automation tools cannot screenshot
`file://` pages (they error with "Frame showing error page"). Always serve via HTTP.

### Scroll-through verification process

1. Navigate to `http://localhost:8765/`
2. Screenshot the hero (check gradient, logo visibility, CTA button colors)
3. Scroll down and screenshot each section in order
4. For sections with fade-in animations, wait 1-2 seconds after scrolling for
   animations to complete before taking the screenshot
5. To jump to a specific section quickly, use JavaScript:
   ```javascript
   document.getElementById('safety').scrollIntoView({behavior: 'instant'});
   ```
   Then scroll 1-2 ticks to trigger IntersectionObserver if content appears invisible.

### Common issues to check during review

- [ ] No edge gaps on hero (left/right black bars)
- [ ] Service cards fill rows evenly (no orphaned last card)
- [ ] "Get a Quote" nav button text is white (not inherited nav color)
- [ ] Footer logo is properly sized (not blown up to full width)
- [ ] Mobile hero has side padding (text not touching edges)
- [ ] All images load (no broken image icons)
- [ ] Fleet gallery rows are fully filled (no blank cells — check grid math)
- [ ] Dark section text uses `--pop` or `--gold-light`, not `--brand` or `--gold`
- [ ] Phone number is a clickable `tel:` link
- [ ] Form freight types match service cards
- [ ] Eyebrow text on cream backgrounds has sufficient contrast (use darker gold)
- [ ] Safety section leads with positives (0% OOS, 0 fatal) not incident counts
- [ ] Gallery images are all the same height within each row
- [ ] Sticky header has backdrop blur and scroll shadow
- [ ] Smooth scroll anchor links offset for sticky header height

---

## GitHub deployment

```bash
# 1. Create .gitignore (exclude raw originals, keep processed assets)
cat > .gitignore << 'GITIGNORE'
.DS_Store
.claude/
assets/Imagery/
assets/Color Palette/
assets/safer screenshots/
# Ignore raw logo originals by filename (NOT by directory —
# macOS case-insensitive FS makes assets/Logo/ match assets/logo/)
assets/logo/FT_Logo-Blue.png
assets/logo/FT_Logo-White.png
GITIGNORE

# 2. Init and commit
git init && git branch -m main
git add .gitignore index.html styles.css script.js assets/img/

# Logo files may need force-add if gitignore patterns match on
# case-insensitive macOS:
git add -f assets/logo/ft-logo-blue.png assets/logo/ft-logo-white.png

git commit -m "Add [CLIENT] marketing site

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# 3. Create repo and push (gh handles remote + push in one command)
gh repo create [repo-name] --public --source=. --remote=origin \
  --description "Marketing website for [CLIENT] — USDOT [NUMBER]"
git -c http.postBuffer=524288000 push -u origin main

# 4. Enable GitHub Pages
gh api repos/[user]/[repo]/pages -X POST \
  -f "source[branch]=main" -f "source[path]=/"

# 5. Poll until build completes (don't use sleep-and-check — use until loop)
until gh api repos/[user]/[repo]/pages --jq '.status' 2>/dev/null \
  | grep -q "built"; do sleep 5; done
echo "Pages is live!"

# 6. Verify
gh api repos/[user]/[repo]/pages --jq '.html_url'
```

Site URL: `https://[user].github.io/[repo]/`

### .gitignore gotcha on macOS

macOS uses a **case-insensitive** filesystem by default (HFS+/APFS). This means:
- `assets/Logo/` in `.gitignore` will also match `assets/logo/`
- If your raw logos live in `assets/Logo/` and processed logos in `assets/logo/`,
  they're the **same directory** on disk

**Solution:** Don't ignore the directory. Instead, ignore specific raw files by
their exact filename:
```
assets/logo/FT_Logo-Blue.png
assets/logo/FT_Logo-White.png
```

Or use `git add -f` to force-stage the processed files regardless of `.gitignore`.

---

## Per-client checklist

### Before building
- [ ] USDOT confirmed; SAFER snapshot received (all tabs)
- [ ] Logo + photos provided as files (not just pasted in chat)
- [ ] Color palette identified (from logo, palette image, or client brand guide)
- [ ] Cargo types reviewed; service card groupings planned (must be 4 or 6)
- [ ] Gallery photo count planned with grid math (total cells divisible by 3)

### During build
- [ ] Images compressed FIRST (before writing HTML)
- [ ] White logo variant created/verified
- [ ] Palette pulled from logo into `:root` design tokens
- [ ] Services match real cargo types
- [ ] Safety section uses real numbers; leads with best stats
- [ ] Phone number is a `tel:` link
- [ ] Footer logo has `width: auto` set
- [ ] Nav CTA button text is white (`!important` or compound selector)
- [ ] Hero overlay gradient has enough opacity on text side

### During review
- [ ] Desktop preview: all sections scrolled and checked
- [ ] Mobile preview: hero padding, nav toggle, grid collapse
- [ ] No gallery gaps (grid math verified)
- [ ] Dark section text uses light color tokens
- [ ] Form freight type dropdown matches service cards
- [ ] All images load (no 404s)

### During deployment
- [ ] `.gitignore` excludes raw originals but NOT processed assets
- [ ] macOS case-sensitivity checked on gitignore patterns
- [ ] Logos force-added with `git add -f` if needed
- [ ] Pushed with `http.postBuffer=524288000`
- [ ] GitHub Pages enabled and build confirmed as "built"
- [ ] Live URL tested in browser

---

## Completed builds

| Client | USDOT | Repo | Live URL |
|---|---|---|---|
| JBD Transit LLC | — | — | — |
| Andrew P Jacobs Transport | — | — | — |
| Faster Transport Inc | 4324214 | `championwes/faster-transport` | https://championwes.github.io/faster-transport/ |

---

## Notes on scaling

One repo per client keeps Pages URLs clean (`…github.io/<client>/`) and isolates
each engagement. To host several from one repo, give each client a subfolder
(`/jbd-transit/`, `/faster-transport/`) and publish with Pages — each is reachable
at `…github.io/carrier_sites/<client>/`. Either way, the per-client build process
above is identical.
