// Load data from JSON
async function fetchData(url) {
    const response = await fetch(url);
    return await response.json();
}

// Initialize and start simulation
async function init() {
    const koiData = await fetchData('KOI_List.json');
    const canvas = document.getElementById('orreryCanvas');
    const context = canvas.getContext('2d');
    
    // Set up initial conditions and zoom factors
    const orbits = calculateOrbits(koiData);
    let zoomFactor = 1;
    
    // Start animation loop
    animate(context, orbits, zoomFactor);
}

// Calculate orbits based on semi-major axis, period, and other parameters
function calculateOrbits(data) {
    return data.map(d => ({
        x: d.semi * Math.cos(d.period), // Sample calculation, adjusted for your data
        y: d.semi * Math.sin(d.period),
        radius: Math.max(d.radius, 2), // Minimum size for visibility
        period: d.period
    }));
}

// Interpolate zoom levels
function interpolateZoom(times, zooms, nmax, startZoom, endZoom) {
    const zoomValues = new Array(times.length).fill(-1);
    times.forEach((time, i) => {
        if (time < 0.25 * nmax) zoomValues[i] = startZoom;
        else if (time > 0.85 * nmax) zoomValues[i] = endZoom;
        zoomValues[i] = zoomValues[i] === -1 ? linearInterpolate(time, zooms) : zoomValues[i];
    });
    return zoomValues;
}

function linearInterpolate(x, array) {
    const i = Math.floor(x);
    const frac = x - i;
    return array[i] * (1 - frac) + array[i + 1] * frac;
}

// Draw orbit
function drawOrbit(context, x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.strokeStyle = "#424242";
    context.stroke();
}

// Main animation loop
function animate(context, orbits, zoomFactor) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    
    orbits.forEach(orbit => {
        // Update positions based on orbit period
        orbit.x += 0.01 * Math.cos(orbit.period); // Sample orbital motion
        orbit.y += 0.01 * Math.sin(orbit.period);
        drawOrbit(context, orbit.x * zoomFactor + 400, orbit.y * zoomFactor + 400, orbit.radius * zoomFactor);
    });
    
    requestAnimationFrame(() => animate(context, orbits, zoomFactor));
}

// Start the simulation
init();
