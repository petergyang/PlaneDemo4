export class GameUI {
  constructor() {
    this.container = null;
    this.speedIndicator = null;
    this.cameraMode = null;
    this.ufoCounter = null;
    
    this.createUI();
  }
  
  createUI() {
    // Create main UI container
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.left = '0';
    this.container.style.bottom = '0';
    this.container.style.width = '100%';
    this.container.style.pointerEvents = 'none';
    this.container.style.fontFamily = 'Arial, sans-serif';
    this.container.style.color = 'white';
    this.container.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
    document.body.appendChild(this.container);
    
    // Create control reference
    const controlsPanel = document.createElement('div');
    controlsPanel.style.position = 'absolute';
    controlsPanel.style.left = '20px';
    controlsPanel.style.bottom = '20px';
    controlsPanel.style.background = 'rgba(0, 0, 0, 0.5)';
    controlsPanel.style.padding = '10px';
    controlsPanel.style.borderRadius = '5px';
    controlsPanel.style.fontSize = '14px';
    
    controlsPanel.innerHTML = `
      <div style="margin-bottom: 5px; font-weight: bold;">CONTROLS</div>
      <div>W/S: Pitch down/up</div>
      <div>A/D: Roll left/right</div>
      <div>Q/E: Decrease/increase speed</div>
      <div>SPACE/CLICK: Shoot</div>
      <div>C: Toggle camera mode</div>
    `;
    
    this.container.appendChild(controlsPanel);
    
    // Create speed indicator
    this.speedIndicator = document.createElement('div');
    this.speedIndicator.style.position = 'absolute';
    this.speedIndicator.style.right = '20px';
    this.speedIndicator.style.bottom = '20px';
    this.speedIndicator.style.background = 'rgba(0, 0, 0, 0.5)';
    this.speedIndicator.style.padding = '10px';
    this.speedIndicator.style.borderRadius = '5px';
    this.speedIndicator.style.textAlign = 'center';
    this.speedIndicator.style.width = '80px';
    
    const speedLabel = document.createElement('div');
    speedLabel.style.fontSize = '12px';
    speedLabel.textContent = 'SPEED';
    
    const speedValue = document.createElement('div');
    speedValue.style.fontSize = '20px';
    speedValue.style.fontWeight = 'bold';
    speedValue.textContent = '30';
    speedValue.id = 'speed-value';
    
    this.speedIndicator.appendChild(speedLabel);
    this.speedIndicator.appendChild(speedValue);
    this.container.appendChild(this.speedIndicator);
    
    // Create UFO counter
    this.ufoCounter = document.createElement('div');
    this.ufoCounter.style.position = 'absolute';
    this.ufoCounter.style.top = '20px';
    this.ufoCounter.style.left = '20px';
    this.ufoCounter.style.background = 'rgba(0, 0, 0, 0.5)';
    this.ufoCounter.style.padding = '10px';
    this.ufoCounter.style.borderRadius = '5px';
    this.ufoCounter.style.textAlign = 'center';
    
    const ufoLabel = document.createElement('div');
    ufoLabel.style.fontSize = '12px';
    ufoLabel.textContent = 'UFOs';
    
    const ufoValue = document.createElement('div');
    ufoValue.style.fontSize = '20px';
    ufoValue.style.fontWeight = 'bold';
    ufoValue.textContent = '0 / 0';
    ufoValue.id = 'ufo-counter';
    
    this.ufoCounter.appendChild(ufoLabel);
    this.ufoCounter.appendChild(ufoValue);
    this.container.appendChild(this.ufoCounter);
    
    // Create ammo indicator
    const ammoIndicator = document.createElement('div');
    ammoIndicator.style.position = 'absolute';
    ammoIndicator.style.bottom = '50%';
    ammoIndicator.style.right = '20px';
    ammoIndicator.style.transform = 'translateY(50%)';
    ammoIndicator.style.background = 'rgba(0, 0, 0, 0.5)';
    ammoIndicator.style.padding = '10px';
    ammoIndicator.style.borderRadius = '5px';
    ammoIndicator.style.textAlign = 'center';
    ammoIndicator.id = 'ammo-indicator';
    ammoIndicator.innerHTML = `
      <div style="font-size: 12px; margin-bottom: 5px;">WEAPONS</div>
      <div style="display: flex; justify-content: center; align-items: center;">
        <div style="width: 15px; height: 15px; background-color: #ffff00; border-radius: 50%; box-shadow: 0 0 5px #ff6600;"></div>
        <div style="margin-left: 5px; font-size: 14px;">READY</div>
      </div>
    `;
    this.container.appendChild(ammoIndicator);
    this.ammoIndicator = ammoIndicator;
    
    // Create camera mode indicator
    this.cameraMode = document.createElement('div');
    this.cameraMode.style.position = 'absolute';
    this.cameraMode.style.right = '20px';
    this.cameraMode.style.top = '20px';
    this.cameraMode.style.background = 'rgba(0, 0, 0, 0.5)';
    this.cameraMode.style.padding = '10px';
    this.cameraMode.style.borderRadius = '5px';
    this.cameraMode.style.textAlign = 'center';
    this.cameraMode.textContent = 'FOLLOW CAM';
    
    this.container.appendChild(this.cameraMode);
    
    // Create crosshair
    const crosshair = document.createElement('div');
    crosshair.style.position = 'absolute';
    crosshair.style.top = '50%';
    crosshair.style.left = '50%';
    crosshair.style.transform = 'translate(-50%, -50%)';
    crosshair.style.width = '20px';
    crosshair.style.height = '20px';
    crosshair.style.border = '2px solid rgba(255, 255, 255, 0.7)';
    crosshair.style.borderRadius = '50%';
    crosshair.style.boxSizing = 'border-box';
    
    // Add center dot
    const centerDot = document.createElement('div');
    centerDot.style.position = 'absolute';
    centerDot.style.top = '50%';
    centerDot.style.left = '50%';
    centerDot.style.transform = 'translate(-50%, -50%)';
    centerDot.style.width = '4px';
    centerDot.style.height = '4px';
    centerDot.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    centerDot.style.borderRadius = '50%';
    
    crosshair.appendChild(centerDot);
    this.container.appendChild(crosshair);
  }
  
  updateSpeed(speed) {
    const speedValue = document.getElementById('speed-value');
    if (speedValue) {
      speedValue.textContent = Math.round(speed);
      
      // Color-code the speed
      if (speed < 15) {
        speedValue.style.color = '#ff6666'; // Red (too slow)
      } else if (speed > 45) {
        speedValue.style.color = '#ffff66'; // Yellow (too fast)
      } else {
        speedValue.style.color = '#66ff66'; // Green (good range)
      }
    }
  }
  
  updateUFOCount(total, destroyed) {
    const ufoCounter = document.getElementById('ufo-counter');
    if (ufoCounter) {
      ufoCounter.textContent = `${destroyed} / ${total}`;
      
      // Color-code based on progress
      if (destroyed === 0) {
        ufoCounter.style.color = '#ffffff'; // White (not started)
      } else if (destroyed < total / 2) {
        ufoCounter.style.color = '#ffff66'; // Yellow (in progress)
      } else if (destroyed < total) {
        ufoCounter.style.color = '#66ff66'; // Green (good progress)
      } else {
        ufoCounter.style.color = '#66ffff'; // Cyan (complete)
      }
    }
  }
  
  updateWeaponStatus(isReady) {
    if (this.ammoIndicator) {
      const statusText = this.ammoIndicator.querySelector('div:last-child div:last-child');
      const statusDot = this.ammoIndicator.querySelector('div:last-child div:first-child');
      
      if (isReady) {
        statusText.textContent = 'READY';
        statusText.style.color = '#66ff66'; // Green
        statusDot.style.backgroundColor = '#ffff00';
        statusDot.style.boxShadow = '0 0 5px #ff6600';
      } else {
        statusText.textContent = 'RELOADING';
        statusText.style.color = '#ffff66'; // Yellow
        statusDot.style.backgroundColor = '#ff6600';
        statusDot.style.boxShadow = 'none';
      }
    }
  }
  
  updateCameraMode(isFollowMode) {
    if (this.cameraMode) {
      this.cameraMode.textContent = isFollowMode ? 'FOLLOW CAM' : 'FREE CAM';
    }
  }
} 