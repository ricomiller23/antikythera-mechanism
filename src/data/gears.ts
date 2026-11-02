export type EpistemologicalStatus = 'ATTESTED' | 'INFERRED' | 'CONJECTURAL';

export type SubsystemType = 
  | 'sun' 
  | 'moon' 
  | 'anomaly' 
  | 'metonic' 
  | 'saros' 
  | 'games' 
  | 'callippic' 
  | 'exeligmos' 
  | 'mercury' 
  | 'venus' 
  | 'mars' 
  | 'jupiter' 
  | 'saturn';

export interface GearDefinition {
  id: string;
  name: string;
  teeth: number;
  axle: string;
  parentGearId: string | null;
  ratioMultiplier: number; // +1 or -1 for direction, or fractional step
  pitchRadius: number; // in mm (approx standard Hellenistic module m ≈ 0.6 - 1.2 mm)
  thickness: number;   // bronze plate thickness mm
  axialZ: number;      // position along axle (front to back)
  subsystem: SubsystemType;
  provenance: string;  // Fragment A, B, C, etc.
  status: EpistemologicalStatus;
  citation: string;
  theory: 'universal' | 'freeth2021' | 'wright' | 'price';
  notes?: string;
}

export const SUBSYSTEM_COLORS: Record<SubsystemType, { name: string; hex: string; glow: string }> = {
  sun: { name: 'Solar Train', hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  moon: { name: 'Lunar Sidereal', hex: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)' },
  anomaly: { name: 'Lunar Anomaly (Pin-and-Slot)', hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
  metonic: { name: 'Metonic Calendar', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
  saros: { name: 'Saros Eclipse Spiral', hex: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
  games: { name: 'Panhellenic Games Dial', hex: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' },
  callippic: { name: 'Callippic Cycle (76y)', hex: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
  exeligmos: { name: 'Exeligmos Cycle (54y)', hex: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },
  mercury: { name: 'Mercury Epicycle', hex: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)' },
  venus: { name: 'Venus Epicycle', hex: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)' },
  mars: { name: 'Mars Epicycle & Slot', hex: '#dc2626', glow: 'rgba(220, 38, 38, 0.4)' },
  jupiter: { name: 'Jupiter Epicycle & Slot', hex: '#d97706', glow: 'rgba(217, 119, 6, 0.4)' },
  saturn: { name: 'Saturn Epicycle & Slot', hex: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' }
};

export const MASTER_GEAR_CATALOG: GearDefinition[] = [
  // --- MAIN DRIVE & SOLAR TRAIN ---
  {
    id: 'b1',
    name: 'Main Drive Crown/Wheel B1',
    teeth: 223,
    axle: 'B',
    parentGearId: null,
    ratioMultiplier: 1.0,
    pitchRadius: 65.0,
    thickness: 2.2,
    axialZ: 0.0,
    subsystem: 'sun',
    provenance: 'Fragment A (wheel spoked with cross-bars)',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006 Nature 444, p. 587; Wright 2005',
    theory: 'universal',
    notes: 'Main drive wheel driven by crank pinion; makes 1 rev per tropical year'
  },
  {
    id: 'b2',
    name: 'Solar Hub Gear B2',
    teeth: 64,
    axle: 'B',
    parentGearId: 'b1',
    ratioMultiplier: 1.0,
    pitchRadius: 28.5,
    thickness: 1.8,
    axialZ: 3.5,
    subsystem: 'sun',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006 Table S1',
    theory: 'universal',
    notes: 'Fixed coaxially to B1; steps power into lunar and calendar trains'
  },
  {
    id: 'c1',
    name: 'Intermediate Idler C1',
    teeth: 38,
    axle: 'C',
    parentGearId: 'b2',
    ratioMultiplier: -64 / 38,
    pitchRadius: 17.0,
    thickness: 1.5,
    axialZ: 3.5,
    subsystem: 'moon',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006 Table S1',
    theory: 'universal'
  },
  {
    id: 'c2',
    name: 'Intermediate Step C2',
    teeth: 48,
    axle: 'C',
    parentGearId: 'c1',
    ratioMultiplier: 1.0,
    pitchRadius: 21.5,
    thickness: 1.5,
    axialZ: 6.5,
    subsystem: 'moon',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006 Table S1',
    theory: 'universal'
  },
  {
    id: 'd1',
    name: 'Reduction Pinion D1',
    teeth: 24,
    axle: 'D',
    parentGearId: 'c2',
    ratioMultiplier: -48 / 24,
    pitchRadius: 10.8,
    thickness: 1.5,
    axialZ: 6.5,
    subsystem: 'moon',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006 Table S1',
    theory: 'universal'
  },
  {
    id: 'd2',
    name: 'Great Sidereal Wheel D2',
    teeth: 127,
    axle: 'D',
    parentGearId: 'd1',
    ratioMultiplier: 1.0,
    pitchRadius: 56.7,
    thickness: 1.8,
    axialZ: 10.0,
    subsystem: 'moon',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006 Table S1; 127 = 254 / 2 half-sidereal months',
    theory: 'universal'
  },
  {
    id: 'e2',
    name: 'Lunar Drive Pinion E2',
    teeth: 32,
    axle: 'E',
    parentGearId: 'd2',
    ratioMultiplier: -127 / 32,
    pitchRadius: 14.3,
    thickness: 1.6,
    axialZ: 10.0,
    subsystem: 'moon',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006 Table S1; cumulative ratio 254/19 rev/year',
    theory: 'universal'
  },

  // --- LUNAR ANOMALY (PIN-AND-SLOT) ---
  {
    id: 'e3',
    name: 'Epicyclic Turntable Disk E3',
    teeth: 223,
    axle: 'E',
    parentGearId: null, // Driven by Saros cycle train
    ratioMultiplier: 1.0,
    pitchRadius: 66.5,
    thickness: 2.5,
    axialZ: 14.0,
    subsystem: 'anomaly',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006; carries the eccentric K1/K2 pin-and-slot arbors',
    theory: 'universal'
  },
  {
    id: 'e5',
    name: 'Turntable Input Gear E5',
    teeth: 50,
    axle: 'E',
    parentGearId: 'e2',
    ratioMultiplier: 1.0,
    pitchRadius: 22.0,
    thickness: 1.4,
    axialZ: 16.5,
    subsystem: 'anomaly',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006 Table S1',
    theory: 'universal'
  },
  {
    id: 'k1',
    name: 'Pin Driving Wheel K1',
    teeth: 50,
    axle: 'K',
    parentGearId: 'e5',
    ratioMultiplier: -1.0,
    pitchRadius: 22.0,
    thickness: 1.4,
    axialZ: 16.5,
    subsystem: 'anomaly',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006; carries the driving pin for the slot mechanism',
    theory: 'universal'
  },
  {
    id: 'k2',
    name: 'Slotted Follower Wheel K2',
    teeth: 50,
    axle: 'K_eccentric',
    parentGearId: 'k1',
    ratioMultiplier: 1.0, // Non-linear angular velocity modulation
    pitchRadius: 22.0,
    thickness: 1.4,
    axialZ: 19.0,
    subsystem: 'anomaly',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006; offset by 1.1 mm to model lunar first anomaly',
    theory: 'universal'
  },
  {
    id: 'e6',
    name: 'Anomaly Return Wheel E6',
    teeth: 50,
    axle: 'E',
    parentGearId: 'k2',
    ratioMultiplier: -1.0,
    pitchRadius: 22.0,
    thickness: 1.4,
    axialZ: 19.0,
    subsystem: 'anomaly',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006 Table S1',
    theory: 'universal'
  },
  {
    id: 'b3',
    name: 'True Lunar Pointer Hub B3',
    teeth: 64,
    axle: 'B',
    parentGearId: 'e6',
    ratioMultiplier: -1.0,
    pitchRadius: 28.5,
    thickness: 1.6,
    axialZ: 22.0,
    subsystem: 'moon',
    provenance: 'Fragment A',
    status: 'INFERRED',
    citation: 'Freeth et al. 2006; coaxial tube to front Moon hand',
    theory: 'universal'
  },

  // --- METONIC 5-TURN SPIRAL & UPPER BACK TRAIN ---
  {
    id: 'l1',
    name: 'Metonic Intermediate L1',
    teeth: 36,
    axle: 'L',
    parentGearId: 'b2',
    ratioMultiplier: -64 / 36,
    pitchRadius: 16.2,
    thickness: 1.5,
    axialZ: 3.5,
    subsystem: 'metonic',
    provenance: 'Fragment B',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2008 Nature 454; AMRP CT scans',
    theory: 'universal'
  },
  {
    id: 'l2',
    name: 'Metonic Intermediate L2',
    teeth: 38,
    axle: 'L',
    parentGearId: 'l1',
    ratioMultiplier: 1.0,
    pitchRadius: 17.0,
    thickness: 1.5,
    axialZ: 6.0,
    subsystem: 'metonic',
    provenance: 'Fragment B',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2008 Nature 454',
    theory: 'universal'
  },
  {
    id: 'm1',
    name: 'Metonic Great Wheel M1',
    teeth: 96,
    axle: 'M',
    parentGearId: 'l2',
    ratioMultiplier: -38 / 96,
    pitchRadius: 43.0,
    thickness: 1.8,
    axialZ: 6.0,
    subsystem: 'metonic',
    provenance: 'Fragment B',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2008 Nature 454',
    theory: 'universal'
  },
  {
    id: 'm2',
    name: 'Metonic Drive Pinion M2',
    teeth: 16,
    axle: 'M',
    parentGearId: 'm1',
    ratioMultiplier: 1.0,
    pitchRadius: 7.2,
    thickness: 1.6,
    axialZ: 9.0,
    subsystem: 'metonic',
    provenance: 'Fragment B',
    status: 'INFERRED',
    citation: 'Freeth et al. 2008 Nature 454',
    theory: 'universal'
  },
  {
    id: 'n1',
    name: 'Metonic Spiral Pointer Gear N1',
    teeth: 53,
    axle: 'N',
    parentGearId: 'm2',
    ratioMultiplier: -16 / 53,
    pitchRadius: 23.8,
    thickness: 1.6,
    axialZ: 9.0,
    subsystem: 'metonic',
    provenance: 'Fragment B (inferred from 5-turn Archimedean spiral tracking 235 cells)',
    status: 'INFERRED',
    citation: 'Freeth et al. 2008 Nature 454; drives 5-turn Metonic pointer',
    theory: 'universal'
  },

  // --- OLYMPIAD / PANHELLENIC GAMES DIAL ---
  {
    id: 'o1',
    name: 'Olympiad Idler O1',
    teeth: 60,
    axle: 'O',
    parentGearId: 'm2',
    ratioMultiplier: -16 / 60,
    pitchRadius: 27.0,
    thickness: 1.4,
    axialZ: 12.0,
    subsystem: 'games',
    provenance: 'Fragment B',
    status: 'INFERRED',
    citation: 'Freeth et al. 2008 Nature 454; Jones 2016',
    theory: 'universal'
  },
  {
    id: 'p1',
    name: 'Olympiad Intermediate P1',
    teeth: 15,
    axle: 'P',
    parentGearId: 'o1',
    ratioMultiplier: -60 / 15,
    pitchRadius: 6.8,
    thickness: 1.4,
    axialZ: 12.0,
    subsystem: 'games',
    provenance: 'Fragment B',
    status: 'INFERRED',
    citation: 'Freeth et al. 2008 Nature 454',
    theory: 'universal'
  },
  {
    id: 'q1',
    name: 'Games Dial Hand Wheel Q1',
    teeth: 60,
    axle: 'Q',
    parentGearId: 'p1',
    ratioMultiplier: -15 / 60,
    pitchRadius: 27.0,
    thickness: 1.4,
    axialZ: 15.0,
    subsystem: 'games',
    provenance: 'Fragment B (inscriptions show 4-year cycle running anticlockwise)',
    status: 'INFERRED',
    citation: 'Freeth et al. 2008; Jones 2016; 1 rev in 4 years',
    theory: 'universal'
  },

  // --- SAROS 4-TURN SPIRAL & LOWER BACK TRAIN ---
  {
    id: 'e4',
    name: 'Saros Step Wheel E4',
    teeth: 188,
    axle: 'E',
    parentGearId: 'e3',
    ratioMultiplier: 1.0,
    pitchRadius: 56.4,
    thickness: 1.8,
    axialZ: 25.0,
    subsystem: 'saros',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006 Nature 444',
    theory: 'universal'
  },
  {
    id: 'f1',
    name: 'Saros Idler F1',
    teeth: 54,
    axle: 'F',
    parentGearId: 'e4',
    ratioMultiplier: -188 / 54,
    pitchRadius: 24.3,
    thickness: 1.5,
    axialZ: 25.0,
    subsystem: 'saros',
    provenance: 'Fragment A',
    status: 'ATTESTED',
    citation: 'Freeth et al. 2006 Table S1',
    theory: 'universal'
  },
  {
    id: 'f2',
    name: 'Saros Drive Pinion F2',
    teeth: 20,
    axle: 'F',
    parentGearId: 'f1',
    ratioMultiplier: 1.0,
    pitchRadius: 9.0,
    thickness: 1.5,
    axialZ: 28.0,
    subsystem: 'saros',
    provenance: 'Fragment A',
    status: 'INFERRED',
    citation: 'Freeth et al. 2006 Table S1',
    theory: 'universal'
  },
  {
    id: 'g1',
    name: 'Saros Spiral Pointer Wheel G1',
    teeth: 60,
    axle: 'G',
    parentGearId: 'f2',
    ratioMultiplier: -20 / 60,
    pitchRadius: 27.0,
    thickness: 1.6,
    axialZ: 28.0,
    subsystem: 'saros',
    provenance: 'Fragment A',
    status: 'INFERRED',
    citation: 'Freeth et al. 2006 Nature 444; drives 4-turn Saros 223-month pointer',
    theory: 'universal'
  },

  // --- EXELIGMOS (54-YEAR) DIAL ---
  {
    id: 'h1',
    name: 'Exeligmos Reduction H1',
    teeth: 15,
    axle: 'H',
    parentGearId: 'g1',
    ratioMultiplier: -1.0,
    pitchRadius: 6.8,
    thickness: 1.4,
    axialZ: 31.0,
    subsystem: 'exeligmos',
    provenance: 'Fragment A (lower back subdial)',
    status: 'INFERRED',
    citation: 'Freeth et al. 2008 Nature 454; 1 rev in 3 Saros cycles (54y 33d)',
    theory: 'universal'
  },
  {
    id: 'i1',
    name: 'Exeligmos Hand Wheel I1',
    teeth: 45,
    axle: 'I',
    parentGearId: 'h1',
    ratioMultiplier: -15 / 45, // 1/3 ratio
    pitchRadius: 20.2,
    thickness: 1.4,
    axialZ: 31.0,
    subsystem: 'exeligmos',
    provenance: 'Fragment A',
    status: 'INFERRED',
    citation: 'Freeth et al. 2008 Nature 454; sectors 0h, 8h, 16h',
    theory: 'universal'
  },

  // --- PLANETARY RECONSTRUCTION (FREETH ET AL. 2021) ---
  // Mercury (145 synodic in 46 years)
  {
    id: 'merc_fixed_51',
    name: 'Mercury Fixed Sun Sun-Gear',
    teeth: 51,
    axle: 'B_fixed',
    parentGearId: null,
    ratioMultiplier: 0.0,
    pitchRadius: 23.0,
    thickness: 1.2,
    axialZ: -4.0,
    subsystem: 'mercury',
    provenance: 'Reconstructed (Freeth 2021)',
    status: 'CONJECTURAL',
    citation: 'Freeth et al. 2021 Sci Rep 11:5821',
    theory: 'freeth2021'
  },
  {
    id: 'merc_epi_27',
    name: 'Mercury Epicyclic Idler',
    teeth: 27,
    axle: 'Merc_Epi',
    parentGearId: 'merc_fixed_51',
    ratioMultiplier: 51 / 27,
    pitchRadius: 12.2,
    thickness: 1.2,
    axialZ: -4.0,
    subsystem: 'mercury',
    provenance: 'Reconstructed (Freeth 2021)',
    status: 'CONJECTURAL',
    citation: 'Freeth et al. 2021 Sci Rep 11:5821',
    theory: 'freeth2021'
  },
  {
    id: 'merc_ring_63',
    name: 'Mercury Output Ring',
    teeth: 63,
    axle: 'Merc_Ring',
    parentGearId: 'merc_epi_27',
    ratioMultiplier: 27 / 63,
    pitchRadius: 36.0,
    thickness: 1.2,
    axialZ: -6.0,
    subsystem: 'mercury',
    provenance: 'Reconstructed (Freeth 2021)',
    status: 'CONJECTURAL',
    citation: 'Freeth et al. 2021; period relation 145/46 synodic',
    theory: 'freeth2021'
  },

  // Venus (289 synodic in 462 years - FCI Inscription)
  {
    id: 'ven_epi_63',
    name: 'Venus Epicyclic Input',
    teeth: 63,
    axle: 'Ven_Epi',
    parentGearId: 'merc_fixed_51',
    ratioMultiplier: 51 / 63,
    pitchRadius: 28.3,
    thickness: 1.2,
    axialZ: -8.0,
    subsystem: 'venus',
    provenance: 'Reconstructed (Freeth 2021; 462y on Fragment 19)',
    status: 'CONJECTURAL',
    citation: 'Freeth et al. 2021 Sci Rep 11:5821',
    theory: 'freeth2021'
  },
  {
    id: 'ven_ring_64',
    name: 'Venus Output Ring',
    teeth: 64,
    axle: 'Ven_Ring',
    parentGearId: 'ven_epi_63',
    ratioMultiplier: 33 / 64,
    pitchRadius: 42.0,
    thickness: 1.2,
    axialZ: -10.0,
    subsystem: 'venus',
    provenance: 'Reconstructed (Freeth 2021)',
    status: 'CONJECTURAL',
    citation: 'Freeth et al. 2021; 289 synodic in 462 years',
    theory: 'freeth2021'
  },

  // Mars (133 synodic in 284 years)
  {
    id: 'mars_fixed_56',
    name: 'Superior Fixed Sun Wheel 56T',
    teeth: 56,
    axle: 'Sup_Fixed',
    parentGearId: null,
    ratioMultiplier: 0.0,
    pitchRadius: 25.2,
    thickness: 1.2,
    axialZ: -12.0,
    subsystem: 'mars',
    provenance: 'Reconstructed (Freeth 2021)',
    status: 'CONJECTURAL',
    citation: 'Freeth et al. 2021 Sci Rep 11:5821',
    theory: 'freeth2021'
  },
  {
    id: 'mars_ring_71',
    name: 'Mars Pin-and-Slot Ring',
    teeth: 71,
    axle: 'Mars_Ring',
    parentGearId: 'mars_fixed_56',
    ratioMultiplier: 56 / 71,
    pitchRadius: 48.0,
    thickness: 1.2,
    axialZ: -14.0,
    subsystem: 'mars',
    provenance: 'Reconstructed (Freeth 2021)',
    status: 'CONJECTURAL',
    citation: 'Freeth et al. 2021; 133 synodic in 284 years',
    theory: 'freeth2021'
  },

  // Jupiter (398 synodic in 427 years)
  {
    id: 'jup_ring_64',
    name: 'Jupiter Pin-and-Slot Ring',
    teeth: 64,
    axle: 'Jup_Ring',
    parentGearId: 'mars_fixed_56',
    ratioMultiplier: 56 / 64,
    pitchRadius: 54.0,
    thickness: 1.2,
    axialZ: -16.0,
    subsystem: 'jupiter',
    provenance: 'Reconstructed (Freeth 2021)',
    status: 'CONJECTURAL',
    citation: 'Freeth et al. 2021; 398 synodic in 427 years',
    theory: 'freeth2021'
  },

  // Saturn (427 synodic in 442 years - FCI Inscription)
  {
    id: 'sat_ring_52',
    name: 'Saturn Pin-and-Slot Ring',
    teeth: 52,
    axle: 'Sat_Ring',
    parentGearId: 'mars_fixed_56',
    ratioMultiplier: 56 / 52,
    pitchRadius: 60.0,
    thickness: 1.2,
    axialZ: -18.0,
    subsystem: 'saturn',
    provenance: 'Reconstructed (Freeth 2021; 442y on Fragment 19)',
    status: 'CONJECTURAL',
    citation: 'Freeth et al. 2021; 427 synodic in 442 years',
    theory: 'freeth2021'
  }
];
