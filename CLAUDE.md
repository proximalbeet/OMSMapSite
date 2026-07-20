# OMSMapSite — WordPress Map Plugin

## What This Is

A WordPress plugin that renders an interactive world map of the OMS (Opsoclonus Myoclonus Syndrome) community. It supports two data layers — patients by country and OMS specialists/hospitals — with a 3-way toggle to switch between views. Data is pulled live from two public Google Sheets and cached server-side.

## How It Works

### Entry Point: Shortcode

The plugin registers a `[interactive_map]` shortcode. Drop this anywhere in WordPress to embed the map. The shortcode renders a wrapper `<div>` with a header (title, description, stats, toggle) and an `#interactive-map` container, followed by a disclaimer block and attribution line outside the card.

### Data Flow

1. **Google Sheets → PHP** (`MapPlugin.php`): On each page load, two functions fetch CSV exports from their respective configured Google Sheets via `wp_remote_get`. Both are cached in WordPress transients for 1 hour and invalidated when settings are saved.
   - `map_plugin_get_sheet_data()` — patients sheet (`name, count, lat, lng`)
   - `map_plugin_get_specialists_data()` — specialists sheet (`institution, specialist, address, phone, lat, lng`)
   - Rows where both `lat` and `lng` are `0` are skipped. Rows where column count doesn't match the header are skipped (prevents `array_combine` crash on malformed CSV).

2. **PHP → JavaScript** (`MapPlugin.php:44–47`): Both datasets injected into the page as `MapPluginData.features` and `MapPluginData.specialists` via `wp_localize_script`.

3. **JavaScript → Map** (`MapPlugin.js`): On `DOMContentLoaded`, Leaflet initializes on `#interactive-map` centered at `[20, 0]` zoom 2. Two `L.layerGroup()` instances are built (one per dataset) and toggled by adding/removing from the map — no re-renders on toggle.

### Patient Layer

Orange bubble markers sized logarithmically: `Math.max(28, Math.min(64, Math.log(count + 1) * 10))`. Each bubble shows the patient count. `zIndexOffset: -1000` keeps them below specialist markers. Clicking opens a popup with country name and count badge. Unknown-location patients are placed at `lat: -40, lng: -160` (South Pacific).

### Specialist Layer

Green circle markers with a `+` symbol, fixed 36×36px. `zIndexOffset: 1000` ensures they always render on top of patient bubbles. Clicking opens a popup with institution name (linked to their website if a `url` is present), specialist name, address, and a `tel:` phone link.

### Header Stats

Total patient count (sum of all `count` values) and total specialist count are computed in JS and injected as stat figures into the header. Only shown when data is present.

### Toggle

Three-button segmented control (Patients | Both | Specialists) injected into the header by JS. Hidden entirely if no specialists sheet is configured — zero visible change for unconfigured installs. Default state is Patients.

### Admin Settings

Settings page at **WordPress Admin → Settings → Map Plugin** with two URL fields:
- **Patients Google Sheet URL** → stored as `map_plugin_sheet_url`
- **Specialists Google Sheet URL** → stored as `map_plugin_specialists_sheet_url`

Both transients are cleared on save.

## File Structure

```
MapPlugin/
├── MapPlugin.php               # Plugin entry — shortcode, data fetch, admin settings
└── assets/
    ├── css/
    │   ├── plugin.css          # All plugin styles: card, header, stats, toggle, bubbles, markers, popups, disclaimer, attribution
    │   └── leaflet.css         # Bundled Leaflet stylesheet (local copy / backup)
    ├── js/
    │   ├── MapPlugin.js        # Map init, layer groups, toggle logic, marker + popup rendering, header stats injection
    │   └── leaflet.js          # Bundled Leaflet library (local copy / backup)
    └── spreadsheets/
        ├── patients_map.csv    # Reference patient data (76 countries + Unknown row at -40,-160)
        └── specialists_map.csv # Clean specialist data ready for Google Sheets import (4 hospitals, fixed coordinates)
```

> Leaflet is loaded from the unpkg CDN in `MapPlugin.php`; local copies in `assets/` are offline backups.

## Key Dependencies

| Dependency | Purpose | How loaded |
|---|---|---|
| Leaflet.js | Interactive map rendering | CDN (`unpkg.com`) via `wp_enqueue_script` |
| OpenStreetMap tiles | Map tile layer | `tile.openstreetmap.org` (fetched client-side) |
| Google Sheets CSV export | Patient + specialist data | Server-side `wp_remote_get` |
| WordPress transients API | 1-hour data cache | Built-in WordPress |

## Google Sheet Requirements

Both sheets must be publicly shared ("Anyone with the link can view").

**Patients sheet** — row 1 headers: `name, count, lat, lng`
- `count` is integer patient count per country
- Rows where both `lat` and `lng` are `0` are skipped
- Unknown-location patients: use `lat: -40, lng: -160` (South Pacific placeholder)

**Specialists sheet** — row 1 headers: `Institution, Specialist, Address, Phone number, Type, OMAS Cases, Registry, Picture, Video, lat, lng`
- Optional extra column: `url` — if present, the institution name in the popup becomes a website link
- `Type` — e.g. "Pediatric"; shown as a badge in the popup
- `OMAS Cases` — integer case count; shown as a badge in the popup
- `Registry` — "YES" or blank; shows a "Registry ✓" badge if YES
- `Picture` — URL to a photo of the specialist (shown at top of popup if present)
- `Video` — URL to a video (shown as a "▶ Watch Video" link in the popup)
- Headers are case-insensitive and spaces are normalized to underscores internally
- Coordinates must be plain decimal numbers (no degree symbols, cardinal letters, or Unicode minus signs)
- Use `specialists_map.csv` as the import template — it has clean coordinates and all column headers

## Styling Notes

- `.map-plugin-wrapper` — rounded card (`border-radius: 16px`, warm shadow)
- `.map-plugin-header` — light warm-gray background, contains title, description, stats row, toggle
- `.map-stat-number` — large bold figures for patient/specialist totals
- `.map-bubble` — orange patient markers, logarithmic size, `zIndexOffset: -1000`
- `.map-specialist-marker` — green `+` markers, fixed 36px, `zIndexOffset: 1000`
- `.map-toggle` — segmented pill button group, blue active state
- `.map-plugin-disclaimer` — warm gray box with left border accent, below the card
- `.map-plugin-attribution` — tiny faded text below disclaimer, links to OSM and CARTO
- Leaflet's built-in attribution control is hidden via CSS; attribution is reproduced in `.map-plugin-attribution` to remain ToS-compliant
