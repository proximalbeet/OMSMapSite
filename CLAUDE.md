# OMSMapSite — WordPress Map Plugin

## What This Is

A WordPress plugin that renders an interactive world map showing the global distribution of OMS (Opsoclonus Myoclonus Syndrome) patients by country. Data is pulled live from a public Google Sheet and displayed as clickable bubble markers on a Leaflet.js map.

## How It Works

### Entry Point: Shortcode

The plugin registers a `[interactive_map]` shortcode. Drop this shortcode anywhere in WordPress (a page, post, etc.) to embed the map. The shortcode renders a wrapper `<div>` with a header and an `#interactive-map` container.

### Data Flow

1. **Google Sheet → PHP** (`MapPlugin.php:51–95`): On each page load, `map_plugin_get_sheet_data()` fetches a CSV export of the configured Google Sheet via `wp_remote_get`. The sheet must have columns: `name`, `count`, `lat`, `lng`. Rows with `lat`/`lng` both zero are skipped. Results are cached in a WordPress transient for 1 hour.

2. **PHP → JavaScript** (`MapPlugin.php:44–46`): The parsed feature array is injected into the page as a global `MapPluginData.features` object via `wp_localize_script`.

3. **JavaScript → Map** (`MapPlugin.js`): On `DOMContentLoaded`, Leaflet.js initializes on `#interactive-map` centered at `[20, 0]` with zoom level 2 (world view). Features are converted to GeoJSON and rendered as `L.divIcon` bubble markers.

### Bubble Markers

Bubble size scales logarithmically — `Math.max(28, Math.min(64, Math.log(count + 1) * 10))` — so countries with very high counts don't visually dominate. Each bubble shows the patient count as its label. Font size grows with bubble size (10/12/14px). Clicking a bubble opens a Leaflet popup showing country name and count in a styled card.

### Admin Settings

The plugin adds a settings page under **WordPress Admin → Settings → Map Plugin**. The admin pastes the Google Sheet URL there. The PHP extracts the sheet ID via regex, builds the CSV export URL, and stores the URL in `wp_options` as `map_plugin_sheet_url`. Saving the form also invalidates the transient cache.

## File Structure

```
MapPlugin/
├── MapPlugin.php               # Plugin entry — shortcode, data fetch, admin settings
└── assets/
    ├── css/
    │   ├── plugin.css          # Wrapper card, header, bubbles, popup styles
    │   └── leaflet.css         # Bundled Leaflet stylesheet (local copy)
    └── js/
        ├── MapPlugin.js        # Map init, GeoJSON rendering, bubble + popup logic
        └── leaflet.js          # Bundled Leaflet library (local copy)
```

> Note: Leaflet is also loaded from the unpkg CDN in `MapPlugin.php`; the local copies in `assets/` appear to be backups/offline references.

## Key Dependencies

| Dependency | Purpose | How loaded |
|---|---|---|
| Leaflet.js | Interactive map rendering | CDN (`unpkg.com`) via `wp_enqueue_script` |
| OpenStreetMap tiles | Map tile layer | `tile.openstreetmap.org` (fetched client-side) |
| Google Sheets CSV export | Patient data source | Server-side `wp_remote_get` |
| WordPress transients API | 1-hour data cache | Built-in WordPress |

## Google Sheet Requirements

The sheet must be:
- Publicly shared ("Anyone with the link can view")
- Row 1 must be headers: `name`, `count`, `lat`, `lng` (case-insensitive)
- `lat`/`lng` are decimal coordinates; rows where both are `0` are excluded
- `count` is an integer patient count per country

## Styling Notes

- The map is wrapped in a rounded card (`border-radius: 12px`, shadow) via `.map-plugin-wrapper`
- Map height is fixed at `560px`
- Bubbles are blue (`rgba(37, 99, 235, 0.85)`) with a white border, scale up 12% on hover
- Popups show country name + a blue pill badge with the count
