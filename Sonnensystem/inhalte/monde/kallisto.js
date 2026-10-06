// Detailseite: Kallisto
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('callisto', {
  titel: 'Kallisto',
  untertitel: 'Der Mond mit den meisten Kratern',
  zusammenfassung: [
    'Kallisto ist der äußerste der vier Galileischen Monde und der drittgrößte Mond im Sonnensystem – fast so groß wie Merkur. Ihre dunkle Oberfläche ist so dicht mit Kratern bedeckt wie kaum ein anderer Himmelskörper.',
    'Die Oberfläche ist rund 4 Milliarden Jahre alt und hat sich seitdem kaum verändert, weil Kallisto geologisch nahezu inaktiv ist. Das große Einschlagbecken Valhalla ist von konzentrischen Ringen mit einem Durchmesser von rund 3.800 km umgeben.',
  ],
  steckbrief: [
    ['Durchmesser', '4.821 km'],
    ['Abstand zu Jupiter', '1,88 Mio. km'],
    ['Umlaufzeit', '16,69 Tage'],
    ['Rotation', 'gebunden'],
    ['Entdeckung', '1610, Galileo Galilei'],
  ],
  fragen: [
    {
      frage: 'Warum hat Kallisto so viele Krater?',
      antwort: 'Weil ihre Oberfläche sehr alt ist und sich kaum erneuert hat. Anders als auf Io oder Europa gibt es auf Kallisto weder Vulkane noch starke Gezeitenwärme, die alte Krater überdecken würden.',
    },
    {
      frage: 'Wie groß ist Kallisto?',
      antwort: 'Mit 4.821 km Durchmesser ist sie nach Ganymed und Titan der drittgrößte Mond im Sonnensystem und nur knapp kleiner als der Planet Merkur.',
    },
    {
      frage: 'Hat Kallisto einen Ozean?',
      antwort: 'Möglicherweise. Messungen der Sonde Galileo deuten auf eine leitfähige Schicht unter der Oberfläche hin, die ein salziger Ozean sein könnte. Der Nachweis ist aber weniger sicher als bei Europa oder Ganymed.',
    },
    {
      frage: 'Könnten Menschen Kallisto besuchen?',
      antwort: 'Kallisto liegt außerhalb von Jupiters stärkstem Strahlungsgürtel. In einer NASA-Studie (2003) wurde sie deshalb als möglicher Standort einer künftigen bemannten Basis im Jupitersystem untersucht.',
    },
    {
      frage: 'Warum ist Kallisto so dunkel?',
      antwort: 'Ihre Oberfläche ist eine Mischung aus Eis und dunklem, gesteinsartigem Material. Über Milliarden Jahre ist das Eis an vielen Stellen verdampft und hat eine dunkle Staubschicht zurückgelassen.',
    },
  ],
});
