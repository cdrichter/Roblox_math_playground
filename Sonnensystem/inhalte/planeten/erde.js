// Detailseite: Erde
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('earth', {
  titel: 'Erde',
  untertitel: 'Unser Heimatplanet – der einzige bekannte Ort mit Leben',
  zusammenfassung: [
    'Die Erde ist der dritte Planet von der Sonne und der größte der vier Gesteinsplaneten. Sie ist der einzige bekannte Himmelskörper, auf dem es flüssiges Wasser an der Oberfläche und Leben gibt – rund 71 % ihrer Oberfläche sind von Ozeanen bedeckt.',
    'Ihre Atmosphäre aus Stickstoff (78 %) und Sauerstoff (21 %) schützt zusammen mit dem Magnetfeld vor gefährlicher Strahlung. Die Neigung der Erdachse um 23,4° sorgt für die Jahreszeiten, der Mond stabilisiert diese Neigung.',
  ],
  steckbrief: [
    ['Durchmesser', '12.742 km'],
    ['Abstand zur Sonne', '147–152 Mio. km'],
    ['Umlaufzeit', '365,25 Tage'],
    ['Rotation', '23 h 56 min'],
    ['Achsneigung', '23,4°'],
    ['Monde', '1'],
  ],
  fragen: [
    {
      frage: 'Warum gibt es Jahreszeiten?',
      antwort: 'Wegen der um 23,4° geneigten Erdachse. Im Juni ist die Nordhalbkugel der Sonne zugeneigt: Die Sonne steht höher, die Tage sind länger – es ist Sommer. Im Dezember ist es umgekehrt. Der Abstand zur Sonne spielt kaum eine Rolle; im Januar ist die Erde der Sonne sogar am nächsten.',
    },
    {
      frage: 'Warum dauert ein Tag 24 Stunden, obwohl sich die Erde in 23 h 56 min dreht?',
      antwort: 'In 23 Stunden 56 Minuten dreht sich die Erde einmal gegenüber den Sternen. Weil sie in dieser Zeit aber auch ein Stück auf ihrer Bahn um die Sonne weiterwandert, muss sie sich noch etwa 4 Minuten weiterdrehen, bis die Sonne wieder an derselben Stelle am Himmel steht.',
    },
    {
      frage: 'Warum ist der Himmel blau?',
      antwort: 'Das Sonnenlicht enthält alle Farben. Die Moleküle der Luft streuen kurzwelliges blaues Licht viel stärker als rotes (Rayleigh-Streuung), sodass blaues Licht aus allen Richtungen zu uns kommt. Bei tief stehender Sonne ist der Weg durch die Luft länger – dann bleiben vor allem Rot- und Orangetöne übrig.',
    },
    {
      frage: 'Wie alt ist die Erde?',
      antwort: 'Etwa 4,54 Milliarden Jahre. Das ergibt sich aus der radiometrischen Datierung der ältesten Gesteine und Meteoriten, die zusammen mit der Erde entstanden sind.',
    },
    {
      frage: 'Ist die Erde eine perfekte Kugel?',
      antwort: 'Nein. Durch ihre Drehung ist sie an den Polen leicht abgeplattet: Der Durchmesser am Äquator ist rund 43 km größer als von Pol zu Pol. Mit bloßem Auge wäre das aus dem All aber nicht zu erkennen.',
    },
  ],
});
