// Detailseite: Ganymed
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('ganymede', {
  titel: 'Ganymed',
  untertitel: 'Der größte Mond im Sonnensystem',
  zusammenfassung: [
    'Ganymed ist der größte Mond des Sonnensystems und sogar größer als der Planet Merkur, hat aber nur etwa halb so viel Masse. Seine Oberfläche zeigt dunkle, alte und stark verkraterte Regionen neben helleren, von Furchen durchzogenen Gebieten.',
    'Als einziger bekannter Mond besitzt Ganymed ein eigenes Magnetfeld. Beobachtungen seiner Polarlichter mit dem Hubble-Teleskop deuten auf einen salzigen Ozean tief unter der Eiskruste hin.',
  ],
  steckbrief: [
    ['Durchmesser', '5.268 km'],
    ['Abstand zu Jupiter', '1,07 Mio. km'],
    ['Umlaufzeit', '7,15 Tage'],
    ['Rotation', 'gebunden'],
    ['Entdeckung', '1610, Galileo Galilei'],
  ],
  fragen: [
    {
      frage: 'Ist Ganymed größer als Merkur?',
      antwort: 'Ja, mit 5.268 km Durchmesser ist er etwas größer als Merkur (4.879 km). Weil Ganymed aber zu einem großen Teil aus Eis besteht, hat er nur etwa die Hälfte von Merkurs Masse.',
    },
    {
      frage: 'Warum hat Ganymed ein Magnetfeld?',
      antwort: 'Vermutlich hat er einen flüssigen, eisenhaltigen Kern, in dem wie bei der Erde Strömungen ein Magnetfeld erzeugen. Kein anderer bekannter Mond hat ein solches eigenes Magnetfeld.',
    },
    {
      frage: 'Gibt es auf Ganymed Wasser?',
      antwort: 'Wahrscheinlich ja, und zwar viel: Die Polarlichter schwanken weniger stark, als es ohne Ozean zu erwarten wäre. Das spricht für eine salzige Wasserschicht in vielen Kilometern Tiefe zwischen Eisschichten.',
    },
    {
      frage: 'Welche Mission erforscht Ganymed?',
      antwort: 'Die europäische Raumsonde JUICE, gestartet 2023, soll Anfang der 2030er-Jahre bei Jupiter ankommen und später in eine Umlaufbahn um Ganymed einschwenken – als erste Sonde, die einen anderen Mond als unseren umkreist.',
    },
    {
      frage: 'Kann man Ganymed von der Erde aus sehen?',
      antwort: 'Ja, schon mit einem einfachen Fernglas erscheint er als Lichtpunkt neben Jupiter, zusammen mit den anderen Galileischen Monden. Ihre Stellung ändert sich von Nacht zu Nacht.',
    },
  ],
});
