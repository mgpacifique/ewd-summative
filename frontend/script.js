
const API_BASE_URL = 'http://127.0.0.1:5000/api'; 

const boroughFilter = document.getElementById('boroughFilter');
const metricFilter = document.getElementById('metricFilter');
const tableBody = document.getElementById('tableBody');
const statusMessage = document.getElementById('status');

let map; 
let geoJsonLayer; 

let activeTripRequest = null;

document.addEventListener('DOMContentLoaded', () => {
    initMap();         
    fetchTripData();   
    fetchChartData();  // Load charts on startup
    
    boroughFilter.addEventListener('change', fetchTripData);
    metricFilter.addEventListener('change', fetchTripData);
});

function initMap() {
    
    map = L.map('map').setView([40.7128, -74.0060], 10); 
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    fetchSpatialBoundaries();
}

async function fetchSpatialBoundaries() {
    try {
        const response = await fetch(`${API_BASE_URL}/zones`);
        if (!response.ok) return;
        
        const geoData = await response.json();
        
        geoJsonLayer = L.geoJSON(geoData, {
            style: {
                color: "#fbbf24",
                weight: 1,
                opacity: 0.6,
                fillOpacity: 0.1
            }
        }).addTo(map);

    } catch (error) {
        console.warn("Spatial data endpoint not ready yet.");
    }
}

async function fetchTripData() {
    const selectedBorough = boroughFilter.value;
    const uiSortValue = metricFilter.value;
    
    const sqlSortMap = {
        'trip_distance': 'trip_miles',
        'trip_duration_mins': 'duration_in_seconds',
        'average_speed_mph': 'calculated_speed_mph',
        'tip_percentage': 'tip_to_fare_ratio'
    };
    const dbSortColumn = sqlSortMap[uiSortValue] || 'trip_miles';
    
    if (activeTripRequest) {
        activeTripRequest.abort();
    }
    const requestController = new AbortController();
    activeTripRequest = requestController;
    
    statusMessage.innerText = "Fetching real-time NYC trip data...";
    statusMessage.style.color = "#fbbf24"; 
    tableBody.innerHTML = ""; 
    
    try {
        let fetchUrl = `${API_BASE_URL}/trips?limit=15&sort=${encodeURIComponent(dbSortColumn)}`;
        if (selectedBorough !== "") {
            fetchUrl += `&borough=${encodeURIComponent(selectedBorough)}`;
        }

        const response = await fetch(fetchUrl, { signal: requestController.signal });
        
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        renderTableRows(data);
        statusMessage.innerText = `W, ${data.length} records loaded.`;
        statusMessage.style.color = "#4ade80"; 
        
    } catch (error) {
        if (error.name === 'AbortError') {
            return;
        }
        console.error("Data Pipeline Error:", error);
        statusMessage.innerText = "Error: Ensure the Flask backend is running on port 5000.";
        statusMessage.style.color = "#ef4444"; 
    } finally {
        if (activeTripRequest === requestController) {
            activeTripRequest = null;
        }
    }
}

function renderTableRows(dataArray) {
    if (dataArray.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Borough of no motion.</td></tr>`;
        return;
    }

    dataArray.forEach(trip => {
        const pu = trip.pickup_zone_id || 'Unknown';
        const doLoc = trip.dropoff_zone_id || 'Unknown';
        
        const dist = trip.trip_miles ? parseFloat(trip.trip_miles).toFixed(2) : '0.00';
        
        const durSeconds = trip.duration_in_seconds || 0;
        const durMins = (durSeconds / 60).toFixed(1);
        
        const speed = trip.calculated_speed_mph ? parseFloat(trip.calculated_speed_mph).toFixed(1) : '0.0';
        const tip = trip.tip_to_fare_ratio ? parseFloat(trip.tip_to_fare_ratio).toFixed(1) : '0.0';

        const rowHTML = `
            <tr>
                <td>Zone ${pu}</td>
                <td>Zone ${doLoc}</td>
                <td>${dist} mi</td>
                <td>${durMins} m</td>
                <td>${speed} mph</td>
                <td style="font-weight: bold; color: #fbbf24;">${tip}%</td>
            </tr>
        `;
        
        tableBody.insertAdjacentHTML('beforeend', rowHTML);
    });
}

// -------------------------------------------------------------
// Chart.js Implementations for EDA Findings
// -------------------------------------------------------------

let speedTipChartInstance = null;
let boroughSpeedChartInstance = null;

async function fetchChartData() {
    try {
        // Fetch Hypothesis A Data (Scatter Plot)
        const resA = await fetch(`${API_BASE_URL}/stats/speed-vs-tip`);
        if (resA.ok) {
            const dataA = await resA.json();
            renderSpeedTipChart(dataA);
        }

        // Fetch Hypothesis B Data (Bar Chart)
        const resB = await fetch(`${API_BASE_URL}/stats/speed-by-borough`);
        if (resB.ok) {
            const dataB = await resB.json();
            renderBoroughSpeedChart(dataB);
        }
    } catch (err) {
        console.warn("Failed to load chart data:", err);
    }
}

function renderSpeedTipChart(data) {
    const ctx = document.getElementById('speedTipChart').getContext('2d');
    
    // Map backend data to Chart.js scatter format {x, y}
    const scatterData = data.map(d => ({
        x: parseFloat(d.speed),
        y: parseFloat(d.tip)
    }));

    if (speedTipChartInstance) speedTipChartInstance.destroy();

    speedTipChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Trips (Speed vs Tip %)',
                data: scatterData,
                backgroundColor: 'rgba(251, 191, 36, 0.6)', // Yellow
                borderColor: '#fbbf24',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: 'Speed (MPH)' },
                    min: 0,
                    max: 60
                },
                y: {
                    title: { display: true, text: 'Tip / Fare Ratio' },
                    min: 0,
                    max: 0.5
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderBoroughSpeedChart(data) {
    const ctx = document.getElementById('boroughSpeedChart').getContext('2d');
    
    const labels = data.map(d => d.borough);
    const speeds = data.map(d => d.avg_speed);

    if (boroughSpeedChartInstance) boroughSpeedChartInstance.destroy();

    boroughSpeedChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Avg Speed (MPH)',
                data: speeds,
                backgroundColor: 'rgba(74, 222, 128, 0.6)', // Green
                borderColor: '#4ade80',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Avg Speed (MPH)' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}
