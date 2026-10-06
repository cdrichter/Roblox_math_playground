// Detailseite: Neptun
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('neptune', {
  titel: 'Neptun',
  untertitel: 'Der äußerste Planet – entdeckt durch Mathematik',
  zusammenfassung: [
    'Neptun ist der achte und äußerste Planet. Er ist ein Eisriese, ähnlich wie Uranus, aber kräftiger blau gefärbt. In seiner Atmosphäre wehen die schnellsten Winde des Sonnensystems mit bis zu etwa 2.000 km/h.',
    'Neptun wurde 1846 als erster Planet nicht durch zufällige Beobachtung, sondern durch eine Berechnung gefunden: Abweichungen in der Bahn des Uranus verrieten seine Position. Sein größter Mond Triton umkreist ihn rückläufig und ist vermutlich ein eingefangenes Objekt aus dem Kuipergürtel.',
  ],
  steckbrief: [
    ['Durchmesser', '49.244 km (4 × Erde)'],
    ['Abstand zur Sonne', '≈ 4,5 Mrd. km'],
    ['Umlaufzeit', '164,8 Jahre'],
    ['Rotation', '16 h 6 min'],
    ['Windgeschwindigkeit', 'bis ≈ 2.000 km/h'],
    ['Monde', '16'],
  ],
  fragen: [
    {
      frage: 'Wie wurde Neptun entdeckt?',
      antwort: 'Urbain Le Verrier berechnete aus Unregelmäßigkeiten der Uranusbahn, wo ein unbekannter Planet stehen müsste. Johann Gottfried Galle fand Neptun am 23. September 1846 an der Berliner Sternwarte nur etwa ein Grad von der berechneten Position entfernt.',
    },
    {
      frage: 'Warum ist es auf Neptun so windig?',
      antwort: 'Das ist noch nicht vollständig verstanden. Neptun gibt mehr als doppelt so viel Wärme ab, wie er von der Sonne erhält; diese innere Wärme treibt die Atmosphäre an, und weil es kaum Reibung an einer festen Oberfläche gibt, werden die Winde extrem schnell.',
    },
    {
      frage: 'Warum ist Neptun blau?',
      antwort: 'Wie bei Uranus absorbiert Methan in der Atmosphäre das rote Licht. Neue Auswertungen zeigen, dass beide Planeten sich farblich ähnlicher sind als lange gedacht; Neptun hat aber weniger Dunst und wirkt dadurch etwas blauer.',
    },
    {
      frage: 'Was ist Triton?',
      antwort: 'Neptuns größter Mond mit 2.707 km Durchmesser. Er umkreist Neptun entgegen dessen Drehrichtung, was darauf hindeutet, dass er eingefangen wurde. Voyager 2 beobachtete auf ihm Geysire aus Stickstoff.',
    },
    {
      frage: 'Wie lange dauert ein Jahr auf Neptun?',
      antwort: 'Rund 165 Erdjahre. Seit seiner Entdeckung 1846 hat Neptun die Sonne erst einmal vollständig umrundet – im Jahr 2011.',
    },
  ],
});
