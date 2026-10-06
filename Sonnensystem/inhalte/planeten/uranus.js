// Detailseite: Uranus
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('uranus', {
  titel: 'Uranus',
  untertitel: 'Der seitlich liegende Eisriese',
  zusammenfassung: [
    'Uranus ist der siebte Planet und ein Eisriese: Unter seiner Atmosphäre aus Wasserstoff, Helium und Methan liegt ein dichter Mantel aus Wasser, Ammoniak und Methan. Das Methan verschluckt rotes Licht und verleiht ihm seine blaugrüne Farbe.',
    'Das Besondere: Seine Drehachse ist um etwa 98° geneigt – Uranus rollt gewissermaßen auf seiner Bahn. Dadurch erlebt jeder Pol 42 Jahre lang Sonne und dann 42 Jahre Dunkelheit. Er war 1781 der erste mit einem Teleskop entdeckte Planet.',
  ],
  steckbrief: [
    ['Durchmesser', '50.724 km (4 × Erde)'],
    ['Abstand zur Sonne', '2,7–3,0 Mrd. km'],
    ['Umlaufzeit', '84 Jahre'],
    ['Rotation', '17 h 14 min, rückläufig'],
    ['Achsneigung', '≈ 98°'],
    ['Monde', '29'],
  ],
  fragen: [
    {
      frage: 'Warum liegt Uranus auf der Seite?',
      antwort: 'Die gängigste Erklärung ist eine gewaltige Kollision mit einem erdgroßen Körper in der Frühzeit des Sonnensystems, die seine Achse umgekippt hat. Auch langsame Schwerkraftwechselwirkungen werden als Ursache diskutiert.',
    },
    {
      frage: 'Warum ist Uranus blaugrün?',
      antwort: 'Methan in seiner Atmosphäre absorbiert den roten Anteil des Sonnenlichts. Zurückgestreut wird vor allem blaues und grünes Licht.',
    },
    {
      frage: 'Wer hat Uranus entdeckt?',
      antwort: 'Der Astronom Wilhelm (William) Herschel im Jahr 1781. Uranus war der erste Planet, der nicht schon seit der Antike bekannt war, sondern mit einem Teleskop entdeckt wurde.',
    },
    {
      frage: 'Wie kalt ist es auf Uranus?',
      antwort: 'Die Atmosphäre erreicht Tiefstwerte von etwa −224 °C – die kälteste aller Planetenatmosphären, obwohl Neptun weiter von der Sonne entfernt ist. Uranus gibt aus seinem Inneren kaum Wärme ab.',
    },
    {
      frage: 'War schon eine Raumsonde bei Uranus?',
      antwort: 'Nur eine: Voyager 2 flog im Januar 1986 an Uranus vorbei. Dabei entdeckte sie neue Monde und Ringe. Eine eigene Uranus-Mission gilt in der Forschung als hohe Priorität.',
    },
  ],
});
