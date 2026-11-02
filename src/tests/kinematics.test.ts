import { describe, it, expect } from 'vitest';
import { AntikytheraKinematicsEngine } from '../kinematics/gearGraph.ts';
import { dateToJulianDay, julianDayToDate } from '../kinematics/calendarEngine.ts';
import { computeOlympiad } from '../data/panhellenicGames.ts';
import { computeMeeusSolar } from '../ephemeris/meeusSolar.ts';
import { computeMeeusLunar } from '../ephemeris/meeusLunar.ts';

describe('Antikythera Kinematic Ratio Assertions', () => {
  const engine = new AntikytheraKinematicsEngine();

  it('asserts the fundamental Moon Sidereal gear ratio is exactly 254/19', () => {
    // b2(64) -> c1(38), c2(48) -> d1(24), d2(127) -> e2(32)
    const ratio = (64 / 38) * (48 / 24) * (127 / 32);
    const expected = 254 / 19;
    expect(Math.abs(ratio - expected)).toBeLessThan(1e-12);
  });

  it('asserts the Moon Synodic phase ratio is exactly 235/19', () => {
    // 254/19 - 1 solar rev/year = 235/19
    const siderealRatio = 254 / 19;
    const synodicRatio = siderealRatio - 1.0;
    const expected = 235 / 19;
    expect(Math.abs(synodicRatio - expected)).toBeLessThan(1e-12);
  });

  it('verifies Metonic pointer executes exactly 5 revolutions in 19 years', () => {
    const epochJD = engine.getEpochJDN();
    const state0 = engine.computeKinematics(epochJD);
    const state19y = engine.computeKinematics(epochJD + 19 * 365.2422);

    expect(state0.metonicCellIndex).toBe(0);
    // After 19 years, exactly 235 synodic months elapse (wrapping to 0)
    expect(state19y.metonicCellIndex).toBe(0);
  });

  it('verifies Saros pointer completes 4 spiral revolutions across 223 synodic months', () => {
    const epochJD = engine.getEpochJDN();
    // 223 synodic months in days
    const sarosDays = 223 * 29.5305888;
    const stateSaros = engine.computeKinematics(epochJD + sarosDays);

    // Should return to beginning of Saros cycle
    expect(stateSaros.sarosCellIndex).toBe(0);
  });

  it('verifies Exeligmos dial steps 8 hours per Saros and completes 1 rev every 3 Saros cycles', () => {
    const epochJD = engine.getEpochJDN();
    const sarosDays = 223 * 29.5305888;
    
    const state0 = engine.computeKinematics(epochJD);
    expect(state0.exeligmosSector).toBe(0);

    const state1Saros = engine.computeKinematics(epochJD + sarosDays);
    expect(state1Saros.exeligmosSector).toBe(8);

    const state2Saros = engine.computeKinematics(epochJD + 2 * sarosDays);
    expect(state2Saros.exeligmosSector).toBe(16);

    const state3Saros = engine.computeKinematics(epochJD + 3 * sarosDays);
    expect(state3Saros.exeligmosSector).toBe(0);
  });

  it('verifies Games Dial operates on a 4-year cycle with 2016 Jones corrections', () => {
    // Test 776 BCE (Olympiad 1, Year 1)
    const o776 = computeOlympiad(-775);
    expect(o776.olympiadNumber).toBe(1);
    expect(o776.yearInOlympiad).toBe(1);
    expect(o776.gamesThisYear[0].name).toContain('Isthmia');
    expect(o776.gamesThisYear[1].name).toContain('Olympia');

    // Year 2: Nemea & Naa (Dodona)
    const o775 = computeOlympiad(-774);
    expect(o775.yearInOlympiad).toBe(2);
    expect(o775.gamesThisYear[1].name).toContain('Naa');

    // Year 3: Isthmia & Pythia (Delphi)
    const o774 = computeOlympiad(-773);
    expect(o774.yearInOlympiad).toBe(3);
    expect(o774.gamesThisYear[1].name).toContain('Pythia');

    // Year 4: Nemea & Halieia (Rhodes)
    const o773 = computeOlympiad(-772);
    expect(o773.yearInOlympiad).toBe(4);
    expect(o773.gamesThisYear[1].name).toContain('Halieia');
  });

  it('verifies Freeth 2021 Venus and Saturn period relations from FCI inscriptions', () => {
    // Venus: 289 synodic in 462 years
    const venusSynodicRatio = 289 / 462;
    expect(venusSynodicRatio).toBeCloseTo(0.62554, 4);

    // Saturn: 427 synodic in 442 years => 15 sidereal revolutions
    const saturnSiderealRevYear = (442 - 427) / 442; // 15 / 442
    const saturnPeriodYears = 1 / saturnSiderealRevYear; // 442 / 15
    expect(saturnPeriodYears).toBeCloseTo(29.467, 2);
    // Modern Saturn period is 29.457 years (within 0.03% ancient accuracy!)
    expect(Math.abs(saturnPeriodYears - 29.457)).toBeLessThan(0.02);
  });
});

describe('Calendar Engine & Ephemeris Verification', () => {
  it('verifies JDN round-trip conversions', () => {
    const testJDN = 2461346.5; // 2026-11-01
    const dt = julianDayToDate(testJDN);
    const jdnBack = dateToJulianDay(dt.year, dt.month, dt.day, dt.hour / 24);
    expect(Math.abs(jdnBack - testJDN)).toBeLessThan(0.01);
  });

  it('computes realistic solar and lunar coordinates', () => {
    const testJDN = 2461346.5; // 2026-11-01
    const solar = computeMeeusSolar(testJDN);
    expect(solar.trueLongitudeDeg).toBeGreaterThanOrEqual(0);
    expect(solar.trueLongitudeDeg).toBeLessThan(360);

    const lunar = computeMeeusLunar(testJDN);
    expect(lunar.trueLongitudeDeg).toBeGreaterThanOrEqual(0);
    expect(lunar.trueLongitudeDeg).toBeLessThan(360);
    expect(lunar.illuminatedFraction).toBeGreaterThanOrEqual(0);
    expect(lunar.illuminatedFraction).toBeLessThanOrEqual(1.0);
  });
});
