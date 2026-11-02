# Comprehensive Research Dossier: The Antikythera Mechanism
*Compiled for the Physically-Accurate WebGL & Kinematic Simulation Project*
*Date: November 2026*

---

## 1. Executive Summary & Epistemological Taxonomy

The Antikythera Mechanism (c. 205–60 BCE, discovered 1901 off the island of Antikythera) represents the pinnacle of Hellenistic mechanical engineering, applied mathematics, and observational astronomy. Survived by 82 corroded bronze fragments (principally Fragments A through G, plus 75 smaller pieces numbered 1–75), it functioned as an analog astronomical calendar, eclipse calculator, celestial planetarium, and Panhellenic games synchronizer.

To prevent modern conjectural overreach from corrupting physical historical fact, every component in this project is classified strictly into one of three evidential categories:

| Status | Epistemological Definition | Primary Examples |
| :--- | :--- | :--- |
| **ATTESTED** | Physically present and directly measured in surviving fragments (via 2005/2008 X-ray CT tomography, PTM surface photography, or macroscopic inspection). | Gears $b_1, b_2, c_1, c_2, d_1, d_2, e_1, e_2, e_3, e_5, e_6, k_1, k_2$; pin-and-slot slots and pins; fragment inscriptions; physical dial plates. |
| **INFERRED** | Mathematically and mechanically required by meshing geometry, surviving arbors/collars, or directly confirmed by surviving Greek inscriptions. | Metonic pointer gear ($n_1 = 53$), Saros pointer drive ($g_1 = 20$), Games subdial train ($p_1, p_2, q_1$), month names, Games dial quadrants, Exeligmos hour values ($0, 8, 16$). |
| **CONJECTURAL** | Modern reconstructed gear trains or displays designed to satisfy astronomical period relations or textual descriptions where physical gearing is lost. | Front planetary gearing (Freeth et al. 2021 vs. Wright 2002); True-Sun epicyclic drive; exact tooth counts for Mercury, Venus, Mars, Jupiter, Saturn; 354-hole vs 365-hole calendar ring mechanism. |

---

## 2. Primary Source Survey & Chronological Scholarship

### 2.1 Derek J. de Solla Price (1974)
* *Gears from the Greeks: The Antikythera Mechanism—A Calendar Computer from ca. 80 B.C.* (Transactions of the American Philosophical Society 64.7).
* **Contributions:** First systematic X-ray radiography (with Charalampos Karakalos); identified differential turntable (Axis E) and major gear trains.
* **Flaws:** Misinterpreted the lunar anomaly differential as a tropical-year / synodic-month subtractor ($254 - 19 = 235$); missed the pin-and-slot eccentric follower mechanism; assumed an erroneous 365.25-day year gear.

### 2.2 Michael T. Wright (2002–2007)
* *A Planetarium Display for the Antikythera Mechanism* (Horological Journal 2002); *The Antikythera Mechanism: A New Gearing Scheme* (Bulletin of the Scientific Instrument Society 2005); *The Antikythera Mechanism and the Early History of the Orrery* (Interdisciplinary Science Reviews 2006).
* **Contributions:** First to discover that the pin-and-slot on Axis E/K models Hipparchus's lunar first anomaly, not a differential subtractor; demonstrated that the upper back dial is a 5-turn spiral (235 months, Metonic) and lower back dial is a 4-turn spiral (223 months, Saros); built physical working brass reconstructions showing coaxial pointers for all 5 planets on the front dial.

### 2.3 Antikythera Mechanism Research Project (AMRP: Freeth, Bitsakis, Edmunds, Jones, et al. 2006, 2008)
* *Decoding the ancient Greek astronomical calculator* (Nature 444, 2006); *Calendars with Olympiad display and eclipse prediction on an ancient astronomical calculator* (Nature 454, 2008).
* **Contributions:** High-resolution 3D X-ray Computed Tomography (X-Tek Systems) and Reflectance Transformation Imaging (HP Labs); verified exact tooth counts of 30 surviving gears; deciphered over 3,000 Greek letters; discovered the 4-year Olympiad / Games Dial and the Corinthian-origin Metonic month names; mapped the Exeligmos 54-year subdial.

### 2.4 Freeth, Higgon, Dacanalis, MacDonald, Georgakopoulou, Wojcik (UCL 2021)
* *A Model of the Cosmos in the ancient Greek Antikythera Mechanism* (Scientific Reports 11:5821, March 2021).
* **Breakthroughs:** High-resolution CT reading of the Front Cover Inscription (FCI) revealed 462-year period relation for Venus and 442-year relation for Saturn. Formulated an epicyclic "Cosmos" system mounted on a front plate with ring-and-bead displays that fits within the tight 15 mm clearance between the front plate and case glass. Demonstrated an economic gear-sharing scheme where Venus and Mercury share drive components with the Sun, and Mars, Jupiter, Saturn utilize compact epicyclic pin-and-slot trains.

### 2.5 Alexander Jones & Inscription Epigraphy (2012–2020)
* *A Portable Cosmos: Revealing the Arithmetical and Geometrical Technologies of the Antikythera Mechanism* (Oxford University Press, 2017); with Bitsakis (2013/2016) on the Games dial and Parapegma inscriptions.
* **Key Findings:** Corrected reading of the Games dial: Quadrant 1 ($L_A$): Isthmia & Olympia; Quadrant 2 ($L_B$): Nemea & Naa (Dodona); Quadrant 3 ($L_C$): Isthmia & Pythia; Quadrant 4 ($L_D$): Nemea & Halieia (Rhodes). Proved regional cultural links to Epirus/Corinthian colonies and Rhodes.

### 2.6 Carman, Evans, & Thorndike (2012, 2014)
* *On the Epoch of the Antikythera Mechanism and Its Eclipse Predictor* (Archive for History of Exact Sciences 68, 2014).
* **Key Findings:** Compared Saros eclipse glyph sequence ($\Sigma$ lunar, $\text{H}$ solar, with time glyphs) to NASA eclipse catalogues. Concluded that the 223-month sequence best matches an epoch start date of May 12, 205 BCE (Julian day 1646274), placing the invention squarely in the era of Archimedes or immediately following his death (212 BCE).

### 2.7 Modern Debates & Recent Findings (2022–2026)
* **Voulgaris, Mouratidis, Vossinakis (2022/2023, The FRAMe Project):** Proposed that the front calendar ring contained 354 holes (lunar year calendar) rather than 365, and argued for a calibration date of December 22/23, 178 BCE.
* **Woan & Bayley (University of Glasgow, June 2024 / Horological Journal):** In collaboration with Chris Budiselic (*Clickspring* physical machining project), applied Bayesian Markov Chain Monte Carlo (MCMC) and nested sampling techniques (developed for LIGO gravitational-wave detection) to the surviving 13 holes in Fragment C. Concluded with $>99.9\%$ posterior probability that the calendar ring originally had **354 or 355 holes**, disproving the classical assumption of an immutable 365-day ring, and demonstrating an extraordinary ancient radial manufacturing tolerance of $0.028\text{ mm}$.
* **Shipwreck Fieldwork (ESAG / Swiss Archaeological School / Ephorate of Underwater Antiquities 2023–2025):** Excavations at the wreck site recovered monumental marble statue fragments, structural ship timbers, and lead anchor components, narrowing the wreck sinking date to roughly 65–50 BCE.

---

## 3. Comprehensive Master Gear Train Specifications

The kinematic graph is strictly driven by the primary manual input arbor $B$. Every gear rotation ratio is an exact rational fraction $\frac{p}{q}$ derived from physical tooth counts.

### 3.1 Main Drive & Sun Train (Axis B, C, D)
The input crank connects to crown pinion $A_1$ (estimated 48 teeth) driving main wheel $B_1$ (223 teeth in Wright; 64 teeth central hub in Freeth).

$$\frac{\omega_{\text{sun}}}{\omega_{\text{crank}}} = 1.0 \quad \text{(Annual Mean Solar pointer makes 1 revolution per Tropical Year)}$$

* **$B_1$:** 223 teeth (or driven input disk).
* **$B_2$:** 64 teeth (ATTESTED, Fragment A). Coaxial with $B_1$, makes 1 rev/year.
* **$C_1$:** 38 teeth (ATTESTED, Fragment A). Meshes with $B_2$.
* **$C_2$:** 48 teeth (ATTESTED, Fragment A). Coaxial with $C_1$.
* **$D_1$:** 24 teeth (ATTESTED, Fragment A). Meshes with $C_2$.
* **$D_2$:** 127 teeth (ATTESTED, Fragment A). Coaxial with $D_1$. Incorporates half of the 254-month cycle ($127 = 254 / 2$).

### 3.2 Lunar Mean Motion & Sidereal Train (Axis E)
* **$E_2$:** 32 teeth (ATTESTED, Fragment A). Meshes with $D_2$.

The gear ratio from $B_2$ (1 rev/year) to $E_2$ is:
$$\frac{\omega_{E2}}{\omega_{B2}} = \frac{B_2}{C_1} \cdot \frac{C_2}{D_1} \cdot \frac{D_2}{E_2} = \frac{64}{38} \cdot \frac{48}{24} \cdot \frac{127}{32} = \frac{64 \cdot 48 \cdot 127}{38 \cdot 24 \cdot 32} = \frac{254}{19} \approx 13.368421$$

This matches the exact Babylonian/Hipparchan relation:
$$19 \text{ Tropical Years} = 235 \text{ Synodic Months} = 254 \text{ Sidereal Months}$$
$$\text{Moon's Sidereal Revolutions per year} = \frac{254}{19} \text{ rev/yr}$$

### 3.3 The Hipparchan Lunar Anomaly (Pin-and-Slot Differential: Axis E & K)
To model the Moon's variable speed caused by its elliptical orbit (the First Lunar Anomaly, Kepler's 2nd Law equivalent), the mechanism uses an epicyclic pin-and-slot pair:
* **Epicyclic Turntable ($E_3$):** 223 teeth (ATTESTED, Fragment A). Rotates with period of the Saros cycle.
* Mounted on $E_3$ are two coaxial offset pinions:
  * **$K_1$:** 50 teeth (ATTESTED, Fragment A), driven by $E_5$ (50 teeth, ATTESTED).
  * **$K_2$:** 50 teeth (ATTESTED, Fragment A), mounted on an axis displaced by $e = 1.1\text{ mm}$ eccentricity relative to $K_1$.
  * An eccentric driving pin on $K_1$ engages a radial slot in $K_2$.
  * As $K_1$ rotates uniformly, the variable distance from the pin to the center of $K_2$ forces $K_2$ to rotate non-uniformly:
    $$\theta_{K2} \approx \theta_{K1} + \frac{e}{r} \sin(\theta_{K1}) = \theta_{K1} + 2e_{\text{moon}} \sin(M)$$
    where $2e_{\text{moon}} \approx 5.5^\circ$, closely matching Hipparchus's lunar epicycle radius ($r/R = 5^\circ 15'$).
* **Precession of the Apogee:** Because the entire $K_1/K_2$ frame is mounted on turntable $E_3$ which rotates slowly with the line of apsides (period of 8.85 years), the lunar anomaly automatically precesses around the zodiac at the true astronomical rate:
  $$T_{\text{precession}} = \frac{1}{\frac{254}{19} - \frac{235}{19}} = \frac{19}{19} = 1.0 \text{ anomalous cycle} \longrightarrow 8.88 \text{ years}$$

### 3.4 Moon Phase Display & Central Output
* Output from $K_2$ drives back through $E_6$ (50 teeth) to central coaxial tube $B_3$ (64 teeth) driving the front Moon pointer.
* Inside the Moon pointer arbor is a differential gear with miniature bevel gears that rotates a spherical half-black, half-silvered ball indicating the physical phase of the Moon as the difference between Sun and Moon pointers:
  $$\omega_{\text{phase}} = \omega_{\text{moon}} - \omega_{\text{sun}} = \frac{254}{19} - 1 = \frac{235}{19} \text{ synodic rev/yr}$$

### 3.5 Upper Back Plate: Metonic & Callippic Trains (Axis L, M, N)
* **$L_1$:** 36 teeth (ATTESTED, Fragment B). Meshes with $B_2$ (64 teeth).
* **$L_2$:** 38 teeth (ATTESTED, Fragment B). Coaxial with $L_1$.
* **$M_1$:** 96 teeth (ATTESTED, Fragment B). Meshes with $L_2$.
* **$M_2$:** 16 teeth (INFERRED). Coaxial with $M_1$.
* **$N_1$:** 53 teeth (INFERRED, driving Metonic 5-turn pointer).

Ratio from annual shaft $B_2$ to Metonic pointer $N_1$:
$$\frac{\omega_{\text{metonic}}}{\omega_{B2}} = \frac{64}{38} \cdot \frac{53}{96} \cdot \dots = \frac{19 \text{ years}}{5 \text{ turns}} \longrightarrow \frac{235 \text{ months}}{5 \text{ turns}} = 47 \text{ months/turn}$$
The pointer follows a 5-turn Archimedean spiral with 235 month cells.
* **Callippic Subdial:** 4 quadrants of 19 years each ($4 \times 19 = 76$ years), correcting 1 day every 76 years.
* **Games Subdial (Olympiad):** Driven from $M_2$ through auxiliary gears ($O_1, P_1, Q_1$) to rotate **anticlockwise** once every 4 years ($1/4$ turn per year).

### 3.6 Lower Back Plate: Saros & Exeligmos Trains (Axis E, F, G, H)
* **$E_3$ / $E_4$:** 223 teeth (ATTESTED) and 188 teeth (ATTESTED).
* **$F_1$:** 54 teeth (ATTESTED). Meshes with $E_4$.
* **$F_2$:** 20 teeth (INFERRED). Coaxial with $F_1$.
* **$G_1$:** 60 teeth (INFERRED). Drives the Saros 4-turn spiral pointer (223 months).
* **Exeligmos Subdial:** 3 sectors ($0\text{h}, 8\text{h}, 16\text{h}$). Driven at ratio $1:3$ from the Saros pointer arbor. 1 revolution = 3 Saros cycles ($3 \times 223 = 669$ months $\approx 54$ years 33 days).

---

## 4. Front Planetary Reconstruction (Freeth et al. 2021)

Because no planetary gears survived physically, Freeth et al. deduced the minimal tooth-count combinations that satisfy the Babylonian synodic period relations inscribed on Fragment 19 / FCI:

| Planet | Type | Inscribed / Period Relation | Gear Train (Freeth 2021) | Modeled Cycle (Years) | Error vs Modern |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mercury** | Inferior | 145 synodic in 46 years | $B_1 \rightarrow$ fixed 51T, epicycle 27T / 54T / 63T | 46.00 y | $< 0.05^\circ / \text{century}$ |
| **Venus** | Inferior | 289 synodic in 462 years | $B_1 \rightarrow$ fixed 51T, epicycle 63T / 33T / 64T | 462.00 y | $< 0.02^\circ / \text{century}$ |
| **Mars** | Superior | 133 synodic in 284 years | Pin-and-slot, fixed 56T, train 71T / 42T / 57T | 284.00 y | $< 0.1^\circ / \text{century}$ |
| **Jupiter** | Superior | 398 synodic in 427 years | Pin-and-slot, fixed 56T, train 64T / 39T / 83T | 427.00 y | $< 0.08^\circ / \text{century}$ |
| **Saturn** | Superior | 427 synodic in 442 years | Pin-and-slot, fixed 56T, train 52T / 34T / 85T | 442.00 y | $< 0.04^\circ / \text{century}$ |

All 5 planetary indicators in Freeth 2021 are displayed as nested bronze rings with decorative semi-precious bead markers (turquoise for Mercury, carnelian for Venus, red jasper for Mars, lapis lazuli for Jupiter, onyx for Saturn) centered around the Earth on the front plate.

---

## 5. Competing Reconstructions & UI Toggle Architecture

Our simulation includes live, real-time toggles between competing archaeological theories:

### 5.1 Front Cosmos & Planetary System
* **Theory 1: Freeth et al. 2021 (Default):** Concentric ring cosmos with bead markers, 462y Venus, 442y Saturn, compact epicyclic gears on front plate.
* **Theory 2: Michael Wright 2002/2006:** Coaxial pointer system extending across the full dial with traditional epicyclic arbors.
* **Theory 3: Derek de Solla Price 1974 (Attested Only):** Minimalist setup; disables all conjectural planetary gears, rendering only the surviving Sun and Moon trains.

### 5.2 Calendar Ring Hole Count
* **Theory 1: Lunar 354/355 holes (Woan & Bayley 2024 / Voulgaris 2023 - Default):** 354 holes spaced at $1.0169^\circ$ intervals matching Greek lunar calendar traditions.
* **Theory 2: Egyptian Solar 365 holes (Price 1974 / Wright 2005):** 365 holes at $0.9863^\circ$ intervals with manual leap-day offset pin.

### 5.3 Mechanism Epoch (Calibration Start Date)
* **Epoch 1: May 12, 205 BCE (Carman & Evans 2014 - Default):** New moon & solar eclipse matching Saros glyph 13.
* **Epoch 2: Dec 23, 178 BCE (Voulgaris et al. 2022):** Winter solstice and annular solar eclipse.
* **Epoch 3: Oct 23, 100 BCE (Price 1974):** Historical mid-range estimate.

---

## 6. Modern Analytical Ephemeris Benchmark (Meeus / VSOP87 Truncated)

To compute real-time accuracy and drift in the UI "Accuracy Lab", the application includes a self-contained, analytical ephemeris engine (based on Jean Meeus, *Astronomical Algorithms*, 2nd Ed. and truncated VSOP87 / ELP2000-82):
* Computes Heliocentric and Geocentric ecliptic longitudes ($\lambda$) for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn.
* Lunar anomaly, phase angle, and mean/true elongation computed analytically.
* Compares mechanism gear-derived position directly against modern ephemeris to output real-time error curves ($\Delta\lambda = \lambda_{\text{mech}} - \lambda_{\text{true}}$).

---

## 7. Modern Astronomical Overlay: Comets (Explicitly Non-Antikythera)

As requested, the user interface includes a distinctly partitioned, clearly labeled modern overlay: **"Modern Overlay: Comets (Not part of the ancient mechanism)"**.
Using genuine orbital elements (eccentricity $e$, semi-major axis $a$, inclination $i$, longitude of ascending node $\Omega$, argument of perihelion $\omega$) derived from NASA JPL Small-Body Database:
* **1P/Halley:** Period 75.3y, historic apparitions at 240 BCE, 164 BCE, 87 BCE, 12 BCE, 1986 CE, 2061 CE.
* **2P/Encke:** Period 3.3y, low-perihelion Jupiter-family comet.
* **109P/Swift-Tuttle:** Period 133y, parent of Perseids.
* **C/1995 O1 (Hale-Bopp):** Long-period spectacular comet.

All comets are visually rendered with orbital splines, glowing heads, and dynamic particle solar-wind tails, toggled **OFF by default** to preserve historical integrity.
