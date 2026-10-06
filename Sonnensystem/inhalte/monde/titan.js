// Detailseite: Titan
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('titan', {
  titel: 'Titan',
  untertitel: 'Saturns größter Mond mit dichter Atmosphäre',
  zusammenfassung: [
    'Titan ist der größte Mond des Saturn und der zweitgrößte im Sonnensystem – größer als der Planet Merkur. Als einziger Mond besitzt er eine dichte Atmosphäre; sie besteht hauptsächlich aus Stickstoff und verhüllt die Oberfläche mit orangefarbenem Dunst.',
    'Bei rund −180 °C regnet es auf Titan flüssiges Methan, das Flüsse, Seen und sogar Meere bildet. Damit ist Titan neben der Erde der einzige bekannte Ort mit stabilen Flüssigkeiten an der Oberfläche.',
  ],
  steckbrief: [
    ['Durchmesser', '5.149 km'],
    ['Abstand zu Saturn', '1,22 Mio. km'],
    ['Umlaufzeit', '15,95 Tage'],
    ['Temperatur', '≈ −180 °C'],
    ['Luftdruck', '≈ 1,5 bar'],
    ['Rotation', 'gebunden'],
  ],
  fragen: [
    {
      frage: 'Was ist besonders an Titans Atmosphäre?',
      antwort: 'Sie ist dichter als die der Erde: Am Boden herrscht etwa der 1,5-fache Luftdruck. Sie besteht zu rund 95 % aus Stickstoff und zu etwa 5 % aus Methan; aus Methan entstehen durch Sonnenlicht organische Verbindungen, die den orangefarbenen Dunst bilden.',
    },
    {
      frage: 'Gibt es auf Titan Seen?',
      antwort: 'Ja, aber nicht aus Wasser, sondern aus flüssigem Methan und Ethan. Die Raumsonde Cassini fand vor allem in der Nordpolregion Seen und Meere; das größte, Kraken Mare, ist größer als das Kaspische Meer.',
    },
    {
      frage: 'Ist schon einmal eine Sonde auf Titan gelandet?',
      antwort: 'Ja. Die europäische Landesonde Huygens setzte am 14. Januar 2005 auf Titan auf und sendete Bilder einer Landschaft mit rundgeschliffenen Eisbrocken. Es ist bis heute die am weitesten entfernte Landung eines Raumfahrzeugs.',
    },
    {
      frage: 'Was ist die Mission Dragonfly?',
      antwort: 'Dragonfly ist ein von der NASA geplanter Drohnen-Helikopter, der in den 2030er-Jahren auf Titan landen und zu verschiedenen Orten fliegen soll, um die chemischen Bausteine des Lebens zu untersuchen.',
    },
    {
      frage: 'Könnte es auf Titan Leben geben?',
      antwort: 'Das ist offen. Die Oberfläche ist sehr kalt, enthält aber reichlich organische Moleküle. Zusätzlich gibt es vermutlich einen Ozean aus Wasser tief unter der Eiskruste – beides macht Titan für die Forschung interessant.',
    },
  ],
});
