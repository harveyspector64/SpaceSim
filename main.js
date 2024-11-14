// Constants
const AU_SCALE = 90; // Scaling factor for semi-major axis in pixels
const TIME_SCALE = 0.05; // Reduced speed multiplier for smoother orbital motion
const PLANET_SCALE = 0.25; // Scaling factor to adjust planet sizes

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

// Calculate orbital position with refined angle for smoothness
function calculateOrbitPosition(semiMajorAxis, period, initialTime, currentTime) {
  const angle = 2 * Math.PI * ((currentTime - initialTime) / period) % (2 * Math.PI); // Phase angle with wrap-around
  const x = semiMajorAxis * Math.cos(angle);
  const y = semiMajorAxis * Math.sin(angle);
  return { x, y };
}

// Render each planet in orbit
function renderPlanet(planet, centerX, centerY, currentTime) {
  const { x, y } = calculateOrbitPosition(planet.semiMajorAxis * AU_SCALE, planet.period, planet.initialTime, currentTime);
  
  // Draw orbit path with slight transparency for smoother visuals
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, planet.semiMajorAxis * AU_SCALE, 0, 2 * Math.PI);
  ctx.stroke();

  // Determine color based on temperature with refined gradient
  const color = getColorFromTemperature(planet.temperature || 500); // default temperature if missing
  ctx.fillStyle = color;

  // Draw planet with size based on radius
  const planetSize = (planet.radius || 1) * PLANET_SCALE; // default radius if missing
  ctx.beginPath();
  ctx.arc(centerX + x, centerY + y, planetSize, 0, 2 * Math.PI);
  ctx.fill();
}

// Temperature to color gradient with finer scaling
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
    // Tighter grid layout with randomized slight offset for natural distribution
    const centerX = (canvas.width / 2) + (index % 10) * 100 - 500 + (Math.random() * 15 - 7.5);
    const centerY = (canvas.height / 2) + Math.floor(index / 10) * 100 - 300 + (Math.random() * 15 - 7.5);

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
