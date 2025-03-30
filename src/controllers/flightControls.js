import * as THREE from 'three';

// Flight control constants
const PITCH_SENSITIVITY = 0.8;
const ROLL_SENSITIVITY = 2.0;
const TURN_SENSITIVITY = 1.5;
const MIN_SPEED = 10;
const MAX_SPEED = 50;
const DEFAULT_SPEED = 30;
const MAX_PITCH_ANGLE = THREE.MathUtils.degToRad(60); // 60 degrees
const MAX_ROLL_ANGLE = THREE.MathUtils.degToRad(45); // 45 degrees
const AUTO_LEVEL_SPEED = 0.5; // Speed of auto-leveling

// Flight state class
export class FlightState {
  constructor() {
    // Flight parameters
    this.speed = DEFAULT_SPEED;
    this.position = new THREE.Vector3(0, 5, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    
    // Rotation parameters
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ'); // YXZ order for flight simulation
    this.quaternion = new THREE.Quaternion();
    
    // Input state
    this.pitchInput = 0; // -1 to 1 (W/S)
    this.rollInput = 0;  // -1 to 1 (A/D)
    this.yawInput = 0;   // Calculated from roll (coupled with bank angle)
    this.speedInput = 0; // -1 to 1 (Q/E)
    
    // Current angles
    this.pitch = 0;
    this.roll = 0;
    this.yaw = 0;
    
    // Initial setup - approach from outside city
    this.position.set(80, 20, 80); // Moved further out for bigger city approach
    this.rotation.y = -Math.PI * 0.75; // Point towards city center
    this.rotation.x = -Math.PI / 18; // Slight nose down
    this.quaternion.setFromEuler(this.rotation);
  }
  
  update(deltaTime, keysPressed) {
    // Process keyboard inputs
    this.processInputs(keysPressed, deltaTime);
    
    // Apply physics
    this.applyPhysics(deltaTime);
    
    // Update the quaternion
    this.updateQuaternion();
  }
  
  processInputs(keysPressed, deltaTime) {
    // Reset inputs
    this.pitchInput = 0;
    this.rollInput = 0;
    this.speedInput = 0;
    
    // Pitch control (W/S)
    if (keysPressed['KeyW'] || keysPressed['ArrowUp']) {
      this.pitchInput = -1; // Nose down
    } else if (keysPressed['KeyS'] || keysPressed['ArrowDown']) {
      this.pitchInput = 1; // Nose up
    }
    
    // Roll control (A/D) - Fixed to be correct direction
    if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) {
      this.rollInput = 1; // Roll left - wings tilt left when turning left
    } else if (keysPressed['KeyD'] || keysPressed['ArrowRight']) {
      this.rollInput = -1; // Roll right - wings tilt right when turning right
    }
    
    // Speed control (Q/E)
    if (keysPressed['KeyQ']) {
      this.speedInput = -1; // Decrease speed
    } else if (keysPressed['KeyE']) {
      this.speedInput = 1; // Increase speed
    }
    
    // Apply sensitivity
    this.pitchInput *= PITCH_SENSITIVITY;
    this.rollInput *= ROLL_SENSITIVITY;
    
    // Apply speed change
    this.speed += this.speedInput * 10 * deltaTime;
    this.speed = THREE.MathUtils.clamp(this.speed, MIN_SPEED, MAX_SPEED);
  }
  
  applyPhysics(deltaTime) {
    // Calculate pitch based on input and auto-centering
    if (this.pitchInput !== 0) {
      this.pitch += this.pitchInput * deltaTime;
      this.pitch = THREE.MathUtils.clamp(this.pitch, -MAX_PITCH_ANGLE, MAX_PITCH_ANGLE);
    } else {
      // Auto-center pitch
      if (Math.abs(this.pitch) > 0.01) {
        const direction = this.pitch > 0 ? -1 : 1;
        this.pitch += direction * AUTO_LEVEL_SPEED * deltaTime;
      } else {
        this.pitch = 0;
      }
    }
    
    // Calculate roll based on input and auto-leveling
    if (this.rollInput !== 0) {
      this.roll += this.rollInput * deltaTime;
      this.roll = THREE.MathUtils.clamp(this.roll, -MAX_ROLL_ANGLE, MAX_ROLL_ANGLE);
      
      // Couple yaw to roll (bank-to-turn)
      // When rolling left (positive roll), turn left (positive yaw)
      this.yaw += this.roll * TURN_SENSITIVITY * deltaTime;
    } else {
      // Auto-level roll
      if (Math.abs(this.roll) > 0.01) {
        const direction = this.roll > 0 ? -1 : 1;
        this.roll += direction * AUTO_LEVEL_SPEED * deltaTime;
      } else {
        this.roll = 0;
      }
    }
    
    // Create direction vector from quaternion
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.quaternion);
    
    // Calculate velocity based on speed and direction
    this.velocity.copy(direction).multiplyScalar(this.speed * deltaTime);
    
    // Update position based on velocity
    this.position.add(this.velocity);
  }
  
  updateQuaternion() {
    // Set rotation in YXZ order (yaw, pitch, roll)
    this.rotation.y = this.yaw;
    this.rotation.x = this.pitch;
    this.rotation.z = this.roll;
    
    // Update quaternion from euler angles
    this.quaternion.setFromEuler(this.rotation);
  }
  
  applyToObject(object) {
    object.position.copy(this.position);
    object.quaternion.copy(this.quaternion);
  }
}

// Input Handling
export class InputHandler {
  constructor() {
    this.keys = {};
    this.cameraToggle = false;
    this.prevCToggle = false;
    
    // Set up event listeners
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }
  
  onKeyDown(event) {
    this.keys[event.code] = true;
    
    // Handle camera toggle
    if (event.code === 'KeyC' && !event.repeat) {
      this.cameraToggle = !this.cameraToggle;
    }
  }
  
  onKeyUp(event) {
    this.keys[event.code] = false;
  }
  
  getKeyState() {
    return this.keys;
  }
  
  getCameraToggle() {
    return this.cameraToggle;
  }
} 