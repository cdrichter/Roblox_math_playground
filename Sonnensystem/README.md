# Sonnensystem live

Interaktive Darstellung des Sonnensystems, die komplett im Browser läuft – ohne Datenbank, ohne Server, ohne externe Bibliotheken.

**Starten:** `index.html` im Browser öffnen (Doppelklick genügt).

## Funktionen

- **Aktuelle Positionen:** Beim Start stehen alle Planeten (und der Mond) dort, wo sie jetzt gerade sind.
  Grundlage sind die Keplerschen Bahnelemente der NASA/JPL (gültig 1800–2050).
- **Aktuelle Eigenrotation:** Jeder Körper dreht sich mit seiner echten Periode, der Drehwinkel
  entspricht dem Nullmeridian nach IAU zum angezeigten Zeitpunkt (Venus und Uranus drehen rückwärts).
- **Zeitsteuerung:** Echtzeit (LIVE), Zeitraffer bis 1 Jahr pro Sekunde, rückwärts, Pause, Sprung zu einem Datum, „Jetzt“.
- **Zoom & Navigation:** Mausrad / Pinch zum Zoomen, Ziehen zum Verschieben,
  Shift + Ziehen (oder rechte Maustaste) zum Kippen. Klick auf einen Planeten zeigt Infos,
  Doppelklick oder die Leiste oben folgt dem Planeten und zoomt heran.
- **Ansichtsoptionen:** echte oder komprimierte Abstände, echte oder vergrößerte Planeten,
  Bahnen, Namen, Asteroiden- und Kuipergürtel, Neigung der Ansicht.

Tastatur: `Leertaste` Pause · `+`/`-` Zoom · `0` Gesamtansicht · `N` Jetzt · `Esc` Auswahl aufheben

## Dateien

- `index.html` – Aufbau der Seite
- `style.css` – Gestaltung
- `solar.js` – Bahnberechnung, Rotation, Darstellung und Bedienung
