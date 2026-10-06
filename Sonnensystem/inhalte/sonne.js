// Detailseite: Sonne
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('sun', {
  titel: 'Sonne',
  untertitel: 'Der Stern im Zentrum unseres Sonnensystems',
  zusammenfassung: [
    'Die Sonne ist ein gewöhnlicher Stern vom Typ G2V – eine riesige, glühende Kugel aus Wasserstoff und Helium. Sie enthält rund 99,86 % der gesamten Masse des Sonnensystems und hält mit ihrer Schwerkraft alle Planeten, Monde, Asteroiden und Kometen auf ihren Bahnen.',
    'In ihrem Kern verschmelzen bei etwa 15 Millionen °C Wasserstoffkerne zu Helium. Dabei werden jede Sekunde gut 4 Millionen Tonnen Materie in Energie umgewandelt, die als Licht und Wärme ins All strahlt – und das Leben auf der Erde erst möglich macht.',
  ],
  steckbrief: [
    ['Durchmesser', '1.392.700 km (109 × Erde)'],
    ['Masse', '333.000 Erdmassen'],
    ['Oberflächentemperatur', '≈ 5.500 °C'],
    ['Kerntemperatur', '≈ 15 Mio. °C'],
    ['Alter', '≈ 4,6 Mrd. Jahre'],
    ['Rotation', '≈ 25 Tage (Äquator) bis 35 Tage (Pole)'],
  ],
  fragen: [
    {
      frage: 'Wie heiß ist die Sonne?',
      antwort: 'An der sichtbaren Oberfläche (Photosphäre) hat die Sonne etwa 5.500 °C, im Kern rund 15 Millionen °C. Erstaunlicherweise ist die äußere Atmosphäre, die Korona, mit über 1 Million °C viel heißer als die Oberfläche – warum genau, wird noch erforscht.',
    },
    {
      frage: 'Wie lange braucht das Sonnenlicht bis zur Erde?',
      antwort: 'Im Mittel etwa 8 Minuten und 20 Sekunden. Wir sehen die Sonne also immer so, wie sie vor gut acht Minuten aussah. Zum Neptun braucht das Licht rund vier Stunden.',
    },
    {
      frage: 'Wie lange wird die Sonne noch scheinen?',
      antwort: 'Die Sonne hat etwa die Hälfte ihres Wasserstoffvorrats im Kern verbraucht. In rund 5 Milliarden Jahren bläht sie sich zu einem Roten Riesen auf, stößt danach ihre äußeren Schichten ab und endet als langsam auskühlender Weißer Zwerg.',
    },
    {
      frage: 'Woraus besteht die Sonne?',
      antwort: 'Gemessen an der Masse zu etwa 73 % aus Wasserstoff und 25 % aus Helium. Die restlichen knapp 2 % sind schwerere Elemente wie Sauerstoff, Kohlenstoff, Neon und Eisen.',
    },
    {
      frage: 'Wie groß ist die Sonne im Vergleich zur Erde?',
      antwort: 'Ihr Durchmesser ist 109-mal so groß wie der der Erde. Vom Volumen her würden rund 1,3 Millionen Erden in die Sonne passen, und sie ist etwa 333.000-mal so schwer wie unser Planet.',
    },
  ],
});
