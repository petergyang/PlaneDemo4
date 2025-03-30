import * as THREE from 'three';

export function createSkybox() {
  // Create a large sphere for the sky
  const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
  
  // Set up gradient sky shader material
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x0077ff) },  // Sky blue
      bottomColor: { value: new THREE.Color(0x89cff0) }, // Light blue
      offset: { value: 33 },
      exponent: { value: 0.6 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      
      varying vec3 vWorldPosition;
      
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide
  });
  
  // Create skybox mesh and return it
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  
  // Add some simple clouds
  const clouds = createClouds();
  sky.add(clouds);
  
  return sky;
}

function createClouds() {
  const cloudsGroup = new THREE.Group();
  
  // Cloud material
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    flatShading: true
  });
  
  // Reuse geometries for better performance
  const cloudGeometries = [
    new THREE.SphereGeometry(5, 7, 7),
    new THREE.SphereGeometry(8, 7, 7),
    new THREE.SphereGeometry(12, 7, 7)
  ];
  
  // Create fewer cloud clusters
  for (let i = 0; i < 10; i++) { // Reduced from 20 to 10
    const cloudCluster = new THREE.Group();
    
    // Random position in the sky
    const angle = Math.random() * Math.PI * 2;
    const radius = 200 + Math.random() * 200;
    const height = 50 + Math.random() * 100;
    
    cloudCluster.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );
    
    // Create 2-4 cloud puffs for this cluster (reduced from 3-7)
    const puffCount = 2 + Math.floor(Math.random() * 3);
    
    for (let j = 0; j < puffCount; j++) {
      // Use one of our pre-defined geometries
      const geometryIndex = Math.floor(Math.random() * cloudGeometries.length);
      const puff = new THREE.Mesh(cloudGeometries[geometryIndex], cloudMaterial);
      
      // Position puff within the cluster
      puff.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 20
      );
      
      // Scale randomly
      const scale = 0.7 + Math.random() * 0.6;
      puff.scale.set(scale, scale, scale);
      
      cloudCluster.add(puff);
    }
    
    cloudsGroup.add(cloudCluster);
  }
  
  return cloudsGroup;
} 