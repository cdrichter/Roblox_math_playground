// Detailseite: Merkur
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('mercury', {
  titel: 'Merkur',
  untertitel: 'Der kleinste und sonnennächste Planet',
  zusammenfassung: [
    'Merkur ist der kleinste Planet des Sonnensystems und umrundet die Sonne in nur 88 Tagen – schneller als jeder andere Planet. Seine von Kratern übersäte Oberfläche erinnert an unseren Mond.',
    'Weil Merkur fast keine Atmosphäre besitzt, schwanken die Temperaturen extrem: tagsüber bis etwa 430 °C, nachts bis −180 °C. Er dreht sich so langsam, dass ein Sonnentag (von Mittag bis Mittag) 176 Erdentage dauert – also zwei Merkurjahre.',
  ],
  steckbrief: [
    ['Durchmesser', '4.879 km'],
    ['Abstand zur Sonne', '46–70 Mio. km'],
    ['Umlaufzeit', '88 Tage'],
    ['Rotation', '58,6 Tage'],
    ['Temperatur', '−180 bis +430 °C'],
    ['Monde', 'keine'],
  ],
  fragen: [
    {
      frage: 'Warum ist Merkur nicht der heißeste Planet, obwohl er der Sonne am nächsten ist?',
      antwort: 'Merkur hat praktisch keine Atmosphäre, die Wärme speichern könnte – nachts kühlt er deshalb stark ab. Die Venus ist zwar weiter von der Sonne entfernt, aber ihre dichte Kohlendioxid-Atmosphäre hält die Wärme fest, sodass sie mit rund 465 °C heißer ist.',
    },
    {
      frage: 'Wie lange dauert ein Tag auf Merkur?',
      antwort: 'Merkur dreht sich in 58,6 Tagen einmal um sich selbst, genau dreimal während zweier Umläufe um die Sonne. Dadurch dauert ein Sonnentag – von einem Mittag zum nächsten – 176 Erdentage.',
    },
    {
      frage: 'Hat Merkur Monde?',
      antwort: 'Nein. Merkur und Venus sind die einzigen Planeten des Sonnensystems ohne Mond.',
    },
    {
      frage: 'Gibt es auf Merkur Wasser?',
      antwort: 'Ja, in Form von Eis: In tiefen Kratern an den Polen, in die nie Sonnenlicht fällt, hat die Raumsonde MESSENGER Hinweise auf Wassereis gefunden – trotz der Nähe zur Sonne.',
    },
    {
      frage: 'Kann man Merkur mit bloßem Auge sehen?',
      antwort: 'Ja, aber nur kurz nach Sonnenuntergang oder vor Sonnenaufgang tief am Horizont, weil er sich am Himmel nie weiter als etwa 28° von der Sonne entfernt. Die besten Sichtbarkeiten gibt es wenige Male pro Jahr.',
    },
  ],
});
