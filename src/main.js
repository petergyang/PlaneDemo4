import * as THREE from 'three';
import { createPlane } from './models/plane.js';
import { createCity } from './models/city.js';
import { createSkybox } from './models/skybox.js';
import { createUFOFleet, updateUFOs } from './models/ufo.js';
import { fireBullet, updateBullets } from './models/bullet.js';
import { createExplosion, updateExplosions } from './effects/explosion.js';
import { FlightState, InputHandler } from './controllers/flightControls.js';
import { FlightCamera } from './cameras/flightCamera.js';
import { GameUI } from './ui/gameUI.js';

// Initialize Scene
const scene = new THREE.Scene();

// Initialize Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);

// Initialize Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Add Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 10;
directionalLight.shadow.camera.far = 200;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);

// Add skybox
const skybox = createSkybox();
scene.add(skybox);

// Add city
const city = createCity();
scene.add(city);

// Add UFOs hovering over the city
const cityRadius = 70; // Match the city radius
const ufoFleet = createUFOFleet(15, 40, 60, cityRadius); // Much higher altitude (40-60 units)
ufoFleet.forEach(ufo => scene.add(ufo));

// Add Plane Model
const plane = createPlane();
scene.add(plane);

// Initialize flight controls
const inputHandler = new InputHandler();
const flightState = new FlightState();

// Initialize camera system
const flightCamera = new FlightCamera(camera, plane, renderer);

// Initialize game UI
const gameUI = new GameUI();

// Initialize game state
const gameState = {
  bullets: [],
  explosions: [],
  destroyedUFOs: 0,
  totalUFOs: ufoFleet.length,
  shootCooldown: 0,
  shootCooldownTime: 0.25 // seconds between shots
};

// Add UFO count to UI
gameUI.updateUFOCount(gameState.totalUFOs, gameState.destroyedUFOs);

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Handle UFO Destruction
function handleUFODestroyed(ufo) {
  // Create explosion at UFO position
  const explosion = createExplosion(ufo.position.clone());
  scene.add(explosion);
  gameState.explosions.push(explosion);
  
  // Hide UFO (but keep it in the scene for tracking)
  ufo.visible = false;
  
  // Update destroyed count
  gameState.destroyedUFOs++;
  
  // Update UI
  gameUI.updateUFOCount(gameState.totalUFOs, gameState.destroyedUFOs);
  
  // Check for victory
  if (gameState.destroyedUFOs >= gameState.totalUFOs) {
    console.log("Victory! All UFOs destroyed!");
    // Victory logic could be added here
  }
}

// Track time for physics
let lastTime = 0;
let elapsedTime = 0;

// Animation Loop
function animate(time) {
  requestAnimationFrame(animate);
  
  // Calculate delta time in seconds
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;
  elapsedTime += deltaTime;
  
  // Skip first frame
  if (deltaTime > 0.1) return;
  
  // Update flight state
  flightState.update(deltaTime, inputHandler.getKeyState());
  
  // Apply flight state to plane
  flightState.applyToObject(plane);
  
  // Rotate propeller
  if (plane.getObjectByName('propeller')) {
    plane.getObjectByName('propeller').rotation.z += 0.2 + (flightState.speed / 30);
  }
  
  // Update UFOs
  const activeUFOs = ufoFleet.filter(ufo => !ufo.userData.isDestroyed);
  updateUFOs(activeUFOs, elapsedTime);
  
  // Handle shooting
  gameState.shootCooldown -= deltaTime;
  
  // Update weapon status in UI
  gameUI.updateWeaponStatus(gameState.shootCooldown <= 0);
  
  if ((inputHandler.keys['Space'] || inputHandler.keys['MouseLeft']) && gameState.shootCooldown <= 0) {
    // Fire bullet
    fireBullet(plane, gameState.bullets, scene);
    
    // Reset cooldown
    gameState.shootCooldown = gameState.shootCooldownTime;
  }
  
  // Update bullets and check for collisions
  updateBullets(gameState.bullets, deltaTime, ufoFleet, scene, handleUFODestroyed);
  
  // Update explosions
  updateExplosions(gameState.explosions, deltaTime, scene);
  
  // Check for camera toggle
  if (inputHandler.keys['KeyC'] && !inputHandler.prevCToggle) {
    const isFollowMode = flightCamera.toggleMode();
    gameUI.updateCameraMode(isFollowMode);
    inputHandler.prevCToggle = true;
  } else if (!inputHandler.keys['KeyC']) {
    inputHandler.prevCToggle = false;
  }
  
  // Update camera
  flightCamera.update(deltaTime);
  
  // Update UI
  gameUI.updateSpeed(flightState.speed);
  
  // Render scene
  renderer.render(scene, camera);
}

// Listen for mouse clicks for shooting
window.addEventListener('mousedown', (e) => {
  if (e.button === 0) { // Left mouse button
    inputHandler.keys['MouseLeft'] = true;
  }
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 0) { // Left mouse button
    inputHandler.keys['MouseLeft'] = false;
  }
});

// Listen for spacebar for shooting
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    inputHandler.keys['Space'] = true;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'Space') {
    inputHandler.keys['Space'] = false;
  }
});

// Start animation loop
animate(0); 