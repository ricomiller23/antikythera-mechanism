import { AntikytheraKinematicsEngine } from './kinematics/gearGraph.ts';
import { AntikytheraScene } from './scene/AntikytheraScene.ts';
import { AntikytheraDashboard } from './ui/Dashboard.ts';

window.addEventListener('DOMContentLoaded', () => {
  const canvasContainer = document.getElementById('canvas-container');
  const dashboardContainer = document.getElementById('dashboard-container');

  if (!canvasContainer || !dashboardContainer) {
    console.error('DOM initialization failed: containers not found.');
    return;
  }

  // 1. Initialize Kinematic State Engine
  const kinematics = new AntikytheraKinematicsEngine();

  // 2. Initialize 3D Three.js WebGL Scene
  const scene = new AntikytheraScene(canvasContainer, kinematics);

  // 3. Initialize Interactive Dashboard & Astronomical Lab
  const dashboard = new AntikytheraDashboard(dashboardContainer, kinematics, scene);

  // 4. Master 60fps Kinematic Render Loop
  function animate(timestamp: number) {
    requestAnimationFrame(animate);

    // Update transport & time scrubbing
    dashboard.tick(timestamp);

    // Compute exact gear rotations and pointer positions
    const jd = kinematics.getJulianDay();
    const epochJD = kinematics.getEpochJDN();
    const state = kinematics.computeKinematics(jd);
    const yearsElapsed = (jd - epochJD) / 365.2422;

    // Drive 3D model
    scene.update(state, yearsElapsed);

    // Render WebGL frame
    scene.render();
  }

  requestAnimationFrame(animate);
});
