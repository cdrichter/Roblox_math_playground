// Detailseite: Europa
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('europa', {
  titel: 'Europa',
  untertitel: 'Eismond mit verborgenem Ozean',
  zusammenfassung: [
    'Europa ist der kleinste der vier Galileischen Monde – etwas kleiner als unser Mond – und hat eine der glattesten Oberflächen im Sonnensystem. Sie besteht aus Wassereis, das von einem Netz rötlich-brauner Risse durchzogen ist.',
    'Unter dem Eispanzer befindet sich mit großer Wahrscheinlichkeit ein globaler Ozean aus salzigem, flüssigem Wasser, der mehr Wasser enthalten könnte als alle Ozeane der Erde zusammen. Deshalb gilt Europa als einer der vielversprechendsten Orte für die Suche nach Leben.',
  ],
  steckbrief: [
    ['Durchmesser', '3.122 km'],
    ['Abstand zu Jupiter', '671.000 km'],
    ['Umlaufzeit', '3,55 Tage'],
    ['Oberflächentemperatur', '≈ −160 °C (Äquator)'],
    ['Rotation', 'gebunden'],
  ],
  fragen: [
    {
      frage: 'Hat Europa wirklich einen Ozean?',
      antwort: 'Sehr wahrscheinlich. Messungen des Magnetfelds durch die Sonde Galileo lassen sich am besten mit einer leitfähigen, salzigen Wasserschicht unter dem Eis erklären. Auch die junge, kaum verkraterte Oberfläche passt dazu.',
    },
    {
      frage: 'Könnte es auf Europa Leben geben?',
      antwort: 'Möglich ist es: Es gibt dort vermutlich flüssiges Wasser, chemische Grundbausteine und Energie durch Gezeitenwärme. Ob tatsächlich Leben existiert, ist völlig offen – genau das sollen künftige Missionen eingrenzen.',
    },
    {
      frage: 'Wie dick ist das Eis?',
      antwort: 'Das ist noch nicht genau bekannt. Die meisten Schätzungen liegen bei etwa 15 bis 25 Kilometern, darunter folgt ein Ozean, der rund 60 bis 150 Kilometer tief sein könnte.',
    },
    {
      frage: 'Woher kommen die Risse auf der Oberfläche?',
      antwort: 'Jupiters Gezeitenkräfte dehnen und stauchen die Eiskruste ständig. Dabei brechen Risse auf, und dunkleres Material – vermutlich Salze aus dem Inneren – gelangt an die Oberfläche.',
    },
    {
      frage: 'Welche Raumsonden erforschen Europa?',
      antwort: 'Die NASA-Sonde Europa Clipper ist im Oktober 2024 gestartet und soll 2030 Jupiter erreichen, um Europa bei Dutzenden Vorbeiflügen zu untersuchen. Auch die europäische Mission JUICE wird an Europa vorbeifliegen.',
    },
  ],
});
