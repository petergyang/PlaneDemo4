import * as THREE from 'three';

export function createCity() {
  const cityGroup = new THREE.Group();
  
  // Create ground/terrain
  const groundGeometry = new THREE.PlaneGeometry(200, 200, 20, 20);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x556633, // Changed to a green-brown earthy color
    side: THREE.DoubleSide 
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  
  // Add some terrain variation
  const vertices = ground.geometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i);
    const z = vertices.getZ(i);
    
    // Skip the center area to keep it flat for the city
    if (Math.abs(x) > 40 || Math.abs(z) > 40) {
      const distance = Math.sqrt(x * x + z * z);
      const height = Math.sin(distance * 0.05) * 0.5 + Math.random() * 0.3;
      vertices.setY(i, height);
    }
  }
  
  ground.geometry.computeVertexNormals();
  cityGroup.add(ground);
  
  // Create buildings
  const buildingCount = 120; // Increased from 50 for a bigger city
  const cityRadius = 70; // Increased from 40
  const buildingMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x777777 }), // Gray
    new THREE.MeshStandardMaterial({ color: 0x999999 }), // Light gray
    new THREE.MeshStandardMaterial({ color: 0x555555 }), // Dark gray
    new THREE.MeshStandardMaterial({ color: 0x334455 }), // Blue-gray
    new THREE.MeshStandardMaterial({ color: 0x445566 })  // Blue-gray lighter
  ];
  
  // Create window material (emissive for glow effect)
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff99,
    emissive: 0xffff00,
    emissiveIntensity: 0.3
  });
  
  // Reusable window geometries
  const windowGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.1);
  const sideWindowGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.2);
  
  // Create skyscrapers and buildings
  for (let i = 0; i < buildingCount; i++) {
    // Random position within city radius, avoiding the very center (for player starting area)
    const angle = Math.random() * Math.PI * 2;
    const distance = 10 + Math.random() * (cityRadius - 10);
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Random building dimensions
    const width = 1 + Math.random() * 4;
    const depth = 1 + Math.random() * 4;
    const height = 3 + Math.random() * 25; // Taller buildings
    
    // Create building
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
    const materialIndex = Math.floor(Math.random() * buildingMaterials.length);
    const building = new THREE.Mesh(buildingGeometry, buildingMaterials[materialIndex]);
    
    // Position building
    building.position.set(x, height / 2 - 0.5, z);
    building.castShadow = true;
    building.receiveShadow = true;
    
    // Randomly rotate building
    building.rotation.y = Math.random() * Math.PI * 2;
    
    cityGroup.add(building);
    
    // Add windows to some buildings (fewer windows for better performance)
    if (Math.random() > 0.3) {
      // Less detailed windows for distant buildings
      if (distance > 40) {
        // Use texture-based windows or simplified window representation
        // For now, just skip windows for far buildings
        continue;
      }
      
      // Add fewer windows to closer buildings
      addSimplifiedWindows(building, width, height, depth, windowGeometry, sideWindowGeometry, windowMaterial);
    }
  }
  
  // Add some roads
  addRoads(cityGroup);
  
  return cityGroup;
}

function addSimplifiedWindows(building, width, height, depth, windowGeometry, sideWindowGeometry, windowMaterial) {
  // Fewer windows per floor and fewer floors
  const windowsPerWidth = Math.min(2, Math.floor(width / 0.8));
  const windowsPerDepth = Math.min(2, Math.floor(depth / 0.8));
  const floors = Math.min(8, Math.floor(height / 2.5));
  
  // Window spacing
  const widthSpacing = width / (windowsPerWidth + 1);
  const depthSpacing = depth / (windowsPerDepth + 1);
  const heightSpacing = height / (floors + 1);
  
  // Create windows for front and back (only on some floors)
  for (let floor = 1; floor <= floors; floor++) {
    // Skip some floors randomly
    if (Math.random() > 0.7) continue;
    
    const y = (floor * heightSpacing) - (height / 2);
    
    for (let w = 1; w <= windowsPerWidth; w++) {
      // Skip some windows randomly
      if (Math.random() > 0.8) continue;
      
      const x = (w * widthSpacing) - (width / 2);
      
      // Front windows
      const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
      frontWindow.position.set(x, y, depth / 2 + 0.01);
      building.add(frontWindow);
      
      // Back windows (only sometimes)
      if (Math.random() > 0.5) {
        const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        backWindow.position.set(x, y, -depth / 2 - 0.01);
        building.add(backWindow);
      }
    }
    
    // Create windows for sides (only sometimes)
    if (Math.random() > 0.5) {
      for (let d = 1; d <= windowsPerDepth; d++) {
        if (Math.random() > 0.7) continue;
        
        const z = (d * depthSpacing) - (depth / 2);
        
        // Left window
        const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
        leftWindow.position.set(width / 2 + 0.01, y, z);
        building.add(leftWindow);
        
        // Right window (only sometimes)
        if (Math.random() > 0.5) {
          const rightWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
          rightWindow.position.set(-width / 2 - 0.01, y, z);
          building.add(rightWindow);
        }
      }
    }
  }
}

function addRoads(cityGroup) {
  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  
  // Main roads
  const mainRoadWidth = 5;
  const mainRoadLength = 160;
  
  // North-South Road
  const nsRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(mainRoadWidth, mainRoadLength),
    roadMaterial
  );
  nsRoad.rotation.x = -Math.PI / 2;
  nsRoad.position.y = -0.48; // Slightly above ground to avoid z-fighting
  cityGroup.add(nsRoad);
  
  // East-West Road
  const ewRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(mainRoadLength, mainRoadWidth),
    roadMaterial
  );
  ewRoad.rotation.x = -Math.PI / 2;
  ewRoad.position.y = -0.48;
  cityGroup.add(ewRoad);
  
  // Add diagonal roads
  const diagonalRoadLength = 120;
  
  // Northeast-Southwest Road
  const neswRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(mainRoadWidth, diagonalRoadLength),
    roadMaterial
  );
  neswRoad.rotation.x = -Math.PI / 2;
  neswRoad.rotation.z = Math.PI / 4;
  neswRoad.position.y = -0.47;
  cityGroup.add(neswRoad);
  
  // Northwest-Southeast Road
  const nwseRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(mainRoadWidth, diagonalRoadLength),
    roadMaterial
  );
  nwseRoad.rotation.x = -Math.PI / 2;
  nwseRoad.rotation.z = -Math.PI / 4;
  nwseRoad.position.y = -0.47;
  cityGroup.add(nwseRoad);
  
  // Add circular road
  const circleSegments = 32;
  const circleRadius = 30;
  const circleRoadWidth = 4;
  
  const circleShape = new THREE.Shape();
  circleShape.moveTo(circleRadius + circleRoadWidth/2, 0);
  circleShape.absarc(0, 0, circleRadius + circleRoadWidth/2, 0, Math.PI * 2, false);
  
  const holeShape = new THREE.Path();
  holeShape.moveTo(circleRadius - circleRoadWidth/2, 0);
  holeShape.absarc(0, 0, circleRadius - circleRoadWidth/2, 0, Math.PI * 2, true);
  
  circleShape.holes.push(holeShape);
  
  const circleGeometry = new THREE.ShapeGeometry(circleShape, circleSegments);
  const circleRoad = new THREE.Mesh(circleGeometry, roadMaterial);
  circleRoad.rotation.x = -Math.PI / 2;
  circleRoad.position.y = -0.46;
  cityGroup.add(circleRoad);
} 