// Constants for scaling
const AU_SCALE = 160;  // Increased to bring objects closer and make the view denser
const TIME_SCALE = 0.003; // Slightly faster orbiting speed
const PLANET_SCALE = 0.45; // Larger planets for a more visible display

// Canvas setup
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let systems = []; // Array for storing star systems data
let lastTimestamp = 0;
let currentTime = 0;

// Resize canvas function
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Load data.json
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    systems = data;
    resizeCanvas();
    requestAnimationFrame(animate); // Start animation
  })
  .catch(error => console.error("Error loading data:", error));

// Calculate orbital position based on semi-major axis, period, and current time
function calculateOrbitPosition(semiMajorAxis, period, initialTime, currentTime) {
  const angle = 2 * Math.PI * ((currentTime - initialTime) / period) % (2 * Math.PI); // Restrict to [0, 2π] for each orbit
  const x = semiMajorAxis * Math.cos(angle);
  const y = semiMajorAxis * Math.sin(angle);
  return { x, y };
}

// Render a planet in its orbit with its specific color and fixed position
function renderPlanet(planet, centerX, centerY, currentTime) {
  const { x, y } = calculateOrbitPosition(planet.semiMajorAxis * AU_SCALE, planet.period, planet.initialTime, currentTime);

  // Draw the orbit path
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, planet.semiMajorAxis * AU_SCALE, 0, 2 * Math.PI);
  ctx.stroke();

  // Set the color based on temperature
  const color = getColorFromTemperature(planet.temperature || 500);
  ctx.fillStyle = color;

  // Draw the planet
  const planetSize = (planet.radius || 1) * PLANET_SCALE;
  ctx.beginPath();
  ctx.arc(centerX + x, centerY + y, planetSize, 0, 2 * Math.PI);
  ctx.fill();
}

// Convert temperature to color
function getColorFromTemperature(temp) {
  const normalizedTemp = Math.min(1250, Math.max(250, temp)); // Clamp temperature for color range
  const blue = Math.max(0, 255 - ((normalizedTemp - 250) / 4));
  const red = Math.max(0, (normalizedTemp - 250) / 4);
  return `rgb(${red}, ${Math.min(255, red / 1.5)}, ${blue})`;
}

// Define closer positions for each system to achieve density
function getStaticPosition(index) {
  const radius = 100 + index * 15; // Tighter distance for higher density
  const angle = (index * 137.5) * (Math.PI / 180); // Use golden angle for a non-uniform spread
  const x = canvas.width / 2 + radius * Math.cos(angle);
  const y = canvas.height / 2 + radius * Math.sin(angle);
  return { x, y };
}

// Render all systems based on fixed center for each system
function renderSystems(currentTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  systems.forEach((system, index) => {
    const { x: centerX, y: centerY } = getStaticPosition(index); // Fixed center per system

    system.planets.forEach(planet => {
      renderPlanet(planet, centerX, centerY, currentTime);
    });
  });
}

// Animation loop for smooth orbiting
function animate(timestamp) {
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  currentTime += deltaTime * TIME_SCALE; // Update current time
  renderSystems(currentTime); // Render with updated time
  requestAnimationFrame(animate);
}

// Resize listener
window.addEventListener('resize', resizeCanvas);
