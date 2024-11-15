// Select canvas and set up the context
const canvas = document.getElementById("simulationCanvas");
const context = canvas.getContext("2d");

// Store the center coordinates for easy reference
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;

// Variables for control of scale, clustering, and animation speed
let scaleFactor = 0.05; // Control how tightly objects cluster
let maxOrbitSpeed = 0.0005; // Adjust orbital speed for smoothness

// Fetch data from JSON and start simulation
fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
        console.log("Data loaded successfully:", data); // Debug: Check if data loads correctly
        if (data && data.planets) {
            startSimulation(data.planets);
        } else {
            console.error("Data format error: 'planets' not found in data.json");
        }
    })
    .catch((error) => {
        console.error("Error loading data:", error);
    });

// Function to start the simulation
function startSimulation(planets) {
    let startTime = Date.now();

    function animate() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate time for smooth orbital movement
        let currentTime = Date.now();
        let elapsedTime = (currentTime - startTime) * maxOrbitSpeed;

        renderPlanets(planets, elapsedTime);
        requestAnimationFrame(animate);
    }

    animate();
}

// Function to draw each planet/star
function drawPlanet(x, y, size, color) {
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
}

// Render planets, including orbital calculations
function renderPlanets(planets, elapsedTime) {
    planets.forEach((planet) => {
        if (!planet || !planet.distance || !planet.orbitSpeed || !planet.size || !planet.color) {
            console.error("Planet data missing properties:", planet);
            return;
        }
        // Calculate orbital movement
        let orbitRadius = planet.distance * scaleFactor;
        let x = centerX + orbitRadius * Math.cos(elapsedTime * planet.orbitSpeed);
        let y = centerY + orbitRadius * Math.sin(elapsedTime * planet.orbitSpeed);

        // Draw each planet with specified size and color
        drawPlanet(x, y, planet.size, planet.color);
    });
}

// Event listener for resizing the canvas responsively
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Function to resize the canvas and adjust center coordinates
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
}
