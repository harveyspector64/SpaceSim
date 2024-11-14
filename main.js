// Constants for scaling
const AU_SCALE = 160;
const TIME_SCALE = 0.003;
const PLANET_SCALE = 0.45;

// Canvas setup
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let systems = [];
let lastTimestamp = 0;
let currentTime = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    systems = data;
    resizeCanvas();
    requestAnimationFrame(animate);
  })
  .catch(error => console.error("Error loading data:", error));

function calculateOrbitPosition(semiMajorAxis, period, initialTime, currentTime) {
  const angle = 2 * Math.PI * ((currentTime - initialTime) / period) % (2 * Math.PI);
  const x = semiMajorAxis * Math.cos(angle);
  const y = semiMajorAxis * Math.sin(angle);
  return { x, y };
}

function renderPlanet(planet, centerX, centerY, currentTime) {
  const { x, y } = calculateOrbitPosition(planet.semiMajorAxis * AU_SCALE, planet.period, planet.initialTime, currentTime);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, planet.semiMajorAxis * AU_SCALE, 0, 2 * Math.PI);
  ctx.stroke();

  const color = getColorFromTemperature(planet.temperature || 500);
  ctx.fillStyle = color;

  const planetSize = (planet.radius || 1) * PLANET_SCALE;
  ctx.beginPath();
  ctx.arc(centerX + x, centerY + y, planetSize, 0, 2 * Math.PI);
  ctx.fill();
}

function getColorFromTemperature(temp) {
  const normalizedTemp = Math.min(1250, Math.max(250, temp));
  const blue = Math.max(0, 255 - ((normalizedTemp - 250) / 4));
  const red = Math.max(0, (normalizedTemp - 250) / 4);
  
  // Adjust the green channel to balance color
  const green = Math.min(255, red / 2);
  
  return `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)})`;
}

function getStaticPosition(index) {
  const radius = 100 + index * 15;
  const angle = (index * 137.5) * (Math.PI / 180);
  const x = canvas.width / 2 + radius * Math.cos(angle);
  const y = canvas.height / 2 + radius * Math.sin(angle);
  return { x, y };
}

function renderSystems(currentTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  systems.forEach((system, index) => {
    const { x: centerX, y: centerY } = getStaticPosition(index);

    system.planets.forEach(planet => {
      renderPlanet(planet, centerX, centerY, currentTime);
    });
  });
}

function animate(timestamp) {
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  currentTime += deltaTime * TIME_SCALE;
  renderSystems(currentTime);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvas);
