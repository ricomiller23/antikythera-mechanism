import * as THREE from 'three';
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
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
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

  // Controls & Interaction
  private isDragging: boolean = false;
  private previousMousePosition = { x: 0, y: 0 };
  private cameraTarget = new THREE.Vector3(0, 0, 0);
  private cameraSpherical = new THREE.Spherical(220, Math.PI / 2.3, 0.2);
  
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

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 1, 2000);
    this.updateCameraPosition();

    // 2. High-Performance PBR Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 3. Lighting (Antique horological studio lighting)
    this.materials = new AntikytheraMaterials();
    this.setupLighting();

    // 4. Construct Gears & Subsystems
    this.caseGroup = new THREE.Group();
    this.caseGroup.name = 'bronzeCaseGroup';
    this.framePlatesGroup = new THREE.Group();
    this.framePlatesGroup.name = 'framePlatesGroup';

    this.scene.add(this.caseGroup);
    this.scene.add(this.framePlatesGroup);

    this.buildGears();
    this.buildCaseAndFramePlates();

    // 5. Mount Front and Back Dials & Comets
    this.frontDials = new FrontDials(this.materials);
    this.frontDials.group.position.z = 18;
    this.scene.add(this.frontDials.group);

    this.backDials = new BackDials(this.materials);
    this.backDials.group.position.z = -18;
    this.scene.add(this.backDials.group);

    this.comets = new CometVisualizer();
    this.scene.add(this.comets.group);

    // 6. User Interactions
    this.setupEventListeners();
  }

  private setupLighting() {
    // Warm key directional light
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(120, 140, 160);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Cool rim light from rear
    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.4);
    rimLight.position.set(-120, -80, -160);
    this.scene.add(rimLight);

    // Subtle amber ambient fill
    const ambLight = new THREE.AmbientLight(0x2d241e, 0.85);
    this.scene.add(ambLight);

    // Dial focal highlights
    const frontDialLight = new THREE.PointLight(0xfef08a, 1.0, 300);
    frontDialLight.position.set(0, 0, 80);
    this.scene.add(frontDialLight);

    const backDialLight = new THREE.PointLight(0x93c5fd, 0.9, 300);
    backDialLight.position.set(0, 0, -80);
    this.scene.add(backDialLight);
  }

  private buildGears() {
    // Clear any previous meshes
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

      // Each gear is wrapped in a group for independent axial positioning and rotation
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
    // Displace each gear group along Z by its native axialZ * (1 + spread)
    const gearCatalog = this.kinematicsEngine.getGearDefinitions();
    for (const gear of gearCatalog) {
      const group = this.gearGroups.get(gear.id);
      if (group) {
        const baseZ = gear.axialZ;
        group.position.z = baseZ + Math.sign(baseZ || 1) * spread * 18.0;
      }
    }

    // Displace dial plates
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

  public setCameraPreset(preset: 'front' | 'back' | 'side' | 'gear_stack' | 'exploded') {
    switch (preset) {
      case 'front':
        this.cameraSpherical.set(220, Math.PI / 2, 0);
        this.setExplodedView(0.0);
        break;
      case 'back':
        this.cameraSpherical.set(220, Math.PI / 2, Math.PI);
        this.setExplodedView(0.0);
        break;
      case 'side':
        this.cameraSpherical.set(220, Math.PI / 2, Math.PI / 2);
        this.setExplodedView(0.0);
        break;
      case 'gear_stack':
        this.cameraSpherical.set(200, Math.PI / 2.6, 0.45);
        this.setShowCase(false);
        this.setExplodedView(0.6);
        break;
      case 'exploded':
        this.cameraSpherical.set(260, Math.PI / 2.4, 0.7);
        this.setShowCase(false);
        this.setExplodedView(1.8);
        break;
    }
    this.updateCameraPosition();
  }

  private updateCameraPosition() {
    this.camera.position.setFromSpherical(this.cameraSpherical).add(this.cameraTarget);
    this.camera.lookAt(this.cameraTarget);
  }

  private setupEventListeners() {
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    dom.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.cameraSpherical.theta -= deltaX * 0.008;
        this.cameraSpherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraSpherical.phi + deltaY * 0.008));
        this.updateCameraPosition();

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraSpherical.radius = Math.max(50, Math.min(600, this.cameraSpherical.radius + e.deltaY * 0.25));
      this.updateCameraPosition();
    }, { passive: false });

    // Click / Raycast Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    dom.addEventListener('click', (e) => {
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

    window.addEventListener('resize', () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  public selectGear(gearId: string | null) {
    // Reset previous selection emissive
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
    // 1. Rotate each physical gear mesh strictly per its kinematic angle
    for (const [id, angle] of Object.entries(state.gearAngles)) {
      const mesh = this.gearMeshes.get(id);
      if (mesh) {
        mesh.rotation.z = angle;
      }
    }

    // 2. Update Front Dials (Sun, Moon phase, Planets)
    this.frontDials.update(state, this.showPlanets);

    // 3. Update Back Dials (Metonic, Games, Saros, Exeligmos)
    this.backDials.update(state);

    // 4. Update Modern Comet Tracks Overlay
    this.comets.update(yearsElapsed);
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}
