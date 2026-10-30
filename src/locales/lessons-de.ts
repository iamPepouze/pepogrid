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
  'Hidden subsets': {
    text: 'Wenn einige Ziffern, die eine Einheit braucht, nur in ebenso viele ihrer Zellen passen, müssen diese Zellen genau diese Ziffern enthalten, und ihre anderen Kandidaten fallen weg. Eine direkte versteckte Teilmenge lässt einer Ziffer nur einen Platz.',
    sections: [
      {
        text: 'Suche zwei Ziffern, die dieselben zwei Zellen, und nur diese, in einer Zeile, Spalte oder einem Block haben. Diese Zellen müssen das Paar enthalten, in beliebiger Reihenfolge, also fällt jeder andere Kandidat darin weg. Hier bleibt dadurch für eine andere Ziffer nur ein Platz in der Einheit.',
        examples: [
          [
            'Zeile 5 braucht noch eine 1, eine 2, eine 4, eine 5, eine 6, eine 7 und eine 8. Wohin können ihre 1 und ihre 2?',
            'Beide sind nur in den Spalten 2 und 3 Kandidaten. Zwei Ziffern, zwei Zellen: Diese Zellen müssen die 1 und die 2 enthalten, in beliebiger Reihenfolge. Das ist ein verstecktes Paar.',
            'Da die 1 und die 2 beide Zellen belegen, passt dort nichts anderes: Ihre anderen Kandidaten fallen weg.',
            'Die 8 in Zeile 5 hat nur noch einen Platz, Spalte 9, also kommt die 8 dorthin. Das versteckte Paar führte direkt zu einem Single: Deshalb heißt es direkt.',
          ],
        ],
      },
      {
        text: 'Drei Ziffern, deren einzige Plätze in einer Einheit dieselben drei Zellen sind, bilden ein verstecktes Tripel. Die drei Zellen müssen diese Ziffern enthalten, also fallen ihre anderen Kandidaten weg. Nicht jede Zelle braucht alle drei Ziffern als Kandidaten: Entscheidend ist, dass die Ziffern keinen anderen Platz haben.',
        examples: [
          [
            'Zeile 7 braucht noch eine 1, eine 2, eine 3, eine 4, eine 8 und eine 9. Wohin können ihre 3, ihre 4 und ihre 9?',
            'Alle drei sind nur in den Spalten 5, 6 und 7 Kandidaten. Drei Ziffern, drei Zellen: Diese Zellen müssen sie enthalten, in beliebiger Reihenfolge. Das ist ein verstecktes Tripel, auch wenn nur eine der Zellen alle drei hat.',
            'Da die 3, die 4 und die 9 diese Zellen belegen, passt dort nichts anderes: Ihre anderen Kandidaten fallen weg.',
            'Die 8 in Zeile 7 hat nur noch einen Platz, Spalte 1, also kommt die 8 dorthin. Das versteckte Tripel führte direkt zu einem Single: Deshalb heißt es direkt.',
          ],
        ],
      },
    ],
  },
  Intersections: {
    text: 'Ein Block schneidet eine Zeile oder Spalte in drei Zellen. Liegen alle Plätze einer Ziffer in einem Block in einer Zeile oder Spalte, muss die Ziffer dieser Linie im Block stehen, also kann der Rest der Linie sie nicht enthalten. Das ist Pointing. Claiming funktioniert umgekehrt: Liegen alle Plätze einer Ziffer in einer Linie in einem Block, kann der Rest des Blocks sie nicht enthalten.',
    sections: [
      {
        text: 'Wähle einen Block und eine Ziffer, die er noch braucht. Liegen alle Zellen des Blocks mit diesem Kandidaten in derselben Zeile oder Spalte, zeigt der Block entlang dieser Linie: Die Ziffer ist im Rest der Linie außerhalb des Blocks ausgeschlossen.',
        examples: [
          [
            'Der Block oben links braucht noch eine 6. Welche seiner Zellen können sie aufnehmen?',
            'Nur zwei, in den Zeilen 1 und 2, und beide liegen in Spalte 2. Welche auch immer die 6 des Blocks enthält, enthält auch die 6 von Spalte 2.',
            'Also kann keine andere Zelle in Spalte 2 eine 6 sein, und die 6 in Zeile 4 fällt weg. Das ist Pointing: Der Block zeigt entlang der Spalte.',
          ],
        ],
      },
      {
        text: 'Pointing ist direkt, wenn die Kandidaten, die es ausschließt, einer Ziffer in einer anderen Einheit nur einen Platz lassen: Es führt direkt zu einem Single.',
        examples: [
          [
            'Der Block links in der Mitte braucht noch eine 2, und jede Zelle, die sie aufnehmen kann, liegt in Zeile 4.',
            'Die 2 von Zeile 4 steht also in diesem Block, und keine andere Zelle in Zeile 4 kann eine 2 sein: Der Block zeigt entlang der Zeile.',
            'Der Block rechts in der Mitte braucht auch eine 2. Da Zeile 4 ausgeschlossen ist, kann nur Zeile 5, Spalte 8 sie aufnehmen, also kommt die 2 dorthin. Pointing führte direkt zu einem Single: Deshalb heißt es direkt.',
          ],
        ],
      },
      {
        text: 'Wähle eine Zeile oder Spalte und eine Ziffer, die sie noch braucht. Liegen alle Zellen der Linie mit diesem Kandidaten im selben Block, beansprucht die Linie die Ziffer für diesen Block: Sie ist im Rest des Blocks außerhalb der Linie ausgeschlossen.',
        examples: [
          [
            'Zeile 1 braucht noch eine 4, eine 5, eine 6 und eine 8. Welche ihrer Zellen können die 8 aufnehmen?',
            'Nur zwei, in den Spalten 7 und 9, und beide liegen im Block oben rechts. Welche auch immer die 8 von Zeile 1 enthält, enthält auch die 8 des Blocks.',
            'Also kann keine andere Zelle im Block eine 8 sein: Die 8 in Zeile 2, Spalte 7 und in Zeile 3, Spalte 9 fallen weg. Das ist Claiming: Die Zeile beansprucht die 8 für den Block.',
          ],
        ],
      },
    ],
  },
}
