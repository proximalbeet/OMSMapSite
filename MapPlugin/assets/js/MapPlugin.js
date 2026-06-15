document.addEventListener('DOMContentLoaded', function () {

    const mapElement = document.getElementById('interactive-map');
    if (!mapElement) return;

    const features    = (MapPluginData && MapPluginData.features)    ? MapPluginData.features    : [];
    const specialists = (MapPluginData && MapPluginData.specialists)  ? MapPluginData.specialists  : [];
    const hasSpecialists = specialists.length > 0;

    // ── Inject stats + toggle into header ────────────────────────────────────

    const header = document.querySelector('.map-plugin-header');
    if (header) {
        const totalPatients = features.reduce(function (sum, f) { return sum + parseInt(f.count, 10); }, 0);

        const stats = document.createElement('div');
        stats.className = 'map-header-stats';
        stats.innerHTML =
            '<div class="map-stat"><span class="map-stat-number">' + totalPatients.toLocaleString() + '</span><span class="map-stat-label">Total Patients</span></div>' +
            (hasSpecialists ? '<div class="map-stat"><span class="map-stat-number">' + specialists.length + '</span><span class="map-stat-label">Specialists</span></div>' : '');
        header.appendChild(stats);

        if (hasSpecialists) {
            const toggle = document.createElement('div');
            toggle.className = 'map-toggle';
            toggle.innerHTML =
                '<button class="map-toggle-btn active" data-view="patients">Patients</button>' +
                '<button class="map-toggle-btn"        data-view="both">Both</button>' +
                '<button class="map-toggle-btn"        data-view="specialists">Specialists</button>';
            header.appendChild(toggle);
        }
    }

    // ── Map init ─────────────────────────────────────────────────────────────

    const map = L.map('interactive-map', { zoomControl: true }).setView([20, 0], 2);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
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

    // ── Specialist layer ──────────────────────────────────────────────────────

    const specialistLayer = L.layerGroup();

    specialists.forEach(function (s) {
        const lat = parseFloat(s.lat);
        const lng = parseFloat(s.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const marker = L.marker([lat, lng], {
            zIndexOffset: 1000,
            icon: L.divIcon({
                className: '',
                html: '<div class="map-specialist-marker">+</div>',
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            })
        });

        marker.bindPopup(`
            <div class="popup popup-specialist">
                <strong>${s.institution}</strong>
                <span class="popup-specialist-name">${s.specialist}</span>
                <div class="popup-address">${s.address}</div>
                <div class="popup-phone">${s.phone}</div>
            </div>
        `);

        marker.addTo(specialistLayer);
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

        if (view === 'specialists' || view === 'both') {
            map.addLayer(specialistLayer);
        } else {
            map.removeLayer(specialistLayer);
        }
    }

    document.querySelectorAll('.map-toggle-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            setView(btn.dataset.view);
        });
    });

});
