import * as THREE from 'three';

export function createPlane() {
  // Create a group to hold all plane parts
  const planeGroup = new THREE.Group();
  
  // Set materials
  const darkGrayMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const lightGrayMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
  const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x3355aa });
  
  // Create fuselage (main body)
  const fuselageGeometry = new THREE.CylinderGeometry(0.5, 0.3, 4, 8);
  const fuselage = new THREE.Mesh(fuselageGeometry, darkGrayMaterial);
  fuselage.castShadow = true;
  fuselage.rotation.x = Math.PI / 2; // Rotate to align with z-axis
  planeGroup.add(fuselage);
  
  // Create cockpit (slightly raised part on top of fuselage)
  const cockpitGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.5, 8);
  const cockpit = new THREE.Mesh(cockpitGeometry, darkGrayMaterial);
  cockpit.position.set(0, 0.6, -0.5);
  cockpit.rotation.x = Math.PI / 2;
  cockpit.castShadow = true;
  planeGroup.add(cockpit);
  
  // Create a blue stripe around the cockpit area
  const stripeGeometry = new THREE.CylinderGeometry(0.52, 0.52, 0.3, 8);
  const stripe = new THREE.Mesh(stripeGeometry, blueMaterial);
  stripe.position.set(0, 0.3, -0.5);
  stripe.rotation.x = Math.PI / 2;
  planeGroup.add(stripe);
  
  // Create wings (rectangular, passing through the middle of the fuselage)
  const wingsGeometry = new THREE.BoxGeometry(6, 0.1, 1);
  const wings = new THREE.Mesh(wingsGeometry, darkGrayMaterial);
  wings.castShadow = true;
  planeGroup.add(wings);
  
  // Create tail section
  const tailFinGeometry = new THREE.BoxGeometry(0.1, 1, 0.8);
  const tailFin = new THREE.Mesh(tailFinGeometry, darkGrayMaterial);
  tailFin.position.set(0, 0.5, 1.8);
  tailFin.castShadow = true;
  planeGroup.add(tailFin);
  
  // Create horizontal stabilizers
  const stabilizerGeometry = new THREE.BoxGeometry(2, 0.1, 0.6);
  const stabilizer = new THREE.Mesh(stabilizerGeometry, darkGrayMaterial);
  stabilizer.position.set(0, 0, 1.8);
  stabilizer.castShadow = true;
  planeGroup.add(stabilizer);
  
  // Create propeller mount
  const mountGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8);
  const mount = new THREE.Mesh(mountGeometry, lightGrayMaterial);
  mount.position.set(0, 0, -2.2);
  mount.rotation.x = Math.PI / 2;
  planeGroup.add(mount);
  
  // Create propeller
  const propellerGroup = new THREE.Group();
  propellerGroup.name = 'propeller'; // Name for animation reference
  
  // Create propeller blades
  const bladeGeometry = new THREE.BoxGeometry(0.2, 1.2, 0.05);
  
  // Vertical blade
  const verticalBlade = new THREE.Mesh(bladeGeometry, darkGrayMaterial);
  verticalBlade.castShadow = true;
  propellerGroup.add(verticalBlade);
  
  // Horizontal blade
  const horizontalBlade = new THREE.Mesh(bladeGeometry, darkGrayMaterial);
  horizontalBlade.rotation.z = Math.PI / 2;
  horizontalBlade.castShadow = true;
  propellerGroup.add(horizontalBlade);
  
  // Position the entire propeller
  propellerGroup.position.set(0, 0, -2.3);
  planeGroup.add(propellerGroup);
  
  // Orient the plane to point nose forward along Z-axis
  planeGroup.rotation.y = Math.PI; // Rotate 180 degrees so it faces forward (-Z direction)
  
  return planeGroup;
} 