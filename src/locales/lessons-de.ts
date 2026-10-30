import type { LessonTexts } from '../lib/lessons'

/** The lessons translated into German, by family. A family left out is shown in English. */
export const deLessons: LessonTexts = {
  Singles: {
    text: 'Jede Zeile, Spalte und jeder Block braucht jede Ziffer genau einmal. Ein Single ist eine Ziffer, für die nur noch ein Platz übrig ist.',
    sections: [
      {
        text: 'Wähle einen Block, eine Zeile oder eine Spalte und eine Ziffer, die sie noch braucht. Schließe jede leere Zelle aus, die diese Ziffer schon in ihrer Zeile, Spalte oder ihrem Block sieht. Bleibt nur eine Zelle übrig, kommt die Ziffer dorthin, auch wenn diese Zelle weitere Kandidaten hat: Die Ziffer hat sich zwischen ihnen versteckt.',
        examples: [
          [
            'Der Block oben in der Mitte braucht noch eine 3. Vier seiner Zellen sind leer: Welche davon kann sie aufnehmen?',
            'Zeile 1 hat schon eine 3, ganz links, also kann die leere Zelle des Blocks in Zeile 1 keine 3 sein.',
            'Die Spalten 5 und 6 haben weiter unten je eine 3, also können auch die Zellen des Blocks in diesen Spalten, in Zeile 2, keine 3 sein.',
            'Nur Zeile 2, Spalte 4 bleibt übrig, also kommt die 3 dorthin, obwohl diese Zelle auch eine 6 aufnehmen könnte. Das ist ein versteckter Single.',
          ],
        ],
      },
    ],
  },
  'Naked Single': {
    text: 'Die Nachbarzellen einer Zelle sind die 20 Zellen, die ihre Zeile, Spalte oder ihren Block teilen. Ein nackter Single ist eine Zelle, deren Nachbarzellen schon alle Ziffern bis auf eine enthalten.',
    sections: [
      {
        text: 'Wähle eine leere Zelle und liste die Ziffern auf, die ihre Nachbarzellen enthalten. Jede davon ist für die Zelle ausgeschlossen. Sind acht Ziffern ausgeschlossen, kommt die neunte dorthin: Sie ist der einzige Kandidat der Zelle, offen sichtbar.',
        examples: [
          [
            'Zeile 2, Spalte 8 ist leer. Welche Ziffern kann sie noch aufnehmen? Sieh dir ihre Nachbarzellen an: ihre Zeile, ihre Spalte und ihren Block.',
            'Zeile 2 hat schon eine 2, eine 3, eine 5 und eine 6, also kann die Zelle keine davon aufnehmen.',
            'Spalte 8 ergänzt eine 1, eine 4, eine 7 und eine 8. Ihr Block hat eine 1, eine 3 und eine 5, alle schon ausgeschlossen.',
            'Alle Ziffern außer der 9 sind ausgeschlossen, also kommt die 9 dorthin. Das ist ein nackter Single: der einzige Kandidat der Zelle.',
          ],
        ],
      },
    ],
  },
  Subsets: {
    text: 'Eine Teilmenge verbindet einige Zellen einer Einheit mit ebenso vielen Ziffern. In einer nackten Teilmenge haben die Zellen nur diese Ziffern als Kandidaten, also füllen die Ziffern die Zellen, und der Rest der Einheit kann sie nicht aufnehmen. In einer versteckten Teilmenge haben die Ziffern in der Einheit keinen anderen Platz, also nehmen die Zellen sie auf, und ihre anderen Kandidaten entfallen.',
    sections: [
      {
        text: 'Suche zwei Zellen in einer Zeile, Spalte oder einem Block mit denselben zwei Kandidaten und keinen weiteren. Eine nimmt jede Ziffer auf, in beliebiger Reihenfolge, also kann keine andere Zelle dieser Einheit eine davon aufnehmen.',
        examples: [
          [
            'Spalte 8 hat fünf leere Zellen. Sieh dir die Zeilen 3 und 4 an: Jede kann nur eine 5 oder eine 7 aufnehmen.',
            'Zwei Zellen, zwei Ziffern: Eine Zelle ist die 5 und die andere die 7, in beliebiger Reihenfolge. Das ist ein nacktes Paar.',
            'Da 5 und 7 vergeben sind, kann keine andere Zelle in Spalte 8 sie aufnehmen: Die 5 in Zeile 5 und die 7 in den Zeilen 7 und 9 entfallen.',
          ],
        ],
      },
      {
        text: 'Drei Zellen einer Einheit, deren Kandidaten zusammen nur drei Ziffern sind, bilden ein nacktes Tripel. Die drei Ziffern füllen diese Zellen in beliebiger Reihenfolge, also kann keine andere Zelle der Einheit sie aufnehmen. Eine Zelle braucht nicht alle drei: Zellen mit einer 4 oder 5, einer 5 oder 6 und einer 4 oder 6 sind auch ein Tripel.',
        examples: [
          [
            'Spalte 8 hat sechs leere Zellen. Sieh dir die Zeilen 2, 4 und 5 an: Jede kann nur eine 4, eine 5 oder eine 6 aufnehmen.',
            'Drei Zellen, drei Ziffern: Die 4, die 5 und die 6 füllen diese Zellen in beliebiger Reihenfolge. Das ist ein nacktes Tripel.',
            'Da diese drei Ziffern vergeben sind, kann keine andere Zelle in Spalte 8 sie aufnehmen: Die 4 und die 5 in Zeile 3 entfallen.',
          ],
        ],
      },
      {
        text: 'Vier Zellen einer Einheit, deren Kandidaten zusammen nur vier Ziffern sind, bilden ein nacktes Quadrupel. Die vier Ziffern füllen diese Zellen in beliebiger Reihenfolge, also kann keine andere Zelle der Einheit sie aufnehmen. Wie beim Tripel braucht eine Zelle nicht alle vier.',
        examples: [
          [
            'Der Block unten links hat neun leere Zellen. Sieh dir vier davon an: die drei in Zeile 7 und Zeile 8, Spalte 3.',
            'Zusammen enthalten sie nur eine 1, 2, 5 oder 9. Vier Zellen, vier Ziffern: Diese Ziffern füllen diese Zellen in beliebiger Reihenfolge. Das ist ein nacktes Quadrupel.',
            'Da diese vier Ziffern vergeben sind, kann keine andere Zelle im Block sie aufnehmen: Die 9 in Zeile 8, Spalte 2 und die 1 und die 2 in Zeile 9, Spalte 3 entfallen.',
          ],
        ],
      },
      {
        text: 'Suche zwei Ziffern, die eine Einheit braucht und deren einzige Plätze dieselben zwei Zellen sind. Diese Zellen müssen das Paar aufnehmen, in beliebiger Reihenfolge, also entfällt jeder andere Kandidat in ihnen. Das Paar hat sich zwischen diesen Kandidaten versteckt.',
        examples: [
          [
            'Der Block unten in der Mitte braucht noch eine 2, 3, 5, 6, 7, 8 und 9. Wohin können seine 8 und seine 9?',
            'Beide sind nur in Zeile 9, Spalten 5 und 6 Kandidaten. Zwei Ziffern, zwei Zellen: Diese Zellen müssen die 8 und die 9 aufnehmen, in beliebiger Reihenfolge. Das ist ein verstecktes Paar.',
            'Da 8 und 9 beide Zellen belegen, passt dort nichts anderes: Die 3 in Spalte 5 und die 5 in Spalte 6 entfallen.',
          ],
        ],
      },
      {
        text: 'Drei Ziffern, deren einzige Plätze in einer Einheit dieselben drei Zellen sind, bilden ein verstecktes Tripel. Die drei Zellen müssen diese Ziffern aufnehmen, also entfallen ihre anderen Kandidaten. Nicht jede Zelle braucht alle drei Ziffern als Kandidaten: Entscheidend ist, dass die Ziffern keinen anderen Platz haben.',
        examples: [
          [
            'Der Block rechts in der Mitte braucht noch jede Ziffer außer der 2. Wohin können seine 1, seine 8 und seine 9?',
            'Alle drei sind nur in Zeile 5, Spalte 9 und Zeile 6, Spalten 8 und 9 Kandidaten. Drei Ziffern, drei Zellen: Diese Zellen müssen sie aufnehmen, in beliebiger Reihenfolge. Das ist ein verstecktes Tripel, auch wenn Zeile 5, Spalte 9 keine 9 hat.',
            'Da 1, 8 und 9 diese Zellen belegen, passt dort nichts anderes: Die 6 und die 7 in Zeile 5, Spalte 9 entfallen.',
          ],
        ],
      },
    ],
  },
}
