// Detailseite: Mars
//
// Diese Datei kann frei bearbeitet werden – nach dem Speichern die Seite neu laden.
//   titel            Überschrift im Popup
//   untertitel       kurze Zeile unter der Überschrift
//   zusammenfassung  Absätze der Zusammenfassung (beliebig viele)
//   steckbrief       Tabelle mit [Bezeichnung, Wert]
//   fragen           häufige Fragen mit Antwort (empfohlen: 5)
// Texte werden als reiner Text angezeigt (kein HTML). Apostrophe im Text als \' schreiben.

SonnensystemInhalte.register('mars', {
  titel: 'Mars',
  untertitel: 'Der Rote Planet',
  zusammenfassung: [
    'Mars ist der vierte Planet von der Sonne und etwa halb so groß wie die Erde. Seine rötliche Farbe stammt von Eisenoxid – also Rost – im Staub der Oberfläche. Er besitzt den höchsten Vulkan des Sonnensystems, Olympus Mons, und das gewaltige Grabensystem Valles Marineris.',
    'Die Atmosphäre ist sehr dünn und besteht vor allem aus Kohlendioxid. Ausgetrocknete Flusstäler zeigen, dass auf dem Mars früher Wasser floss. Heute erforschen Rover wie Curiosity und Perseverance, ob es dort einst Leben gegeben haben könnte.',
  ],
  steckbrief: [
    ['Durchmesser', '6.779 km'],
    ['Abstand zur Sonne', '207–249 Mio. km'],
    ['Umlaufzeit', '687 Tage'],
    ['Rotation', '24 h 37 min'],
    ['Temperatur', 'im Mittel ≈ −60 °C'],
    ['Monde', '2 (Phobos, Deimos)'],
  ],
  fragen: [
    {
      frage: 'Warum ist der Mars rot?',
      antwort: 'Der Staub und das Gestein an der Oberfläche enthalten viel Eisenoxid, also Rost. Feiner Staub in der Atmosphäre färbt sogar den Himmel tagsüber rötlich-beige.',
    },
    {
      frage: 'Gibt es Wasser auf dem Mars?',
      antwort: 'Ja, vor allem als Eis: in den Polkappen und unter der Oberfläche. Flüssiges Wasser ist an der Oberfläche wegen des geringen Luftdrucks heute nicht dauerhaft stabil. Flusstäler, Deltas und Mineralien zeigen aber, dass es vor Milliarden Jahren Seen und Flüsse gab.',
    },
    {
      frage: 'Gab oder gibt es Leben auf dem Mars?',
      antwort: 'Das ist eine der großen offenen Fragen. Bisher wurde kein Leben nachgewiesen. Die Rover haben aber gezeigt, dass es früher lebensfreundliche Bedingungen gab, und Perseverance sammelt Gesteinsproben, die später zur Untersuchung zur Erde gebracht werden sollen.',
    },
    {
      frage: 'Wie lange dauert ein Flug zum Mars?',
      antwort: 'Mit heutigen Raketen etwa sechs bis neun Monate. Günstige Startfenster, in denen Erde und Mars passend zueinander stehen, gibt es nur etwa alle 26 Monate.',
    },
    {
      frage: 'Könnten Menschen auf dem Mars leben?',
      antwort: 'Nur mit viel Technik: Die Luft ist nicht atembar, der Druck beträgt weniger als 1 % des Erddrucks, es ist sehr kalt, und ohne schützendes Magnetfeld trifft starke Strahlung auf die Oberfläche. Unterkünfte müssten abgeschirmt sein und Wasser, Sauerstoff und Nahrung selbst erzeugen.',
    },
  ],
});
