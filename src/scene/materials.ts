import * as THREE from 'three';
import { SubsystemType, SUBSYSTEM_COLORS } from '../data/gears.ts';

export class AntikytheraMaterials {
  // PBR Antique Hellenistic Bronze
  public bronzeBase: THREE.MeshStandardMaterial;
  // Ancient Corroded Verdigris Patina
  public verdigrisPatina: THREE.MeshStandardMaterial;
  // Polished Gold Leaf for Celestial Sun Hand
  public goldFoil: THREE.MeshStandardMaterial;
  // Dark Oxidized Iron/Bronze Arbor Spindles
  public oxidizedDark: THREE.MeshStandardMaterial;
  // Case Wooden/Bronze Frame Material
  public caseBronze: THREE.MeshStandardMaterial;
  public caseWood: THREE.MeshStandardMaterial;
  // Dial Plate Material with Inscriptions
  public dialPlateMaterial: THREE.MeshStandardMaterial;

  // Moon Phase Sphere Materials
  public moonSilverSide: THREE.MeshStandardMaterial;
  public moonBlackSide: THREE.MeshStandardMaterial;

  // Subsystem Color Overlay Materials for Color-Code Mode
  public subsystemMaterials: Record<SubsystemType, THREE.MeshStandardMaterial>;

  constructor() {
    this.bronzeBase = new THREE.MeshStandardMaterial({
      color: 0xc89658,
      metalness: 0.85,
      roughness: 0.35,
      name: 'bronzeBase'
    });

    this.verdigrisPatina = new THREE.MeshStandardMaterial({
      color: 0x489080,
      metalness: 0.3,
      roughness: 0.75,
      name: 'verdigrisPatina'
    });

    this.goldFoil = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x78350f,
      emissiveIntensity: 0.25,
      name: 'goldFoil'
    });

    this.oxidizedDark = new THREE.MeshStandardMaterial({
      color: 0x242426,
      metalness: 0.6,
      roughness: 0.6,
      name: 'oxidizedDark'
    });

    this.caseBronze = new THREE.MeshStandardMaterial({
      color: 0xa07840,
      metalness: 0.75,
      roughness: 0.45,
      name: 'caseBronze'
    });

    this.caseWood = new THREE.MeshStandardMaterial({
      color: 0x3d2b1f,
      metalness: 0.05,
      roughness: 0.85,
      name: 'caseWood'
    });

    this.dialPlateMaterial = new THREE.MeshStandardMaterial({
      color: 0xbfa068,
      metalness: 0.8,
      roughness: 0.4,
      name: 'dialPlateMaterial'
    });

    this.moonSilverSide = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.3,
      name: 'moonSilverSide'
    });

    this.moonBlackSide = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.1,
      roughness: 0.9,
      name: 'moonBlackSide'
    });

    this.subsystemMaterials = {} as Record<SubsystemType, THREE.MeshStandardMaterial>;
    const keys = Object.keys(SUBSYSTEM_COLORS) as SubsystemType[];
    for (const key of keys) {
      const cfg = SUBSYSTEM_COLORS[key];
      this.subsystemMaterials[key] = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cfg.hex),
        metalness: 0.85,
        roughness: 0.3,
        emissive: new THREE.Color(cfg.hex),
        emissiveIntensity: 0.4,
        name: `subsystem_${key}`
      });
    }
  }

  public getMaterialForGear(subsystem: SubsystemType, colorCodeEnabled: boolean): THREE.Material {
    if (colorCodeEnabled) {
      return this.subsystemMaterials[subsystem] || this.bronzeBase;
    }
    return this.bronzeBase;
  }
}
