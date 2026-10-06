'use strict';
/*
 * Sonnensystem live – läuft komplett im Browser, ohne Datenbank und ohne Bibliotheken.
 *
 * Planetenpositionen: Keplersche Bahnelemente von JPL/NASA
 *   (E. M. Standish, "Approximate Positions of the Planets", gültig 1800–2050).
 * Eigenrotation: Nullmeridian-Winkel W = W0 + W1·d nach IAU WGCCRE,
 *   d = Tage seit J2000 – dadurch steht jede Rotation so wie zum gewählten Zeitpunkt.
 * Achsen: Nordpol-Richtung (Rektaszension/Deklination) nach IAU – jede Kugel wird
 *   in 3D gedreht, d. h. Achsneigung und Blickrichtung werden berücksichtigt.
 * Mond: vereinfachte Mondtheorie (Hauptterme), gebundene Rotation nach IAU.
 *
 * Erde: echte Küstenlinien, Seen und Gletscher aus earth-data.js (Natural Earth).
 * Echte Bilder: equirektangulare Karten (2:1, Länge −180°…+180°, Norden oben) in den
 *   Ordner "textures/" legen – Dateinamen siehe TEXTURE_FILES. Fehlt ein Bild, wird eine
 *   erzeugte Textur verwendet.
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

  // Für HD-Texturen werden zusätzliche Oktaven (feinere Details) berechnet.
  let fbmBoost = 0;
  function fbm(x, y, z, s, octaves = 5) {
    let amp = 0.5, freq = 1, sum = 0, norm = 0;
    octaves += fbmBoost;
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

  // Erzeugt eine Equirectangular-Textur (Länge −180..+180°, Breite +90..−90°) zeilenweise.
  // step(budgetMs) rechnet höchstens so lange und liefert am Ende die fertige Textur –
  // so können große HD-Texturen nebenbei entstehen, ohne die Animation anzuhalten.
  // fn(x, y, z, lat, lon, px, py) → [r, g, b]; boost = zusätzliche Rausch-Oktaven.
  // Leinwand – im Hauptprogramm als <canvas>, im Web Worker als OffscreenCanvas
  function makeCanvas(w, h) {
    if (typeof document === 'undefined') return new OffscreenCanvas(w, h);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  // Eine Texturzeile y berechnen und ab Zeile y0 in den RGBA-Puffer d schreiben
  function renderRow(fn, w, h, y, d, y0) {
    const lat = (0.5 - (y + 0.5) / h) * Math.PI;
    const cl = Math.cos(lat), sl = Math.sin(lat);
    let i = (y - y0) * w * 4;
    for (let x = 0; x < w; x++, i += 4) {
      const lon = ((x + 0.5) / w) * TAU - Math.PI;
      const col = fn(cl * Math.cos(lon), cl * Math.sin(lon), sl, lat, lon, x, y);
      d[i] = col[0];
      d[i + 1] = col[1];
      d[i + 2] = col[2];
      d[i + 3] = 255;
    }
  }

  function textureJob(fn, w, h, boost = 0) {
    const c = makeCanvas(w, h);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    let y = 0;
    return {
      progress: () => y / h,
      cancel() {},
      step(budgetMs = Infinity) {
        const t0 = performance.now();
        fbmBoost = boost;
        try {
          while (y < h && performance.now() - t0 < budgetMs) renderRow(fn, w, h, y++, img.data, 0);
        } finally {
          fbmBoost = 0;
        }
        if (y < h) return null;
        ctx.putImageData(img, 0, 0);
        return texFromCanvas(c);
      },
    };
  }

  const makeTexture = (fn, w = 256, h = 128) => textureJob(fn, w, h).step();

  // Textur als gepackte Pixel + Zonalmittel je Zeile (für Bewegungsunschärfe bei schneller Drehung)
  function texFromCanvas(c) {
    return texFromPixels(c.getContext('2d').getImageData(0, 0, c.width, c.height).data, c.width, c.height);
  }

  function texFromPixels(rgba, w, h) {
    const px = new Uint32Array(rgba.buffer, rgba.byteOffset, w * h);
    const mean = new Uint32Array(h);
    for (let y = 0; y < h; y++) {
      let r = 0, g = 0, b = 0;
      for (let x = 0; x < w; x++) {
        const p = px[y * w + x];
        r += p & 255;
        g += (p >>> 8) & 255;
        b += (p >>> 16) & 255;
      }
      mean[y] = (Math.round(r / w) | (Math.round(g / w) << 8) | (Math.round(b / w) << 16)) >>> 0;
    }
    return { w, h, px, mean };
  }

  // ------------------------------------------------------------------ Erde aus echten Küstenlinien
  // earth-data.js enthält Land, Seen und Gletscher (Natural Earth, gemeinfrei). Daraus wird eine
  // Karte gezeichnet und eingefärbt – ganz ohne Bilddatei, funktioniert also auch per Doppelklick.
  function decodeRings(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
    let i = 0;
    const next = () => {
      let n = 0, sh = 1, b;
      do {
        b = bytes[i++];
        n += (b & 127) * sh;
        sh *= 128;
      } while (b & 128);
      return n;
    };
    const zz = (n) => (n % 2 ? -(n + 1) / 2 : n / 2);
    const rings = [];
    while (i < bytes.length) {
      const cnt = next();
      const r = new Float32Array(cnt * 2);
      let x = 0, y = 0;
      for (let k = 0; k < cnt; k++) {
        x += zz(next());
        y += zz(next());
        r[2 * k] = x / 10;
        r[2 * k + 1] = y / 10;
      }
      rings.push(r);
    }
    return rings;
  }

  // Polygone (Länge/Breite) in eine Graustufenmaske zeichnen; blur > 0 macht einen weichen Rand
  // Nur die Zeilen y0..y1 werden gezeichnet (Streifen für die Web Worker); für die Unschärfe
  // wird oben und unten ein Rand mitgezeichnet.
  function rasterize(rings, w, h, blur = 0, y0 = 0, y1 = h) {
    const m = blur ? Math.ceil(blur * 3) : 0;
    const bh = y1 - y0 + 2 * m;
    const c = makeCanvas(w, bh);
    const cx = c.getContext('2d');
    cx.fillStyle = '#000';
    cx.fillRect(0, 0, w, bh);
    cx.translate(0, m - y0);
    cx.fillStyle = '#fff';
    cx.beginPath();
    for (const r of rings) {
      for (let k = 0; k < r.length; k += 2) {
        const x = ((r[k] + 180) / 360) * w, y = ((90 - r[k + 1]) / 180) * h;
        if (k === 0) cx.moveTo(x, y);
        else cx.lineTo(x, y);
      }
      cx.closePath();
    }
    cx.fill('evenodd');
    if (blur) {
      const b = makeCanvas(w, bh);
      const bx = b.getContext('2d');
      bx.filter = `blur(${blur}px)`;
      bx.drawImage(c, 0, 0);
      return bx.getImageData(0, m, w, y1 - y0).data;
    }
    return cx.getImageData(0, 0, w, y1 - y0).data;
  }

  // Grobe Klimazonen für die Einfärbung: [Länge, Breite, Radius Länge, Radius Breite, Stärke]
  const DESERTS = [
    [8, 23, 30, 8, 1], [47, 23, 13, 9, 1], [60, 29, 11, 5, 0.8], [62, 43, 14, 5, 0.7],
    [84, 39, 9, 3.5, 1], [104, 42, 15, 5, 0.85], [130, -25, 16, 9, 0.9], [-113, 33, 8, 6, 0.75],
    [-70, -22, 3.5, 9, 0.9], [19, -24, 8, 6, 0.7], [-68, -45, 4, 7, 0.5], [45, 7, 7, 5, 0.6],
    [88, 33, 12, 4, 0.45], [-104, 26, 5, 5, 0.5],
  ];
  const RAINFOREST = [
    [-62, -4, 16, 9, 1], [20, 0, 11, 6, 1], [112, 0, 20, 7, 0.9], [100, 15, 8, 6, 0.5],
    [-80, 5, 6, 8, 0.6], [145, -6, 6, 4, 0.7],
  ];
  // Grundfarbe nach geografischer Breite (Betrag): [Breite, r, g, b]
  const ZONES = [
    [0, 52, 100, 38], [12, 98, 118, 52], [28, 128, 132, 72], [40, 62, 102, 44],
    [55, 42, 78, 44], [64, 70, 86, 58], [70, 128, 122, 100], [90, 150, 145, 130],
  ];

  function regionWeight(list, lonD, latD) {
    let w = 0;
    for (const [cl, cb, rl, rb, k] of list) {
      const dl = angDiff(lonD * DEG, cl * DEG) / DEG / rl, db = (latD - cb) / rb;
      const d = dl * dl + db * db;
      if (d < 1) w = Math.max(w, k * (1 - d) * (1 - d) * 1.6);
    }
    return Math.min(1, w);
  }

  function zoneColor(alat) {
    for (let k = 1; k < ZONES.length; k++) {
      if (alat <= ZONES[k][0]) {
        const a = ZONES[k - 1], b = ZONES[k];
        return mix(a.slice(1), b.slice(1), (alat - a[0]) / (b[0] - a[0]));
      }
    }
    return ZONES[ZONES.length - 1].slice(1);
  }

  // Liefert die Farbfunktion der Erde für eine Karte der Größe w × h (Masken werden vorab gezeichnet)
  function earthTextureFn(data, w, h, y0 = 0, y1 = h) {
    const landRings = decodeRings(data.land);
    const land = rasterize(landRings, w, h, 0, y0, y1);
    const shelf = rasterize(landRings, w, h, w / 160, y0, y1);
    const lakes = rasterize(decodeRings(data.lakes), w, h, 0, y0, y1);
    const ice = rasterize(decodeRings(data.ice), w, h, 0, y0, y1);
    let zoneRow = -1, zone = null;
    return (px, py, pz, lat, lon, x, y) => {
      const latD = lat / DEG, lonD = lon / DEG;
      if (y !== zoneRow) { zoneRow = y; zone = zoneColor(Math.abs(latD)); }
      const i = ((y - y0) * w + x) * 4;
      // Meer: tief → flach in Küstennähe
      let col = mix([6, 26, 74], [28, 92, 150], Math.pow(shelf[i] / 255, 0.8) * 0.9);
      let t = land[i] / 255;
      if (lakes[i] > 127) t = Math.min(t, 1 - lakes[i] / 255);
      if (t > 0) {
        const n = fbm(px * 6, py * 6, pz * 6, 11, 3);
        const m = fbm(px * 14, py * 14, pz * 14, 12, 3); // unregelmäßige Ränder der Wüsten
        let lc = zone;
        const dry = regionWeight(DESERTS, lonD + (m - 0.5) * 9, latD + (n - 0.5) * 6);
        lc = mix(lc, [212, 182, 128], dry * (0.75 + m * 0.5) + (n - 0.5) * 0.35);
        lc = mix(lc, [22, 70, 28], regionWeight(RAINFOREST, lonD, latD));
        const k = 0.85 + n * 0.3;
        col = mix(col, [lc[0] * k, lc[1] * k, lc[2] * k], t);
      }
      // Gletscher und Eisschilde (Grönland, Antarktis), Meereis in der hohen Arktis
      if (ice[i] > 0) col = mix(col, [238, 243, 248], ice[i] / 255);
      if (latD > 80 && t < 0.5) col = mix(col, [225, 233, 240], (latD - 80) / 6);
      // dezente Wolken, damit die Kontinente gut erkennbar bleiben
      const cloud = fbm(px * 3 + 7, py * 3, pz * 5, 13, 4);
      if (cloud > 0.6) col = mix(col, [255, 255, 255], (cloud - 0.6) * 1.6);
      return col;
    };
  }

  const makeEarthTexture = (data, w = 1024, h = 512) => makeTexture(earthTextureFn(data, w, h), w, h);

  // ------------------------------------------------------------------ echte Bilder (optional)
  // Equirektangulare Karten, z. B. von solarsystemscope.com/textures (CC BY 4.0) oder NASA.
  const TEXTURE_FILES = {
    sun: 'textures/sun.jpg',
    mercury: 'textures/mercury.jpg',
    venus: 'textures/venus.jpg',
    earth: 'textures/earth.jpg',
    moon: 'textures/moon.jpg',
    mars: 'textures/mars.jpg',
    jupiter: 'textures/jupiter.jpg',
    saturn: 'textures/saturn.jpg',
    uranus: 'textures/uranus.jpg',
    neptune: 'textures/neptune.jpg',
    pluto: 'textures/pluto.jpg',
    io: 'textures/io.jpg',
    europa: 'textures/europa.jpg',
    ganymede: 'textures/ganymede.jpg',
    callisto: 'textures/callisto.jpg',
    titan: 'textures/titan.jpg',
  };
  // Ringstreifen: links innen → rechts außen, mit Transparenz (z. B. 2k_saturn_ring_alpha.png)
  const RING_FILE = 'textures/saturn_ring.png';
  const RING_IMG_INNER = 1.11, RING_IMG_OUTER = 2.33; // in Saturnradien

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  // Bild auf max. 2048 px Breite in eine Canvas zeichnen. Wirft SecurityError bei file://.
  function imageToCanvas(img, maxW = 2048) {
    const w = Math.min(img.naturalWidth, maxW);
    const h = Math.max(1, Math.round((img.naturalHeight * w) / img.naturalWidth));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cx = c.getContext('2d');
    cx.drawImage(img, 0, 0, w, h);
    cx.getImageData(0, 0, 1, 1); // löst bei blockiertem Zugriff sofort den Fehler aus
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
      // feine Wirbel und Strömungsbänder, die beim Heranzoomen sichtbar werden
      const f = fbm(x * 18 + t * 2, y * 18, z * 40, 32, 3);
      const b = Math.sin(lat * 15 + t * 2.4) + Math.sin(lat * 48 + f * 5) * 0.18;
      let col = b > 0 ? mix([212, 178, 140], [244, 232, 210], b) : mix([212, 178, 140], [150, 98, 64], -b);
      col = mix(col, [250, 245, 235], (f - 0.62) * 2.2);
      const e = spot(lat, lon, -22, 30, 6, 13);
      if (e < 1) col = mix(col, [196, 88, 56], (1 - e) * 1.6);
      return col;
    },
    saturn(x, y, z, lat) {
      const t = fbm(x * 3, y * 3, z * 4, 41, 3);
      const f = fbm(x * 14, y * 14, z * 36, 42, 3);
      const b = Math.sin(lat * 11 + t * 1.3) + Math.sin(lat * 40 + f * 3) * 0.15;
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
    io(x, y, z) {
      const n = fbm(x * 3, y * 3, z * 3, 91, 5);
      const v = fbm(x * 9, y * 9, z * 9, 92, 3);
      let col = mix([200, 170, 60], [245, 230, 140], n * 1.3 - 0.15);
      if (v > 0.66) col = mix(col, [70, 40, 20], (v - 0.66) * 6); // Vulkane
      else if (v < 0.3) col = mix(col, [215, 110, 40], (0.3 - v) * 3); // Schwefelablagerungen
      return col;
    },
    europa(x, y, z) {
      const n = fbm(x * 2.5, y * 2.5, z * 2.5, 101, 4);
      let col = mix([185, 165, 135], [242, 236, 222], n * 1.4 - 0.1);
      // rötlich-braune Risse (Lineae)
      const l1 = Math.abs(Math.sin((x * 7 + y * 3 + fbm(x * 4, y * 4, z * 4, 102, 3) * 4) * 3));
      const l2 = Math.abs(Math.sin((y * 6 - z * 5 + fbm(x * 5, y * 5, z * 5, 103, 3) * 4) * 3));
      const line = Math.min(l1, l2);
      if (line < 0.08) col = mix(col, [150, 95, 60], (0.08 - line) * 10);
      return col;
    },
    ganymede(x, y, z) {
      const n = fbm(x * 2, y * 2, z * 2, 111, 5);
      const c = fbm(x * 12, y * 12, z * 12, 112, 3);
      const base = n < 0.47 ? [100, 90, 80] : [175, 165, 150];
      return mix(base, [225, 220, 210], c * 0.7 - 0.2);
    },
    callisto(x, y, z) {
      const n = fbm(x * 3, y * 3, z * 3, 121, 4);
      const c = fbm(x * 16, y * 16, z * 16, 122, 3);
      let col = mix([55, 48, 40], [110, 98, 82], n * 1.3 - 0.15);
      if (c > 0.66) col = mix(col, [230, 225, 215], (c - 0.66) * 5); // helle Krater
      return col;
    },
    titan(x, y, z, lat) {
      const n = fbm(x * 2, y * 2, z * 4, 131, 4);
      return mix([170, 110, 40], [225, 165, 80], 0.5 + Math.sin(lat * 3) * 0.15 + (n - 0.5) * 0.6);
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
      id: 'io', name: 'Io', type: 'Mond des Jupiter', R: 1821.6, color: '#e8d26a', minPx: 1.5, parent: 'jupiter',
      sat: { a: 421700, L: [106.07719, 203.488955790] }, rot: [0, 203.488955790],
      facts: [['Durchmesser', '3.643 km'], ['Umlaufzeit', '1,77 Tage'], ['Besonderheit', 'über 400 aktive Vulkane']],
    },
    {
      id: 'europa', name: 'Europa', type: 'Mond des Jupiter', R: 1560.8, color: '#d9cdb4', minPx: 1.5, parent: 'jupiter',
      sat: { a: 671034, L: [175.73161, 101.374724735] }, rot: [0, 101.374724735],
      facts: [['Durchmesser', '3.122 km'], ['Umlaufzeit', '3,55 Tage'], ['Besonderheit', 'Ozean unter dem Eispanzer']],
    },
    {
      id: 'ganymede', name: 'Ganymed', type: 'Mond des Jupiter', R: 2634.1, color: '#a49a8c', minPx: 1.5, parent: 'jupiter',
      sat: { a: 1070412, L: [120.55883, 50.317609207] }, rot: [0, 50.317609207],
      facts: [['Durchmesser', '5.268 km'], ['Umlaufzeit', '7,15 Tage'], ['Besonderheit', 'größter Mond des Sonnensystems']],
    },
    {
      id: 'callisto', name: 'Kallisto', type: 'Mond des Jupiter', R: 2410.3, color: '#6f6457', minPx: 1.5, parent: 'jupiter',
      sat: { a: 1882709, L: [84.44459, 21.571071177] }, rot: [0, 21.571071177],
      facts: [['Durchmesser', '4.821 km'], ['Umlaufzeit', '16,69 Tage'], ['Besonderheit', 'am stärksten verkraterte Oberfläche']],
    },
    {
      id: 'saturn', name: 'Saturn', type: 'Gasriese', R: 58232, color: '#e3cd95', minPx: 4, rings: true,
      el: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
      rt: [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
      rot: [38.90, 810.7939024],
      facts: [['Durchmesser', '116.460 km'], ['Umlaufzeit', '29,46 Jahre'], ['Rotation', '10 h 34 min'], ['Monde', '274']],
    },
    {
      id: 'titan', name: 'Titan', type: 'Mond des Saturn', R: 2574.7, color: '#d9a35a', minPx: 1.5, parent: 'saturn',
      // λ0/ϖ0 an TASS 1.7 angepasst (Abweichung < 0,15° für 2000–2026)
      sat: { a: 1221870, L: [7.53, 22.5769768], e: 0.0288, peri: [204.22, 0.0014012], epoch: 2451545.0, equatorial: true },
      rot: [0, 22.5769768],
      facts: [['Durchmesser', '5.149 km'], ['Umlaufzeit', '15,95 Tage'], ['Besonderheit', 'dichte Stickstoff-Atmosphäre']],
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
  // Nordpol der Rotationsachse [α0, δ0] in Grad (IAU WGCCRE, äquatorial J2000)
  const POLES = {
    sun: [286.13, 63.87],
    mercury: [281.0103, 61.4155],
    venus: [272.76, 67.16],
    earth: [0, 90],
    moon: [269.9949, 66.5392],
    mars: [317.269, 54.432],
    jupiter: [268.056595, 64.495303],
    saturn: [40.589, 83.537],
    uranus: [257.311, -15.175],
    neptune: [299.36, 43.46],
    pluto: [132.993, -6.163],
    io: [268.05, 64.5],
    europa: [268.08, 64.51],
    ganymede: [268.2, 64.57],
    callisto: [268.72, 64.83],
    titan: [39.4827, 83.4279],
  };
  for (const b of BODIES) b.pole = POLES[b.id];
  const byId = Object.fromEntries(BODIES.map((b) => [b.id, b]));
  const PLANETS = BODIES.filter((b) => b.el);
  const MOONS = BODIES.filter((b) => b.parent);
  for (const m of MOONS) m.parentBody = BODIES.find((b) => b.id === m.parent);

  // äquatorial (J2000) → ekliptikal
  const eqToEcl = (v) => [
    v[0],
    v[1] * Math.cos(OBLIQUITY) + v[2] * Math.sin(OBLIQUITY),
    -v[1] * Math.sin(OBLIQUITY) + v[2] * Math.cos(OBLIQUITY),
  ];

  // Körperfestes Achsensystem nach IAU: P = Nordpol, X = Nullmeridian, Y = 90° Ost.
  // X entsteht, indem der Knoten Q (Schnitt Äquator des Körpers / Himmelsäquator)
  // um den Winkel W um P gedreht wird.
  function bodyAxes(b, W) {
    const a = b.pole[0] * DEG, d = b.pole[1] * DEG;
    const P = [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
    const Q = [-Math.sin(a), Math.cos(a), 0];
    const PQ = [P[1] * Q[2] - P[2] * Q[1], P[2] * Q[0] - P[0] * Q[2], P[0] * Q[1] - P[1] * Q[0]];
    const c = Math.cos(W), s = Math.sin(W);
    const X = [Q[0] * c + PQ[0] * s, Q[1] * c + PQ[1] * s, Q[2] * c + PQ[2] * s];
    const Y = [P[1] * X[2] - P[2] * X[1], P[2] * X[0] - P[0] * X[2], P[0] * X[1] - P[1] * X[0]];
    return { X: eqToEcl(X), Y: eqToEcl(Y), P: eqToEcl(P) };
  }
  // Erzeugte Ringe: [innen, außen, r, g, b, alpha] in Saturnradien
  const RING_BANDS = [
    [1.24, 1.53, 150, 135, 110, 0.35],
    [1.53, 1.95, 225, 205, 165, 0.85],
    [2.03, 2.27, 200, 180, 140, 0.7],
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

  const poleEq = (b) => {
    const a = b.pole[0] * DEG, d = b.pole[1] * DEG;
    return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
  };
  const eclToEq = (v) => [
    v[0],
    v[1] * Math.cos(OBLIQUITY) - v[2] * Math.sin(OBLIQUITY),
    v[1] * Math.sin(OBLIQUITY) + v[2] * Math.cos(OBLIQUITY),
  ];

  // Galileische Monde: mittlere Längen nach J. Meeus, „Astronomical Algorithms“, Kap. 44,
  //   inkl. Hauptstörung der Laplace-Resonanz; Bezug B1950 → +0,70° Präzession bis J2000.
  //   Geprüft am Meeus-Beispiel 44.a: Abweichung ≤ 0,03 Jupiterradien (Kallisto 0,26).
  // Titan: Bahnelemente (JPL) in der Äquatorebene des Saturn, gemessen vom Knoten auf dem
  //   Himmelsäquator, mit Mittelpunktsgleichung (e = 0,0288); geprüft gegen TASS 1.7.
  function satelliteOffset(m, jd) {
    const t = jd - (m.sat.epoch ?? 2443000.5);
    let L = m.sat.L[0] + m.sat.L[1] * t;
    if (m.sat.equatorial) {
      const e = m.sat.e, w = m.sat.peri[0] + m.sat.peri[1] * t;
      const M = (L - w) * DEG;
      const nu = M + 2 * e * Math.sin(M) + 1.25 * e * e * Math.sin(2 * M);
      const th = w * DEG + nu;
      const r = (m.sat.a * (1 - e * e)) / (1 + e * Math.cos(nu)) / AU_KM;
      const a = m.parentBody.pole[0] * DEG;
      const P = poleEq(m.parentBody), Q = [-Math.sin(a), Math.cos(a), 0];
      const PQ = [P[1] * Q[2] - P[2] * Q[1], P[2] * Q[0] - P[0] * Q[2], P[0] * Q[1] - P[1] * Q[0]];
      return eqToEcl([0, 1, 2].map((k) => (Q[k] * Math.cos(th) + PQ[k] * Math.sin(th)) * r));
    }
    if (m.id === 'io' || m.id === 'europa') {
      const l1 = 106.07719 + 203.48895579 * t, l2 = 175.73161 + 101.374724735 * t, l3 = 120.55883 + 50.317609207 * t;
      L += m.id === 'io' ? 0.47259 * Math.sin(2 * (l1 - l2) * DEG) : 1.06476 * Math.sin(2 * (l2 - l3) * DEG);
    }
    L = (L + 0.6984) * DEG;
    const d = [Math.cos(L), Math.sin(L), 0];
    const P = eqToEcl(poleEq(m.parentBody));
    const k = d[0] * P[0] + d[1] * P[1] + d[2] * P[2];
    const v = normalize([d[0] - k * P[0], d[1] - k * P[1], d[2] - k * P[2]]);
    const r = m.sat.a / AU_KM;
    return [v[0] * r, v[1] * r, v[2] * r];
  }

  // Gebundene Rotation: Nullmeridian (Länge 0°) zeigt zum Planeten
  function lockedSpin(b, dirEcl) {
    const a = b.pole[0] * DEG;
    const P = poleEq(b), Q = [-Math.sin(a), Math.cos(a), 0];
    const PQ = [P[1] * Q[2] - P[2] * Q[1], P[2] * Q[0] - P[0] * Q[2], P[0] * Q[1] - P[1] * Q[0]];
    const d = eclToEq(dirEcl);
    return Math.atan2(d[0] * PQ[0] + d[1] * PQ[1] + d[2] * PQ[2], d[0] * Q[0] + d[1] * Q[1] + d[2] * Q[2]);
  }

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

  function projectVec(v) {
    return [v[0], v[1] * ct + v[2] * st, -v[1] * st + v[2] * ct];
  }

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
    const moon = byId.moon;
    for (const m of MOONS) {
      const parent = m.parentBody;
      const geo = m.sat ? satelliteOffset(m, jd) : moonGeocentric(state.days);
      const gl = len(geo);
      // In der vergrößerten Darstellung werden die Monde weiter nach außen gesetzt (Reihenfolge bleibt)
      const minOff = m.sat ? dispRadius(parent) * 1.25 * Math.sqrt(m.sat.a / parent.R) : 3.2 * dispRadius(parent);
      const off = Math.max(gl, minOff);
      m.geo = geo;
      m.helio = [parent.helio[0] + geo[0], parent.helio[1] + geo[1], parent.helio[2] + geo[2]];
      m.disp = [0, 1, 2].map((k) => parent.disp[k] + (geo[k] / gl) * off);
      m.geoDisp = off;
    }

    // Mond: Hauptterme der IAU-Lösung (Präzession der Mondachse um den Ekliptikpol, 18,6 Jahre)
    const E1 = (125.045 - 0.0529921 * state.days) * DEG, E2 = (250.089 - 0.1059842 * state.days) * DEG;
    moon.pole = [269.9949 - 3.8787 * Math.sin(E1) - 0.1204 * Math.sin(E2), 66.5392 + 1.5419 * Math.cos(E1) + 0.0239 * Math.cos(E2)];
    moon.rotExtra = 3.561 * Math.sin(E1) + 0.1208 * Math.sin(E2);

    for (const b of BODIES) {
      b.p = project(b.disp);
      b.spin = b.sat
        ? lockedSpin(b, [-b.geo[0], -b.geo[1], -b.geo[2]])
        : ((b.rot[0] + b.rot[1] * state.days + (b.rotExtra || 0)) % 360) * DEG;
      const ax = bodyAxes(b, b.spin);
      b.axes = ax;
      b.viewAxes = { X: projectVec(ax.X), Y: projectVec(ax.Y), P: projectVec(ax.P) };
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
    if (b.parent) s = Math.min(s, Math.min(W, H) * 0.3 / b.geoDisp); // Planet bleibt im Bild
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
    // Mondbahnen, sobald sie groß genug sind
    for (const m of MOONS) {
      if (m.geoDisp * cam.scale < 25) continue;
      const parent = m.parentBody;
      const n = m.sat ? eqToEcl(poleEq(parent)) : moonOrbitNormal();
      const a = normalize(cross(n, [1, 0, 0])), c = cross(n, a);
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const t = (i / 120) * TAU;
        const v = [0, 1, 2].map((k) => parent.disp[k] + (a[k] * Math.cos(t) + c[k] * Math.sin(t)) * m.geoDisp);
        const p = project(v);
        if (i === 0) ctx.moveTo(sx(p.X), sy(p.Y));
        else ctx.lineTo(sx(p.X), sy(p.Y));
      }
      const al = m === state.selected ? 0.75 : 0.25 + (1 - (m.alpha ?? 1)) * 0.6;
      ctx.strokeStyle = `rgba(200,200,200,${al.toFixed(2)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  function normalize(v) {
    const l = len(v) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  }
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

  // Texturierte Kugel, Pixel für Pixel: Für jeden sichtbaren Punkt (u, v, w) der Scheibe wird
  // über die körperfesten Achsen (Pol + Nullmeridian, in Blickkoordinaten) die geografische
  // Breite/Länge bestimmt. Dadurch stimmen Drehwinkel, Drehrichtung, Achsneigung und
  // Blickrichtung – z. B. zeigt der Mond der Erde immer dieselbe Seite.
  // Berechnet wird nur der Teil der Scheibe, der auf dem Bildschirm liegt, mit einem festen
  // Pixelbudget (beobachteter Körper: groß + bilineare Filterung, alle anderen: klein).
  // blur (0..1): Mischung mit dem Zonalmittel, wenn die Drehung zu schnell für die Bildrate ist.
  // Pixelbudget: passt sich der Gerätegeschwindigkeit an (Ziel ≈ 9 ms für den beobachteten Körper)
  const PIXEL_BUDGET = 160000, FOCUS_TARGET_MS = 9, FOCUS_MIN = 120000, FOCUS_MAX = 1400000;
  let nsPerPixel = 25; // gleitender Mittelwert, wird laufend gemessen

  // schnelle Näherungen für die Pixelschleife (Fehler < 0,1°)
  const ASIN_N = 8192, ASIN_LUT = new Float32Array(ASIN_N + 1);
  for (let k = 0; k <= ASIN_N; k++) ASIN_LUT[k] = 0.5 - Math.asin((k / ASIN_N) * 2 - 1) / Math.PI;
  function fastAtan2(y, x) {
    const ax = Math.abs(x), ay = Math.abs(y);
    const mx = ax > ay ? ax : ay, mn = ax > ay ? ay : ax;
    if (mx === 0) return 0;
    const a = mn / mx, q = a * a;
    let r = ((-0.0464964749 * q + 0.15931422) * q - 0.327622764) * q * a + a;
    if (ay > ax) r = 1.57079637 - r;
    if (x < 0) r = 3.14159274 - r;
    return y < 0 ? -r : r;
  }
  const sphereBuf = { w: 0, h: 0, canvas: null, ctx: null, img: null, px: null };

  function sphereBuffer(w, h) {
    if (w > sphereBuf.w || h > sphereBuf.h) {
      const c = document.createElement('canvas');
      c.width = Math.max(w, sphereBuf.w);
      c.height = Math.max(h, sphereBuf.h);
      const cx = c.getContext('2d');
      const img = cx.createImageData(c.width, c.height);
      Object.assign(sphereBuf, { w: c.width, h: c.height, canvas: c, ctx: cx, img, px: new Uint32Array(img.data.buffer) });
    }
    return sphereBuf;
  }

  function bilerp(c00, c10, c01, c11, tx, ty) {
    const w00 = (1 - tx) * (1 - ty), w10 = tx * (1 - ty), w01 = (1 - tx) * ty, w11 = tx * ty;
    const r = (c00 & 255) * w00 + (c10 & 255) * w10 + (c01 & 255) * w01 + (c11 & 255) * w11;
    const g = ((c00 >>> 8) & 255) * w00 + ((c10 >>> 8) & 255) * w10 + ((c01 >>> 8) & 255) * w01 + ((c11 >>> 8) & 255) * w11;
    const b = ((c00 >>> 16) & 255) * w00 + ((c10 >>> 16) & 255) * w10 + ((c01 >>> 16) & 255) * w01 + ((c11 >>> 16) & 255) * w11;
    return r | (g << 8) | (b << 16);
  }

  function drawSphere(b, x, y, r) {
    // sichtbarer Ausschnitt der Scheibe (CSS-Pixel)
    const x0 = Math.max(Math.floor(x - r), 0), x1 = Math.min(Math.ceil(x + r), W);
    const y0 = Math.max(Math.floor(y - r), 0), y1 = Math.min(Math.ceil(y + r), H);
    if (x1 <= x0 || y1 <= y0) return;
    const focus = b === hdFocus();
    const visW = x1 - x0, visH = y1 - y0;
    const budget = focus ? clamp((FOCUS_TARGET_MS * 1e6) / nsPerPixel, FOCUS_MIN, FOCUS_MAX) : PIXEL_BUDGET;
    const res = Math.min(DPR, Math.sqrt(budget / (visW * visH)));
    const t0 = performance.now();
    const bw = Math.max(1, Math.round(visW * res)), bh = Math.max(1, Math.round(visH * res));
    const S = sphereBuffer(bw, bh), out = S.px, stride = S.w;
    const T = b.texHi || b.tex;
    const { w: TW, h: TH, px: tex, mean } = T;
    const { X, Y, P } = b.viewAxes;
    const blur = b.blur || 0, keep = 1 - blur;
    // bilinear nur, wenn ein Texel größer als ein Bildpunkt erscheint
    const bilinear = focus && (r * res * Math.PI) / TW > 1.2;
    const sx0 = (x0 - x) / r, sy0 = (y - y0) / r;
    const stepX = visW / bw / r, stepY = visH / bh / r;
    const edge = r * res; // Scheibenradius in Puffer-Pixeln (Kantenglättung)
    for (let py = 0; py < bh; py++) {
      const v0 = sy0 - (py + 0.5) * stepY;
      let i = py * stride;
      for (let px = 0; px < bw; px++, i++) {
        const u0 = sx0 + (px + 0.5) * stepX;
        const d2 = u0 * u0 + v0 * v0;
        if (d2 > 1.0 + 4 / edge) { out[i] = 0; continue; }
        const d = Math.sqrt(d2);
        const cov = (1 - d) * edge + 0.5;
        if (cov <= 0) { out[i] = 0; continue; }
        const k = d > 1 ? 1 / d : 1;
        const u = u0 * k, v = v0 * k;
        const w = Math.sqrt(Math.max(0, 1 - u * u - v * v));
        const bx = u * X[0] + v * X[1] + w * X[2];
        const by = u * Y[0] + v * Y[1] + w * Y[2];
        const bz = u * P[0] + v * P[1] + w * P[2];
        const fy = ASIN_LUT[((bz > 1 ? 1 : bz < -1 ? -1 : bz) + 1) * (ASIN_N / 2) + 0.5 | 0] * TH;
        const fx = (fastAtan2(by, bx) / TAU + 0.5) * TW;
        let c;
        if (bilinear) {
          const ax = fx - 0.5, ay = Math.min(Math.max(fy - 0.5, 0), TH - 1.001);
          const ix = Math.floor(ax), iy = ay | 0, tx = ax - ix, ty = ay - iy;
          const xa = (ix + TW) % TW, xb = (ix + 1) % TW, ra = iy * TW, rb = Math.min(iy + 1, TH - 1) * TW;
          c = bilerp(tex[ra + xa], tex[ra + xb], tex[rb + xa], tex[rb + xb], tx, ty);
        } else {
          let ty = fy | 0;
          if (ty >= TH) ty = TH - 1;
          let tx = fx | 0;
          if (tx >= TW) tx -= TW;
          c = tex[ty * TW + tx];
        }
        if (blur > 0) {
          const m = mean[Math.min(TH - 1, fy | 0)];
          c = ((c & 255) * keep + (m & 255) * blur) |
            ((((c >>> 8) & 255) * keep + ((m >>> 8) & 255) * blur) << 8) |
            ((((c >>> 16) & 255) * keep + ((m >>> 16) & 255) * blur) << 16);
        }
        out[i] = ((c & 0xffffff) | ((cov >= 1 ? 255 : (cov * 255) | 0) << 24)) >>> 0;
      }
    }
    if (bw * bh > 50000) nsPerPixel += (((performance.now() - t0) * 1e6) / (bw * bh) - nsPerPixel) * 0.2;
    S.ctx.putImageData(S.img, 0, 0, 0, 0, bw, bh);
    ctx.save();
    ctx.drawImage(S.canvas, 0, 0, bw, bh, x0, y0, visW, visH);
    // Randverdunkelung
    const g = ctx.createRadialGradient(x, y, r * 0.55, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, b.id === 'sun' ? 'rgba(160,40,0,0.45)' : 'rgba(0,0,0,0.3)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // ------------------------------------------------------------------ HD-Oberflächen
  // Erst wenn man nah an den beobachteten Körper heranzoomt (mehr Bildpunkte als die normale
  // Textur hergibt), wird für genau diesen Körper eine hochaufgelöste Textur erzeugt – in
  // kleinen Häppchen pro Bild, damit die Animation flüssig bleibt. Wechselt man den Körper,
  // wird die alte HD-Textur verworfen (Speicher).
  const HD_STEP_MS = 8;
  const hd = { body: null, job: null };
  const hdFocus = () => state.follow || state.selected;

  // Web Worker: rechnen die HD-Textur in Streifen parallel auf mehreren Prozessorkernen.
  // Der Worker-Code wird aus denselben Funktionen zusammengesetzt wie im Hauptprogramm
  // (Blob-URL – funktioniert auch beim Öffnen per Doppelklick).
  let workers = null, workerJobId = 0;

  function workerSource() {
    const fns = [hash, noise3, fbm, makeCanvas, renderRow, decodeRings, rasterize, regionWeight, zoneColor, earthTextureFn];
    return [
      `'use strict';`,
      `const DEG = ${DEG}, TAU = ${TAU};`,
      `let fbmBoost = 0;`,
      `const clamp = ${clamp};`,
      `const mix = ${mix};`,
      `const angDiff = ${angDiff};`,
      `const spot = ${spot};`,
      `const DESERTS = ${JSON.stringify(DESERTS)}, RAINFOREST = ${JSON.stringify(RAINFOREST)}, ZONES = ${JSON.stringify(ZONES)};`,
      ...fns.map(String),
      `const TEXTURES = {${Object.values(TEXTURES).map(String).join(',\n')}};`,
      `onmessage = (e) => {
        const { jobId, id, w, h, y0, y1, boost, earth } = e.data;
        fbmBoost = boost;
        const fn = earth ? earthTextureFn(earth, w, h, y0, y1) : TEXTURES[id];
        const out = new Uint8ClampedArray(w * (y1 - y0) * 4);
        for (let y = y0; y < y1; y++) renderRow(fn, w, h, y, out, y0);
        postMessage({ jobId, y0, out }, [out.buffer]);
      };`,
    ].join('\n');
  }

  function getWorkers() {
    if (workers) return workers;
    workers = [];
    try {
      if (typeof OffscreenCanvas === 'undefined') throw new Error('kein OffscreenCanvas');
      const url = URL.createObjectURL(new Blob([workerSource()], { type: 'text/javascript' }));
      const n = clamp((navigator.hardwareConcurrency || 2) - 1, 1, 4);
      for (let k = 0; k < n; k++) {
        const wk = new Worker(url);
        wk.onerror = () => { workers = []; }; // Fallback: Berechnung auf dem Hauptthread (s. updateHD)
        workers.push(wk);
      }
    } catch {
      workers = [];
    }
    return workers;
  }

  function workerTextureJob(b, w, h, boost) {
    const ws = getWorkers();
    if (!ws.length) return null;
    const jobId = ++workerJobId, bands = ws.length * 4;
    const px = new Uint8ClampedArray(w * h * 4);
    const earth = b.id === 'earth' && window.EARTH_DATA ? window.EARTH_DATA : null;
    let next = 0, done = 0, result = null, cancelled = false;
    const send = (wk) => {
      if (next >= bands || cancelled) return;
      const y0 = Math.floor((next * h) / bands), y1 = Math.floor(((next + 1) * h) / bands);
      next++;
      wk.postMessage({ jobId, id: b.id, w, h, y0, y1, boost, earth });
    };
    for (const wk of ws) {
      wk.onmessage = (e) => {
        if (e.data.jobId !== jobId || cancelled) return; // Antwort eines abgebrochenen Auftrags
        px.set(e.data.out, e.data.y0 * w * 4);
        if (++done === bands) result = texFromPixels(px, w, h);
        else send(wk);
      };
      send(wk);
    }
    return {
      progress: () => done / bands,
      step: () => result,
      cancel: () => { cancelled = true; },
      failed: () => !result && workers.length === 0,
    };
  }

  function updateHD() {
    const b = hdFocus();
    if (hd.body && hd.body !== b) {
      hd.body.texHi = null;
      hd.body = null;
      if (hd.job) hd.job.cancel();
      hd.job = null;
    }
    const hint = $('hdHint');
    if (!b || b.texHi || b.hdNone || b.rpx === undefined) { hint.classList.add('hidden'); return; }
    const needed = b.rpx * 2 * DPR > b.tex.w * 0.45;
    if (!needed && !hd.job) { hint.classList.add('hidden'); return; }
    hd.body = b;
    if (!hd.job) {
      if (b.realImg) {
        // echtes Bild in voller Auflösung (bis 4096 px) statt der verkleinerten 2048er-Fassung
        if (b.realImg.naturalWidth > b.tex.w) b.texHi = texFromCanvas(imageToCanvas(b.realImg, 4096));
        else b.hdNone = true;
        return;
      }
      // mit Web Workern 4096 × 2048 (parallel), sonst 2048 × 1024 in Häppchen auf dem Hauptthread
      const boost = b.id === 'earth' ? 1 : 2;
      hd.job = workerTextureJob(b, 4096, 2048, boost);
      if (!hd.job) {
        const fn = b.id === 'earth' && window.EARTH_DATA ? earthTextureFn(window.EARTH_DATA, 2048, 1024) : TEXTURES[b.id];
        hd.job = textureJob(fn, 2048, 1024, boost);
      }
    }
    if (hd.job.failed && hd.job.failed()) {
      // Worker ausgefallen → auf dem Hauptthread weiterrechnen
      const fn = b.id === 'earth' && window.EARTH_DATA ? earthTextureFn(window.EARTH_DATA, 2048, 1024) : TEXTURES[b.id];
      hd.job = textureJob(fn, 2048, 1024, b.id === 'earth' ? 1 : 2);
    }
    const tex = hd.job.step(HD_STEP_MS);
    if (tex) {
      b.texHi = tex;
      hd.job = null;
      hint.classList.add('hidden');
    } else {
      hint.textContent = `HD-Oberfläche ${b.name}: ${Math.round(hd.job.progress() * 100)} %`;
      hint.classList.remove('hidden');
    }
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

  // Ringe als Draufsicht-Bild (Kreisring) vorberechnen; gezeichnet wird es gestaucht zur Ellipse.
  const RING_SIZE = 1024;
  let ringImage = null; // { canvas, outer } – outer in Saturnradien

  function buildRingImage(sample, outer) {
    const c = document.createElement('canvas');
    c.width = c.height = RING_SIZE;
    const cx = c.getContext('2d');
    const img = cx.createImageData(RING_SIZE, RING_SIZE);
    const d = img.data, h = RING_SIZE / 2;
    for (let y = 0; y < RING_SIZE; y++) {
      for (let x = 0; x < RING_SIZE; x++) {
        const rho = (Math.hypot(x + 0.5 - h, y + 0.5 - h) / h) * outer;
        const col = sample(rho);
        if (!col) continue;
        const i = (y * RING_SIZE + x) * 4;
        d[i] = col[0];
        d[i + 1] = col[1];
        d[i + 2] = col[2];
        d[i + 3] = col[3];
      }
    }
    cx.putImageData(img, 0, 0);
    return { canvas: c, outer };
  }

  function proceduralRings() {
    return buildRingImage((rho) => {
      for (const [ri, ro, r, g, b, a] of RING_BANDS) {
        if (rho >= ri && rho <= ro) {
          const fine = 0.93 + 0.07 * Math.sin(rho * 45);
          return [r * fine, g * fine, b * fine, a * 255];
        }
      }
      return null;
    }, 2.3);
  }

  function ringsFromStrip(stripCanvas) {
    const w = stripCanvas.width, hgt = stripCanvas.height;
    const data = stripCanvas.getContext('2d').getImageData(0, Math.floor(hgt / 2), w, 1).data;
    return buildRingImage((rho) => {
      if (rho < RING_IMG_INNER || rho > RING_IMG_OUTER) return null;
      const i = Math.min(w - 1, Math.floor(((rho - RING_IMG_INNER) / (RING_IMG_OUTER - RING_IMG_INNER)) * w)) * 4;
      return [data[i], data[i + 1], data[i + 2], data[i + 3]];
    }, RING_IMG_OUTER);
  }

  function ringGeometry() {
    const N = byId.saturn.viewAxes.P; // Ringebene = Äquatorebene des Saturn
    const s = Math.hypot(N[0], N[1]);
    const ang = s < 1e-6 ? 0 : Math.atan2(-N[1], N[0]);
    return { ang, open: Math.abs(N[2]), nearRight: N[2] < 0 };
  }

  function drawRings(x, y, r, half) {
    const g = ringGeometry();
    const R = r * ringImage.outer;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(g.ang);
    if (half) {
      ctx.beginPath();
      if (g.nearRight) ctx.rect(0, -R - 1, R + 1, 2 * R + 2);
      else ctx.rect(-R - 1, -R - 1, R + 1, 2 * R + 2);
      ctx.clip();
    }
    ctx.scale(Math.max(g.open, 0.004), 1);
    ctx.drawImage(ringImage.canvas, -R, -R, 2 * R, 2 * R);
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

  // Mond ausblenden, solange er in der Darstellung im Planeten (bzw. Saturnring) verschwinden würde
  function moonHidden(m) {
    const p = m.parentBody;
    return m.geoDisp * cam.scale < p.rpx * (p.rings ? 2.35 : 1) + 5;
  }

  function drawBodies() {
    for (const b of BODIES) {
      b.sx = sx(b.p.X);
      b.sy = sy(b.p.Y);
      b.rpx = Math.max(b.minPx, dispRadius(b) * cam.scale);
    }
    const order = BODIES.slice().sort((a, b) => a.p.D - b.p.D);
    for (const b of order) {
      if (b.parent && moonHidden(b)) continue;
      const { sx: x, sy: y, rpx: r } = b;
      const margin = b.rings ? r * 2.4 : b.id === 'sun' ? r * 4 + 30 : r;
      if (x < -margin || y < -margin || x > W + margin || y > H + margin) continue;

      ctx.globalAlpha = b.alpha ?? 1;
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
      ctx.globalAlpha = 1;

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
      if (b.parent && (moonHidden(b) || b.geoDisp * cam.scale < 30)) continue;
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
    if (b.parent) {
      rows.push([`Abstand zu${b.parent === 'earth' ? 'r Erde' : 'm ' + b.parentBody.name}`, `${nf(len(b.geo) * AU_KM)} km`]);
    }
    if (b.id !== 'earth' && b.id !== 'moon') {
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
    rows.push(['Achsneigung', `${nf(axialTilt(b), 1)}°`]);
    rows.push(['1 Umdrehung im Bild', animRotation(b)]);
    if (b.id === 'earth') {
      // Länge, über der die Sonne gerade im Zenit steht (12 Uhr Ortszeit)
      rows.push(['Sonne im Zenit über', fmtLon(subPointLon(b, [-b.helio[0], -b.helio[1], -b.helio[2]]))]);
    }
    if (b.parent) {
      // gebundene Rotation: Punkt, über dem der Planet steht – bleibt nahe 0° (Erdmond: ± Libration)
      rows.push([`${b.parentBody.name} im Zenit über`, fmtLon(subPointLon(b, [-b.geo[0], -b.geo[1], -b.geo[2]]))]);
    }
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

  function subPointLon(b, dir) {
    const { X, Y } = b.axes;
    return Math.atan2(dir[0] * Y[0] + dir[1] * Y[1] + dir[2] * Y[2], dir[0] * X[0] + dir[1] * X[1] + dir[2] * X[2]) / DEG;
  }

  const fmtLon = (l) => (Math.abs(l) < 0.05 ? '0,0°' : `${nf(Math.abs(l), 1)}° ${l > 0 ? 'Ost' : 'West'}`);

  // Neigung der Drehachse gegen die eigene Bahnebene (Sonne/Mond: gegen die Ekliptik)
  function axialTilt(b) {
    let n = [0, 0, 1];
    if (b.sat) n = eqToEcl(poleEq(b.parentBody));
    else if (b.el) {
      const el = elementsAt(b, state.T);
      n = [Math.sin(el.I) * Math.sin(el.node), -Math.sin(el.I) * Math.cos(el.node), Math.cos(el.I)];
    }
    // Drehimpulsrichtung: bei rückläufiger Rotation (Venus, Uranus) zeigt sie zum Südpol
    const P = b.axes.P, sgn = Math.sign(b.rot[1]);
    return Math.acos(clamp(sgn * (n[0] * P[0] + n[1] * P[1] + n[2] * P[2]), -1, 1)) / DEG;
  }

  // Wie lange eine Umdrehung bei der gewählten Geschwindigkeit auf dem Bildschirm dauert
  function animRotation(b) {
    const dps = Math.abs(daysPerSecond());
    if (!dps) return 'pausiert';
    const sec = 360 / Math.abs(b.rot[1]) / dps;
    const t = sec < 0.01 ? '< 0,01 s' : sec < 1 ? `${nf(sec, 2)} s` : sec < 120 ? `${nf(sec, 1)} s` : sec < 7200 ? `${nf(sec / 60, 1)} min`
      : sec < 172800 ? `${nf(sec / 3600, 1)} h` : `${nf(sec / 86400, 1)} Tage`;
    return b.blur > 0.05 ? `${t} (zu schnell → verwischt)` : t;
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
      if (b.parent && moonHidden(b)) continue;
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

  // ------------------------------------------------------------------ Bewegungsunschärfe
  // Bei hohem Zeitraffer dreht sich ein Körper zwischen zwei Bildern um mehr, als das Auge
  // verfolgen kann (z. B. Jupiter bei „1 Woche/s“: ~100° pro Bild). Ohne Gegenmaßnahme
  // entsteht der Stroboskop-Effekt (Rad dreht scheinbar langsam oder rückwärts).
  // Deshalb wird die Oberfläche dann entlang der Breitenkreise verwischt – wie bei einer
  // Langzeitbelichtung – und der Mond bei sehr schnellem Umlauf halbtransparent gezeichnet.
  let smoothDt = 1 / 60;
  const BLUR_START = 25, BLUR_FULL = 90; // Grad pro Bild

  function daysPerSecond() {
    return state.playing ? (state.speed * state.direction) / 86400 : 0;
  }

  function updateMotionBlur(dt) {
    smoothDt += (clamp(dt, 1 / 240, 0.1) - smoothDt) * 0.1;
    const dps = Math.abs(daysPerSecond());
    for (const b of BODIES) {
      b.degPerFrame = Math.abs(b.rot[1]) * dps * smoothDt;
      b.blur = clamp((b.degPerFrame - BLUR_START) / (BLUR_FULL - BLUR_START));
    }
    for (const m of MOONS) {
      const period = m.sat ? 360 / m.sat.L[1] : 27.321661; // Tage
      m.orbitDegPerFrame = (360 / period) * dps * smoothDt;
      m.alpha = 1 - 0.7 * clamp((m.orbitDegPerFrame - 30) / 60);
    }
  }

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
    updateMotionBlur(dt);
    updateCamera(dt);
    render();
    updateHD();
    updateHud(now);
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------------ echte Bilder laden
  async function loadRealImages() {
    let loaded = 0, blocked = false;
    const jobs = BODIES.map(async (b) => {
      const src = TEXTURE_FILES[b.id];
      if (!src) return;
      let img;
      try {
        img = await loadImage(src);
      } catch {
        return; // kein Bild vorhanden → erzeugte Textur bleibt
      }
      try {
        b.tex = texFromCanvas(imageToCanvas(img));
        b.realImage = true;
        b.realImg = img; // für HD-Stufe beim Heranzoomen
        b.texHi = null;
        b.hdNone = false;
        loaded++;
      } catch {
        blocked = true;
      }
    });
    jobs.push(
      loadImage(RING_FILE).then(
        (img) => {
          try {
            ringImage = ringsFromStrip(imageToCanvas(img, 1024));
          } catch {
            blocked = true;
          }
        },
        () => {}
      )
    );
    await Promise.all(jobs);
    const hint = $('texHint');
    if (blocked) {
      hint.textContent = 'Echte Bilder gefunden, aber der Browser sperrt sie beim Öffnen als Datei – bitte über einen lokalen Webserver starten (siehe README).';
      hint.classList.remove('hidden');
    } else if (loaded) {
      hint.textContent = `${loaded} echte Oberflächenbilder geladen`;
      hint.classList.remove('hidden');
      setTimeout(() => hint.classList.add('hidden'), 4000);
    }
  }

  // ------------------------------------------------------------------ Start
  for (const b of BODIES) b.tex = makeTexture(TEXTURES[b.id], 256, 128);
  if (window.EARTH_DATA) byId.earth.tex = makeEarthTexture(window.EARTH_DATA);
  ringImage = proceduralRings();
  loadRealImages();
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
