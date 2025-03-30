import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class FlightCamera {
  constructor(camera, target, renderer) {
    this.camera = camera;
    this.target = target;
    this.renderer = renderer;
    
    // Camera offset from plane
    this.offset = new THREE.Vector3(0, 3, 15);
    
    // Position and look vectors
    this.currentPosition = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
    this.lookAtPosition = new THREE.Vector3();
    
    // Camera smoothing
    this.followSmoothing = 0.05;
    this.lookSmoothing = 0.1;
    
    // Camera modes
    this.isFollowMode = true;
    
    // Create orbit controls for free mode
    this.orbitControls = new OrbitControls(camera, renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.enabled = false;
  }
  
  update(deltaTime) {
    if (this.isFollowMode) {
      this.updateFollowCamera(deltaTime);
      this.orbitControls.enabled = false;
    } else {
      this.orbitControls.target.copy(this.target.position);
      this.orbitControls.update();
      this.orbitControls.enabled = true;
    }
  }
  
  updateFollowCamera(deltaTime) {
    // Calculate ideal camera position in world space
    // Convert the local offset to world space using the target's quaternion
    const worldOffset = this.offset.clone().applyQuaternion(this.target.quaternion);
    this.targetPosition.copy(this.target.position).add(worldOffset);
    
    // Calculate look position (slightly ahead of the target)
    const forwardVector = new THREE.Vector3(0, 0, -10);
    forwardVector.applyQuaternion(this.target.quaternion);
    
    // Look at position is target position plus forward vector
    this.lookAtPosition.copy(this.target.position).add(forwardVector);
    
    // Smoothly move camera position
    this.currentPosition.lerp(this.targetPosition, this.followSmoothing);
    this.camera.position.copy(this.currentPosition);
    
    // Smoothly look at the target
    this.camera.lookAt(this.lookAtPosition);
  }
  
  toggleMode() {
    this.isFollowMode = !this.isFollowMode;
    
    if (!this.isFollowMode) {
      // When switching to orbit mode, initialize controls at current position
      this.orbitControls.target.copy(this.target.position);
      this.orbitControls.update();
    } else {
      // When switching back to follow mode, reset the camera position
      this.currentPosition.copy(this.camera.position);
    }
    
    return this.isFollowMode;
  }
} 