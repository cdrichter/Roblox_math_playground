// Detailseite: Saturn
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('saturn', {
  titel: 'Saturn',
  untertitel: 'Der Ringplanet',
  zusammenfassung: [
    'Saturn ist der zweitgrößte Planet und vor allem für sein prächtiges Ringsystem bekannt. Die Ringe bestehen aus unzähligen Brocken aus Wassereis, von Staubkörnchen bis zu hausgroßen Stücken, und sind zwar Hunderttausende Kilometer breit, aber meist nur etwa zehn Meter bis einen Kilometer dick.',
    'Wie Jupiter ist Saturn ein Gasriese aus Wasserstoff und Helium. Seine mittlere Dichte ist geringer als die von Wasser. Mit über 270 bekannten Monden hat Saturn mehr Monde als jeder andere Planet; der größte ist Titan.',
  ],
  steckbrief: [
    ['Durchmesser', '116.460 km (9 × Erde)'],
    ['Masse', '95 Erdmassen'],
    ['Abstand zur Sonne', '1,35–1,51 Mrd. km'],
    ['Umlaufzeit', '29,46 Jahre'],
    ['Rotation', '10 h 34 min'],
    ['Monde', 'über 270'],
  ],
  fragen: [
    {
      frage: 'Woraus bestehen Saturns Ringe?',
      antwort: 'Fast vollständig aus Wassereis, mit etwas Staub und Gestein. Die Teilchen reichen von winzigen Körnchen bis zu Brocken von einigen Metern Größe und umkreisen den Planeten jeweils auf eigenen Bahnen.',
    },
    {
      frage: 'Würde Saturn in Wasser schwimmen?',
      antwort: 'Rein rechnerisch ja: Seine mittlere Dichte beträgt nur etwa 0,69 g/cm³ und ist damit geringer als die von Wasser (1 g/cm³). Eine ausreichend große Badewanne gibt es natürlich nicht.',
    },
    {
      frage: 'Wie viele Monde hat Saturn?',
      antwort: 'Mehr als 270 – so viele wie kein anderer Planet. Die meisten sind nur wenige Kilometer groß. Die bekanntesten sind Titan, Enceladus mit seinen Wasserfontänen, Rhea, Dione, Tethys, Mimas und Iapetus.',
    },
    {
      frage: 'Was ist das Sechseck am Nordpol?',
      antwort: 'Ein riesiges, sechseckiges Wolkenmuster um Saturns Nordpol, breiter als die Erde. Es entsteht durch einen stabilen Jetstream, dessen Strömung sich zu einem Sechseck formt, und wurde von den Sonden Voyager und Cassini beobachtet.',
    },
    {
      frage: 'Verschwinden Saturns Ringe?',
      antwort: 'Etwa alle 13 bis 16 Jahre sehen wir genau auf die Kante der Ringe – dann sind sie fast unsichtbar, zuletzt im März 2025. Auf sehr lange Sicht verlieren die Ringe tatsächlich Material, das auf Saturn regnet; das dauert aber Hunderte Millionen Jahre.',
    },
  ],
});
