// Constants
const AU_SCALE = 100; // Scaling factor for semi-major axis in pixels
const TIME_SCALE = 0.2; // Speed multiplier for the orbital animation
const PLANET_SCALE = 0.3; // Scaling factor to reduce planet sizes, adjust as necessary

// Initialize canvas and context
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let systems = []; // Placeholder for star systems data

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
    animate();       // Start animation loop
  })
  .catch(error => console.error("Error loading data:", error));

// Calculate orbital position based on period and time
function calculateOrbitPosition(semiMajorAxis, period, initialTime, currentTime) {
  const angle = 2 * Math.PI * ((currentTime - initialTime) / period); // Phase angle
  const x = semiMajorAxis * Math.cos(angle);
  const y = semiMajorAxis * Math.sin(angle);
  return { x, y };
}

// Render each planet in orbit
function renderPlanet(planet, centerX, centerY, currentTime) {
  const { x, y } = calculateOrbitPosition(planet.semiMajorAxis * AU_SCALE, planet.period, planet.initialTime, currentTime);
  
  // Draw orbit path
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, planet.semiMajorAxis * AU_SCALE, 0, 2 * Math.PI);
  ctx.stroke();

  // Determine color based on temperature and add variation
  const color = getColorFromTemperature(planet.temperature || 500); // default temperature if missing
  ctx.fillStyle = color;

  // Draw planet with size based on radius
  const planetSize = (planet.radius || 1) * PLANET_SCALE; // default radius if missing
  ctx.beginPath();
  ctx.arc(centerX + x, centerY + y, planetSize, 0, 2 * Math.PI);
  ctx.fill();
}

// Temperature to color gradient with more varied color mapping
function getColorFromTemperature(temp) {
  const blue = Math.min(255, Math.max(0, 255 - temp / 5));  // Varying blue based on temp
  const red = Math.min(255, Math.max(0, temp / 3));
  return `rgb(${red}, ${Math.min(255, red / 2)}, ${blue})`;
}

// Render all systems and planets
function renderSystems(currentTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  systems.forEach((system, index) => {
    const centerX = (canvas.width / 2) + (index % 6) * 150 - 400; // Distribute systems across rows
    const centerY = (canvas.height / 2) + Math.floor(index / 6) * 150 - 200;

    system.planets.forEach(planet => {
      renderPlanet(planet, centerX, centerY, currentTime);
    });
  });
}

// Main animation loop
let currentTime = 0;
function animate() {
  currentTime += TIME_SCALE;
  renderSystems(currentTime);
  requestAnimationFrame(animate);
}

// Listen for window resize
window.addEventListener('resize', resizeCanvas);
