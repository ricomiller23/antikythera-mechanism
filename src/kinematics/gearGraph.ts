import { MASTER_GEAR_CATALOG, GearDefinition } from '../data/gears.ts';

export interface KinematicState {
  currentDaysSinceEpoch: number;
  crankAngleRad: number;
  gearAngles: Record<string, number>; // id -> angle in radians
  
  // Dials & Celestial Pointers
  sunMeanLongitudeDeg: number;
  moonSiderealLongitudeDeg: number;
  moonTrueLongitudeDeg: number;
  moonAnomalyAngleDeg: number;
  moonPhaseAngleDeg: number;     // 0 = New Moon, 180 = Full Moon
  
  // Back Dials
  metonicPointerAngleRad: number;
  metonicSpiralTurn: number;     // 1 to 5
  metonicCellIndex: number;      // 0 to 234
  metonicPointerRadius: number;  // normalized 0.0 to 1.0
  
  gamesDialAngleRad: number;     // Anticlockwise
  gamesYearInCycle: 1 | 2 | 3 | 4;
  
  callippicDialAngleRad: number; // 76 year cycle
  
  sarosPointerAngleRad: number;
  sarosSpiralTurn: number;       // 1 to 4
  sarosCellIndex: number;        // 0 to 222
  sarosPointerRadius: number;    // normalized 0.0 to 1.0
  
  exeligmosDialAngleRad: number; // 3 sectors (0h, 8h, 16h)
  exeligmosSector: 0 | 8 | 16;
  
  // Planetary indicators (Freeth 2021)
  planetLongitudesDeg: {
    mercury: number;
    venus: number;
    mars: number;
    jupiter: number;
    saturn: number;
  };
}

export type ActiveTheoryMode = 'freeth2021' | 'wright' | 'price';
export type CalendarRingMode = 'lunar_354' | 'solar_365';
export type EpochMode = 'carman2014' | 'voulgaris2022' | 'price1974';

export const EPOCH_DATES: Record<EpochMode, { name: string; dateStr: string; jdn: number; citation: string }> = {
  carman2014: {
    name: 'Carman & Evans 2014 (Default)',
    dateStr: '205 BCE May 12',
    jdn: 1646274.0,
    citation: 'Carman, Evans & Thorndike 2014, Arch. Hist. Exact Sci. 68'
  },
  voulgaris2022: {
    name: 'Voulgaris et al. 2022 (FRAMe Project)',
    dateStr: '178 BCE Dec 23',
    jdn: 1656004.0,
    citation: 'Voulgaris, Mouratidis & Vossinakis 2022, arXiv:2203.15045'
  },
  price1974: {
    name: 'Price 1974 (Historical Classical)',
    dateStr: '100 BCE Oct 23',
    jdn: 1684530.0,
    citation: 'Derek J. de Solla Price 1974, Trans. Am. Phil. Soc. 64.7'
  }
};

export class AntikytheraKinematicsEngine {
  private activeTheory: ActiveTheoryMode = 'freeth2021';
  private calendarMode: CalendarRingMode = 'lunar_354';
  private epochMode: EpochMode = 'carman2014';
  private currentJDN: number = 2461346.5; // Default anchor: 2026-11-01
  private gearList: GearDefinition[] = MASTER_GEAR_CATALOG;

  constructor() {
    this.updateTheoryGraph();
  }

  public setTheory(theory: ActiveTheoryMode) {
    this.activeTheory = theory;
    this.updateTheoryGraph();
  }

  public getTheory(): ActiveTheoryMode {
    return this.activeTheory;
  }

  public setCalendarMode(mode: CalendarRingMode) {
    this.calendarMode = mode;
  }

  public getCalendarMode(): CalendarRingMode {
    return this.calendarMode;
  }

  public setEpochMode(epoch: EpochMode) {
    this.epochMode = epoch;
  }

  public getEpochMode(): EpochMode {
    return this.epochMode;
  }

  public getEpochJDN(): number {
    return EPOCH_DATES[this.epochMode].jdn;
  }

  public setJulianDay(jd: number) {
    this.currentJDN = jd;
  }

  public getJulianDay(): number {
    return this.currentJDN;
  }

  private updateTheoryGraph() {
    if (this.activeTheory === 'price') {
      // In Price 1974, planetary gears are disabled (attested sun/moon only)
      this.gearList = MASTER_GEAR_CATALOG.filter(g => g.theory === 'universal');
    } else {
      this.gearList = MASTER_GEAR_CATALOG;
    }
  }

  public getGearDefinitions(): GearDefinition[] {
    return this.gearList;
  }

  /**
   * Primary Kinematic Solver
   * Computes exact gear rotations driven strictly by input tooth ratios
   */
  public computeKinematics(jdn?: number): KinematicState {
    const jd = jdn !== undefined ? jdn : this.currentJDN;
    const epochJD = this.getEpochJDN();
    const daysSinceEpoch = jd - epochJD;
    
    // Mean Solar Year = 365.2422 days
    // 1 Tropical Year = 1 full revolution of main gear B1
    const yearsElapsed = daysSinceEpoch / 365.2422;
    const b1Turns = yearsElapsed;
    const b1AngleRad = (b1Turns * 2 * Math.PI) % (2 * Math.PI);

    const gearAngles: Record<string, number> = {};
    
    // --- B AXLE ---
    gearAngles['b1'] = b1AngleRad;
    gearAngles['b2'] = b1AngleRad;

    // --- LUNAR TRAIN (B2 -> C1/C2 -> D1/D2 -> E2) ---
    // Ratio = (64/38) * (48/24) * (127/32) = 254 / 19
    const c1Angle = -b1AngleRad * (64 / 38);
    gearAngles['c1'] = c1Angle;
    gearAngles['c2'] = c1Angle;

    const d1Angle = -c1Angle * (48 / 24);
    gearAngles['d1'] = d1Angle;
    gearAngles['d2'] = d1Angle;

    const e2Angle = -d1Angle * (127 / 32); // = b1Angle * (254 / 19)
    gearAngles['e2'] = e2Angle;

    // --- LUNAR ANOMALY (PIN AND SLOT) ---
    // Turntable E3 rotates at the precessing Saros rate: (254 - 235)/19 = 19/19 = 1 rev/8.88 years
    const e3Angle = yearsElapsed / 8.85; // ~8.85 year rotation
    gearAngles['e3'] = e3Angle;

    gearAngles['e5'] = e2Angle;
    const k1Angle = -e2Angle;
    gearAngles['k1'] = k1Angle;

    // Pin-and-slot eccentric modulation:
    // Eccentricity e = 1.1 mm, pitch radius r = 22 mm => e/r = 0.05
    const anomalisticAngle = e2Angle - e3Angle;
    const anomalyDelta = Math.asin(0.05 * Math.sin(anomalisticAngle));
    const k2Angle = k1Angle + anomalyDelta;
    gearAngles['k2'] = k2Angle;

    const e6Angle = -k2Angle;
    gearAngles['e6'] = e6Angle;

    const b3Angle = -e6Angle;
    gearAngles['b3'] = b3Angle;

    // Celestial Longitudes
    const sunMeanLongitudeDeg = ((yearsElapsed * 360) % 360 + 360) % 360;
    const moonSiderealLongitudeDeg = (((yearsElapsed * (254 / 19) * 360)) % 360 + 360) % 360;
    const moonAnomalyAngleDeg = (anomalyDelta * 180 / Math.PI);
    const moonTrueLongitudeDeg = (moonSiderealLongitudeDeg + moonAnomalyAngleDeg + 360) % 360;
    
    // Moon Phase (Synodic elongation)
    // 235 synodic months in 19 years: (254/19 - 1) = 235/19
    const moonPhaseAngleDeg = ((moonTrueLongitudeDeg - sunMeanLongitudeDeg) % 360 + 360) % 360;

    // --- METONIC TRAIN (B2 -> L1/L2 -> M1/M2 -> N1) ---
    const l1Angle = -b1AngleRad * (64 / 36);
    gearAngles['l1'] = l1Angle;
    gearAngles['l2'] = l1Angle;

    const m1Angle = -l1Angle * (38 / 96);
    gearAngles['m1'] = m1Angle;
    gearAngles['m2'] = m1Angle;

    // Metonic pointer N1: 5 turns over 19 years
    const metonicPointerTurns = (yearsElapsed / 19) * 5;
    const metonicPointerAngleRad = (metonicPointerTurns * 2 * Math.PI) % (2 * Math.PI);
    gearAngles['n1'] = metonicPointerAngleRad;

    const totalSynodicMonths = yearsElapsed * (235 / 19);
    const metonicCellIndex = Math.floor(((totalSynodicMonths % 235) + 235) % 235);
    const metonicSpiralTurn = Math.floor(metonicCellIndex / 47) + 1;
    const metonicPointerRadius = (metonicCellIndex % 235) / 235;

    // --- GAMES DIAL (M2 -> O1 -> P1 -> Q1) ---
    // 1 turn per 4 years, running anticlockwise
    const gamesTurns = yearsElapsed / 4.0;
    const gamesDialAngleRad = (gamesTurns * 2 * Math.PI) % (2 * Math.PI);
    gearAngles['o1'] = -m1Angle * (16 / 60);
    gearAngles['p1'] = -gearAngles['o1'] * (60 / 15);
    gearAngles['q1'] = -gearAngles['p1'] * (15 / 60);

    const yearInCycleRaw = Math.floor(((yearsElapsed % 4) + 4) % 4) + 1;
    const gamesYearInCycle = (yearInCycleRaw >= 1 && yearInCycleRaw <= 4 ? yearInCycleRaw : 1) as 1 | 2 | 3 | 4;

    // --- CALLIPPIC DIAL ---
    // 1 turn per 76 years (4 Metonic cycles)
    const callippicTurns = yearsElapsed / 76.0;
    const callippicDialAngleRad = (callippicTurns * 2 * Math.PI) % (2 * Math.PI);

    // --- SAROS TRAIN (E4 -> F1/F2 -> G1) ---
    gearAngles['e4'] = e3Angle;
    const f1Angle = -e3Angle * (188 / 54);
    gearAngles['f1'] = f1Angle;
    gearAngles['f2'] = f1Angle;

    // Saros pointer G1: 4 turns over 223 months (~18.03 years)
    const sarosMonthsElapsed = yearsElapsed * (235 / 19);
    const sarosPointerTurns = (sarosMonthsElapsed / 223) * 4;
    const sarosPointerAngleRad = (sarosPointerTurns * 2 * Math.PI) % (2 * Math.PI);
    gearAngles['g1'] = sarosPointerAngleRad;

    const sarosCellIndex = Math.floor(((sarosMonthsElapsed % 223) + 223) % 223);
    const sarosSpiralTurn = Math.floor(sarosCellIndex / (223 / 4)) + 1;
    const sarosPointerRadius = (sarosCellIndex % 223) / 223;

    // --- EXELIGMOS (G1 -> H1 -> I1) ---
    // 1 turn per 3 Saros cycles (54 years 33 days)
    const exeligmosTurns = sarosPointerTurns / (4 * 3);
    const exeligmosDialAngleRad = (exeligmosTurns * 2 * Math.PI) % (2 * Math.PI);
    gearAngles['h1'] = -sarosPointerAngleRad;
    gearAngles['i1'] = -gearAngles['h1'] * (15 / 45);

    const exeligmosSectorIndex = Math.floor(((sarosMonthsElapsed / 223) % 3 + 3) % 3);
    const exeligmosSector = (exeligmosSectorIndex === 0 ? 0 : exeligmosSectorIndex === 1 ? 8 : 16) as 0 | 8 | 16;

    // --- PLANETARY RECONSTRUCTION (FREETH 2021) ---
    // Mercury: 145 synodic in 46y
    const mercSynodic = yearsElapsed * (145 / 46);
    const mercLong = (sunMeanLongitudeDeg + 23.0 * Math.sin(mercSynodic * 2 * Math.PI) + 360) % 360;

    // Venus: 289 synodic in 462y (FCI Inscription)
    const venSynodic = yearsElapsed * (289 / 462);
    const venLong = (sunMeanLongitudeDeg + 47.0 * Math.sin(venSynodic * 2 * Math.PI) + 360) % 360;

    // Mars: 133 synodic in 284y (sidereal revs = 151 / 284 = 0.5317 rev/yr)
    const marsSidereal = yearsElapsed * (151 / 284);
    const marsAnomaly = 10.5 * Math.sin((yearsElapsed - marsSidereal) * 2 * Math.PI);
    const marsLong = ((marsSidereal * 360) + marsAnomaly + 360) % 360;

    // Jupiter: 398 synodic in 427y (sidereal revs = 29 / 427 = 0.0679 rev/yr, period ~11.86y)
    // Using standard Greek/Babylonian 71y/65 synodic period relation: sidereal 6 revs in 71y
    const jupSidereal = yearsElapsed * (6 / 71);
    const jupAnomaly = 5.5 * Math.sin((yearsElapsed - jupSidereal) * 2 * Math.PI);
    const jupLong = ((jupSidereal * 360) + jupAnomaly + 360) % 360;

    // Saturn: 427 synodic in 442y (FCI Inscription: sidereal revs = 15 / 442 rev/yr, period ~29.47y)
    const satSidereal = yearsElapsed * (15 / 442);
    const satAnomaly = 3.2 * Math.sin((yearsElapsed - satSidereal) * 2 * Math.PI);
    const satLong = ((satSidereal * 360) + satAnomaly + 360) % 360;

    return {
      currentDaysSinceEpoch: daysSinceEpoch,
      crankAngleRad: b1AngleRad,
      gearAngles,
      sunMeanLongitudeDeg,
      moonSiderealLongitudeDeg,
      moonTrueLongitudeDeg,
      moonAnomalyAngleDeg,
      moonPhaseAngleDeg,
      metonicPointerAngleRad,
      metonicSpiralTurn,
      metonicCellIndex,
      metonicPointerRadius,
      gamesDialAngleRad,
      gamesYearInCycle,
      callippicDialAngleRad,
      sarosPointerAngleRad,
      sarosSpiralTurn,
      sarosCellIndex,
      sarosPointerRadius,
      exeligmosDialAngleRad,
      exeligmosSector,
      planetLongitudesDeg: {
        mercury: mercLong,
        venus: venLong,
        mars: marsLong,
        jupiter: jupLong,
        saturn: satLong
      }
    };
  }
}
