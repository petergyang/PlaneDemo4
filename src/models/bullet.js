import * as THREE from 'three';

export function createBullet() {
  // Create bullet geometry and material
  const geometry = new THREE.SphereGeometry(0.2, 8, 8);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xff6600,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2
  });
  
  // Create bullet mesh
  const bullet = new THREE.Mesh(geometry, material);
  bullet.castShadow = true;
  
  // Set bullet properties
  bullet.userData = {
    speed: 2, // Speed of bullet
    lifetime: 0, // Current lifetime of bullet
    maxLifetime: 2, // Maximum lifetime in seconds
    isActive: true // Whether bullet is active
  };
  
  return bullet;
}

export function fireBullet(plane, bullets, scene) {
  // Create a new bullet
  const bullet = createBullet();
  
  // Position bullet at plane's position
  bullet.position.copy(plane.position);
  
  // Set bullet velocity in direction plane is facing
  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(plane.quaternion);
  bullet.userData.velocity = direction.multiplyScalar(bullet.userData.speed);
  
  // Add bullet to scene and bullets array
  scene.add(bullet);
  bullets.push(bullet);
  
  return bullet;
}

export function updateBullets(bullets, deltaTime, ufos, scene, onUFODestroyed) {
  // Update each bullet
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    
    // Skip inactive bullets
    if (!bullet.userData.isActive) continue;
    
    // Update lifetime
    bullet.userData.lifetime += deltaTime;
    
    // Remove bullet if it's exceeded its lifetime
    if (bullet.userData.lifetime > bullet.userData.maxLifetime) {
      scene.remove(bullet);
      bullets.splice(i, 1);
      continue;
    }
    
    // Update position based on velocity
    const velocity = bullet.userData.velocity.clone();
    bullet.position.add(velocity.multiplyScalar(deltaTime * 60));
    
    // Check for collisions with UFOs
    for (let j = 0; j < ufos.length; j++) {
      const ufo = ufos[j];
      
      // Skip already destroyed UFOs
      if (ufo.userData.isDestroyed) continue;
      
      // Collision detection using bounding spheres
      const bulletRadius = 0.2;
      const ufoRadius = 3; // Rough estimate of UFO size
      const distance = bullet.position.distanceTo(ufo.position);
      
      if (distance < (bulletRadius + ufoRadius)) {
        // Collision occurred - mark bullet as inactive
        bullet.userData.isActive = false;
        scene.remove(bullet);
        bullets.splice(i, 1);
        
        // Mark UFO as destroyed and create explosion
        ufo.userData.isDestroyed = true;
        
        // Call callback function for UFO destruction
        if (onUFODestroyed) {
          onUFODestroyed(ufo);
        }
        
        break;
      }
    }
  }
} 