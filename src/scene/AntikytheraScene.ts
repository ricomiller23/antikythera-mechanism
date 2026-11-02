import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AntikytheraMaterials } from './materials.ts';
import { createAntikytheraGearGeometry } from './gearGeometry.ts';
import { FrontDials } from './dialsFront.ts';
import { BackDials } from './dialsBack.ts';
import { CometVisualizer } from './cometVisualizer.ts';
import { GearDefinition } from '../data/gears.ts';
import { AntikytheraKinematicsEngine, KinematicState } from '../kinematics/gearGraph.ts';

// Axle physical 2D coordinates on the central frame plate (in mm)
const AXLE_COORDINATES: Record<string, { x: number; y: number }> = {
  B: { x: 0, y: 0 },
  B_fixed: { x: 0, y: 0 },
  C: { x: 0, y: 38 },
  D: { x: -32, y: 38 },
  E: { x: 0, y: -24 },
  K: { x: 18, y: -24 },
  K_eccentric: { x: 19.1, y: -24 },
  L: { x: 28, y: 20 },
  M: { x: 42, y: 44 },
  N: { x: 0, y: 48 },
  O: { x: 22, y: 34 },
  P: { x: 22, y: 16 },
  Q: { x: 22, y: 0 },
  F: { x: -28, y: -38 },
  G: { x: 0, y: -48 },
  H: { x: 0, y: -36 },
  I: { x: 0, y: -48 },
  // Planetary arbors (Freeth 2021)
  Merc_Epi: { x: -22, y: -6 },
  Merc_Ring: { x: 0, y: 0 },
  Ven_Epi: { x: 24, y: -8 },
  Ven_Ring: { x: 0, y: 0 },
  Sup_Fixed: { x: 0, y: 0 },
  Mars_Ring: { x: 0, y: 0 },
  Jup_Ring: { x: 0, y: 0 },
  Sat_Ring: { x: 0, y: 0 }
};

export class AntikytheraScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;
  private materials: AntikytheraMaterials;
  private kinematicsEngine: AntikytheraKinematicsEngine;

  // Scene Components
  public frontDials: FrontDials;
  public backDials: BackDials;
  public comets: CometVisualizer;
  private gearMeshes: Map<string, THREE.Mesh> = new Map();
  private gearGroups: Map<string, THREE.Group> = new Map();
  private caseGroup: THREE.Group;
  private framePlatesGroup: THREE.Group;

  // State toggles
  public explodedSpread: number = 0.0;
  public showCase: boolean = true;
  private colorCodeGears: boolean = false;
  private showPlanets: boolean = true;
  private selectedGearId: string | null = null;
  public onGearSelect?: (gear: GearDefinition | null) => void;

  constructor(container: HTMLElement, kinematics: AntikytheraKinematicsEngine) {
    this.container = container;
    this.kinematicsEngine = kinematics;

    // 1. Scene & Camera Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0f17);

    const initialW = Math.max(container.clientWidth, 300);
    const initialH = Math.max(container.clientHeight, 300);
    const aspect = initialW / initialH;

    this.camera = new THREE.PerspectiveCamera(40, aspect, 1, 2500);

    // 2. High-Performance PBR Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(initialW, initialH, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Append canvas to container
    container.appendChild(this.renderer.domElement);

    // 3. 3D Orbit & Zoom Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 1.0;
    this.controls.minDistance = 60;
    this.controls.maxDistance = 1200;
    this.controls.enablePan = true;
    this.controls.screenSpacePanning = true;
    this.controls.target.set(0, 0, 0);

    // Set initial camera position framing the mechanism nicely
    this.fitToFrame();

    // 4. Lighting (Antique horological studio lighting)
    this.materials = new AntikytheraMaterials();
    this.setupLighting();

    // 5. Construct Gears & Subsystems
    this.caseGroup = new THREE.Group();
    this.caseGroup.name = 'bronzeCaseGroup';
    this.framePlatesGroup = new THREE.Group();
    this.framePlatesGroup.name = 'framePlatesGroup';

    this.scene.add(this.caseGroup);
    this.scene.add(this.framePlatesGroup);

    this.buildGears();
    this.buildCaseAndFramePlates();

    // 6. Mount Front and Back Dials & Comets
    this.frontDials = new FrontDials(this.materials);
    this.frontDials.group.position.z = 18;
    this.scene.add(this.frontDials.group);

    this.backDials = new BackDials(this.materials);
    this.backDials.group.position.z = -18;
    this.scene.add(this.backDials.group);

    this.comets = new CometVisualizer();
    this.scene.add(this.comets.group);

    // 7. Event Listeners & HUD wiring
    this.setupEventListeners();
  }

  private setupLighting() {
    // Warm key directional light
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(140, 160, 180);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Cool rim light from rear
    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.4);
    rimLight.position.set(-140, -100, -180);
    this.scene.add(rimLight);

    // Subtle amber ambient fill
    const ambLight = new THREE.AmbientLight(0x2d241e, 0.85);
    this.scene.add(ambLight);

    // Dial focal highlights
    const frontDialLight = new THREE.PointLight(0xfef08a, 1.0, 350);
    frontDialLight.position.set(0, 0, 90);
    this.scene.add(frontDialLight);

    const backDialLight = new THREE.PointLight(0x93c5fd, 0.9, 350);
    backDialLight.position.set(0, 0, -90);
    this.scene.add(backDialLight);
  }

  private buildGears() {
    for (const mesh of this.gearMeshes.values()) {
      this.scene.remove(mesh);
    }
    this.gearMeshes.clear();
    this.gearGroups.clear();

    const gearCatalog = this.kinematicsEngine.getGearDefinitions();

    for (const gear of gearCatalog) {
      const geom = createAntikytheraGearGeometry(gear);
      const mat = this.materials.getMaterialForGear(gear.subsystem, this.colorCodeGears);

      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = gear.id;
      mesh.userData = { gearDef: gear };

      const group = new THREE.Group();
      group.name = `gear_group_${gear.id}`;
      
      const coords = AXLE_COORDINATES[gear.axle] || { x: 0, y: 0 };
      group.position.set(coords.x, coords.y, gear.axialZ);

      group.add(mesh);
      this.scene.add(group);

      this.gearMeshes.set(gear.id, mesh);
      this.gearGroups.set(gear.id, group);
    }
  }

  private buildCaseAndFramePlates() {
    // 1. Bronze Structural Frame Plates (Per Fragment A)
    const plateWidth = 140;
    const plateHeight = 220;
    const plateThickness = 1.2;

    const plateGeom = new THREE.BoxGeometry(plateWidth, plateHeight, plateThickness);

    // Front frame plate
    const frontPlate = new THREE.Mesh(plateGeom, this.materials.caseBronze);
    frontPlate.position.set(0, 0, 16);
    this.framePlatesGroup.add(frontPlate);

    // Back frame plate
    const backPlate = new THREE.Mesh(plateGeom, this.materials.caseBronze);
    backPlate.position.set(0, 0, -16);
    this.framePlatesGroup.add(backPlate);

    // 2. Wooden Outer Cabinet with Bronze Inscribed Door Plates
    const caseDepth = 60;
    const caseGeom = new THREE.BoxGeometry(plateWidth + 18, plateHeight + 18, caseDepth);
    const caseWire = new THREE.BoxHelper(new THREE.Mesh(caseGeom), 0x92400e);
    this.caseGroup.add(caseWire);

    // Lateral wooden walls
    const wallMat = this.materials.caseWood;
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(6, plateHeight + 16, caseDepth), wallMat);
    leftWall.position.set(-(plateWidth / 2 + 6), 0, 0);
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(6, plateHeight + 16, caseDepth), wallMat);
    rightWall.position.set(plateWidth / 2 + 6, 0, 0);
    const topWall = new THREE.Mesh(new THREE.BoxGeometry(plateWidth + 18, 6, caseDepth), wallMat);
    topWall.position.set(0, plateHeight / 2 + 6, 0);
    const bottomWall = new THREE.Mesh(new THREE.BoxGeometry(plateWidth + 18, 6, caseDepth), wallMat);
    bottomWall.position.set(0, -(plateHeight / 2 + 6), 0);

    this.caseGroup.add(leftWall, rightWall, topWall, bottomWall);

    // Crank socket on right wall
    const crankSocketGeom = new THREE.CylinderGeometry(5, 5, 12, 16);
    const crankSocket = new THREE.Mesh(crankSocketGeom, this.materials.bronzeBase);
    crankSocket.rotation.z = Math.PI / 2;
    crankSocket.position.set(plateWidth / 2 + 10, 0, 0);
    this.caseGroup.add(crankSocket);
  }

  public rebuildGearsForTheory() {
    this.buildGears();
  }

  public setExplodedView(spread: number) {
    this.explodedSpread = spread;
    const gearCatalog = this.kinematicsEngine.getGearDefinitions();
    for (const gear of gearCatalog) {
      const group = this.gearGroups.get(gear.id);
      if (group) {
        const baseZ = gear.axialZ;
        group.position.z = baseZ + Math.sign(baseZ || 1) * spread * 18.0;
      }
    }

    this.frontDials.group.position.z = 18 + spread * 40;
    this.backDials.group.position.z = -18 - spread * 40;
  }

  public setShowCase(show: boolean) {
    this.showCase = show;
    this.caseGroup.visible = show;
    this.framePlatesGroup.visible = show;
  }

  public setColorCodeGears(enabled: boolean) {
    this.colorCodeGears = enabled;
    const gearCatalog = this.kinematicsEngine.getGearDefinitions();
    for (const gear of gearCatalog) {
      const mesh = this.gearMeshes.get(gear.id);
      if (mesh) {
        mesh.material = this.materials.getMaterialForGear(gear.subsystem, enabled);
      }
    }
  }

  public setShowPlanets(show: boolean) {
    this.showPlanets = show;
  }

  public calculateFrameDistance(): number {
    const aspect = this.camera.aspect || 1.0;
    const fovRad = (this.camera.fov * Math.PI) / 180;
    
    // Total bounding dimensions of the Antikythera case
    const caseHeight = 240; // mm
    const caseWidth = 160;  // mm
    const margin = 1.18;    // Clean breathing room, filling ~85% of viewport

    const distForHeight = (caseHeight * margin) / (2 * Math.tan(fovRad / 2));
    const distForWidth = (caseWidth * margin) / (2 * Math.tan(fovRad / 2) * aspect);

    return Math.max(distForHeight, distForWidth);
  }

  public fitToFrame() {
    const dist = this.calculateFrameDistance();
    this.controls.target.set(0, 0, 0);

    // Current direction vector from target
    const currentDir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
    if (currentDir.lengthSq() < 1) {
      // Default to slightly angled front view
      currentDir.set(dist * 0.1, dist * 0.15, dist);
    } else {
      currentDir.setLength(dist);
    }

    this.camera.position.copy(currentDir);
    this.controls.update();
  }

  public zoomIn(factor: number = 0.8) {
    const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
    const newLen = Math.max(this.controls.minDistance, offset.length() * factor);
    offset.setLength(newLen);
    this.camera.position.copy(this.controls.target).add(offset);
    this.controls.update();
  }

  public zoomOut(factor: number = 1.25) {
    const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
    const newLen = Math.min(this.controls.maxDistance, offset.length() * factor);
    offset.setLength(newLen);
    this.camera.position.copy(this.controls.target).add(offset);
    this.controls.update();
  }

  public setCameraPreset(preset: 'front' | 'back' | 'side' | 'gear_stack' | 'exploded') {
    const dist = this.calculateFrameDistance();
    this.controls.target.set(0, 0, 0);

    switch (preset) {
      case 'front':
        this.camera.position.set(0, 0, dist);
        this.setExplodedView(0.0);
        this.setShowCase(this.showCase);
        break;
      case 'back':
        this.camera.position.set(0, 0, -dist);
        this.setExplodedView(0.0);
        this.setShowCase(this.showCase);
        break;
      case 'side':
        this.camera.position.set(dist, 0, 0);
        this.setExplodedView(0.0);
        this.setShowCase(this.showCase);
        break;
      case 'gear_stack':
        this.camera.position.set(dist * 0.45, dist * 0.35, dist * 0.85);
        this.setShowCase(false);
        this.setExplodedView(0.6);
        break;
      case 'exploded':
        this.camera.position.set(dist * 0.55, dist * 0.45, dist * 1.0);
        this.setShowCase(false);
        this.setExplodedView(1.8);
        break;
    }
    this.controls.update();
  }

  public onResize() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    const w = Math.floor(rect.width) || this.container.clientWidth;
    const h = Math.floor(rect.height) || this.container.clientHeight;

    if (w <= 0 || h <= 0) return;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.controls.update();
  }

  private setupEventListeners() {
    // 1. ResizeObserver for responsive fluid canvas fitting
    const ro = new ResizeObserver(() => {
      this.onResize();
    });
    ro.observe(this.container);

    window.addEventListener('resize', () => {
      this.onResize();
    });

    // Double check on next frame when DOM flex layout has settled
    requestAnimationFrame(() => {
      this.onResize();
      this.fitToFrame();
    });

    // 2. Raycast Selection with drag tolerance
    const dom = this.renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    dom.addEventListener('pointerdown', (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    dom.addEventListener('pointerup', (e) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      // If user dragged to rotate or pan in 3D, do not trigger gear selection
      if (Math.hypot(dx, dy) > 6) return;

      const rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const meshes = Array.from(this.gearMeshes.values());
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const gearDef = hit.userData.gearDef as GearDefinition;
        this.selectGear(gearDef.id);
      } else {
        this.selectGear(null);
      }
    });

    // 3. Floating Viewport HUD Button wiring
    const btnZoomIn = document.getElementById('btn-zoom-in');
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => this.zoomIn());
    }

    const btnZoomOut = document.getElementById('btn-zoom-out');
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => this.zoomOut());
    }

    const btnFit = document.getElementById('btn-fit-frame');
    if (btnFit) {
      btnFit.addEventListener('click', () => this.fitToFrame());
    }

    const btnHudFront = document.getElementById('btn-hud-front');
    if (btnHudFront) {
      btnHudFront.addEventListener('click', () => this.setCameraPreset('front'));
    }

    const btnHudBack = document.getElementById('btn-hud-back');
    if (btnHudBack) {
      btnHudBack.addEventListener('click', () => this.setCameraPreset('back'));
    }

    const btnHudGears = document.getElementById('btn-hud-gears');
    if (btnHudGears) {
      btnHudGears.addEventListener('click', () => this.setCameraPreset('gear_stack'));
    }
  }

  public selectGear(gearId: string | null) {
    if (this.selectedGearId && this.gearMeshes.has(this.selectedGearId)) {
      const prevMesh = this.gearMeshes.get(this.selectedGearId)!;
      (prevMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = this.colorCodeGears ? 0.4 : 0.0;
    }

    this.selectedGearId = gearId;

    if (gearId && this.gearMeshes.has(gearId)) {
      const mesh = this.gearMeshes.get(gearId)!;
      (mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x38bdf8);
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
      if (this.onGearSelect) {
        this.onGearSelect(mesh.userData.gearDef as GearDefinition);
      }
    } else {
      if (this.onGearSelect) {
        this.onGearSelect(null);
      }
    }
  }

  public update(state: KinematicState, yearsElapsed: number) {
    for (const [id, angle] of Object.entries(state.gearAngles)) {
      const mesh = this.gearMeshes.get(id);
      if (mesh) {
        mesh.rotation.z = angle;
      }
    }

    this.frontDials.update(state, this.showPlanets);
    this.backDials.update(state);
    this.comets.update(yearsElapsed);
  }

  public render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
