document.addEventListener('DOMContentLoaded', function () {

    const mapElement = document.getElementById('interactive-map');
    if (!mapElement) return;

    const features    = (MapPluginData && MapPluginData.features)    ? MapPluginData.features    : [];
    const hospitals = (MapPluginData && MapPluginData.hospitals)  ? MapPluginData.hospitals  : [];
    const hasHospitals = hospitals.length > 0;

    // ── Inject stats + toggle into header ────────────────────────────────────

    const header = document.querySelector('.map-plugin-header');
    if (header) {
        const totalPatients = features.reduce(function (sum, f) { return sum + parseInt(f.count, 10); }, 0);

        const stats = document.createElement('div');
        stats.className = 'map-header-stats';
        stats.innerHTML =
            '<div class="map-stat"><span class="map-stat-number">' + totalPatients.toLocaleString() + '</span><span class="map-stat-label">Total Patients</span></div>' +
            (hasHospitals ? '<div class="map-stat"><span class="map-stat-number">' + hospitals.length + '</span><span class="map-stat-label">Hospitals</span></div>' : '');
        header.appendChild(stats);

        if (hasHospitals) {
            const toggle = document.createElement('div');
            toggle.className = 'map-toggle';
            toggle.innerHTML =
                '<button class="map-toggle-btn active" data-view="patients">Patients</button>' +
                '<button class="map-toggle-btn"        data-view="both">Both</button>' +
                '<button class="map-toggle-btn"        data-view="hospitals">Hospitals</button>';
            header.appendChild(toggle);
        }
    }

    // ── Map init ─────────────────────────────────────────────────────────────

    const map = L.map('interactive-map', { zoomControl: true }).setView([20, 0], 2);

    // CARTO now requires an API key for their basemap tiles (even free tier);
    // without one they overlay an "API KEY REQUIRED" watermark. Switched to
    // OpenStreetMap tiles below to avoid needing an API key at all.
    // L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    //     maxZoom: 19,
    //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    // }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // ── Patient layer ─────────────────────────────────────────────────────────

    function bubbleSize(count) {
        return Math.max(28, Math.min(64, Math.log(count + 1) * 10));
    }

    const patientLayer = L.layerGroup();

    if (features.length > 0) {
        const geojson = {
            type: 'FeatureCollection',
            features: features.map(function (f) {
                return {
                    type: 'Feature',
                    properties: { name: f.name, count: f.count },
                    geometry: { type: 'Point', coordinates: [parseFloat(f.lng), parseFloat(f.lat)] }
                };
            })
        };

        L.geoJSON(geojson, {
            pointToLayer: function (feature, latlng) {
                const count    = feature.properties.count;
                const size     = bubbleSize(count);
                const fontSize = size < 36 ? 10 : size < 48 ? 12 : 14;
                return L.marker(latlng, {
                    zIndexOffset: -1000,
                    icon: L.divIcon({
                        className: '',
                        html: `<div class="map-bubble" style="width:${size}px;height:${size}px;font-size:${fontSize}px;">${count}</div>`,
                        iconSize: [size, size],
                        iconAnchor: [size / 2, size / 2]
                    })
                });
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(`
                    <div class="popup">
                        <strong>${feature.properties.name}</strong>
                        <span>Patients</span>
                        <div class="popup-count">${feature.properties.count}</div>
                    </div>
                `);
            }
        }).addTo(patientLayer);
    }

    patientLayer.addTo(map);

    // ── Hospital layer ──────────────────────────────────────────────────────

    const hospitalLayer = L.layerGroup();

    hospitals.forEach(function (s) {
        const lat = parseFloat(s.lat);
        const lng = parseFloat(s.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const cases = parseInt(s.omas_cases, 10) || 0;
        const sizeClass = cases > 100 ? 'map-hospital-marker--size-4'
            : cases >= 50 ? 'map-hospital-marker--size-3'
            : cases >= 20 ? 'map-hospital-marker--size-2'
            : 'map-hospital-marker--size-1';

        
        const iconSizes = { 'map-hospital-marker--size-1': 28, 'map-hospital-marker--size-2': 36, 'map-hospital-marker--size-3': 46, 'map-hospital-marker--size-4': 58 };
        const px = iconSizes[sizeClass];

        const marker = L.marker([lat, lng], {
            zIndexOffset: 1000,
            icon: L.divIcon({
                className: '',
                html: `<div class="map-hospital-marker ${sizeClass}">+</div>`,
                iconSize: [px, px],
                iconAnchor: [px / 2, px / 2]
            })
        });

        const institutionHtml = s.url
            ? `<a class="popup-institution-link" href="${s.url}" target="_blank" rel="noopener noreferrer">${s.institution}</a>`
            : `<strong>${s.institution}</strong>`;

        const tags = [
            s.type       ? `<span class="popup-tag popup-tag-type">${s.type}</span>` : '',
            s.omas_cases ? `<span class="popup-tag popup-tag-cases">${s.omas_cases} cases</span>` : '',
            s.registry === 'YES' ? `<span class="popup-tag popup-tag-registry">Registry &#10003;</span>` : ''
        ].filter(Boolean).join('');

        const pictureHtml = s.picture
            ? `<img class="popup-hospital-photo" src="${s.picture}" alt="${s.hospital}" />`
            : '';

        const videoHtml = s.video
            ? `<a class="popup-video-link" href="${s.video}" target="_blank" rel="noopener noreferrer">&#9654; Watch Video</a>`
            : '';

        marker.bindPopup(`
            <div class="popup popup-hospital">
                ${pictureHtml}
                ${institutionHtml}
                <span class="popup-hospital-name">${s.hospital}</span>
                ${tags ? `<div class="popup-tags">${tags}</div>` : ''}
                <div class="popup-address">${s.address}</div>
                <div class="popup-phone"><a href="tel:${s.phone}">${s.phone}</a></div>
                ${videoHtml}
            </div>
        `);

        marker.addTo(hospitalLayer);
    });

    // ── Toggle logic ──────────────────────────────────────────────────────────

    function setView(view) {
        document.querySelectorAll('.map-toggle-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        if (view === 'patients' || view === 'both') {
            map.addLayer(patientLayer);
        } else {
            map.removeLayer(patientLayer);
        }

        if (view === 'hospitals' || view === 'both') {
            map.addLayer(hospitalLayer);
        } else {
            map.removeLayer(hospitalLayer);
        }
    }

    document.querySelectorAll('.map-toggle-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            setView(btn.dataset.view);
        });
    });

});
