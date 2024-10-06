// Normal Information(Main Page)
// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1); // Set clear color to black
document.body.appendChild(renderer.domElement);

// Add camera controls for better interactivity
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Smooth camera movement
controls.dampingFactor = 0.1;
controls.enablePan = false;

// Add Sun's light (PointLight for realism)
const sunLight = new THREE.PointLight(0xffffff, 2, 3000);
scene.add(sunLight);

// Add a dim ambient light to simulate space ambient lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1); // soft white light
scene.add(ambientLight);

// Load planet and Sun textures
const textureLoader = new THREE.TextureLoader();
const planetTextures = {
    Sun: textureLoader.load('Textures/sun.jpg'),
    Mercury: textureLoader.load('Textures/mercury.jpg'),
    Venus: textureLoader.load('Textures/venus.jpg'),
    Earth: textureLoader.load('Textures/earth.png'),
    Mars: textureLoader.load('Textures/mars.jpg'),
    Jupiter: textureLoader.load('Textures/jupiter.jpg'),
    Saturn: textureLoader.load('Textures/saturn.jpg'),
    Uranus: textureLoader.load('Textures/uranus.jpg'),
    Neptune: textureLoader.load('Textures/neptune.jpg')
};

// Increase planet sizes for better visualization
const planetScaleFactor = 3; // Scale multiplier for planet sizes

// Planet data (approximate distances in AU and orbital periods)
const planets = [
    { name: "Mercury", texture: planetTextures.Mercury, distance: 35, size: 1 * planetScaleFactor, period: 0.24 },
    { name: "Venus", texture: planetTextures.Venus, distance: 50, size: 2.5 * planetScaleFactor, period: 0.62 },
    { name: "Earth", texture: planetTextures.Earth, distance: 70, size: 3 * planetScaleFactor, period: 1.0 },
    { name: "Mars", texture: planetTextures.Mars, distance: 90, size: 2 * planetScaleFactor, period: 1.88 },
    { name: "Jupiter", texture: planetTextures.Jupiter, distance: 120, size: 8 * planetScaleFactor, period: 11.86 },
    { name: "Saturn", texture: planetTextures.Saturn, distance: 150, size: 7 * planetScaleFactor, period: 29.46 },
    { name: "Uranus", texture: planetTextures.Uranus, distance: 190, size: 6 * planetScaleFactor, period: 84.01 },
    { name: "Neptune", texture: planetTextures.Neptune, distance: 230, size: 5.5 * planetScaleFactor, period: 164.8 }
];


// Create Sun with increased size and realistic lighting
const sunGeometry = new THREE.SphereGeometry(10 * planetScaleFactor, 32, 32);  // Increased Sun size
const sunMaterial = new THREE.MeshBasicMaterial({ map: planetTextures.Sun });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Position the Sun's light at the Sun
sunLight.position.set(sun.position.x, sun.position.y, sun.position.z);

// Labels for planets
const labels = document.getElementById("labels");

// Create planets and add orbits
planets.forEach(planet => {
    // Planet mesh with texture
    const planetGeometry = new THREE.SphereGeometry(planet.size, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({ map: planet.texture });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    
    // Assign initial position based on distance
    planetMesh.position.x = planet.distance;
    
    // Create a ring to show the orbit
    const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.5, planet.distance + 0.5, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2; // Rotate the orbit to lay flat
    scene.add(orbit);
    
    // Add the planet mesh to the scene
    scene.add(planetMesh);
    
    // Create label for each planet
    const planetLabel = document.createElement("div");
    planetLabel.innerHTML = planet.name;
    labels.appendChild(planetLabel);
    
    // Store planet mesh for animation
    planet.mesh = planetMesh;
    planet.label = planetLabel;
});

// Function to add rings to Saturn
function addSaturnRings() {
    const ringGeometry = new THREE.RingGeometry(8.5 * planetScaleFactor, 14 * planetScaleFactor, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xb8b2a5,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    const saturnRings = new THREE.Mesh(ringGeometry, ringMaterial);
    saturnRings.rotation.x = Math.PI / 2;
    const saturn = planets.find(planet => planet.name === 'Saturn');
    saturnRings.position.copy(saturn.mesh.position);
    scene.add(saturnRings);
    saturn.rings = saturnRings;
}
addSaturnRings();

// Function to create a planet atmosphere
function createAtmosphere(planet) {
    const atmosphereGeometry = new THREE.SphereGeometry(planet.size * 1.1, 32, 32); // Slightly larger than the planet
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x00aaff, // Light blue for Earth, modify as needed for other planets
        transparent: true,
        opacity: 0.5 // Adjust opacity for atmospheric effect
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // Store reference to atmosphere mesh in planet object for positioning
    planet.atmosphere = atmosphereMesh;
}

// After adding the planets
planets.forEach(planet => {
    // Existing planet creation code...

    // Add atmosphere for Earth and Venus
    if (planet.name === "Earth" || planet.name === "Venus") {
        createAtmosphere(planet);
    }
});


// Function to create starfield background
function addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 1 });
    const starCount = 10000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    return starMaterial;
}
const starMaterial = addStars();

// Initial camera position (completely zoomed out)
const initialCameraPosition = new THREE.Vector3(0, 500, 1000);
const finalCameraPosition = new THREE.Vector3(0, 50, 150);
const solarSystemViewPosition = new THREE.Vector3(200, 100, 300);

// Current phase of the zoom animation (0 = starting, 1 = end of zoom-in, 2 = zoom-out slightly)
let zoomPhase = 0;
let zoomSpeed = 0.004;
let zoomProgress = 0;

// Create a pause button
const pauseButton = document.createElement("div");
pauseButton.innerHTML = "&#10074;&#10074; Pause"; // Use pause icon (vertical bars)
pauseButton.style.position = "absolute";
pauseButton.style.top = "10px";
pauseButton.style.right = "10px";
pauseButton.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
pauseButton.style.color = "white";
pauseButton.style.padding = "10px 20px";
pauseButton.style.borderRadius = "5px";
pauseButton.style.cursor = "pointer";
pauseButton.style.fontSize = "18px";
pauseButton.style.transition = "background-color 0.3s";
pauseButton.style.zIndex = 10;

// Add hover effect
pauseButton.onmouseover = () => {
    pauseButton.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
};
pauseButton.onmouseout = () => {
    pauseButton.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
};

// Append to the document body
document.body.appendChild(pauseButton);

// Pause functionality
let isPaused = false;
pauseButton.addEventListener('click', () => {
    isPaused = !isPaused; // Toggle pause state
    pauseButton.innerHTML = isPaused ? "&#9658 Resume" : "&#10074;&#10074; Pause"; // Change text/icon
});

// Create a Child Mode button
const childModeButton = document.createElement("div");
childModeButton.innerHTML = "Child Mode: Off"; // Initial state
childModeButton.style.position = "absolute";
childModeButton.style.top = "13px"; // Position below the pause button
childModeButton.style.right = "120px";
childModeButton.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
childModeButton.style.color = "white";
childModeButton.style.padding = "10px 20px";
childModeButton.style.borderRadius = "5px";
childModeButton.style.cursor = "pointer";
childModeButton.style.fontSize = "18px";
childModeButton.style.transition = "background-color 0.3s";
childModeButton.style.zIndex = 10;

// Add hover effect
childModeButton.onmouseover = () => {
    childModeButton.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
};
childModeButton.onmouseout = () => {
    childModeButton.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
};

// Append to the document body
document.body.appendChild(childModeButton);

// Child Mode functionality
let isChildMode = false;
childModeButton.addEventListener('click', () => {
    isChildMode = !isChildMode; // Toggle child mode state
    childModeButton.innerHTML = isChildMode ? "Child Mode: On" : "Child Mode: Off"; // Change text

    if (isChildMode) {
        // Redirect to another page when Child Mode is turned on
        window.location.pathname = "index.html";
    }
});

// Create NEC button
const necButton = document.createElement("div");
necButton.innerHTML = "NEC"; // Button label
necButton.style.position = "absolute";
necButton.style.top = "13px"; // Position below the Child Mode button
necButton.style.right = "280px"; // Align to the right
necButton.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
necButton.style.color = "white";
necButton.style.padding = "10px 20px";
necButton.style.borderRadius = "5px";
necButton.style.cursor = "pointer";
necButton.style.fontSize = "18px";
necButton.style.transition = "background-color 0.3s";
necButton.style.zIndex = 10;

// Add hover effect for NEC button
necButton.onmouseover = () => {
    necButton.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
};
necButton.onmouseout = () => {
    necButton.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
};

// Append NEC button to the document body
document.body.appendChild(necButton);

// NEC button functionality
necButton.addEventListener('click', () => {
    window.location.pathname = "Nes.html"; // Replace with the desired page URL
});

// Function to smoothly interpolate between two positions
function lerp(start, end, t) {
    return start.clone().lerp(end, t);
}

// In the animate function
function animate() {
    requestAnimationFrame(animate);

    // Update the zoom animation based on the phase
    if (zoomPhase === 0) {
        // Zoom in towards the Sun
        zoomProgress += zoomSpeed;
        if (zoomProgress >= 1) {
            zoomProgress = 1;
            zoomPhase = 1; // Transition to next phase (zoom-out)
        }
        camera.position.copy(lerp(initialCameraPosition, finalCameraPosition, zoomProgress));
    } else if (zoomPhase === 1) {
        // Stay near the Sun for a moment, then start zooming out slightly
        setTimeout(() => {
            zoomPhase = 2;
        }, 250); // Hold for 2 seconds before zooming out
    } else if (zoomPhase === 2) {
        // Zoom out to display the entire solar system
        zoomProgress -= zoomSpeed * 0.5;  // Slower zoom out
        if (zoomProgress <= 0) {
            zoomProgress = 0;
            zoomPhase = 3; // Stop animation after reaching the desired position
        }
        camera.position.copy(lerp(finalCameraPosition, solarSystemViewPosition, 1 - zoomProgress));
    }

    if (!isPaused) {
        // Only update planet positions when not paused
        planets.forEach(planet => {
            const time = Date.now() * 0.00005;  // Time factor for orbiting speed
            const angle = time / (planet.period * 0.2) * 2 * Math.PI; // Adjust orbital speed
            
            // Simulating elliptical orbits using a scale factor (slight eccentricity)
            const eccentricity = 0.1; // Small value for elliptical effect
            const semiMajorAxis = planet.distance; // Distance from the Sun
            const semiMinorAxis = semiMajorAxis * (1 - eccentricity); // Adjusted for eccentricity

            // Update planet positions based on their orbits
            planet.mesh.position.x = semiMajorAxis * Math.cos(angle);
            planet.mesh.position.z = semiMinorAxis * Math.sin(angle);

            // Update Saturn's rings to follow Saturn's position
            if (planet.name === "Saturn") {
                planet.rings.position.copy(planet.mesh.position);
            }

            // Update label position relative to the planet's position
            const vector = planet.mesh.position.clone();
            vector.project(camera);

            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = -(vector.y * 0.5 + 0.5) * window.innerHeight;

            planet.label.style.transform = `translate(${x}px,${y}px)`;
        });
    }

    // Update camera controls for smooth interaction
    controls.update();

    // Render the scene
    renderer.render(scene, camera);
}

// Start the animation loop
animate();

// Create a UI element for displaying planet information
const infoDiv = document.createElement("div");
infoDiv.style.position = "absolute";
infoDiv.style.top = "10px";
infoDiv.style.left = "10px";
infoDiv.style.color = "white";
infoDiv.style.fontSize = "20px";
infoDiv.style.pointerEvents = "none"; // So it doesn't block clicks
document.body.appendChild(infoDiv);


// Raycaster for detecting clicks on planets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Add an event listener for mouse clicks
window.addEventListener('click', (event) => {
    // Normalize mouse coordinates to -1 to 1 range
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Use raycaster to find intersecting objects
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(planet => planet.mesh).concat(sun));

    if (intersects.length > 0) {
        const object = intersects[0].object;

        // Check if the clicked object is the Sun
        if (object === sun) {
            window.location.pathname = "normalsun.html";
        } else {
            const planetData = planets.find(p => p.mesh === object);

            // Redirect to the corresponding planet page
            window.location.href = `${planetData.name.toLowerCase()}.html`; // Redirect based on the planet name

            // Optionally, you could also update the information display here if needed
            infoDiv.innerHTML = `
                <strong>${planetData.name}</strong><br>
                Distance from Sun: ${planetData.distance} AU<br>
                Size: ${planetData.size / planetScaleFactor} Earth diameters<br>
                Orbital Period: ${planetData.period} Earth years
            `;
        }
    } else {
        infoDiv.innerHTML = ""; // Clear info if no planet is clicked
    }
});


// Adjust scene when the window is resized
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
