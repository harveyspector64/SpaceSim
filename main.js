// Constants
const AU_SCALE = 120; // Scaling factor for semi-major axis in pixels, increase for closer zoom
const TIME_SCALE = 0.001; // Further reduced speed multiplier for smoother orbital motion
const PLANET_SCALE = 0.3; // Scaling factor for planet size, slightly larger for better view

// Initialize canvas and context
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let systems = []; // Placeholder for star systems data
let lastTimestamp = 0; // Track time for smoother animation

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

// Calculate orbital position based on refined smooth angle calculation
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

// Render all systems and planets with improved layout and spacing
function renderSystems(currentTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  systems.forEach((system, index) => {
    const centerX = (canvas.width / 2) + (index % 10) * 150 - 700; // Adjust layout for closer view
    const centerY = (canvas.height / 2) + Math.floor(index / 10) * 150 - 300;

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
