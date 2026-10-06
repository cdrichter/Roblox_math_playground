'use strict';
/*
 * Sonnensystem live – läuft komplett im Browser, ohne Datenbank und ohne Bibliotheken.
 *
 * Planetenpositionen: Keplersche Bahnelemente von JPL/NASA
 *   (E. M. Standish, "Approximate Positions of the Planets", gültig 1800–2050).
 * Eigenrotation: Nullmeridian-Winkel W = W0 + W1·d nach IAU WGCCRE,
 *   d = Tage seit J2000 – dadurch steht jede Rotation so wie zum gewählten Zeitpunkt.
 * Mond: vereinfachte Mondtheorie (Hauptterme).
 */
(() => {
  const DEG = Math.PI / 180;
  const TAU = Math.PI * 2;
  const AU_KM = 149597870.7;
  const GM_SUN = 1.32712440018e11; // km³/s²
  const MS_DAY = 86400000;
  const OBLIQUITY = 23.43928 * DEG;

  // ------------------------------------------------------------------ Rauschen für Texturen
  function hash(x, y, z, s) {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1440670441) ^ Math.imul(s, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function noise3(x, y, z, s) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x - xi, yf = y - yi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    const l = (a, b, t) => a + (b - a) * t;
    const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz, s);
    return l(
      l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v),
      l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v),
      w
    );
  }

  function fbm(x, y, z, s, octaves = 5) {
    let amp = 0.5, freq = 1, sum = 0, norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * noise3(x * freq, y * freq, z * freq, s + i * 17);
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum / norm;
  }

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => {
    t = clamp(t);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  };
  const angDiff = (a, b) => {
    let d = (a - b) % TAU;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    return d;
  };
  const spot = (lat, lon, cLat, cLon, rLat, rLon) => {
    const dl = (lat - cLat * DEG) / (rLat * DEG);
    const dn = angDiff(lon, cLon * DEG) / (rLon * DEG);
    return dl * dl + dn * dn;
  };

  // Erzeugt eine Equirectangular-Textur (Länge 0..360°, Breite +90..−90°)
  function makeTexture(fn, w = 256, h = 128) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let y = 0; y < h; y++) {
      const lat = (0.5 - (y + 0.5) / h) * Math.PI;
      const cl = Math.cos(lat), sl = Math.sin(lat);
      for (let x = 0; x < w; x++) {
        const lon = ((x + 0.5) / w) * TAU;
        const col = fn(cl * Math.cos(lon), cl * Math.sin(lon), sl, lat, lon);
        const i = (y * w + x) * 4;
        d[i] = col[0];
        d[i + 1] = col[1];
        d[i + 2] = col[2];
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  const TEXTURES = {
    sun(x, y, z, lat) {
      const n = fbm(x * 9, y * 9, z * 9, 1, 4);
      let col = mix([255, 150, 30], [255, 235, 150], n * 1.3 - 0.1);
      const s = fbm(x * 3 + 5, y * 3, z * 3, 7, 3);
      if (Math.abs(lat) < 35 * DEG && s > 0.68) col = mix(col, [90, 40, 10], (s - 0.68) * 9);
      return col;
    },
    mercury(x, y, z) {
      const n = fbm(x * 3, y * 3, z * 3, 2, 5);
      const c = fbm(x * 14, y * 14, z * 14, 3, 3);
      return mix([80, 76, 74], [185, 178, 170], n * 0.75 + c * 0.45 - 0.1);
    },
    venus(x, y, z) {
      const n = fbm(x * 2 + fbm(x * 3, y * 3, z * 3, 5, 3), y * 2, z * 7, 4, 5);
      return mix([196, 150, 80], [252, 232, 185], n * 1.4 - 0.2);
    },
    earth(x, y, z, lat) {
      const n = fbm(x * 1.7 + 3, y * 1.7, z * 1.7, 11, 6);
      const alat = Math.abs(lat) / DEG;
      let col;
      if (n > 0.52) {
        const dry = fbm(x * 4, y * 4, z * 4, 12, 3) + (alat < 32 && alat > 12 ? 0.25 : 0);
        col = mix([50, 110, 45], [175, 150, 95], dry * 1.4 - 0.4);
        if (alat > 55) col = mix(col, [110, 120, 100], (alat - 55) / 15);
      } else {
        col = mix([8, 28, 85], [30, 95, 170], n / 0.52);
      }
      if (alat > 74 - n * 10) col = [236, 242, 248];
      const cl = fbm(x * 3, y * 3, z * 6, 13, 5);
      if (cl > 0.53) col = mix(col, [255, 255, 255], (cl - 0.53) * 3.2);
      return col;
    },
    moon(x, y, z) {
      const m = fbm(x * 1.8, y * 1.8, z * 1.8, 61, 4);
      const c = fbm(x * 12, y * 12, z * 12, 62, 3);
      const base = m < 0.46 ? [92, 92, 98] : [178, 176, 172];
      return mix(base, [210, 208, 204], c * 0.6 - 0.15);
    },
    mars(x, y, z, lat) {
      const n = fbm(x * 2.5, y * 2.5, z * 2.5, 21, 5);
      const d = fbm(x * 7, y * 7, z * 7, 22, 3);
      let col = mix([105, 48, 28], [210, 115, 65], n * 1.2 + d * 0.3 - 0.2);
      if (Math.abs(lat) > (80 - d * 8) * DEG) col = [240, 235, 230];
      return col;
    },
    jupiter(x, y, z, lat, lon) {
      const t = fbm(x * 4, y * 4, z * 5, 31, 4);
      const b = Math.sin(lat * 15 + t * 2.4);
      let col = b > 0 ? mix([212, 178, 140], [244, 232, 210], b) : mix([212, 178, 140], [150, 98, 64], -b);
      const e = spot(lat, lon, -22, 30, 6, 13);
      if (e < 1) col = mix(col, [196, 88, 56], (1 - e) * 1.6);
      return col;
    },
    saturn(x, y, z, lat) {
      const t = fbm(x * 3, y * 3, z * 4, 41, 3);
      const b = Math.sin(lat * 11 + t * 1.3);
      return mix([196, 165, 110], [242, 222, 172], b * 0.5 + 0.5);
    },
    uranus(x, y, z, lat) {
      const t = fbm(x * 3, y * 3, z * 3, 51, 3);
      return mix([140, 200, 212], [196, 238, 242], 0.5 + Math.sin(lat * 7) * 0.15 + (t - 0.5) * 0.5);
    },
    neptune(x, y, z, lat, lon) {
      const t = fbm(x * 3, y * 3, z * 5, 71, 4);
      const b = Math.sin(lat * 9 + t * 2);
      let col = mix([40, 75, 190], [95, 145, 240], b * 0.5 + 0.5);
      const e = spot(lat, lon, -22, 200, 6, 11);
      if (e < 1) col = mix(col, [20, 35, 110], (1 - e) * 1.5);
      if (t > 0.66 && Math.abs(lat) < 50 * DEG) col = mix(col, [230, 240, 255], (t - 0.66) * 5);
      return col;
    },
    pluto(x, y, z, lat, lon) {
      const n = fbm(x * 2.5, y * 2.5, z * 2.5, 81, 5);
      let col = mix([110, 80, 60], [222, 196, 165], n * 1.4 - 0.2);
      const e = spot(lat, lon, 18, 180, 26, 30);
      if (e < 1) col = mix(col, [242, 232, 218], (1 - e) * 2);
      return col;
    },
  };

  // ------------------------------------------------------------------ Himmelskörper
  // el = [a (AE), e, I (°), L (°), ϖ (°), Ω (°)] zu J2000, rt = Änderung pro Jahrhundert
  // rot = [W0, W1 (°/Tag)] Nullmeridian nach IAU
  const BODIES = [
    {
      id: 'sun', name: 'Sonne', type: 'Stern (G2V)', R: 696340, color: '#ffcc55', minPx: 7,
      rot: [84.176, 14.1844],
      facts: [['Durchmesser', '1.392.700 km'], ['Rotation (Äquator)', '≈ 25,4 Tage'], ['Oberfläche', '≈ 5.500 °C'], ['Alter', '≈ 4,6 Mrd. Jahre']],
    },
    {
      id: 'mercury', name: 'Merkur', type: 'Gesteinsplanet', R: 2439.7, color: '#b5aca4', minPx: 2,
      el: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593],
      rt: [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
      rot: [329.5988, 6.1385108],
      facts: [['Durchmesser', '4.879 km'], ['Umlaufzeit', '88 Tage'], ['Rotation', '58,6 Tage'], ['Monde', '0']],
    },
    {
      id: 'venus', name: 'Venus', type: 'Gesteinsplanet', R: 6051.8, color: '#e8cf96', minPx: 3,
      el: [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255],
      rt: [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
      rot: [160.20, -1.4813688],
      facts: [['Durchmesser', '12.104 km'], ['Umlaufzeit', '224,7 Tage'], ['Rotation', '243 Tage (rückläufig)'], ['Monde', '0']],
    },
    {
      id: 'earth', name: 'Erde', type: 'Gesteinsplanet', R: 6371, color: '#4f8fe0', minPx: 3,
      el: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
      rt: [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
      rot: [190.147, 360.9856235],
      facts: [['Durchmesser', '12.742 km'], ['Umlaufzeit', '365,25 Tage'], ['Rotation', '23 h 56 min'], ['Monde', '1']],
    },
    {
      id: 'moon', name: 'Mond', type: 'Mond der Erde', R: 1737.4, color: '#c9c6c0', minPx: 1.5, parent: 'earth',
      rot: [38.3213, 13.17635815],
      facts: [['Durchmesser', '3.474 km'], ['Umlaufzeit', '27,3 Tage'], ['Rotation', 'gebunden (27,3 Tage)']],
    },
    {
      id: 'mars', name: 'Mars', type: 'Gesteinsplanet', R: 3389.5, color: '#d0703f', minPx: 2.5,
      el: [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
      rt: [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
      rot: [176.049863, 350.891982443297],
      facts: [['Durchmesser', '6.779 km'], ['Umlaufzeit', '687 Tage'], ['Rotation', '24 h 37 min'], ['Monde', '2']],
    },
    {
      id: 'jupiter', name: 'Jupiter', type: 'Gasriese', R: 69911, color: '#d8b48a', minPx: 4,
      el: [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
      rt: [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
      rot: [284.95, 870.536],
      facts: [['Durchmesser', '139.820 km'], ['Umlaufzeit', '11,86 Jahre'], ['Rotation', '9 h 56 min'], ['Monde', '95']],
    },
    {
      id: 'saturn', name: 'Saturn', type: 'Gasriese', R: 58232, color: '#e3cd95', minPx: 4, rings: true,
      el: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
      rt: [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
      rot: [38.90, 810.7939024],
      facts: [['Durchmesser', '116.460 km'], ['Umlaufzeit', '29,46 Jahre'], ['Rotation', '10 h 34 min'], ['Monde', '274']],
    },
    {
      id: 'uranus', name: 'Uranus', type: 'Eisriese', R: 25362, color: '#9fdbe4', minPx: 3.5,
      el: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503],
      rt: [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
      rot: [203.81, -501.1600928],
      facts: [['Durchmesser', '50.724 km'], ['Umlaufzeit', '84 Jahre'], ['Rotation', '17 h 14 min (rückläufig)'], ['Monde', '29']],
    },
    {
      id: 'neptune', name: 'Neptun', type: 'Eisriese', R: 24622, color: '#4f7de8', minPx: 3.5,
      el: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574],
      rt: [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.01262724],
      rot: [249.978, 541.1397757],
      facts: [['Durchmesser', '49.244 km'], ['Umlaufzeit', '164,8 Jahre'], ['Rotation', '16 h 6 min'], ['Monde', '16']],
    },
    {
      id: 'pluto', name: 'Pluto', type: 'Zwergplanet', R: 1188.3, color: '#cdb59a', minPx: 2,
      el: [39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684],
      rt: [-0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482],
      rot: [302.695, 56.3625225],
      facts: [['Durchmesser', '2.377 km'], ['Umlaufzeit', '248 Jahre'], ['Rotation', '6,4 Tage (rückläufig)'], ['Monde', '5']],
    },
  ];
  const byId = Object.fromEntries(BODIES.map((b) => [b.id, b]));
  const PLANETS = BODIES.filter((b) => b.el);

  // Saturn-Rotationsachse (IAU: α = 40.589°, δ = 83.537°) → ekliptikale Koordinaten
  const SATURN_POLE = (() => {
    const a = 40.589 * DEG, d = 83.537 * DEG;
    const x = Math.cos(d) * Math.cos(a), y = Math.cos(d) * Math.sin(a), z = Math.sin(d);
    return [x, y * Math.cos(OBLIQUITY) + z * Math.sin(OBLIQUITY), -y * Math.sin(OBLIQUITY) + z * Math.cos(OBLIQUITY)];
  })();
  const RING_BANDS = [
    [1.24, 1.53, 'rgba(150,135,110,0.35)'],
    [1.53, 1.95, 'rgba(225,205,165,0.85)'],
    [2.03, 2.27, 'rgba(200,180,140,0.7)'],
  ];

  // ------------------------------------------------------------------ Bahnmechanik
  function solveKepler(M, e) {
    let E = M + e * Math.sin(M);
    for (let i = 0; i < 10; i++) {
      const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      E -= dE;
      if (Math.abs(dE) < 1e-12) break;
    }
    return E;
  }

  function elementsAt(b, T) {
    const [a, e, I, L, peri, node] = b.el.map((v, i) => v + b.rt[i] * T);
    return { a, e, I: I * DEG, L: L * DEG, w: (peri - node) * DEG, node: node * DEG, M: (L - peri) * DEG };
  }

  // Bahnebene → heliozentrisch-ekliptikal (J2000)
  function orbitalToEcliptic(xp, yp, el) {
    const cw = Math.cos(el.w), sw = Math.sin(el.w);
    const cO = Math.cos(el.node), sO = Math.sin(el.node);
    const cI = Math.cos(el.I), sI = Math.sin(el.I);
    return [
      (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
      (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
      sw * sI * xp + cw * sI * yp,
    ];
  }

  function heliocentric(b, T) {
    const el = elementsAt(b, T);
    const M = angDiff(el.M, 0);
    const E = solveKepler(M, el.e);
    const xp = el.a * (Math.cos(E) - el.e);
    const yp = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
    b.a = el.a;
    return orbitalToEcliptic(xp, yp, el);
  }

  function orbitPoints(b, T, n = 360) {
    const el = elementsAt(b, T);
    const pts = [];
    const q = Math.sqrt(1 - el.e * el.e);
    for (let i = 0; i < n; i++) {
      const E = (i / n) * TAU;
      pts.push(orbitalToEcliptic(el.a * (Math.cos(E) - el.e), el.a * q * Math.sin(E), el));
    }
    return pts;
  }

  // Geozentrische Mondposition (AE), d = Tage seit J2000
  function moonGeocentric(d) {
    const L = (218.316 + 13.176396 * d) * DEG;
    const M = (134.963 + 13.064993 * d) * DEG;
    const F = (93.272 + 13.229350 * d) * DEG;
    const D = (297.850 + 12.190749 * d) * DEG;
    const lon = L + (6.289 * Math.sin(M) + 1.274 * Math.sin(2 * D - M) + 0.658 * Math.sin(2 * D)) * DEG;
    const lat = 5.128 * Math.sin(F) * DEG;
    const dist = (385001 - 20905 * Math.cos(M)) / AU_KM;
    return [dist * Math.cos(lat) * Math.cos(lon), dist * Math.cos(lat) * Math.sin(lon), dist * Math.sin(lat)];
  }

  const len = (v) => Math.hypot(v[0], v[1], v[2]);

  // ------------------------------------------------------------------ Zustand
  const state = {
    simMs: Date.now(),
    speed: 86400, // simulierte Sekunden pro echter Sekunde
    direction: 1,
    playing: true,
    realDist: false,
    realSize: false,
    showOrbits: true,
    showLabels: true,
    showBelts: true,
    tilt: 35 * DEG,
    selected: null,
    follow: null,
    T: 0,
    days: 0,
  };
  const cam = { x: 0, y: 0, scale: 60, goalX: null, goalY: null, goalScale: null, anim: false, animT: 0 };

  const SPEEDS = [
    [1, 'Echtzeit'],
    [3600, '1 Std/s'],
    [86400, '1 Tag/s'],
    [604800, '1 Woche/s'],
    [2629800, '1 Monat/s'],
    [31557600, '1 Jahr/s'],
  ];

  // ------------------------------------------------------------------ Canvas
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  let starCanvas = null;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    buildStars();
  }

  function buildStars() {
    starCanvas = document.createElement('canvas');
    starCanvas.width = canvas.width;
    starCanvas.height = canvas.height;
    const s = starCanvas.getContext('2d');
    const g = s.createRadialGradient(W * 0.7 * DPR, H * 0.3 * DPR, 0, W * 0.7 * DPR, H * 0.3 * DPR, Math.max(W, H) * DPR);
    g.addColorStop(0, '#0b1030');
    g.addColorStop(1, '#02030a');
    s.fillStyle = g;
    s.fillRect(0, 0, starCanvas.width, starCanvas.height);
    const count = Math.round((W * H) / 1400);
    for (let i = 0; i < count; i++) {
      const x = Math.random() * starCanvas.width;
      const y = Math.random() * starCanvas.height;
      const r = Math.random() ** 3 * 1.4 * DPR + 0.3 * DPR;
      const t = Math.random();
      s.fillStyle = t < 0.15 ? 'rgba(255,210,180,' : t < 0.3 ? 'rgba(180,200,255,' : 'rgba(255,255,255,';
      s.fillStyle += (0.25 + Math.random() * 0.75).toFixed(2) + ')';
      s.beginPath();
      s.arc(x, y, r, 0, TAU);
      s.fill();
    }
  }

  // ------------------------------------------------------------------ Asteroiden-/Kuipergürtel
  const belts = [];
  (function buildBelts() {
    let seed = 12345;
    const rnd = () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822519) + 0x9e3779b9) >>> 0) / 4294967296;
    const add = (n, aMin, aMax, incMax, alpha) => {
      for (let i = 0; i < n; i++) {
        const a = aMin + (aMax - aMin) * Math.sqrt(rnd());
        belts.push({
          a,
          th0: rnd() * TAU,
          n: TAU / (Math.pow(a, 1.5) * 365.25),
          inc: (rnd() - 0.5) * 2 * incMax * DEG,
          node: rnd() * TAU,
          alpha,
        });
      }
    };
    add(1800, 2.1, 3.3, 15, 0.55);
    add(900, 39, 48, 20, 0.35);
  })();

  // ------------------------------------------------------------------ Transformationen
  function dispRadius(b) {
    if (state.realSize) return b.R / AU_KM;
    if (b.id === 'sun') return 0.18;
    return 0.03 * Math.sqrt(b.R / 6371);
  }

  function toDisplay(v) {
    if (state.realDist) return v;
    const r = len(v);
    if (r === 0) return [0, 0, 0];
    const f = Math.sqrt(r) / r;
    return [v[0] * f, v[1] * f, v[2] * f];
  }

  let ct = Math.cos(state.tilt), st = Math.sin(state.tilt);
  // Ansicht: x nach rechts, Y nach oben, D zum Betrachter hin
  function project(v) {
    return { X: v[0], Y: v[1] * ct + v[2] * st, D: -v[1] * st + v[2] * ct };
  }
  const sx = (X) => W / 2 + (X - cam.x) * cam.scale;
  const sy = (Y) => H / 2 - (Y - cam.y) * cam.scale;

  function viewDir(v) {
    const p = project(v);
    const l = Math.hypot(p.X, p.Y, p.D) || 1;
    return [p.X / l, p.Y / l, p.D / l];
  }

  // ------------------------------------------------------------------ Simulation
  let orbitCache = { T: null, real: {} };

  function computePositions() {
    const jd = state.simMs / MS_DAY + 2440587.5;
    state.days = jd - 2451545.0;
    state.T = state.days / 36525;

    const sun = byId.sun;
    sun.helio = [0, 0, 0];
    sun.disp = [0, 0, 0];
    for (const b of PLANETS) {
      b.helio = heliocentric(b, state.T);
      b.disp = toDisplay(b.helio);
    }
    const earth = byId.earth, moon = byId.moon;
    const geo = moonGeocentric(state.days);
    moon.helio = [earth.helio[0] + geo[0], earth.helio[1] + geo[1], earth.helio[2] + geo[2]];
    const gl = len(geo);
    const off = Math.max(gl, 3.2 * dispRadius(earth));
    moon.disp = [earth.disp[0] + (geo[0] / gl) * off, earth.disp[1] + (geo[1] / gl) * off, earth.disp[2] + (geo[2] / gl) * off];
    moon.geoDisp = off;

    for (const b of BODIES) {
      b.p = project(b.disp);
      b.spin = ((b.rot[0] + b.rot[1] * state.days) % 360) * DEG;
    }

    if (orbitCache.T === null || Math.abs(orbitCache.T - state.T) > 0.05) {
      orbitCache = { T: state.T, real: {} };
      for (const b of PLANETS) orbitCache.real[b.id] = orbitPoints(b, state.T);
    }
  }

  // ------------------------------------------------------------------ Kamera
  function fitScale() {
    const R = state.realDist ? 31.5 : Math.sqrt(31.5);
    return Math.min((W * 0.46) / R, (H * 0.42) / (R * Math.max(ct, 0.3)));
  }
  const MAX_SCALE = 5e7;
  const minScale = () => fitScale() * 0.15;
  const clampScale = (s) => clamp(s, minScale(), MAX_SCALE);

  function fitView() {
    state.follow = null;
    cam.goalX = 0;
    cam.goalY = 0;
    cam.goalScale = fitScale();
    cam.anim = true;
    cam.animT = 0;
    updateBodyBar();
  }

  function focusBody(b) {
    state.follow = b;
    select(b);
    const target = Math.min(W, H) * (b.id === 'sun' ? 0.16 : 0.07);
    let s = target / dispRadius(b);
    if (b.id === 'earth') s = Math.min(s, Math.min(W, H) * 0.3 / byId.moon.geoDisp);
    cam.goalScale = clampScale(s);
    cam.anim = true;
    cam.animT = 0;
    updateBodyBar();
  }

  function updateCamera(dt) {
    const k = 1 - Math.exp(-dt * 5);
    let tx = cam.goalX, ty = cam.goalY;
    if (state.follow) {
      tx = state.follow.p.X;
      ty = state.follow.p.Y;
    }
    if (tx !== null) {
      if (cam.anim) {
        cam.animT += dt;
        cam.x += (tx - cam.x) * k;
        cam.y += (ty - cam.y) * k;
        const done = Math.hypot(tx - cam.x, ty - cam.y) * cam.scale < 0.5 && cam.goalScale === null;
        if (done || cam.animT > 2.5) {
          cam.anim = false;
          if (!state.follow) cam.goalX = cam.goalY = null;
          else { cam.x = tx; cam.y = ty; }
        }
      } else if (state.follow) {
        cam.x = tx;
        cam.y = ty;
      }
    }
    if (cam.goalScale !== null) {
      const ls = Math.log(cam.scale), lg = Math.log(cam.goalScale);
      cam.scale = Math.exp(ls + (lg - ls) * k);
      if (Math.abs(lg - ls) < 0.003) {
        cam.scale = cam.goalScale;
        cam.goalScale = null;
      }
    }
  }

  function zoomAt(mx, my, factor) {
    const ns = clampScale(cam.scale * factor);
    cam.goalScale = null;
    if (state.follow || cam.anim) {
      cam.scale = ns;
      return;
    }
    const wx = cam.x + (mx - W / 2) / cam.scale;
    const wy = cam.y - (my - H / 2) / cam.scale;
    cam.scale = ns;
    cam.x = wx - (mx - W / 2) / ns;
    cam.y = wy + (my - H / 2) / ns;
  }

  // ------------------------------------------------------------------ Zeichnen
  function drawOrbits() {
    ctx.lineWidth = 1;
    for (const b of PLANETS) {
      const pts = orbitCache.real[b.id];
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const p = project(toDisplay(pts[i]));
        const x = sx(p.X), y = sy(p.Y);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = b === state.selected ? b.color : hexA(b.color, 0.32);
      ctx.lineWidth = b === state.selected ? 1.6 : 1;
      ctx.stroke();
    }
    // Mondbahn, sobald sie groß genug ist
    const earth = byId.earth, moon = byId.moon;
    const rr = moon.geoDisp * cam.scale;
    if (rr > 25) {
      const n = moonOrbitNormal();
      const u = [1, 0, 0];
      const a = normalize(cross(n, u)), c = cross(n, a);
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const t = (i / 120) * TAU;
        const v = [0, 1, 2].map((k) => earth.disp[k] + (a[k] * Math.cos(t) + c[k] * Math.sin(t)) * moon.geoDisp);
        const p = project(v);
        if (i === 0) ctx.moveTo(sx(p.X), sy(p.Y));
        else ctx.lineTo(sx(p.X), sy(p.Y));
      }
      ctx.strokeStyle = 'rgba(200,200,200,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const normalize = (v) => {
    const l = len(v) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  function moonOrbitNormal() {
    // Ebene durch zwei Mondpositionen im Abstand von ~1/4 Umlauf
    const a = moonGeocentric(state.days), b = moonGeocentric(state.days + 6.8);
    return normalize(cross(a, b));
  }

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function drawBelts() {
    const d = state.days;
    ctx.fillStyle = '#b9b2a6';
    for (const o of belts) {
      const th = o.th0 + o.n * d;
      const c = Math.cos(th), s = Math.sin(th);
      const v = [o.a * c, o.a * s, o.a * Math.sin(o.inc) * Math.sin(th - o.node)];
      const p = project(toDisplay(v));
      const x = sx(p.X), y = sy(p.Y);
      if (x < -2 || y < -2 || x > W + 2 || y > H + 2) continue;
      ctx.globalAlpha = o.alpha;
      ctx.fillRect(x, y, 1.2, 1.2);
    }
    ctx.globalAlpha = 1;
  }

  // Texturierte Kugel: pixelgenaue orthografische Projektion der Textur.
  // Pro Scheibengröße wird eine Tabelle (Breite → Texturzeile, Länge → Spaltenanteil) gecacht,
  // pro Frame wird nur noch der Drehwinkel addiert.
  const TEX_W = 256, TEX_H = 128;
  const sphereLUTs = new Map();
  function sphereLUT(N) {
    let lut = sphereLUTs.get(N);
    if (lut) return lut;
    const idx = [], row = [], lon = [], alpha = [];
    for (let py = 0; py < N; py++) {
      const v0 = 1 - ((py + 0.5) / N) * 2;
      for (let px = 0; px < N; px++) {
        const u0 = ((px + 0.5) / N) * 2 - 1;
        const d = Math.hypot(u0, v0);
        const cov = clamp((1 - d) * (N / 2) + 0.5); // Kantenglättung
        if (cov <= 0) continue;
        const k = d > 1 ? 1 / d : 1;
        const u = u0 * k, v = v0 * k;
        const lat = Math.asin(clamp(v, -1, 1));
        const cl = Math.cos(lat);
        idx.push(py * N + px);
        row.push(Math.min(TEX_H - 1, Math.floor((0.5 - lat / Math.PI) * TEX_H)) * TEX_W);
        lon.push(Math.asin(clamp(u / (cl || 1e-9), -1, 1)) / TAU + 1);
        alpha.push(Math.round(cov * 255) << 24);
      }
    }
    lut = { idx: Int32Array.from(idx), row: Int32Array.from(row), lon: Float32Array.from(lon), alpha: Uint32Array.from(alpha) };
    if (sphereLUTs.size > 40) sphereLUTs.clear();
    sphereLUTs.set(N, lut);
    return lut;
  }

  function drawSphere(b, x, y, r) {
    const N = clamp(Math.round(2 * r * DPR), 8, 520) | 0;
    if (!b.sphere || b.sphere.N !== N) {
      const c = document.createElement('canvas');
      c.width = c.height = N;
      const cx = c.getContext('2d');
      const img = cx.createImageData(N, N);
      b.sphere = { N, canvas: c, ctx: cx, img, px: new Uint32Array(img.data.buffer) };
    }
    const S = b.sphere, lut = sphereLUT(N), tex = b.texPx, out = S.px;
    const shift = ((-b.spin / TAU) % 1 + 1) % 1; // sichtbare Länge in der Scheibenmitte
    for (let i = 0; i < lut.idx.length; i++) {
      const tx = ((lut.lon[i] + shift) * TEX_W | 0) % TEX_W;
      out[lut.idx[i]] = ((tex[lut.row[i] + tx] & 0xffffff) | lut.alpha[i]) >>> 0;
    }
    S.ctx.putImageData(S.img, 0, 0);
    ctx.save();
    ctx.drawImage(S.canvas, x - r, y - r, 2 * r, 2 * r);
    // Randverdunkelung
    const g = ctx.createRadialGradient(x, y, r * 0.55, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, b.id === 'sun' ? 'rgba(160,40,0,0.45)' : 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // Nachtseite: Halbkreis + Terminator-Halbellipse, abhängig von der 3D-Lichtrichtung
  function drawNightSide(b, x, y, r) {
    const toSun = [-b.helio[0], -b.helio[1], -b.helio[2]];
    const L = viewDir(toSun);
    const ang = Math.atan2(-L[1], L[0]);
    const lz = L[2];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.arc(0, 0, r + 0.3, Math.PI / 2, (3 * Math.PI) / 2, false);
    ctx.ellipse(0, 0, Math.max(0.01, Math.abs(lz) * (r + 0.3)), r + 0.3, 0, (3 * Math.PI) / 2, Math.PI / 2, lz > 0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(2,3,12,0.86)';
    ctx.fill();
    ctx.restore();
  }

  function ringGeometry() {
    const N = viewDir(SATURN_POLE);
    const s = Math.hypot(N[0], N[1]);
    const ang = s < 1e-6 ? 0 : Math.atan2(-N[1], N[0]);
    return { ang, open: Math.abs(N[2]), nearRight: N[2] < 0 };
  }

  function drawRings(x, y, r, half) {
    const g = ringGeometry();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(g.ang);
    if (half) {
      ctx.beginPath();
      const R = r * 2.4;
      if (g.nearRight) ctx.rect(0, -R, R, 2 * R);
      else ctx.rect(-R, -R, R, 2 * R);
      ctx.clip();
    }
    for (const [ri, ro, col] of RING_BANDS) {
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(0.2, ro * r * g.open), ro * r, 0, 0, TAU);
      ctx.ellipse(0, 0, Math.max(0.1, ri * r * g.open), ri * r, 0, 0, TAU);
      ctx.fillStyle = col;
      ctx.fill('evenodd');
    }
    ctx.restore();
  }

  function drawSunGlow(x, y, r) {
    const R = r * 4 + 30;
    const g = ctx.createRadialGradient(x, y, r * 0.8, x, y, R);
    g.addColorStop(0, 'rgba(255,200,90,0.55)');
    g.addColorStop(0.3, 'rgba(255,150,40,0.18)');
    g.addColorStop(1, 'rgba(255,120,20,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, TAU);
    ctx.fill();
  }

  function moonHidden() {
    const e = byId.earth;
    return byId.moon.geoDisp * cam.scale < e.rpx + 5;
  }

  function drawBodies() {
    for (const b of BODIES) {
      b.sx = sx(b.p.X);
      b.sy = sy(b.p.Y);
      b.rpx = Math.max(b.minPx, dispRadius(b) * cam.scale);
    }
    const order = BODIES.slice().sort((a, b) => a.p.D - b.p.D);
    for (const b of order) {
      if (b.id === 'moon' && moonHidden()) continue;
      const { sx: x, sy: y, rpx: r } = b;
      const margin = b.rings ? r * 2.4 : b.id === 'sun' ? r * 4 + 30 : r;
      if (x < -margin || y < -margin || x > W + margin || y > H + margin) continue;

      if (b.id === 'sun') drawSunGlow(x, y, r);
      if (b.rings && r > 2) drawRings(x, y, r, false);

      if (r < 3.5) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fillStyle = b.color;
        ctx.fill();
      } else {
        drawSphere(b, x, y, r);
        if (b.id !== 'sun') drawNightSide(b, x, y, r);
      }
      if (b.rings && r > 2) drawRings(x, y, r, true);

      if (b === state.selected) {
        ctx.beginPath();
        ctx.arc(x, y, (b.rings ? r * 2.3 : r) + 6, 0, TAU);
        ctx.strokeStyle = 'rgba(255,201,77,0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }

  function drawLabels() {
    ctx.font = '12px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    for (const b of BODIES) {
      if (b.id === 'moon' && (moonHidden() || byId.moon.geoDisp * cam.scale < 30)) continue;
      const x = b.sx, y = b.sy;
      if (x < -50 || y < -20 || x > W + 50 || y > H + 20) continue;
      const off = (b.rings ? b.rpx * 2.3 : b.rpx) + 6;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillText(b.name, x + off + 1, y + 1);
      ctx.fillStyle = b === state.selected ? '#ffc94d' : 'rgba(230,235,255,0.9)';
      ctx.fillText(b.name, x + off, y);
    }
  }

  function render() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.drawImage(starCanvas, 0, 0, W, H);
    if (state.showOrbits) drawOrbits();
    if (state.showBelts) drawBelts();
    drawBodies();
    if (state.showLabels) drawLabels();
  }

  // ------------------------------------------------------------------ HUD / UI
  const $ = (id) => document.getElementById(id);
  const fmtDate = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const nf = (v, d = 0) => v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });

  function isLive() {
    return state.playing && state.speed === 1 && state.direction === 1 && Math.abs(state.simMs - Date.now()) < 5000;
  }

  let lastHud = 0;
  function updateHud(now) {
    if (now - lastHud < 200) return;
    lastHud = now;
    const d = new Date(state.simMs);
    $('date').textContent = isFinite(d) ? fmtDate.format(d) : '—';
    $('liveBadge').classList.toggle('on', isLive());
    const sp = SPEEDS.find((s) => s[0] === state.speed);
    $('speedLabel').textContent = state.playing
      ? `${state.direction < 0 ? 'rückwärts · ' : ''}${sp ? sp[1] : ''}`
      : 'pausiert';
    const y = d.getFullYear();
    $('accuracy').classList.toggle('hidden', y >= 1800 && y <= 2050);
    if (document.activeElement !== $('dateInput')) $('dateInput').value = toLocalInput(d);
    updateInfo();
    updateScaleBar();
  }

  function toLocalInput(d) {
    if (!isFinite(d) || d.getFullYear() < 1 || d.getFullYear() > 9999) return '';
    const p = (n) => String(n).padStart(2, '0');
    return `${String(d.getFullYear()).padStart(4, '0')}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function updateScaleBar() {
    const el = $('scaleBar');
    if (!state.realDist) {
      el.querySelector('.bar').style.display = 'none';
      el.querySelector('span').textContent = 'Abstände komprimiert, Größen ' + (state.realSize ? 'echt' : 'vergrößert');
      return;
    }
    el.querySelector('.bar').style.display = '';
    const target = 120 / cam.scale; // AE für ~120 px
    let km = target * AU_KM, unit = 'km', val = km;
    if (target >= 0.1) { val = target; unit = 'AE'; }
    const p = Math.pow(10, Math.floor(Math.log10(val)));
    const nice = [1, 2, 5, 10].map((m) => m * p).filter((v) => v <= val).pop() || p;
    const au = unit === 'AE' ? nice : nice / AU_KM;
    el.querySelector('.bar').style.width = `${au * cam.scale}px`;
    el.querySelector('span').textContent = `${nf(nice, nice < 1 ? 1 : 0)} ${unit}${state.realSize ? '' : ' · Größen vergrößert'}`;
  }

  function select(b) {
    state.selected = b;
    $('info').classList.toggle('hidden', !b);
    if (b) {
      $('infoName').textContent = b.name;
      $('infoType').textContent = b.type;
    }
    updateInfo();
    updateBodyBar();
  }

  function updateInfo() {
    const b = state.selected;
    if (!b) return;
    const rows = b.facts.slice();
    const earth = byId.earth;
    const sunDist = len(b.helio);
    if (b.id !== 'sun') {
      rows.push(['Abstand zur Sonne', `${nf(sunDist, 3)} AE · ${nf((sunDist * AU_KM) / 1e6, 1)} Mio. km`]);
    }
    if (b.id === 'moon') {
      const g = moonGeocentric(state.days);
      rows.push(['Abstand zur Erde', `${nf(len(g) * AU_KM)} km`]);
    } else if (b.id !== 'earth') {
      const dv = [b.helio[0] - earth.helio[0], b.helio[1] - earth.helio[1], b.helio[2] - earth.helio[2]];
      rows.push(['Abstand zur Erde', `${nf(len(dv), 3)} AE · ${nf((len(dv) * AU_KM) / 1e6, 1)} Mio. km`]);
      const lt = (len(dv) * AU_KM) / 299792.458;
      rows.push(['Lichtlaufzeit', lt < 3600 ? `${nf(lt / 60, 1)} min` : `${nf(lt / 3600, 2)} h`]);
    }
    if (b.el) {
      const r = sunDist * AU_KM, a = b.a * AU_KM;
      rows.push(['Bahngeschwindigkeit', `${nf(Math.sqrt(GM_SUN * (2 / r - 1 / a)), 2)} km/s`]);
    }
    const spinDeg = ((b.spin / DEG) % 360 + 360) % 360;
    rows.push(['Drehwinkel (Nullmeridian)', `${nf(spinDeg, 1)}°`]);
    const dl = $('infoList');
    dl.innerHTML = '';
    for (const [k, v] of rows) {
      const dt = document.createElement('dt');
      dt.textContent = k;
      const dd = document.createElement('dd');
      dd.textContent = v;
      dl.append(dt, dd);
    }
    $('followBtn').textContent = state.follow === b ? 'Folgen beenden' : 'Folgen & heranzoomen';
  }

  function updateBodyBar() {
    for (const btn of $('bodyBar').children) {
      btn.classList.toggle('active', btn.dataset.id === (state.follow || state.selected || {}).id);
    }
  }

  function updateSpeedButtons() {
    for (const btn of $('speeds').children) btn.classList.toggle('active', Number(btn.dataset.speed) === state.speed);
    $('play').textContent = state.playing ? '⏸' : '▶';
    $('reverse').classList.toggle('active', state.direction < 0);
  }

  function setupUI() {
    const bar = $('bodyBar');
    for (const b of BODIES) {
      const btn = document.createElement('button');
      btn.dataset.id = b.id;
      btn.innerHTML = `<span class="dot" style="background:${b.color}"></span>${b.name}`;
      btn.addEventListener('click', () => focusBody(b));
      bar.append(btn);
    }
    const sp = $('speeds');
    for (const [v, label] of SPEEDS) {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.dataset.speed = v;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        state.speed = v;
        state.playing = true;
        updateSpeedButtons();
      });
      sp.append(btn);
    }
    $('play').addEventListener('click', togglePlay);
    $('reverse').addEventListener('click', () => {
      state.direction *= -1;
      updateSpeedButtons();
    });
    $('now').addEventListener('click', goNow);
    $('dateInput').addEventListener('change', (e) => {
      const t = new Date(e.target.value).getTime();
      if (isFinite(t)) state.simMs = t;
    });
    $('zoomIn').addEventListener('click', () => zoomAt(W / 2, H / 2, 1.6));
    $('zoomOut').addEventListener('click', () => zoomAt(W / 2, H / 2, 1 / 1.6));
    $('zoomFit').addEventListener('click', fitView);
    $('infoClose').addEventListener('click', () => {
      state.follow = null;
      select(null);
    });
    $('followBtn').addEventListener('click', () => {
      if (state.follow === state.selected) {
        state.follow = null;
        updateInfo();
        updateBodyBar();
      } else focusBody(state.selected);
    });

    const bind = (id, key, after) => {
      const el = $(id);
      el.checked = state[key];
      el.addEventListener('change', () => {
        state[key] = el.checked;
        if (after) after();
      });
    };
    const refit = () => {
      computePositions();
      if (state.follow) focusBody(state.follow);
      else fitView();
    };
    bind('optRealDist', 'realDist', refit);
    bind('optRealSize', 'realSize', refit);
    bind('optOrbits', 'showOrbits');
    bind('optLabels', 'showLabels');
    bind('optBelts', 'showBelts');
    $('optTilt').value = Math.round(state.tilt / DEG);
    $('optTilt').addEventListener('input', (e) => setTilt(Number(e.target.value) * DEG));

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'range') return;
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      else if (e.key === '+' || e.key === '=') zoomAt(W / 2, H / 2, 1.4);
      else if (e.key === '-' || e.key === '_') zoomAt(W / 2, H / 2, 1 / 1.4);
      else if (e.key === '0') fitView();
      else if (e.key === 'n' || e.key === 'N') goNow();
      else if (e.key === 'Escape') { state.follow = null; select(null); }
    });
    updateSpeedButtons();
  }

  function setTilt(t) {
    // Bildschirmmitte beim Kippen erhalten (wenn keinem Körper gefolgt wird)
    const oldCt = ct;
    state.tilt = clamp(t, 0, 88 * DEG);
    ct = Math.cos(state.tilt);
    st = Math.sin(state.tilt);
    if (!state.follow && oldCt > 1e-3) cam.y = (cam.y / oldCt) * ct;
    $('optTilt').value = Math.round(state.tilt / DEG);
  }

  function togglePlay() {
    state.playing = !state.playing;
    updateSpeedButtons();
  }

  function goNow() {
    state.simMs = Date.now();
    state.speed = 1;
    state.direction = 1;
    state.playing = true;
    updateSpeedButtons();
  }

  // ------------------------------------------------------------------ Maus & Touch
  const pointers = new Map();
  let down = null, pinch = null, lastTap = { t: 0, body: null };

  function pick(x, y) {
    let best = null, bestD = Infinity;
    for (const b of BODIES) {
      if (b.sx === undefined) continue;
      if (b.id === 'moon' && moonHidden()) continue;
      const d = Math.hypot(b.sx - x, b.sy - y);
      const hit = Math.max(b.rpx + 4, 12);
      if (d < hit && d < bestD) { best = b; bestD = d; }
    }
    return best;
  }

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      down = { x: e.clientX, y: e.clientY, moved: false, tilt: e.shiftKey || e.button === 2 };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) };
      if (down) down.moved = true;
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) {
      canvas.classList.toggle('hover', !!pick(e.clientX, e.clientY));
      return;
    }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    prev.x = e.clientX;
    prev.y = e.clientY;
    if (pointers.size === 1 && down) {
      if (!down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4) {
        down.moved = true;
        canvas.classList.add('dragging');
      }
      if (!down.moved) return;
      if (down.tilt) {
        setTilt(state.tilt + dy * 0.4 * DEG);
      } else {
        if (state.follow) {
          state.follow = null;
          updateInfo();
          updateBodyBar();
        }
        cam.anim = false;
        cam.goalX = cam.goalY = null;
        cam.x -= dx / cam.scale;
        cam.y += dy / cam.scale;
      }
    } else if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.dist > 0) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, dist / pinch.dist);
      pinch.dist = dist;
    }
  });
  const endPointer = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) {
      canvas.classList.remove('dragging');
      if (down && !down.moved && e.type === 'pointerup') {
        const b = pick(e.clientX, e.clientY);
        const now = performance.now();
        if (b && lastTap.body === b && now - lastTap.t < 400) focusBody(b);
        else if (b) select(b);
        lastTap = { t: now, body: b };
      }
      down = null;
    }
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const k = e.deltaMode === 1 ? 0.05 : e.deltaMode === 2 ? 1 : 0.0015;
    zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * k));
  }, { passive: false });

  // ------------------------------------------------------------------ Hauptschleife
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (state.playing) {
      if (state.speed === 1 && state.direction === 1 && Math.abs(state.simMs - Date.now()) < 5000) {
        state.simMs = Date.now(); // Echtzeit an die Systemuhr koppeln
      } else {
        state.simMs += dt * 1000 * state.speed * state.direction;
      }
      // Datumsgrenzen von JavaScript nicht überschreiten
      state.simMs = clamp(state.simMs, -8.0e15, 8.0e15);
    }
    computePositions();
    updateCamera(dt);
    render();
    updateHud(now);
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------------ Start
  for (const b of BODIES) {
    const t = makeTexture(TEXTURES[b.id], TEX_W, TEX_H);
    b.texPx = new Uint32Array(t.getContext('2d').getImageData(0, 0, TEX_W, TEX_H).data.buffer);
  }
  resize();
  window.addEventListener('resize', () => {
    const wasFit = !state.follow;
    resize();
    if (wasFit) cam.scale = clampScale(cam.scale);
  });
  setupUI();
  computePositions();
  cam.scale = fitScale();
  requestAnimationFrame(frame);
})();
