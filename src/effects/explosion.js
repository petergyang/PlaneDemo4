import * as THREE from 'three';

export function createExplosion(position) {
  const explosionGroup = new THREE.Group();
  explosionGroup.position.copy(position);
  
  // Explosion properties
  explosionGroup.userData = {
    lifetime: 0,
    maxLifetime: 1.5, // seconds
    scale: 1,
    particles: []
  };
  
  // Create core flash
  const coreGeometry = new THREE.SphereGeometry(1, 16, 16);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff99,
    transparent: true,
    opacity: 1
  });
  
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.scale.set(0.1, 0.1, 0.1);
  explosionGroup.add(core);
  explosionGroup.userData.core = core;
  
  // Create particles
  const particleCount = 20;
  const particleGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  
  for (let i = 0; i < particleCount; i++) {
    // Random color from orange to yellow
    const colorHue = 0.05 + Math.random() * 0.08; // 0.05-0.13 (orange to yellow)
    const colorSaturation = 0.8 + Math.random() * 0.2; // 0.8-1.0
    const particleColor = new THREE.Color().setHSL(colorHue, colorSaturation, 0.6);
    
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: particleColor,
      transparent: true,
      opacity: 1
    });
    
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    
    // Random direction
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const radius = 0.2 + Math.random() * 0.8;
    
    particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
    particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
    particle.position.z = radius * Math.cos(phi);
    
    // Random size
    const scale = 0.2 + Math.random() * 0.8;
    particle.scale.set(scale, scale, scale);
    
    // Random velocity
    const speed = 1 + Math.random() * 3;
    const velocity = new THREE.Vector3(
      particle.position.x,
      particle.position.y,
      particle.position.z
    ).normalize().multiplyScalar(speed);
    
    // Store particle data
    particle.userData = {
      velocity: velocity,
      initialScale: scale
    };
    
    explosionGroup.add(particle);
    explosionGroup.userData.particles.push(particle);
  }
  
  return explosionGroup;
}

export function updateExplosions(explosions, deltaTime, scene) {
  for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i];
    const data = explosion.userData;
    
    // Update lifetime
    data.lifetime += deltaTime;
    
    // Remove explosion if it's exceeded its lifetime
    if (data.lifetime > data.maxLifetime) {
      scene.remove(explosion);
      explosions.splice(i, 1);
      continue;
    }
    
    // Calculate progress (0 to 1)
    const progress = data.lifetime / data.maxLifetime;
    
    // Update core
    if (data.core) {
      // Core expands quickly then fades
      const coreScale = Math.min(4, 4 * progress * 2);
      data.core.scale.set(coreScale, coreScale, coreScale);
      
      // Fade out core
      data.core.material.opacity = 1 - (progress * 1.5);
    }
    
    // Update particles
    for (const particle of data.particles) {
      // Update position based on velocity
      particle.position.add(
        particle.userData.velocity.clone().multiplyScalar(deltaTime)
      );
      
      // Slow down particles over time
      particle.userData.velocity.multiplyScalar(0.95);
      
      // Fade out particles
      particle.material.opacity = 1 - progress;
      
      // Shrink particles at the end
      const scaleMultiplier = 1 - Math.max(0, (progress - 0.7) * 3);
      const currentScale = particle.userData.initialScale * scaleMultiplier;
      particle.scale.set(currentScale, currentScale, currentScale);
    }
  }
} 