import * as THREE from 'three';

export function createUFO() {
  const ufoGroup = new THREE.Group();
  
  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x444444,
    metalness: 0.7,
    roughness: 0.3
  });
  
  const domeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x666666,
    metalness: 0.8,
    roughness: 0.2
  });
  
  const glowMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x88aaff,
    emissive: 0x4466ff,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.8
  });
  
  // Main saucer body
  const bodyGeometry = new THREE.CylinderGeometry(0, 3, 0.8, 24);
  bodyGeometry.scale(1, 0.2, 1); // Flatten it
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.rotation.x = Math.PI; // Flip upside down
  body.position.y = -0.1;
  body.castShadow = true;
  ufoGroup.add(body);
  
  // Bottom part
  const bottomGeometry = new THREE.CylinderGeometry(2, 1.5, 0.5, 24);
  bottomGeometry.scale(1, 0.5, 1);
  const bottom = new THREE.Mesh(bottomGeometry, bodyMaterial);
  bottom.position.y = -0.3;
  bottom.castShadow = true;
  ufoGroup.add(bottom);
  
  // Top dome
  const domeGeometry = new THREE.SphereGeometry(1.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeometry, domeMaterial);
  dome.position.y = 0.2;
  dome.castShadow = true;
  ufoGroup.add(dome);
  
  // Glow ring
  const ringGeometry = new THREE.TorusGeometry(2.5, 0.2, 8, 24);
  const ring = new THREE.Mesh(ringGeometry, glowMaterial);
  ring.position.y = -0.2;
  ring.castShadow = false;
  ufoGroup.add(ring);
  
  // Make UFO bigger by scaling the entire group
  ufoGroup.scale.set(1.8, 1.8, 1.8);
  
  return ufoGroup;
}

export function createUFOFleet(count, minHeight, maxHeight, radius) {
  const ufos = [];
  
  for (let i = 0; i < count; i++) {
    const ufo = createUFO();
    
    // Random path type: circular or figure-eight
    const pathType = Math.random() > 0.5 ? 'circular' : 'figure-eight';
    
    // Position UFOs in a more concentrated pattern above the center of the city
    const angle = Math.random() * Math.PI * 2;
    // Use a smaller radius to keep UFOs more centralized over the city
    const distance = (pathType === 'circular') 
      ? (radius * 0.2) + (Math.random() * radius * 0.4) // 20-60% of city radius
      : (radius * 0.1) + (Math.random() * radius * 0.3); // 10-40% of city radius for figure-eight
    
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const y = minHeight + Math.random() * (maxHeight - minHeight);
    
    ufo.position.set(x, y, z);
    
    // Random slight tilt
    ufo.rotation.x = (Math.random() - 0.5) * 0.2;
    ufo.rotation.z = (Math.random() - 0.5) * 0.2;
    
    // Movement parameters
    const movementData = {
      // Center of the path
      center: new THREE.Vector3(x, y, z),
      // Path type
      pathType: pathType,
      // Current angle in the path
      angle: Math.random() * Math.PI * 2,
      // Speed of movement along the path
      speed: 0.1 + Math.random() * 0.3,
      // Path radius
      radius: 5 + Math.random() * 15,
      // For figure-eight paths
      radiusX: 10 + Math.random() * 20,
      radiusZ: 5 + Math.random() * 15,
      // Hover parameters
      hover: {
        initialY: y,
        amplitude: 0.2 + Math.random() * 0.2,
        frequency: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2
      },
      // Rotation speed
      rotationSpeed: (Math.random() * 0.2 - 0.1) * 0.5
    };
    
    ufo.userData = movementData;
    ufos.push(ufo);
  }
  
  return ufos;
}

export function updateUFOs(ufos, time) {
  ufos.forEach(ufo => {
    const data = ufo.userData;
    
    // Update path angle
    data.angle += data.speed * 0.01;
    
    // Calculate new position based on path type
    if (data.pathType === 'circular') {
      // Circular path
      const x = data.center.x + Math.cos(data.angle) * data.radius;
      const z = data.center.z + Math.sin(data.angle) * data.radius;
      
      ufo.position.x = x;
      ufo.position.z = z;
    } else {
      // Figure-eight path (lemniscate of Bernoulli)
      const t = data.angle;
      // Figure-eight formula
      const denominator = 1 + Math.sin(t) * Math.sin(t);
      const x = data.center.x + (data.radiusX * Math.cos(t)) / denominator;
      const z = data.center.z + (data.radiusZ * Math.sin(t) * Math.cos(t)) / denominator;
      
      ufo.position.x = x;
      ufo.position.z = z;
    }
    
    // Apply vertical hover motion
    ufo.position.y = data.hover.initialY + 
      Math.sin(time * data.hover.frequency + data.hover.phase) * data.hover.amplitude;
    
    // Gradually rotate UFO to face the direction of movement
    const targetRotationY = Math.atan2(
      ufo.position.x - data.prevX || 0,
      ufo.position.z - data.prevZ || 0
    );
    
    // Store current position for next frame's direction calculation
    data.prevX = ufo.position.x;
    data.prevZ = ufo.position.z;
    
    // Apply rotation around Y axis to face direction of travel
    if (data.prevX !== undefined) {
      // Smoothly interpolate towards the target rotation
      ufo.rotation.y = lerpAngle(ufo.rotation.y, targetRotationY, 0.05);
    }
    
    // Apply additional slow constant rotation
    ufo.rotation.y += data.rotationSpeed * 0.01;
  });
}

// Helper function to interpolate between angles considering the shortest path
function lerpAngle(a, b, t) {
  // Ensure angles are between 0 and 2π
  a = (a % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  b = (b % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  
  // Find the shortest path
  let delta = b - a;
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  
  return a + delta * t;
} 