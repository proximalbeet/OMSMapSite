document.addEventListener('DOMContentLoaded', function () {

    const mapElement = document.getElementById('interactive-map');
    if (!mapElement) return;

    const map = L.map('interactive-map').setView([20, 0], 2);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var geojson = {
        "type": "FeatureCollection",
        "features": [
            {"type":"Feature","properties":{"name":"Australia","count":46},"geometry":{"type":"Point","coordinates":[133.7751,-25.2744]}},
            {"type":"Feature","properties":{"name":"UK","count":118},"geometry":{"type":"Point","coordinates":[-3.435973,55.378051]}},
            {"type":"Feature","properties":{"name":"El Salvador","count":9},"geometry":{"type":"Point","coordinates":[-88.89653,13.794185]}},
            {"type":"Feature","properties":{"name":"Canada","count":54},"geometry":{"type":"Point","coordinates":[-106.3468,56.1304]}},
            {"type":"Feature","properties":{"name":"New Zealand","count":11},"geometry":{"type":"Point","coordinates":[174.88597,-40.9006]}},
            {"type":"Feature","properties":{"name":"England","count":39},"geometry":{"type":"Point","coordinates":[-1.1743,52.3555]}},
            {"type":"Feature","properties":{"name":"Chile","count":12},"geometry":{"type":"Point","coordinates":[-71.542969,-35.675147]}},
            {"type":"Feature","properties":{"name":"USA","count":807},"geometry":{"type":"Point","coordinates":[-98.5795,39.8283]}},
            {"type":"Feature","properties":{"name":"Phillipines","count":7},"geometry":{"type":"Point","coordinates":[121.774,12.8797]}},
            {"type":"Feature","properties":{"name":"Scotland","count":3},"geometry":{"type":"Point","coordinates":[-4.2026,56.4907]}},
            {"type":"Feature","properties":{"name":"Peru","count":15},"geometry":{"type":"Point","coordinates":[-75.0152,-9.19]}},
            {"type":"Feature","properties":{"name":"Mexico","count":75},"geometry":{"type":"Point","coordinates":[-102.5528,23.6345]}},
            {"type":"Feature","properties":{"name":"Saudi Arabia","count":3},"geometry":{"type":"Point","coordinates":[45.0792,23.8859]}},
            {"type":"Feature","properties":{"name":"Northern Ireland","count":5},"geometry":{"type":"Point","coordinates":[-6.4923,54.7877]}},
            {"type":"Feature","properties":{"name":"Costa Rica","count":4},"geometry":{"type":"Point","coordinates":[-83.7534,9.7489]}},
            {"type":"Feature","properties":{"name":"Sudan","count":1},"geometry":{"type":"Point","coordinates":[30.2176,12.8628]}},
            {"type":"Feature","properties":{"name":"Romania","count":21},"geometry":{"type":"Point","coordinates":[24.9668,45.9432]}},
            {"type":"Feature","properties":{"name":"Uraguay","count":5},"geometry":{"type":"Point","coordinates":[-55.7658,-32.5228]}},
            {"type":"Feature","properties":{"name":"Puerto Rico","count":2},"geometry":{"type":"Point","coordinates":[-66.5901,18.2208]}},
            {"type":"Feature","properties":{"name":"Russia","count":4},"geometry":{"type":"Point","coordinates":[105.3188,61.524]}},
            {"type":"Feature","properties":{"name":"Poland","count":14},"geometry":{"type":"Point","coordinates":[19.1451,51.9194]}},
            {"type":"Feature","properties":{"name":"Paraguay","count":5},"geometry":{"type":"Point","coordinates":[-58.4438,-23.4425]}},
            {"type":"Feature","properties":{"name":"Trinidad and Tobago","count":2},"geometry":{"type":"Point","coordinates":[-61.2225,10.6918]}},
            {"type":"Feature","properties":{"name":"South Africa","count":4},"geometry":{"type":"Point","coordinates":[22.9375,-30.5595]}},
            {"type":"Feature","properties":{"name":"Germany","count":20},"geometry":{"type":"Point","coordinates":[10.4515,51.1657]}},
            {"type":"Feature","properties":{"name":"Columbia","count":7},"geometry":{"type":"Point","coordinates":[-74.2973,4.5709]}},
            {"type":"Feature","properties":{"name":"zzz","count":566},"geometry":{"type":"Point","coordinates":[0,0]}},
            {"type":"Feature","properties":{"name":"Hong Kong","count":1},"geometry":{"type":"Point","coordinates":[114.1095,22.3964]}},
            {"type":"Feature","properties":{"name":"France","count":18},"geometry":{"type":"Point","coordinates":[2.2137,46.2276]}},
            {"type":"Feature","properties":{"name":"Brazil","count":59},"geometry":{"type":"Point","coordinates":[-51.9253,-14.235]}},
            {"type":"Feature","properties":{"name":"Cuba","count":1},"geometry":{"type":"Point","coordinates":[-77.7812,21.5218]}},
            {"type":"Feature","properties":{"name":"India","count":15},"geometry":{"type":"Point","coordinates":[78.9629,20.5937]}},
            {"type":"Feature","properties":{"name":"Estonia","count":2},"geometry":{"type":"Point","coordinates":[25.0136,58.5953]}},
            {"type":"Feature","properties":{"name":"Argentina","count":28},"geometry":{"type":"Point","coordinates":[-63.6167,-38.4161]}},
            {"type":"Feature","properties":{"name":"Israel","count":10},"geometry":{"type":"Point","coordinates":[34.8516,31.0461]}},
            {"type":"Feature","properties":{"name":"Sweden","count":15},"geometry":{"type":"Point","coordinates":[18.6435,60.1282]}},
            {"type":"Feature","properties":{"name":"Bolivia","count":4},"geometry":{"type":"Point","coordinates":[-63.5887,-16.2902]}},
            {"type":"Feature","properties":{"name":"Singapore","count":1},"geometry":{"type":"Point","coordinates":[103.8198,1.3521]}},
            {"type":"Feature","properties":{"name":"Norway","count":10},"geometry":{"type":"Point","coordinates":[8.4689,60.472]}},
            {"type":"Feature","properties":{"name":"Venezuala","count":7},"geometry":{"type":"Point","coordinates":[-66.5897,6.4238]}},
            {"type":"Feature","properties":{"name":"South Korea","count":2},"geometry":{"type":"Point","coordinates":[127.7669,35.9078]}},
            {"type":"Feature","properties":{"name":"Finland","count":2},"geometry":{"type":"Point","coordinates":[25.7482,61.9241]}},
            {"type":"Feature","properties":{"name":"Guatemala","count":2},"geometry":{"type":"Point","coordinates":[-90.2308,15.7835]}},
            {"type":"Feature","properties":{"name":"Egypt","count":1},"geometry":{"type":"Point","coordinates":[30.8025,26.8206]}},
            {"type":"Feature","properties":{"name":"Switzerland","count":5},"geometry":{"type":"Point","coordinates":[8.2275,46.8182]}},
            {"type":"Feature","properties":{"name":"Nicaragua","count":1},"geometry":{"type":"Point","coordinates":[-85.2072,12.8654]}},
            {"type":"Feature","properties":{"name":"Montenegro","count":1},"geometry":{"type":"Point","coordinates":[19.3744,42.7087]}},
            {"type":"Feature","properties":{"name":"Italy","count":21},"geometry":{"type":"Point","coordinates":[12.5674,41.8719]}},
            {"type":"Feature","properties":{"name":"Turkey","count":4},"geometry":{"type":"Point","coordinates":[35.2433,38.9637]}},
            {"type":"Feature","properties":{"name":"Morocco","count":2},"geometry":{"type":"Point","coordinates":[-7.0926,31.7917]}},
            {"type":"Feature","properties":{"name":"Algeria","count":2},"geometry":{"type":"Point","coordinates":[1.6596,28.0339]}},
            {"type":"Feature","properties":{"name":"Hungary","count":7},"geometry":{"type":"Point","coordinates":[19.5033,47.1625]}},
            {"type":"Feature","properties":{"name":"Malasia","count":1},"geometry":{"type":"Point","coordinates":[101.9758,4.2105]}},
            {"type":"Feature","properties":{"name":"Malta","count":2},"geometry":{"type":"Point","coordinates":[14.3754,35.9375]}},
            {"type":"Feature","properties":{"name":"United Arab Emiretes","count":4},"geometry":{"type":"Point","coordinates":[54.3773,23.4241]}},
            {"type":"Feature","properties":{"name":"Spain","count":31},"geometry":{"type":"Point","coordinates":[-3.7492,40.4637]}},
            {"type":"Feature","properties":{"name":"Tunisia","count":1},"geometry":{"type":"Point","coordinates":[9.5375,33.8869]}},
            {"type":"Feature","properties":{"name":"The Netherlands","count":14},"geometry":{"type":"Point","coordinates":[5.2913,52.1326]}},
            {"type":"Feature","properties":{"name":"China","count":1},"geometry":{"type":"Point","coordinates":[104.1954,35.8617]}},
            {"type":"Feature","properties":{"name":"Greece","count":3},"geometry":{"type":"Point","coordinates":[21.8243,39.0742]}},
            {"type":"Feature","properties":{"name":"Portugal","count":8},"geometry":{"type":"Point","coordinates":[-8.2245,39.3999]}},
            {"type":"Feature","properties":{"name":"Cyprus","count":2},"geometry":{"type":"Point","coordinates":[33.4299,35.1264]}},
            {"type":"Feature","properties":{"name":"Tasmania","count":1},"geometry":{"type":"Point","coordinates":[146.3159,-42.0409]}},
            {"type":"Feature","properties":{"name":"Ireland","count":8},"geometry":{"type":"Point","coordinates":[-8.2439,53.4129]}},
            {"type":"Feature","properties":{"name":"Congo","count":1},"geometry":{"type":"Point","coordinates":[15.8277,-0.228]}},
            {"type":"Feature","properties":{"name":"Denmark","count":9},"geometry":{"type":"Point","coordinates":[9.5018,56.2639]}},
            {"type":"Feature","properties":{"name":"Guyana","count":1},"geometry":{"type":"Point","coordinates":[-58.9302,4.8604]}},
            {"type":"Feature","properties":{"name":"Austria","count":4},"geometry":{"type":"Point","coordinates":[14.5501,47.5162]}},
            {"type":"Feature","properties":{"name":"Islamabad","count":1},"geometry":{"type":"Point","coordinates":[73.0479,33.6844]}},
            {"type":"Feature","properties":{"name":"Belguim","count":4},"geometry":{"type":"Point","coordinates":[4.4699,50.5039]}},
            {"type":"Feature","properties":{"name":"Georgia","count":1},"geometry":{"type":"Point","coordinates":[43.3569,42.3154]}},
            {"type":"Feature","properties":{"name":"Slovenia","count":2},"geometry":{"type":"Point","coordinates":[14.9955,46.1512]}},
            {"type":"Feature","properties":{"name":"Czech Republic","count":2},"geometry":{"type":"Point","coordinates":[15.4729,49.8175]}},
            {"type":"Feature","properties":{"name":"Bosnia and Herzagovenia","count":1},"geometry":{"type":"Point","coordinates":[17.6791,43.9159]}},
            {"type":"Feature","properties":{"name":"Latvia","count":1},"geometry":{"type":"Point","coordinates":[24.6032,56.8796]}},
            {"type":"Feature","properties":{"name":"Croatia","count":1},"geometry":{"type":"Point","coordinates":[15.2,45.1]}}
        ]
    }

    L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
            const name = feature.properties.name;
            const count = feature.properties.count;

            const html = `
            <div class="popup">
                <strong>${name}</strong><br>
                <span>Population: ${count}</span>
            </div>
        `;
            layer.bindPopup(html);
        }
    }).addTo(map);

});
