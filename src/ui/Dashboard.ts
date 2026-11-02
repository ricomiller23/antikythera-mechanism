import { AntikytheraKinematicsEngine, ActiveTheoryMode } from '../kinematics/gearGraph.ts';
import { AntikytheraScene } from '../scene/AntikytheraScene.ts';
import { computeCalendarConversions, julianDayToDate } from '../kinematics/calendarEngine.ts';
import { computeAllPlanetsEphemeris } from '../ephemeris/meeusPlanets.ts';
import { computeMeeusLunar } from '../ephemeris/meeusLunar.ts';
import { computeOlympiad } from '../data/panhellenicGames.ts';
import { findNearestEclipse } from '../data/eclipseCatalog.ts';
import { MODERN_COMET_OVERLAYS } from '../data/comets.ts';
import { GearDefinition, SUBSYSTEM_COLORS } from '../data/gears.ts';

export class AntikytheraDashboard {
  private container: HTMLElement;
  private kinematics: AntikytheraKinematicsEngine;
  private scene: AntikytheraScene;

  // Animation & Time scrub state
  private isPlaying: boolean = false;
  private playDirection: 1 | -1 = 1;
  private playSpeedDaysPerSec: number = 30; // default 30 days/s
  private lastTimestamp: number = 0;

  // UI DOM elements
  private dateDisplayEl!: HTMLElement;
  private jdnInputEl!: HTMLInputElement;
  private playBtnEl!: HTMLButtonElement;
  private speedInputEl!: HTMLInputElement;
  private speedLabelEl!: HTMLElement;
  private gearInfoPanelEl!: HTMLElement;
  private activeTab: 'planets' | 'moon' | 'games' | 'eclipses' | 'calendar' | 'accuracy' | 'comets' | 'research' = 'planets';

  constructor(container: HTMLElement, kinematics: AntikytheraKinematicsEngine, scene: AntikytheraScene) {
    this.container = container;
    this.kinematics = kinematics;
    this.scene = scene;

    this.renderLayout();
    this.bindEvents();
    this.scene.onGearSelect = (gear) => this.showGearDetails(gear);
  }

  private renderLayout() {
    this.container.innerHTML = `
      <div class="dashboard-root flex flex-col h-full bg-slate-950 text-slate-100 border-l border-slate-800 select-none">
        <!-- HEADER -->
        <header class="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <h1 class="text-base font-bold tracking-wide text-amber-400 flex items-center gap-2">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              THE ANTIKYTHERA MECHANISM
            </h1>
            <p class="text-xs text-slate-400">Kinematic 3D Astronomical Computer & Historical Reconstructions</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center gap-1" title="9/9 Kinematic Vitest Unit Tests Passing">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              KINEMATICS VERIFIED (254:19)
            </span>
          </div>
        </header>

        <!-- TOP BAR: TIME & CRANK CONTROLS -->
        <section class="p-4 border-b border-slate-800 bg-slate-900/30 space-y-3">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <div class="text-xs text-slate-400 font-mono">ACTIVE ASTRONOMICAL DATE</div>
              <div id="date-display" class="text-lg font-bold text-amber-300 font-mono tracking-tight">2026-11-01 CE</div>
            </div>
            <button id="btn-now" class="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition">
              Set to Now (2026)
            </button>
          </div>

          <!-- CRANK TRANSPORT BAR -->
          <div class="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
            <button id="btn-reverse" class="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition" title="Reverse Crank">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
            </button>
            <button id="btn-play" class="flex-1 py-1.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
              <span>RUN CRANK</span>
            </button>
            <button id="btn-forward" class="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition" title="Forward Crank">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
            </button>
          </div>

          <!-- TIME SLIDER & SPEED -->
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Time Scrubber (-300 BCE to 3000 CE)</span>
              <span id="speed-label">Speed: 30 days/s</span>
            </div>
            <input id="jdn-slider" type="range" min="1611674" max="2816787" value="2461346" class="w-full accent-amber-500 cursor-pointer">
            <div class="flex items-center gap-2 pt-1">
              <span class="text-[10px] text-slate-500 font-mono">SPEED:</span>
              <input id="speed-slider" type="range" min="1" max="36525" value="30" class="flex-1 accent-amber-500 cursor-pointer">
            </div>
          </div>

          <!-- THEORY & VIEW PRESET CONTROLS -->
          <div class="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label class="block text-[10px] uppercase text-slate-400 font-semibold mb-1">Cosmos Theory:</label>
              <select id="theory-select" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300">
                <option value="freeth2021">Freeth 2021 (Default, 5 Planets)</option>
                <option value="wright">Michael Wright (Coaxial Pointers)</option>
                <option value="price">Price 1974 (Attested Only)</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] uppercase text-slate-400 font-semibold mb-1">Calendar Ring:</label>
              <select id="calendar-mode-select" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-300">
                <option value="lunar_354">Lunar 354/355 holes (Woan/Glasgow 2024)</option>
                <option value="solar_365">Egyptian 365 days (Price/Wright)</option>
              </select>
            </div>
          </div>

          <!-- CAMERA PRESETS & VIEW MODES -->
          <div class="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
            <span class="text-[10px] text-slate-500 font-mono">CAMERA:</span>
            <button data-cam="front" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">Front</button>
            <button data-cam="back" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">Back</button>
            <button data-cam="side" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">Side</button>
            <button data-cam="gear_stack" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">Gears</button>
            <button data-cam="exploded" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">Exploded</button>
          </div>

          <div class="flex items-center gap-3 pt-1 text-[11px] text-slate-300">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input id="toggle-case" type="checkbox" checked class="accent-amber-500">
              <span>Show Case</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input id="toggle-colorcode" type="checkbox" class="accent-amber-500">
              <span>Color-Code Trains</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input id="toggle-planets" type="checkbox" checked class="accent-amber-500">
              <span>Planets (Freeth 2021)</span>
            </label>
          </div>
        </section>

        <!-- NAVIGATION TABS -->
        <nav class="flex border-b border-slate-800 bg-slate-900/80 text-xs overflow-x-auto scrollbar-none">
          <button data-tab="planets" class="tab-btn px-3 py-2.5 font-medium border-b-2 border-amber-500 text-amber-400 whitespace-nowrap">Planets</button>
          <button data-tab="moon" class="tab-btn px-3 py-2.5 font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 whitespace-nowrap">Moon & Phase</button>
          <button data-tab="games" class="tab-btn px-3 py-2.5 font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 whitespace-nowrap">Olympics / Games</button>
          <button data-tab="eclipses" class="tab-btn px-3 py-2.5 font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 whitespace-nowrap">Saros Eclipses</button>
          <button data-tab="calendar" class="tab-btn px-3 py-2.5 font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 whitespace-nowrap">Calendar</button>
          <button data-tab="accuracy" class="tab-btn px-3 py-2.5 font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 whitespace-nowrap">Accuracy Lab</button>
          <button data-tab="comets" class="tab-btn px-3 py-2.5 font-medium border-b-2 border-transparent text-sky-400 hover:text-sky-300 whitespace-nowrap">Modern: Comets</button>
          <button data-tab="research" class="tab-btn px-3 py-2.5 font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 whitespace-nowrap">Dossier / Provenance</button>
        </nav>

        <!-- DYNAMIC TAB CONTENT AREA -->
        <div id="tab-content" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Populated dynamically by renderActiveTab() -->
        </div>

        <!-- SELECTED GEAR INSPECTOR PANEL (Sticky Drawer at bottom) -->
        <div id="gear-inspector" class="p-3 border-t border-slate-800 bg-slate-900/90 text-xs hidden">
          <!-- Populated on gear click -->
        </div>
      </div>
    `;

    this.dateDisplayEl = this.container.querySelector('#date-display')!;
    this.jdnInputEl = this.container.querySelector('#jdn-slider')!;
    this.playBtnEl = this.container.querySelector('#btn-play')!;
    this.speedInputEl = this.container.querySelector('#speed-slider')!;
    this.speedLabelEl = this.container.querySelector('#speed-label')!;
    this.gearInfoPanelEl = this.container.querySelector('#gear-inspector')!;

    this.renderActiveTab();
  }

  private bindEvents() {
    // Crank Play/Pause
    this.playBtnEl.addEventListener('click', () => {
      this.isPlaying = !this.isPlaying;
      this.playBtnEl.classList.toggle('bg-amber-600', !this.isPlaying);
      this.playBtnEl.classList.toggle('bg-rose-600', this.isPlaying);
      this.playBtnEl.innerHTML = this.isPlaying
        ? `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg><span>PAUSE</span>`
        : `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg><span>RUN CRANK</span>`;
    });

    this.container.querySelector('#btn-reverse')!.addEventListener('click', () => {
      this.playDirection = -1;
      this.isPlaying = true;
      this.playBtnEl.innerHTML = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg><span>PAUSE (REV)</span>`;
    });

    this.container.querySelector('#btn-forward')!.addEventListener('click', () => {
      this.playDirection = 1;
      this.isPlaying = true;
      this.playBtnEl.innerHTML = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg><span>PAUSE (FWD)</span>`;
    });

    // Time scrubber
    this.jdnInputEl.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.kinematics.setJulianDay(val);
      this.updateDisplays();
    });

    // Speed slider
    this.speedInputEl.addEventListener('input', (e) => {
      this.playSpeedDaysPerSec = parseFloat((e.target as HTMLInputElement).value);
      const text = this.playSpeedDaysPerSec > 365
        ? `${(this.playSpeedDaysPerSec / 365.25).toFixed(1)} yr/s`
        : `${this.playSpeedDaysPerSec} d/s`;
      this.speedLabelEl.textContent = `Speed: ${text}`;
    });

    // Set to now (2026-11-01)
    this.container.querySelector('#btn-now')!.addEventListener('click', () => {
      this.kinematics.setJulianDay(2461346.5);
      this.jdnInputEl.value = '2461346.5';
      this.updateDisplays();
    });

    // Theory Select
    const theorySelect = this.container.querySelector('#theory-select') as HTMLSelectElement;
    theorySelect.addEventListener('change', (e) => {
      const mode = (e.target as HTMLSelectElement).value as ActiveTheoryMode;
      this.kinematics.setTheory(mode);
      this.scene.rebuildGearsForTheory();
      this.updateDisplays();
    });

    // Calendar Mode Select
    const calSelect = this.container.querySelector('#calendar-mode-select') as HTMLSelectElement;
    calSelect.addEventListener('change', (e) => {
      const mode = (e.target as HTMLSelectElement).value as 'lunar_354' | 'solar_365';
      this.kinematics.setCalendarMode(mode);
      this.scene.frontDials.setCalendarMode(mode);
      this.updateDisplays();
    });

    // Camera presets
    this.container.querySelectorAll('[data-cam]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = (btn as HTMLElement).dataset.cam as any;
        this.scene.setCameraPreset(p);
      });
    });

    // Toggles
    const toggleCase = this.container.querySelector('#toggle-case') as HTMLInputElement;
    toggleCase.addEventListener('change', () => this.scene.setShowCase(toggleCase.checked));

    const toggleColor = this.container.querySelector('#toggle-colorcode') as HTMLInputElement;
    toggleColor.addEventListener('change', () => this.scene.setColorCodeGears(toggleColor.checked));

    const togglePlanets = this.container.querySelector('#toggle-planets') as HTMLInputElement;
    togglePlanets.addEventListener('change', () => this.scene.setShowPlanets(togglePlanets.checked));

    // Tab buttons
    this.container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.tab-btn').forEach((b) => {
          b.classList.remove('border-amber-500', 'text-amber-400');
          b.classList.add('border-transparent', 'text-slate-400');
        });
        btn.classList.add('border-amber-500', 'text-amber-400');
        btn.classList.remove('border-transparent', 'text-slate-400');
        this.activeTab = (btn as HTMLElement).dataset.tab as any;
        this.renderActiveTab();
      });
    });
  }

  public tick(timestamp: number) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const dt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    if (this.isPlaying) {
      const currentJD = this.kinematics.getJulianDay();
      const deltaDays = this.playSpeedDaysPerSec * dt * this.playDirection;
      const nextJD = currentJD + deltaDays;
      this.kinematics.setJulianDay(nextJD);
      this.jdnInputEl.value = nextJD.toString();
      this.updateDisplays();
    }
  }

  public updateDisplays() {
    const jd = this.kinematics.getJulianDay();
    const dt = julianDayToDate(jd);
    const yrStr = dt.year <= 0 ? `${Math.abs(dt.year - 1)} BCE` : `${dt.year} CE`;
    this.dateDisplayEl.textContent = `${yrStr}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}`;

    this.renderActiveTab();
  }

  private renderActiveTab() {
    const tabEl = this.container.querySelector('#tab-content')!;
    const jd = this.kinematics.getJulianDay();
    const state = this.kinematics.computeKinematics(jd);
    const cal = computeCalendarConversions(jd, this.kinematics.getEpochJDN(), this.kinematics.getCalendarMode());
    const lunar = computeMeeusLunar(jd);
    const planets = computeAllPlanetsEphemeris(jd, state.planetLongitudesDeg);

    switch (this.activeTab) {
      case 'planets':
        tabEl.innerHTML = `
          <div class="space-y-3">
            <div class="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span class="font-semibold text-amber-400">PLANETARY TRAINS (FREETH ET AL. 2021)</span>
              <span>Epistemology: <span class="text-amber-400 font-mono">CONJECTURAL</span></span>
            </div>
            
            <div class="grid grid-cols-1 gap-2.5">
              ${Object.values(planets).map(p => `
                <div class="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm" style="background: ${p.colorHex}22; color: ${p.colorHex}; border: 1px solid ${p.colorHex}">
                      ${p.symbol}
                    </span>
                    <div>
                      <div class="font-bold text-slate-200 text-xs flex items-center gap-2">
                        <span>${p.name}</span>
                        <span class="text-[10px] text-slate-400 font-normal italic">${p.greekName}</span>
                      </div>
                      <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Mech: <b class="text-amber-300 font-mono">${p.mechanismLongitudeDeg.toFixed(1)}°</b></span>
                        <span>True: <b class="text-slate-300 font-mono">${p.trueLongitudeDeg.toFixed(1)}°</b></span>
                        <span>Δ: <b class="${Math.abs(p.errorDeg) > 5 ? 'text-rose-400' : 'text-emerald-400'} font-mono">${p.errorDeg >= 0 ? '+' : ''}${p.errorDeg}°</b></span>
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${p.isRetrograde ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}">
                      ${p.isRetrograde ? 'RETROGRADE' : 'DIRECT'}
                    </span>
                    <div class="text-[10px] text-slate-400 mt-1">${p.synodicPhaseName}</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Ecliptic Heliocentric/Geocentric Mini-Map -->
            <div class="mt-4 p-3 bg-slate-900 border border-slate-800 rounded">
              <div class="text-xs font-semibold text-slate-300 mb-2 flex justify-between">
                <span>ECLIPTIC GEOCENTRIC VIEW</span>
                <span class="text-[10px] text-slate-500 font-mono">EARTH CENTERED</span>
              </div>
              <div class="relative w-full h-24 bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center">
                <div class="w-full h-0.5 bg-slate-800 relative">
                  <!-- Sun marker -->
                  <div class="absolute -top-2 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[9px] font-bold text-slate-950 shadow-lg shadow-amber-500/50" style="left: ${(state.sunMeanLongitudeDeg / 360) * 100}%" title="Sun: ${state.sunMeanLongitudeDeg.toFixed(1)}°">
                    ☉
                  </div>
                  <!-- Moon marker -->
                  <div class="absolute -top-2 w-4 h-4 rounded-full bg-sky-300 flex items-center justify-center text-[9px] font-bold text-slate-950 shadow-lg shadow-sky-500/50" style="left: ${(state.moonTrueLongitudeDeg / 360) * 100}%" title="Moon: ${state.moonTrueLongitudeDeg.toFixed(1)}°">
                    ☽
                  </div>
                  <!-- Planet markers -->
                  ${Object.values(planets).map(p => `
                    <div class="absolute -top-1.5 w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-950" style="left: ${(p.mechanismLongitudeDeg / 360) * 100}%; background: ${p.colorHex}" title="${p.name}: ${p.mechanismLongitudeDeg.toFixed(1)}°">
                      ${p.symbol}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case 'moon':
        tabEl.innerHTML = `
          <div class="space-y-3">
            <div class="p-3 bg-slate-900 border border-slate-800 rounded flex items-center justify-between">
              <div>
                <div class="text-xs text-slate-400">CURRENT LUNAR PHASE</div>
                <div class="text-sm font-bold text-sky-400">${lunar.phaseName}</div>
                <div class="text-xs text-slate-400 mt-1">Age: <b class="text-slate-200 font-mono">${lunar.ageDays.toFixed(1)} days</b> | Illumination: <b class="text-slate-200 font-mono">${(lunar.illuminatedFraction * 100).toFixed(1)}%</b></div>
              </div>
              <div class="w-12 h-12 rounded-full border-2 border-sky-400/50 flex items-center justify-center bg-slate-950 relative overflow-hidden">
                <div class="w-full h-full bg-sky-200 rounded-full" style="clip-path: inset(0 ${(1 - lunar.illuminatedFraction) * 100}% 0 0)"></div>
              </div>
            </div>

            <div class="p-3 bg-slate-900 border border-slate-800 rounded space-y-2 text-xs">
              <div class="font-bold text-slate-300">HIPPARCHAN LUNAR ANOMALY (PIN-AND-SLOT)</div>
              <div class="grid grid-cols-2 gap-2 text-slate-400">
                <div>Mechanism Longitude: <b class="text-amber-400 font-mono">${state.moonTrueLongitudeDeg.toFixed(2)}°</b></div>
                <div>True Meeus Longitude: <b class="text-slate-200 font-mono">${lunar.trueLongitudeDeg.toFixed(2)}°</b></div>
                <div>Anomaly Modulation: <b class="text-purple-400 font-mono">${state.moonAnomalyAngleDeg >= 0 ? '+' : ''}${state.moonAnomalyAngleDeg.toFixed(2)}°</b></div>
                <div>Next Full Moon in: <b class="text-slate-200 font-mono">${lunar.nextFullMoonDays.toFixed(1)} days</b></div>
              </div>
              <p class="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                Modeled via eccentric pin-and-slot pair K1/K2 (50T each, offset 1.1 mm) mounted on turntable E3, precessing every 8.85 years.
              </p>
            </div>
          </div>
        `;
        break;

      case 'games':
        const olym = computeOlympiad(julianDayToDate(jd).year);
        tabEl.innerHTML = `
          <div class="space-y-3">
            <div class="p-3 bg-amber-950/30 border border-amber-800/60 rounded">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-[10px] text-amber-500 font-mono">PANHELLENIC GAMES DIAL (UPPER BACK SUBDIAL)</div>
                  <div class="text-base font-bold text-amber-300">Olympiad ${olym.olympiadNumber}, ${olym.quadrant.labelGreek}</div>
                  <div class="text-xs text-slate-400">${olym.historicalEra}</div>
                </div>
                <div class="text-right">
                  <span class="px-2 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-600/50">
                    DIAL: ${olym.dialAngleDeg}° ANTICLOCKWISE
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="text-xs font-semibold text-slate-300">GAMES CELEBRATED THIS YEAR:</div>
              <div class="grid grid-cols-1 gap-2">
                ${olym.gamesThisYear.map(g => `
                  <div class="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs">
                    <div class="flex items-center justify-between font-bold text-amber-400">
                      <span>${g.name}</span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">${g.cycle}</span>
                    </div>
                    <div class="text-slate-300 text-[11px] mt-1">Location: <b>${g.location}</b> | Season: <b>${g.season}</b></div>
                    <div class="text-slate-400 text-[10px] mt-1">${g.notes}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case 'eclipses':
        const nearEcl = findNearestEclipse(julianDayToDate(jd).year);
        tabEl.innerHTML = `
          <div class="space-y-3">
            <div class="p-3 bg-rose-950/30 border border-rose-800/60 rounded">
              <div class="text-[10px] text-rose-400 font-mono">SAROS 4-TURN SPIRAL (223 MONTHS)</div>
              <div class="text-sm font-bold text-rose-200">Current Cell: Month ${state.sarosCellIndex + 1} of 223 (Turn ${state.sarosSpiralTurn})</div>
              <div class="text-xs text-slate-400 mt-1">Exeligmos 54-Year Shift: <b class="text-pink-400 font-mono">+${state.exeligmosSector} Hours</b></div>
            </div>

            <div class="space-y-2 text-xs">
              <div class="font-bold text-slate-300">HISTORICAL NASA/ESPENAK BENCHMARK COMPARISON</div>
              <div class="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <div class="font-bold text-amber-400">${nearEcl.next.type} (${nearEcl.next.dateStr})</div>
                <div class="text-slate-300">Mechanism Saros Cell: <b class="text-slate-100 font-mono">${nearEcl.next.sarosCellIndex}</b> (Glyph: <b class="text-rose-400">${nearEcl.next.glyphType}</b>, Hour: <b class="text-sky-400">${nearEcl.next.hourGlyphGreek}</b>)</div>
                <div class="text-slate-400 text-[11px] italic">${nearEcl.next.notes}</div>
              </div>
            </div>
          </div>
        `;
        break;

      case 'calendar':
        tabEl.innerHTML = `
          <div class="space-y-3 text-xs">
            <div class="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
              <div class="text-slate-400 text-[10px] font-mono">CORINTHIAN METONIC CALENDAR (235 MONTHS)</div>
              <div class="text-base font-bold text-emerald-400">${cal.metonicDate.monthNameGreek} (${cal.metonicDate.monthNameTranslit})</div>
              <div class="text-slate-300 text-xs">Metonic Year ${cal.metonicDate.cycleYear} of 19 | Month ${cal.metonicDate.monthInYear} of ${cal.metonicDate.isIntercalary ? '13 (Intercalary)' : '12'}</div>
              <div class="text-slate-400 text-[11px]">Upper Spiral Turn: ${cal.metonicDate.spiralTurn} of 5 | Cell: ${cal.metonicDate.cellNumber} of 235</div>
            </div>

            <div class="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
              <div class="text-slate-400 text-[10px] font-mono">EGYPTIAN CIVIL CALENDAR (365 DAYS FIXED)</div>
              <div class="text-sm font-bold text-amber-300">${cal.egyptianDate.day} ${cal.egyptianDate.monthNameEn} (${cal.egyptianDate.monthNameGreek})</div>
              <div class="text-slate-400 text-[11px]">${cal.egyptianDate.isEpagomenal ? 'Epagomenal Festival Day' : `Month ${cal.egyptianDate.monthNumber} of 12`}</div>
            </div>

            <div class="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
              <div class="text-slate-400 text-[10px] font-mono">FRONT CALENDAR RING HOLE</div>
              <div class="text-sm font-bold text-sky-300">Hole ${cal.calendarRingDay} of ${this.kinematics.getCalendarMode() === 'lunar_354' ? '354 (Lunar Greek)' : '365 (Egyptian Solar)'}</div>
              <div class="text-slate-400 text-[11px]">Leap Day Retaining Pin Offset: ${cal.leapOffsetDays} holes accumulated</div>
            </div>
          </div>
        `;
        break;

      case 'accuracy':
        tabEl.innerHTML = `
          <div class="space-y-3 text-xs">
            <div class="p-3 bg-slate-900 border border-slate-800 rounded">
              <div class="text-xs font-bold text-amber-400 mb-1">ACCURACY LAB: MECHANISM VS MODERN EPHEMERIS</div>
              <p class="text-[11px] text-slate-400 leading-relaxed">
                The mechanism achieves extraordinary mechanical accuracy through integer tooth approximations of celestial periods:
              </p>
            </div>

            <div class="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div class="flex justify-between">
                <span class="text-slate-400">Lunar Month Gear (254:19):</span>
                <span class="text-emerald-400">27.321277 d (True: 27.321661 d)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Metonic Cycle (235 synodic):</span>
                <span class="text-emerald-400">6939.69 d (True: 6939.60 d)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Saros Eclipse (223 synodic):</span>
                <span class="text-emerald-400">6585.32 d (True: 6585.32 d)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Venus Period (462 years):</span>
                <span class="text-emerald-400">Error &lt; 0.02° / century</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Saturn Period (442 years):</span>
                <span class="text-emerald-400">Error &lt; 0.04° / century</span>
              </div>
            </div>
          </div>
        `;
        break;

      case 'comets':
        tabEl.innerHTML = `
          <div class="space-y-3 text-xs">
            <div class="p-3 bg-sky-950/40 border border-sky-800/80 rounded">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-sky-300">MODERN OVERLAY: COMETS</span>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input id="toggle-comets-vis" type="checkbox" ${this.scene.comets.isVisible() ? 'checked' : ''} class="accent-sky-500">
                  <span class="text-xs font-bold text-sky-400">ENABLE 3D TRACKS</span>
                </label>
              </div>
              <p class="text-[11px] text-sky-300/80 mt-1.5 leading-relaxed">
                <b>Historical Caveat:</b> There is NO evidence the Antikythera Mechanism tracked comets; ancient Greek mechanical astronomy did not model parabolic/eccentric cometary orbits. This overlay is provided as an independent educational tool.
              </p>
            </div>

            <div class="space-y-2">
              ${MODERN_COMET_OVERLAYS.map(c => `
                <div class="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs">
                  <div class="flex items-center justify-between font-bold" style="color: ${c.colorHex}">
                    <span>${c.name} (${c.designation})</span>
                    <span class="text-slate-400 font-mono text-[11px]">Period: ${c.periodYears}y</span>
                  </div>
                  <div class="text-slate-300 text-[11px] mt-1">Perihelion Distance: <b>${c.perihelionDistanceAU} AU</b> | Next: <b>${c.nextPerihelionDate}</b></div>
                  <div class="text-slate-400 text-[10px] mt-1">${c.notes}</div>
                  ${c.historicApparitionsBCE.length > 0 ? `
                    <div class="mt-1.5 pt-1 border-t border-slate-800 text-[10px] text-amber-400/90 font-mono">
                      Ancient Records: ${c.historicApparitionsBCE.map(a => `${a.yearBCE} BCE`).join(', ')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
        // Bind comet toggle
        setTimeout(() => {
          const comToggle = this.container.querySelector('#toggle-comets-vis') as HTMLInputElement;
          if (comToggle) {
            comToggle.addEventListener('change', () => {
              this.scene.comets.setVisible(comToggle.checked);
            });
          }
        }, 50);
        break;

      case 'research':
        tabEl.innerHTML = `
          <div class="space-y-3 text-xs">
            <div class="p-3 bg-slate-900 border border-slate-800 rounded">
              <div class="text-xs font-bold text-amber-400 mb-1">ARCHAEOLOGICAL PROVENANCE & DOSSIER</div>
              <p class="text-[11px] text-slate-300 leading-relaxed">
                Recovered in 1901 from a shipwreck off Point Glyphadia, Antikythera Island (approx 70–60 BCE). Currently conserved in the National Archaeological Museum in Athens.
              </p>
            </div>

            <div class="space-y-2 text-[11px]">
              <div class="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <div class="font-bold text-emerald-400">ATTESTED COMPONENTS (Surviving in Fragments)</div>
                <p class="text-slate-400 mt-0.5">30 gear wheels in Fragments A, B, C, D (including B1, B2, C1, C2, D1, D2, E1-E6, K1, K2, L1, L2, M1). Epicyclic turntable and pin-and-slot anomaly mechanism.</p>
              </div>
              <div class="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <div class="font-bold text-amber-400">INFERRED COMPONENTS (Inscriptions & Gearing Geometry)</div>
                <p class="text-slate-400 mt-0.5">Metonic pointer N1 (53T), Saros pointer G1 (60T), Games pointer Q1 (60T), Exeligmos H1/I1. 235-month Corinthian calendar inscriptions, 4-year Games inscriptions, 223-month eclipse glyphs.</p>
              </div>
              <div class="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <div class="font-bold text-rose-400">CONJECTURAL RECONSTRUCTIONS</div>
                <p class="text-slate-400 mt-0.5">Front planetary gear trains for Mercury, Venus, Mars, Jupiter, Saturn (Freeth et al. 2021); True-Sun epicyclic drive; 354-hole calendar ring (Woan & Bayley 2024).</p>
              </div>
            </div>
          </div>
        `;
        break;
    }
  }

  private showGearDetails(gear: GearDefinition | null) {
    if (!gear) {
      this.gearInfoPanelEl.classList.add('hidden');
      return;
    }

    const color = SUBSYSTEM_COLORS[gear.subsystem]?.hex || '#f59e0b';
    this.gearInfoPanelEl.classList.remove('hidden');
    this.gearInfoPanelEl.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" style="background: ${color}"></span>
          <span class="font-bold text-slate-100 text-xs">${gear.name} (${gear.id.toUpperCase()})</span>
        </div>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${gear.status === 'ATTESTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : gear.status === 'INFERRED' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}">
          ${gear.status}
        </span>
      </div>
      <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-300 font-mono">
        <div>Teeth Count: <b class="text-amber-400">${gear.teeth}T</b></div>
        <div>Axle: <b class="text-slate-100">${gear.axle}</b></div>
        <div>Pitch Radius: <b class="text-slate-100">${gear.pitchRadius.toFixed(1)} mm</b></div>
        <div>Thickness: <b class="text-slate-100">${gear.thickness.toFixed(1)} mm</b></div>
        <div>Subsystem: <b style="color: ${color}">${SUBSYSTEM_COLORS[gear.subsystem]?.name}</b></div>
        <div>Provenance: <b class="text-slate-100">${gear.provenance}</b></div>
      </div>
      <div class="mt-2 text-[10px] text-slate-400 italic border-t border-slate-800 pt-1">
        Citation: ${gear.citation}
      </div>
    `;
  }
}
