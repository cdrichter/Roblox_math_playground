// Detailseite: Venus
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('venus', {
  titel: 'Venus',
  untertitel: 'Der heißeste Planet – der „Morgen- und Abendstern“',
  zusammenfassung: [
    'Die Venus ist fast so groß wie die Erde und wird deshalb oft ihr Schwesterplanet genannt. Doch die Bedingungen sind lebensfeindlich: Eine dichte Atmosphäre aus Kohlendioxid erzeugt einen Druck wie in 900 m Meerestiefe und einen extremen Treibhauseffekt mit rund 465 °C.',
    'Dichte Wolken aus Schwefelsäure verhüllen die Oberfläche und reflektieren das Sonnenlicht so stark, dass die Venus nach dem Mond das hellste Objekt am Nachthimmel ist. Sie dreht sich rückwärts und so langsam, dass ihr Tag länger ist als ihr Jahr.',
  ],
  steckbrief: [
    ['Durchmesser', '12.104 km (95 % der Erde)'],
    ['Abstand zur Sonne', '108 Mio. km'],
    ['Umlaufzeit', '224,7 Tage'],
    ['Rotation', '243 Tage, rückläufig'],
    ['Temperatur', '≈ 465 °C'],
    ['Luftdruck', '≈ 92 bar'],
  ],
  fragen: [
    {
      frage: 'Warum ist die Venus so heiß?',
      antwort: 'Ihre Atmosphäre besteht zu etwa 96,5 % aus Kohlendioxid und ist rund 90-mal so dicht wie die der Erde. Das Sonnenlicht erwärmt den Boden, doch die Wärmestrahlung kann kaum entweichen – ein außer Kontrolle geratener Treibhauseffekt.',
    },
    {
      frage: 'Warum dreht sich die Venus rückwärts?',
      antwort: 'Das ist nicht endgültig geklärt. Diskutiert werden große Einschläge in der Frühzeit sowie Gezeitenkräfte der Sonne, die auf die dichte Atmosphäre wirken und die Drehung über lange Zeit umgekehrt haben könnten.',
    },
    {
      frage: 'Warum heißt die Venus Morgenstern und Abendstern?',
      antwort: 'Weil sie innerhalb der Erdbahn kreist, steht sie von uns aus gesehen immer in der Nähe der Sonne. Je nach Bahnstellung leuchtet sie deshalb entweder abends nach Sonnenuntergang im Westen oder morgens vor Sonnenaufgang im Osten.',
    },
    {
      frage: 'Ist schon einmal eine Sonde auf der Venus gelandet?',
      antwort: 'Ja. Die sowjetischen Venera-Sonden landeten ab 1970 auf der Venus – Venera 7 war die erste weiche Landung auf einem anderen Planeten überhaupt. Wegen Hitze und Druck hielten die Landegeräte nur etwa eine bis zwei Stunden durch.',
    },
    {
      frage: 'Gibt es Leben auf der Venus?',
      antwort: 'Auf der glühend heißen Oberfläche nicht. Spekuliert wird über die Wolkenschicht in 50–60 km Höhe, wo Temperatur und Druck erdähnlich sind. Hinweise wie das 2020 gemeldete Gas Phosphin sind aber umstritten und nicht bestätigt.',
    },
  ],
});
