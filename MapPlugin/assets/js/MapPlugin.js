document.addEventListener('DOMContentLoaded', function () {

    const mapElement = document.getElementById('interactive-map');
    if (!mapElement) return;

    const map = L.map('interactive-map', { zoomControl: true }).setView([20, 0], 2);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const features = (MapPluginData && MapPluginData.features) ? MapPluginData.features : [];
    if (features.length === 0) return;

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

    // Scale bubble size logarithmically so large values don't dwarf small ones
    function bubbleSize(count) {
        return Math.max(28, Math.min(64, Math.log(count + 1) * 10));
    }

    L.geoJSON(geojson, {
        pointToLayer: function (feature, latlng) {
            const count = feature.properties.count;
            const size  = bubbleSize(count);
            const fontSize = size < 36 ? 10 : size < 48 ? 12 : 14;

            return L.marker(latlng, {
                icon: L.divIcon({
                    className: '',
                    html: `<div class="map-bubble" style="width:${size}px;height:${size}px;font-size:${fontSize}px;">${count}</div>`,
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2]
                })
            });
        },
        onEachFeature: function (feature, layer) {
            const name  = feature.properties.name;
            const count = feature.properties.count;
            layer.bindPopup(`
                <div class="popup">
                    <strong>${name}</strong>
                    <span>Patients</span>
                    <div class="popup-count">${count}</div>
                </div>
            `);
        }
    }).addTo(map);

});
