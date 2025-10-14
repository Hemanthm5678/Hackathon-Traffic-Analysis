document.addEventListener('DOMContentLoaded', () => {
    // --- MAP AND UI INITIALIZATION ---
    const map = L.map('map').setView([28.6139, 77.2090], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    const findRouteBtn = document.getElementById('find-route-btn');
    const startInput = document.getElementById('start');
    const endInput = document.getElementById('end');
    const statusMessage = document.getElementById('status-message');
    const loadingSpinner = document.getElementById('loading-spinner');
    const buttonText = document.getElementById('button-text');
    const toggleHeatmapBtn = document.getElementById('toggle-heatmap-btn');

    let routingControl = null;
    let safetyPolylineLayer = null;
    let heatLayer = null;
    let isHeatmapVisible = true;

    // --- LEGEND CONTROL ---
    function createLegend() {
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML += '<h4>Route Safety</h4>';
            div.innerHTML += '<div><span style="background:#22c55e;"></span>Safer</div>';
            div.innerHTML += '<div><span style="background:#facc15;"></span>Moderate Risk</div>';
            div.innerHTML += '<div><span style="background:#ef4444;"></span>Higher Risk</div>';
            return div;
        };
        legend.addTo(map);
    }
    createLegend();

    // --- HEATMAP (ACCIDENT ZONES) LOGIC ---
    async function fetchAndDisplayHeatmap() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/accidents');
            if (!response.ok) throw new Error('Could not fetch accident data for heatmap.');
            const data = await response.json();
            
            heatLayer = L.heatLayer(data, {
                radius: 20,
                blur: 15,
                maxZoom: 12,
                gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
            }).addTo(map);
        } catch (error) {
            console.error('Heatmap Error:', error);
            statusMessage.textContent = 'Could not load accident zones.';
        }
    }
    fetchAndDisplayHeatmap();

    // --- CORE ROUTE FINDING AND ANALYSIS ---
    const findAndAnalyzeRoute = async () => {
        const startQuery = startInput.value;
        const endQuery = endInput.value;
        if (!startQuery || !endQuery) {
            statusMessage.textContent = "Please enter both a 'From' and 'To' location.";
            return;
        }
        findRouteBtn.disabled = true;
        statusMessage.textContent = "Finding initial route...";
        loadingSpinner.classList.remove('hidden');
        buttonText.textContent = "Analyzing...";
        if (routingControl) map.removeControl(routingControl);
        if (safetyPolylineLayer) map.removeLayer(safetyPolylineLayer);

        // --- CHANGE HERE: Hide the default route line ---
        routingControl = L.Routing.control({
            waypoints: [L.latLng(0, 0), L.latLng(0, 0)],
            createMarker: () => null,
            routeWhileDragging: false,
            lineOptions: {
                // Set styles to be invisible
                styles: [{ color: 'transparent', opacity: 0, weight: 0 }]
            }
        }).addTo(map);

        const geocodeUrl = (query) => `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

        try {
            const [startResp, endResp] = await Promise.all([fetch(geocodeUrl(startQuery)), fetch(geocodeUrl(endQuery))]);
            const [startData, endData] = await Promise.all([startResp.json(), endResp.json()]);
            if (startData.length === 0 || endData.length === 0) throw new Error("Could not find one or both locations.");
            const startLatLng = L.latLng(startData[0].lat, startData[0].lon);
            const endLatLng = L.latLng(endData[0].lat, endData[0].lon);
            L.marker(startLatLng).addTo(map).bindPopup('<b>Start</b>').openPopup();
            L.marker(endLatLng).addTo(map).bindPopup('<b>End</b>');
            routingControl.setWaypoints([startLatLng, endLatLng]);

            routingControl.on('routesfound', async (e) => {
                const route = e.routes[0];
                const waypointsForBackend = route.coordinates.map(coord => [coord.lat, coord.lng]);
                statusMessage.textContent = "Analyzing route safety with the ML model...";
                const response = await fetch('http://127.0.0.1:5000/api/find_safe_route', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ waypoints: waypointsForBackend })
                });
                if (!response.ok) throw new Error('Backend analysis failed.');
                const result = await response.json();
                drawSafetyPolyline(result.waypoints, result.safety_scores);
                map.fitBounds(L.latLngBounds(route.coordinates));
                statusMessage.textContent = "Analysis complete. Green indicates safer segments.";
            });

        } catch (error) {
            console.error('Error:', error);
            statusMessage.textContent = `Error: ${error.message}`;
        } finally {
            findRouteBtn.disabled = false;
            loadingSpinner.classList.add('hidden');
            buttonText.textContent = "Find Safest Route";
        }
    };

    // --- HELPER FUNCTION TO DRAW THE COLORED SAFETY LINE ---
    function drawSafetyPolyline(waypoints, scores) {
        const polylines = [];
        for (let i = 0; i < waypoints.length - 1; i++) {
            const color = scores[i] < 0.3 ? '#22c55e' : (scores[i] < 0.6 ? '#facc15' : '#ef4444');
            polylines.push(L.polyline([waypoints[i], waypoints[i + 1]], { color, weight: 8, opacity: 0.8 }));
        }
        safetyPolylineLayer = L.layerGroup(polylines).addTo(map);
    }

    // --- EVENT LISTENERS ---
    findRouteBtn.addEventListener('click', findAndAnalyzeRoute);

    toggleHeatmapBtn.addEventListener('click', () => {
        if (!heatLayer) return;
        if (isHeatmapVisible) {
            map.removeLayer(heatLayer);
            toggleHeatmapBtn.style.backgroundColor = "#4b5563";
        } else {
            map.addLayer(heatLayer);
            toggleHeatmapBtn.style.backgroundColor = "rgba(31, 41, 55, 0.8)";
        }
        isHeatmapVisible = !isHeatmapVisible;
    });
});