# Sonnensystem live

Interaktive Darstellung des Sonnensystems, die komplett im Browser läuft – ohne Datenbank, ohne Server, ohne externe Bibliotheken.

**Starten:** `index.html` im Browser öffnen (Doppelklick genügt).
Mit echten Bildern (siehe unten) muss die Seite über einen kleinen lokalen Webserver laufen,
weil Browser beim Öffnen als Datei (`file://`) den Zugriff auf Bildpixel sperren:

```bash
cd Sonnensystem
python3 -m http.server 8000     # dann http://localhost:8000 öffnen
```

(Alternativ: VS Code „Live Server“, oder die Seite über GitHub Pages veröffentlichen.)

## Funktionen

- **Aktuelle Positionen:** Beim Start stehen alle Planeten (und der Mond) dort, wo sie jetzt gerade sind.
  Grundlage sind die Keplerschen Bahnelemente der NASA/JPL (gültig 1800–2050).
- **Aktuelle Eigenrotation:** Jeder Körper dreht sich mit seiner echten Periode, der Drehwinkel
  entspricht dem Nullmeridian nach IAU zum angezeigten Zeitpunkt. Die Kugeln werden in 3D
  gedreht: Achsneigung (Erde 23,4°, Uranus 97,8°), Drehrichtung (Venus/Uranus rückläufig) und
  Blickwinkel stimmen. Der Mond zeigt der Erde immer dieselbe Seite (inkl. Libration ±7°).
- **Zeitraffer ohne Stroboskop-Effekt:** Dreht sich ein Körper zwischen zwei Bildern um mehr als
  ~25°, wird seine Oberfläche entlang der Breitenkreise verwischt (wie eine Langzeitbelichtung),
  statt scheinbar stillzustehen oder rückwärts zu laufen. Die Infotafel zeigt, wie lange eine
  Umdrehung bei der gewählten Geschwindigkeit auf dem Bildschirm dauert.
- **Zeitsteuerung:** Echtzeit (LIVE), Zeitraffer bis 1 Jahr pro Sekunde, rückwärts, Pause, Sprung zu einem Datum, „Jetzt“.
- **Zoom & Navigation:** Mausrad / Pinch zum Zoomen, Ziehen zum Verschieben,
  Shift + Ziehen (oder rechte Maustaste) zum Kippen. Klick auf einen Planeten zeigt Infos,
  Doppelklick oder die Leiste oben folgt dem Planeten und zoomt heran.
- **Ansichtsoptionen:** echte oder komprimierte Abstände, echte oder vergrößerte Planeten,
  Bahnen, Namen, Asteroiden- und Kuipergürtel, Neigung der Ansicht.

Tastatur: `Leertaste` Pause · `+`/`-` Zoom · `0` Gesamtansicht · `N` Jetzt · `Esc` Auswahl aufheben

## Echte Bilder

Equirektangulare Karten (Seitenverhältnis 2:1, links −180°, Mitte 0° = Nullmeridian, Norden oben)
in den Ordner `textures/` legen – Details in [`textures/README.md`](textures/README.md).
Fehlt ein Bild, wird automatisch die erzeugte Ersatztextur verwendet.

## Dateien

- `index.html` – Aufbau der Seite
- `style.css` – Gestaltung
- `solar.js` – Bahnberechnung, Rotation, Darstellung und Bedienung
