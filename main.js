<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orbital System Simulation</title>
    <style>
        body { margin: 0; overflow: hidden; background-color: black; }
        canvas { display: block; }
    </style>
</head>
<body>
    <canvas id="simulationCanvas"></canvas>
    <script>
        const canvas = document.getElementById("simulationCanvas");
        const context = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let planets = [];  // This will hold our planet data

        // Adjust canvas on resize
        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            renderPlanets(planets);
        });

        // Function to draw each planet
        function drawPlanet(context, x, y, size, color) {
            const maxSize = 20; // Cap size for visual consistency
            const radius = Math.min(size, maxSize); // Ensure no planet is too large

            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = color;
            context.fill();
        }

        // Function to render all planets
        function renderPlanets(planets) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            planets.forEach((planet) => {
                // Position and scale adjustments to avoid overlapping
                const scaledX = (planet.x / 15) + canvas.width / 2; // Compress positions closer
                const scaledY = (planet.y / 15) + canvas.height / 2;

                drawPlanet(context, scaledX, scaledY, planet.size, planet.color || "orange");
            });
        }

        // Function to animate the planets
        function animate() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            planets.forEach((planet) => {
                // Update positions based on simulated orbital movement
                planet.x += planet.vx;
                planet.y += planet.vy;
            });
            renderPlanets(planets);
            requestAnimationFrame(animate);
        }

        // Load planets data from JSON file
        fetch("data.json")
            .then(response => response.json())
            .then(data => {
                planets = data.map(item => ({
                    x: item.x * 10, // Scale up initial positions
                    y: item.y * 10,
                    size: item.size ? item.size / 5 : 5, // Scale down to prevent oversized planets
                    vx: item.vx || 0.5 * (Math.random() - 0.5), // Small random velocity if not provided
                    vy: item.vy || 0.5 * (Math.random() - 0.5),
                    color: item.color || "orange" // Default color if none specified
                }));
                animate();
            })
            .catch(error => console.error("Error loading data:", error));
    </script>
</body>
</html>
