# OMS Map Plugin

A WordPress plugin that displays an interactive world map of the OMS (Opsoclonus Myoclonus Syndrome) community. Shows two data layers — patients by country and OMS hospital hospitals — with a live 3-way toggle between views. Data is pulled from public Google Sheets and cached automatically.

---

## Features

- Interactive Leaflet.js map embedded via the `[interactive_map]` shortcode
- **Patients layer** — orange bubble markers sized logarithmically by patient count per country
- **Hospitals layer** — green `+` markers for individual OMS hospital hospitals
- **3-way toggle** — switch between Patients, Hospitals, or Both layers simultaneously
- **Header stats** — total patient count and hospital count displayed above the map
- **Rich hospital popups** — institution name (website link), hospital name, type badge, OMAS case count, registry status, address, tap-to-call phone, and video link
- **Patient popups** — country name and patient count
- Data cached for 1 hour; cache clears automatically when settings are saved
- Toggle and hospital layer are hidden if no hospitals sheet is configured — no visual change for unconfigured installs
- Medical disclaimer and map attribution displayed below the card

---

## Installation

1. Copy the `MapPlugin/` folder into your WordPress site's `wp-content/plugins/` directory
2. Go to **WP Admin → Plugins** and activate **MapPlugin**
3. Go to **WP Admin → Settings → Map Plugin** and configure your data sources (see below)
4. Add the shortcode `[interactive_map]` to any page or post

> **Local development tip:** Instead of copying files each time, symlink the plugin directory into your local WordPress install:
> ```bash
> ln -s /path/to/repo/MapPlugin /path/to/wp-content/plugins/MapPlugin
> ```

---

## Data Setup

Both data sources are public Google Sheets. Each sheet must be shared with **"Anyone with the link can view"**.

### Patients Sheet

Row 1 headers (case-insensitive):

| name | count | lat | lng |
|------|-------|-----|-----|
| United States | 807 | 37.0902 | -95.7129 |
| United Kingdom | 118 | 55.3781 | -3.4360 |
| Unknown | 566 | -40 | -160 |

- Rows where both `lat` and `lng` are `0` are skipped automatically
- Patients with no known location should use `lat: -40, lng: -160` (South Pacific placeholder — keeps them on the map without implying a false location)
- Use `patients_map.csv` (in `assets/spreadsheets/`) as your import template

### Hospitals Sheet

Row 1 headers (case-insensitive, spaces allowed):

| Institution | Hospital | Address | Phone number | Type | OMAS Cases | Registry | Picture | Video | lat | lng |
|-------------|------------|---------|--------------|------|------------|----------|---------|-------|-----|-----|
| Boston Children's Hospital | Mark Gorman | 300 Longwood Ave, Boston, MA 02115 | (617) 919-5323 | Pediatric | 105 | YES | | https://youtube.com/... | 42.3372 | -71.1064 |

**Column notes:**

| Column | Required | Description |
|--------|----------|-------------|
| Institution | Yes | Hospital or clinic name |
| Hospital | Yes | Doctor's full name |
| Address | Yes | Full mailing address (multi-line addresses are supported) |
| Phone number | Yes | Displayed as a tap-to-call link |
| Type | No | e.g. "Pediatric" — shown as a badge in the popup |
| OMAS Cases | No | Integer case count — shown as a badge in the popup |
| Registry | No | "YES" or blank — shows a "Registry ✓" badge if YES |
| Picture | No | **URL** to a publicly hosted photo — see note below |
| Video | No | URL to a video (YouTube etc.) — shown as a "▶ Watch Video" link |
| lat | Yes | Decimal latitude — no degree symbols or cardinal letters |
| lng | Yes | Decimal longitude — no Unicode minus signs, plain `-` only |
| url *(optional)* | No | Website URL — makes the institution name a clickable link |

> **About the Picture column:** Spreadsheets cannot store image files — only links to them. To show a doctor's photo, upload the image somewhere publicly accessible (e.g. WordPress Media Library via WP Admin → Media → Add New), then paste the resulting URL into the Picture column.

> **Coordinates:** Must be plain decimal numbers (e.g. `42.3372`, `-71.1064`). Google Sheets sometimes exports coordinates with degree symbols or Unicode minus signs — use `hospitals_map.csv` as your import template since it has pre-cleaned values.

> Use `hospitals_map.csv` (in `assets/spreadsheets/`) as your import template.

---

## Configuration

In **WP Admin → Settings → Map Plugin**:

- **Patients Google Sheet URL** — paste the full Google Sheets URL for patient data
- **Hospitals Google Sheet URL** — paste the full Google Sheets URL for hospital data

Click **Save & Refresh Map Data** to clear the cache and fetch fresh data. Do this any time you update sheet content, even if the URL hasn't changed.

---

## Dependencies

| Library | Source |
|---------|--------|
| Leaflet.js | unpkg CDN |
| OpenStreetMap / CARTO tiles | Tile layer (client-side) |

No build step required. Pure PHP and vanilla JavaScript.

---

## Shortcode

```
[interactive_map]
```

Place this in any page or post body. The map renders inside a styled card with the title, stats row, layer toggle, and the map itself. A medical disclaimer and attribution line appear below the card.

---

## Disclaimer

The following disclaimer is rendered below the map card:

> The information presented on this map is based primarily on patient utilization patterns and reflects locations where larger numbers of patients have received care. It may also include institutions where physicians are recognized by their peers as experienced medical professionals in the treatment of OMAS. Inclusion does not imply any recommendation, endorsement, or assessment of the quality, effectiveness, or suitability of any institution, physician, or healthcare provider. Users are encouraged to conduct their own research and consult qualified professionals when making healthcare decisions.
