// Detailseite: Jupiter
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('jupiter', {
  titel: 'Jupiter',
  untertitel: 'Der Riese unter den Planeten',
  zusammenfassung: [
    'Jupiter ist der größte Planet des Sonnensystems: Er ist mehr als doppelt so schwer wie alle anderen Planeten zusammen, und über 1.300 Erden würden in ihn hineinpassen. Als Gasriese besteht er vor allem aus Wasserstoff und Helium und hat keine feste Oberfläche.',
    'Seine farbigen Wolkenbänder entstehen durch starke Winde, und der Große Rote Fleck ist ein Wirbelsturm, der größer als die Erde ist. Jupiter dreht sich in knapp 10 Stunden um sich selbst – schneller als jeder andere Planet – und hat mehr als 90 bekannte Monde.',
  ],
  steckbrief: [
    ['Durchmesser', '139.820 km (11 × Erde)'],
    ['Masse', '318 Erdmassen'],
    ['Abstand zur Sonne', '741–817 Mio. km'],
    ['Umlaufzeit', '11,86 Jahre'],
    ['Rotation', '9 h 56 min'],
    ['Monde', 'über 90'],
  ],
  fragen: [
    {
      frage: 'Wie groß ist Jupiter?',
      antwort: 'Sein Durchmesser ist etwa 11-mal so groß wie der der Erde, seine Masse 318-mal so groß. Vom Volumen her passen über 1.300 Erden hinein.',
    },
    {
      frage: 'Was ist der Große Rote Fleck?',
      antwort: 'Ein riesiger Hochdruck-Wirbelsturm in Jupiters Südhalbkugel, der seit mindestens etwa 190 Jahren beobachtet wird. Er ist größer als die Erde, schrumpft aber seit Jahrzehnten langsam.',
    },
    {
      frage: 'Kann man auf Jupiter landen?',
      antwort: 'Nein, denn Jupiter hat keine feste Oberfläche. Mit zunehmender Tiefe werden Druck und Temperatur so extrem, dass jede Sonde zerquetscht würde – das Gas geht allmählich in eine flüssige Schicht über.',
    },
    {
      frage: 'Ist Jupiter ein gescheiterter Stern?',
      antwort: 'Nicht wirklich. Um im Inneren Wasserstoff zu Helium zu verschmelzen wie die Sonne, bräuchte Jupiter etwa die 80-fache Masse. Er ist zwar aus ähnlichem Material wie die Sonne, aber eindeutig ein Planet.',
    },
    {
      frage: 'Hat Jupiter Ringe?',
      antwort: 'Ja, aber sehr dunkle und dünne. Sie bestehen aus feinem Staub und wurden erst 1979 von der Raumsonde Voyager 1 entdeckt.',
    },
  ],
});
