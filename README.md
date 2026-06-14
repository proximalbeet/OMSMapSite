OMS Map Plugin
A WordPress plugin that displays an interactive world map of the OMS (Opsoclonus Myoclonus Syndrome) community. Supports two data layers — patients by country and specialist hospitals — with a live toggle between views. Data is pulled from public Google Sheets and cached automatically.

Features
Interactive Leaflet.js map embedded via shortcode
Patients layer — blue bubble markers sized by patient count per country
Specialists layer — green markers for individual OMS specialist hospitals
3-way toggle — switch between Patients, Specialists, or Both layers simultaneously
Clicking any marker opens a popup with details
Data cached for 1 hour; refreshes automatically or on settings save
Specialists toggle is hidden automatically if no specialists sheet is configured
Installation
Copy the MapPlugin/ folder into your WordPress site's wp-content/plugins/ directory
Go to WP Admin → Plugins and activate MapPlugin
Go to WP Admin → Settings → Map Plugin and configure your data sources (see below)
Add the shortcode [interactive_map] to any page or post
Data Setup
Both data sources are public Google Sheets. Each sheet must be shared with "Anyone with the link can view".

Patients Sheet
Row 1 must have these headers (lowercase):

name	count	lat	lng
United States	807	37.0902	-95.7129
United Kingdom	118	55.3781	-3.4360
Specialists Sheet
Row 1 must have these headers (lowercase):

institution	specialist	address	phone	lat	lng
Boston Children's Hospital	Mark Gorman	300 Longwood Ave, Boston, MA	(617) 919-5323	42.3372	-71.1064
Note: Coordinates must be plain decimal numbers. Rows where both lat and lng are 0 or empty are skipped automatically.

Configuration
In WP Admin → Settings → Map Plugin:

Patients Google Sheet URL — paste the full Google Sheets URL for patient data
Specialists Google Sheet URL — paste the full Google Sheets URL for specialist data
Saving the settings clears the cache and fetches fresh data immediately.

Dependencies
Library	Version	Source
Leaflet.js	Latest	unpkg CDN
OpenStreetMap	—	Tile layer (client-side)
No build step required. Pure PHP and vanilla JavaScript.

Shortcode

[interactive_map]
