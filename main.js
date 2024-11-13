// main.js

// Initialize canvas and context
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const AU_SCALE = 2; // Scale factor for astronomical units to pixels
const TIME_SCALE = 0.1; // Speed multiplier for the simulation (e.g., days per frame)

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Utility function to calculate planet position in orbit
function calculateOrbitPosition(semiMajorAxis, period, currentTime) {
  const angle = (2 * Math.PI * currentTime) / period; // Orbital phase angle
  const x = semiMajorAxis * Math.cos(angle);
  const y = semiMajorAxis * Math.sin(angle);
  return { x, y };
}

// Render each planet in the system
function renderPlanet(planet, systemCenterX, systemCenterY, currentTime) {
  const { x, y } = calculateOrbitPosition(planet.semiMajorAxis * AU_SCALE, planet.period, currentTime);
  
  // Draw orbit path (circle)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(systemCenterX, systemCenterY, planet.semiMajorAxis * AU_SCALE, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Draw planet
  ctx.fillStyle = planet.color;
  ctx.beginPath();
  ctx.arc(systemCenterX + x, systemCenterY + y, planet.radius, 0, 2 * Math.PI);
  ctx.fill();
}

// Render all systems and planets
function renderSystems(currentTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  systems.forEach(system => {
    system.planets.forEach(planet => {
      renderPlanet(planet, system.centerX, system.centerY, currentTime);
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

// Start animation
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();
