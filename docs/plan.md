# Comprehensive Implementation Plan: The Antikythera Mechanism Web Application

## 1. Project Architecture & Stack
- **Framework & Build:** Vite + TypeScript + Three.js
- **Testing:** Vitest (testing all kinematic ratios, period relations, calendar conversions, ephemeris calculations)
- **Styling:** Vanilla Tailwind/CSS embedded in Vite, dark horological aesthetic with PBR metallic styling and responsive layout
- **State Management & Kinematics Engine:** 
  - Pure TypeScript typed kinematic graph (`src/kinematics/`) driven by central crank `B1`
  - Reconfigurable runtime dependency graph that rewires gears upon theory toggles
  - In-browser analytical ephemeris engine (Meeus/VSOP87 truncated) for real-time astronomical verification
  - NASA Five Millennium Eclipse Catalog integration (embedded offline subset from 500 BCE to 2100 CE)

## 2. Directory Structure
```
antikythera-mechanism/
├── docs/
│   ├── research.md
│   ├── plan.md
│   └── screenshots/
├── src/
│   ├── data/
│   │   ├── gears.ts             # Master typed gear database with provenance & status
│   │   ├── eclipseCatalog.ts    # NASA/Espenak eclipse database (500 BCE - 2100 CE)
│   │   ├── comets.ts            # JPL orbital elements for Halley, Encke, Swift-Tuttle, Hale-Bopp
│   │   └── panhellenicGames.ts  # Historical Olympiads, dates, and Panhellenic cycle lookup
│   ├── kinematics/
│   │   ├── gearGraph.ts         # Topological gear train solver & pin-and-slot anomaly simulation
│   │   ├── planetaryRatios.ts   # Period relations for Mercury, Venus, Mars, Jupiter, Saturn
│   │   └── calendarEngine.ts    # Conversions: Julian, Gregorian, Egyptian, Metonic months
│   ├── ephemeris/
│   │   ├── meeusSolar.ts        # Analytical Sun position & equation of center
│   │   ├── meeusLunar.ts        # Lunar longitude, anomaly, nodes, phase angle
│   │   └── meeusPlanets.ts      # Analytical planetary positions & retrograde stations
│   ├── scene/
│   │   ├── AntikytheraScene.ts  # Three.js scene setup, PBR lighting, camera controls
│   │   ├── materials.ts         # Bronze, verdigris patina, gold foil, dark oxidized metal
│   │   ├── gearGeometry.ts      # Instanced real triangular teeth generator & gear mesh builder
│   │   ├── dialsFront.ts        # Zodiac 360°, Egyptian 365/354 ring, Moon phase ball, planets
│   │   ├── dialsBack.ts         # Metonic 5-turn spiral, Games dial, Callippic, Saros 4-turn, Exeligmos
│   │   ├── particleTrails.ts    # Glowing orbital particle paths & pointer tip flares
│   │   └── cometVisualizer.ts   # Separate modern overlay comets in 3D
│   ├── ui/
│   │   ├── Dashboard.ts         # Responsive UI layout (~40% panel, collapse on mobile)
│   │   ├── TimeControls.ts      # Crank scrubber, play/pause, date picker, speed slider
│   │   ├── TheoryToggles.ts     # Live theory switching (Freeth, Wright, Price, Woan)
│   │   ├── PlanetInspector.ts   # Real-time mechanism vs modern ephemeris comparison
│   │   ├── EclipseExplorer.ts   # Saros spiral cells, glyph reader, Exeligmos calculator
│   │   ├── GamesLookup.ts       # Olympiad tracker & 776 BCE+ historical games converter
│   │   ├── AccuracyLab.ts       # Drift error curves & gear ratio verification
│   │   └── ResearchDrawer.ts    # Academic citations, fragment provenance & attested badges
│   ├── tests/
│   │   └── kinematics.test.ts   # Vitest unit test suite asserting exact fractional ratios
│   ├── main.ts
│   └── style.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 3. Step-by-Step Implementation Strategy
1. **Initialize Vite + TypeScript Project:** Configure `package.json`, `tsconfig.json`, `vite.config.ts`, install `three`, `@types/three`, `lucide`, `vitest`.
2. **Implement Kinematics & Data Models:** Define all 30+ physical gears and Freeth 2021 planetary gears in `gears.ts` with exact tooth counts, provenance, and status. Build `gearGraph.ts` with pin-and-slot differential mechanics.
3. **Write & Pass Vitest Kinematics Tests:** Verify `254/19` sidereal moon ratio, `235/19` synodic phase ratio, 5-turn Metonic spiral, 4-turn Saros spiral, 76y Callippic, 4y Games dial, and planetary period relations.
4. **Build 3D WebGL Three.js Visualizer:**
   - Procedural realistic gear geometries with physical triangular teeth.
   - PBR bronze, verdigris patina, and engraved dial faces with authentic Greek typography.
   - Front dials (Zodiac, 354/355 or 365 calendar ring, pointers, rotating Moon phase sphere).
   - Back dials (Metonic 235-cell spiral, Saros 223-cell spiral with Sigma/Eta glyphs, Games quadrant dial, Exeligmos dial).
   - Interactive camera views (Front, Back, Side, Gear Stack, Exploded view with slider).
   - Color-coded gear trains and particle trails.
5. **Implement Analytical Ephemeris & Astronomy Engines:**
   - Jean Meeus analytical solar, lunar, and planetary position solvers.
   - Real-time comparison between mechanism position and true position with error metrics.
   - NASA 5-Millennium Eclipse Catalog correlation.
   - Historical Panhellenic Games lookup engine.
   - Modern Comets overlay module (JPL orbital elements, Halley apparitions).
6. **Implement UI & Controls:**
   - Dark horological UI with accent colors matching gear trains.
   - Date scrubber (-300 BCE to 3000 CE), play/reverse/speed, interactive manual crank.
   - Theory toggles (Freeth 2021 vs Wright vs Price; 354-hole vs 365-hole; Epoch 205 BCE vs 178 BCE).
   - Mobile-first responsive integration meeting 390x844 iPhone benchmarks.
7. **Verification & Delivery:**
   - Run Vitest and confirm green status.
   - Run automated browser audit, render tests, click testing on interactive elements.
   - Capture screenshots of Front, Back, and Gear Stack views to `/docs/screenshots`.
   - Export reports to `~/Downloads`.
