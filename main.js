// Constants
const AU_SCALE = 130; // Increased scaling factor for semi-major axis in pixels for a closer view
const TIME_SCALE = 0.002; // Increased speed multiplier for faster orbital motion
const PLANET_SCALE = 0.35; // Slightly larger planets for visibility

// Initialize canvas and context
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let systems = []; // Placeholder for star systems data
let lastTimestamp = 0; // Track time for smoother animation
let currentTime = 0; // Initialize currentTime for use in animation loop

// Resize canvas on window resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Load JSON data
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    systems = data;
    resizeCanvas();  // Initial setup
    requestAnimationFrame(animate); // Start animation loop
  })
  .catch(error => console.error("Error loading data:", error));

// Calculate orbital position with refined smooth angle calculation
function calculateOrbitPosition(semiMajorAxis, period, initialTime, currentTime) {
  const angle = 2 * Math.PI * ((currentTime - initialTime) / period) % (2 * Math.PI); // Wrap-around angle
  const x = semiMajorAxis * Math.cos(angle);
  const y = semiMajorAxis * Math.sin(angle);
  return { x, y };
}

// Render each planet in orbit
function renderPlanet(planet, centerX, centerY, currentTime) {
  const { x, y } = calculateOrbitPosition(planet.semiMajorAxis * AU_SCALE, planet.period, planet.initialTime, currentTime);
  
  // Draw orbit path with reduced alpha for stability
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, planet.semiMajorAxis * AU_SCALE, 0, 2 * Math.PI);
  ctx.stroke();

  // Determine color based on temperature
  const color = getColorFromTemperature(planet.temperature || 500); // Default if missing
  ctx.fillStyle = color;

  // Draw planet with adjusted size
  const planetSize = (planet.radius || 1) * PLANET_SCALE;
  ctx.beginPath();
  ctx.arc(centerX + x, centerY + y, planetSize, 0, 2 * Math.PI);
  ctx.fill();
}

// Temperature to color gradient with slight refinements for color balance
function getColorFromTemperature(temp) {
  const normalizedTemp = Math.min(1250, Math.max(250, temp)); // Clamp temperature within range
  const blue = Math.max(0, 255 - ((normalizedTemp - 250) / 4));
  const red = Math.max(0, (normalizedTemp - 250) / 4);
  return `rgb(${red}, ${Math.min(255, red / 1.5)}, ${blue})`;
}

// Organic layout positioning function
function getRandomPosition(index) {
  const radius = 300 + index * 20; // Increase radius per index for spreading out systems
  const angle = Math.random() * 2 * Math.PI;
  const x = canvas.width / 2 + radius * Math.cos(angle);
  const y = canvas.height / 2 + radius * Math.sin(angle);
  return { x, y };
}

// Render all systems and planets with organic layout
function renderSystems(currentTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  systems.forEach((system, index) => {
    const { x: centerX, y: centerY } = getRandomPosition(index);

    system.planets.forEach(planet => {
      renderPlanet(planet, centerX, centerY, currentTime);
    });
  });
}

// Main animation loop using timestamp for smoothness
function animate(timestamp) {
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  // Increment currentTime based on actual elapsed time for smooth animation
  currentTime += deltaTime * TIME_SCALE;
  renderSystems(currentTime);
  requestAnimationFrame(animate);
}

// Listen for window resize
window.addEventListener('resize', resizeCanvas);
