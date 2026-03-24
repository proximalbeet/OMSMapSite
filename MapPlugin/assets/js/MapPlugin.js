document.addEventListener('DOMContentLoaded', function () {

    const mapElement = document.getElementById('interactive-map');
    if (!mapElement) return;

    const map = L.map('interactive-map').setView([20, 0], 2);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // MapPluginData is injected by PHP (wp_localize_script)
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

    L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
            const name  = feature.properties.name;
            const count = feature.properties.count;
            layer.bindPopup(`
                <div class="popup">
                    <strong>${name}</strong><br>
                    <span>Count: ${count}</span>
                </div>
            `);
        }
    }).addTo(map);

});
