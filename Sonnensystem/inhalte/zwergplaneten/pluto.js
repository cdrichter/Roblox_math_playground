// Detailseite: Pluto
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('pluto', {
  titel: 'Pluto',
  untertitel: 'Zwergplanet im Kuipergürtel',
  zusammenfassung: [
    'Pluto wurde 1930 entdeckt und galt 76 Jahre lang als neunter Planet. Seit 2006 zählt er zu den Zwergplaneten. Er ist kleiner als unser Mond und kreist auf einer stark elliptischen, geneigten Bahn im Kuipergürtel jenseits des Neptun.',
    'Die Raumsonde New Horizons zeigte 2015 eine überraschend abwechslungsreiche Welt mit Bergen aus Wassereis, einer dünnen Stickstoffatmosphäre und einer großen herzförmigen Ebene aus gefrorenem Stickstoff.',
  ],
  steckbrief: [
    ['Durchmesser', '2.377 km'],
    ['Abstand zur Sonne', '4,4–7,4 Mrd. km'],
    ['Umlaufzeit', '248 Jahre'],
    ['Rotation', '6,4 Tage, rückläufig'],
    ['Temperatur', '≈ −230 °C'],
    ['Monde', '5'],
  ],
  fragen: [
    {
      frage: 'Warum ist Pluto kein Planet mehr?',
      antwort: '2006 legte die Internationale Astronomische Union fest, dass ein Planet seine Umlaufbahn von anderen Objekten „freigeräumt“ haben muss. Pluto teilt seine Region mit vielen anderen Kuipergürtel-Objekten und gilt deshalb als Zwergplanet.',
    },
    {
      frage: 'Was ist das Herz auf Pluto?',
      antwort: 'Die helle, herzförmige Region heißt Tombaugh Regio. Ihre linke Hälfte, Sputnik Planitia, ist eine riesige Ebene aus gefrorenem Stickstoff, in der sich das Eis langsam umwälzt.',
    },
    {
      frage: 'Wer hat Pluto entdeckt?',
      antwort: 'Der Amerikaner Clyde Tombaugh am Lowell-Observatorium im Februar 1930, durch den Vergleich von Fotoplatten, die im Abstand von einigen Tagen aufgenommen worden waren.',
    },
    {
      frage: 'Wie viele Monde hat Pluto?',
      antwort: 'Fünf. Der größte, Charon, ist etwa halb so groß wie Pluto selbst; beide umkreisen einen gemeinsamen Schwerpunkt außerhalb von Pluto. Die anderen heißen Nix, Hydra, Kerberos und Styx.',
    },
    {
      frage: 'War schon eine Raumsonde bei Pluto?',
      antwort: 'Ja, die NASA-Sonde New Horizons flog am 14. Juli 2015 an Pluto vorbei und lieferte die ersten detaillierten Bilder. Danach flog sie weiter in den Kuipergürtel.',
    },
  ],
});
