# Oberflächenbilder

Hier die Karten mit genau diesen Dateinamen ablegen (andere Namen: `TEXTURE_FILES` oben in `solar.js` anpassen):

| Datei | Körper |
|---|---|
| `sun.jpg` | Sonne |
| `mercury.jpg` | Merkur |
| `venus.jpg` | Venus (Oberfläche oder Atmosphäre) |
| `earth.jpg` | Erde |
| `moon.jpg` | Mond |
| `mars.jpg` | Mars |
| `jupiter.jpg` | Jupiter |
| `saturn.jpg` | Saturn |
| `uranus.jpg` | Uranus |
| `neptune.jpg` | Neptun |
| `pluto.jpg` | Pluto |
| `saturn_ring.png` | Saturnring als Streifen (links innen → rechts außen, mit Transparenz) |

**Format:** equirektangular (2:1), linker Rand = 180° West, Bildmitte = 0° (Nullmeridian), Norden oben.
So sind z. B. die Karten von [Solar System Scope](https://www.solarsystemscope.com/textures/)
(CC BY 4.0 – Quellenangabe nötig) und NASA Blue Marble aufgebaut. 2k-Auflösung reicht völlig;
größere Bilder werden beim Laden auf 2048 px Breite verkleinert.

Für den Ring geht die Darstellung davon aus, dass der Streifen von 1,11 bis 2,33 Saturnradien reicht
(`RING_IMG_INNER` / `RING_IMG_OUTER` in `solar.js`), passend zu `2k_saturn_ring_alpha.png`.

**Wichtig:** Bilder werden nur geladen, wenn die Seite über einen Webserver läuft
(`python3 -m http.server`), nicht per Doppelklick (`file://`) – die Seite zeigt dann einen Hinweis.
