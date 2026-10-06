// Detailseite: Mond
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('moon', {
  titel: 'Mond',
  untertitel: 'Der ständige Begleiter der Erde',
  zusammenfassung: [
    'Der Mond ist der einzige natürliche Satellit der Erde und mit 3.474 km Durchmesser der fünftgrößte Mond im Sonnensystem. Er umkreist die Erde in rund 27,3 Tagen in einem mittleren Abstand von 384.400 km.',
    'Er ist gebunden rotiert: Weil er sich genau einmal pro Umlauf um sich selbst dreht, zeigt er uns immer dieselbe Seite. Der Mond verursacht die Gezeiten und ist der einzige fremde Himmelskörper, den Menschen bisher betreten haben.',
  ],
  steckbrief: [
    ['Durchmesser', '3.474 km'],
    ['Abstand zur Erde', '356.500–406.700 km'],
    ['Umlaufzeit', '27,3 Tage'],
    ['Mondphasen-Zyklus', '29,5 Tage'],
    ['Rotation', 'gebunden'],
    ['Temperatur', '−170 bis +120 °C'],
  ],
  fragen: [
    {
      frage: 'Warum sehen wir immer dieselbe Seite des Mondes?',
      antwort: 'Die Gezeitenkräfte der Erde haben die Drehung des Mondes über lange Zeit so abgebremst, dass er sich genau einmal pro Umlauf um sich selbst dreht. Durch kleine Schwankungen (Libration) sehen wir im Lauf der Zeit trotzdem etwa 59 % seiner Oberfläche.',
    },
    {
      frage: 'Wie entstehen die Mondphasen?',
      antwort: 'Der Mond leuchtet nicht selbst, sondern wird von der Sonne beleuchtet – immer zur Hälfte. Je nachdem, wo er auf seiner Bahn um die Erde steht, sehen wir einen größeren oder kleineren Teil der beleuchteten Hälfte: von Neumond über Vollmond zurück zu Neumond in 29,5 Tagen.',
    },
    {
      frage: 'Wie ist der Mond entstanden?',
      antwort: 'Nach der heute anerkannten Theorie prallte vor etwa 4,5 Milliarden Jahren ein marsgroßer Himmelskörper („Theia“) auf die junge Erde. Aus den herausgeschleuderten Trümmern formte sich der Mond.',
    },
    {
      frage: 'Wie viele Menschen waren auf dem Mond?',
      antwort: 'Zwölf. Sie landeten zwischen 1969 (Apollo 11, Neil Armstrong und Buzz Aldrin) und 1972 (Apollo 17) mit sechs Apollo-Missionen. Mit dem Artemis-Programm will die NASA wieder Menschen zum Mond bringen.',
    },
    {
      frage: 'Entfernt sich der Mond von der Erde?',
      antwort: 'Ja, um etwa 3,8 cm pro Jahr. Das wurde mit Laserstrahlen gemessen, die an von Apollo-Astronauten aufgestellten Spiegeln reflektiert werden. Gleichzeitig wird die Erdrotation ganz allmählich langsamer.',
    },
  ],
});
