// Detailseite: Io
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('io', {
  titel: 'Io',
  untertitel: 'Der vulkanisch aktivste Ort im Sonnensystem',
  zusammenfassung: [
    'Io ist der innerste der vier großen Jupitermonde und etwas größer als unser Mond. Mit über 400 aktiven Vulkanen ist er der vulkanisch aktivste Himmelskörper, den wir kennen; manche Ausbrüche schleudern Material Hunderte Kilometer hoch.',
    'Angetrieben wird der Vulkanismus von Gezeitenkräften: Io steht mit Europa und Ganymed in einer Bahnresonanz (1:2:4), die seine Bahn leicht elliptisch hält. Jupiter knetet den Mond dadurch ständig durch und heizt sein Inneres auf.',
  ],
  steckbrief: [
    ['Durchmesser', '3.643 km'],
    ['Abstand zu Jupiter', '421.700 km'],
    ['Umlaufzeit', '1,77 Tage'],
    ['Rotation', 'gebunden'],
    ['Entdeckung', '1610, Galileo Galilei'],
  ],
  fragen: [
    {
      frage: 'Warum hat Io so viele Vulkane?',
      antwort: 'Jupiters Schwerkraft verformt Io bei jedem Umlauf um bis zu etwa 100 m, weil Europa und Ganymed seine Bahn durch eine Resonanz leicht elliptisch halten. Diese ständige Verformung erzeugt durch Reibung so viel Wärme, dass Gestein im Inneren schmilzt.',
    },
    {
      frage: 'Warum ist Io gelb und orange?',
      antwort: 'Die Farben stammen von Schwefel und Schwefelverbindungen, die bei den Ausbrüchen ausgestoßen werden und sich über die Oberfläche legen. Je nach Temperatur erscheinen sie gelb, orange, rot oder weiß.',
    },
    {
      frage: 'Wer hat Io entdeckt?',
      antwort: 'Galileo Galilei entdeckte Io im Januar 1610 zusammen mit Europa, Ganymed und Kallisto. Deshalb heißen diese vier Monde die Galileischen Monde.',
    },
    {
      frage: 'Ist Io größer als unser Mond?',
      antwort: 'Ein wenig: Io hat 3.643 km Durchmesser, unser Mond 3.474 km. Beide sind auch ähnlich dicht und bestehen vor allem aus Gestein.',
    },
    {
      frage: 'Könnte man auf Io landen?',
      antwort: 'Technisch wäre eine Landung denkbar, aber Io liegt mitten in Jupiters extrem starkem Strahlungsgürtel. Ungeschützte Elektronik und erst recht Menschen würden dort sehr schnell geschädigt.',
    },
  ],
});
