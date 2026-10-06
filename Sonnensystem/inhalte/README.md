# Inhalte der Detailseiten

Jede Datei enthält die Texte für das Popup eines Himmelskörpers: Zusammenfassung, Steckbrief
und die 5 häufigsten Fragen mit Antworten. Zum Ändern einfach die Datei mit einem Texteditor
bearbeiten, speichern und die Seite neu laden.

```
inhalte/
├── sonne.js
├── planeten/      merkur.js, venus.js, erde.js, mars.js, jupiter.js, saturn.js, uranus.js, neptun.js
├── zwergplaneten/ pluto.js
└── monde/         mond.js, io.js, europa.js, ganymed.js, kallisto.js, titan.js
```

## Aufbau einer Datei

```js
SonnensystemInhalte.register('earth', {        // Kennung – nicht ändern
  titel: 'Erde',
  untertitel: 'Unser Heimatplanet',
  zusammenfassung: [
    'Erster Absatz …',
    'Zweiter Absatz …',
  ],
  steckbrief: [
    ['Durchmesser', '12.742 km'],
  ],
  fragen: [
    { frage: 'Warum gibt es Jahreszeiten?', antwort: 'Wegen der geneigten Erdachse …' },
  ],
});
```

Hinweise:
- Texte stehen in einfachen Anführungszeichen `'…'`. Ein Apostroph im Text wird als `\'` geschrieben.
- Texte werden als reiner Text angezeigt – HTML-Tags erscheinen wörtlich.
- Die Dateien sind JavaScript statt JSON, damit die Seite auch ohne Webserver (Doppelklick auf
  `index.html`) funktioniert.
- Kennungen: `sun`, `mercury`, `venus`, `earth`, `moon`, `mars`, `jupiter`, `io`, `europa`,
  `ganymede`, `callisto`, `saturn`, `titan`, `uranus`, `neptune`, `pluto`.
  Welche Datei zu welcher Kennung gehört, steht in `CONTENT_FILES` in `solar.js`.
- Direktlink auf ein Popup: `index.html#erde`, `index.html#jupiter` usw. (Dateiname ohne `.js`).
