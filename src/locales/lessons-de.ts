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
  BUG: {
    text: 'Ein BUG, kurz für Bivalue Universal Grave, ist ein Gitter, in dem jede leere Zelle genau zwei Kandidaten hat und jeder Kandidat in jeder seiner Einheiten genau zwei Plätze. Ein solches Gitter hat keine Lösung oder mehrere, nie genau eine. Trennen also nur ein paar überzählige Kandidaten das Gitter von einem BUG, ist einer von ihnen wahr.',
    sections: [
      {
        text: 'Jede leere Zelle hat zwei Kandidaten bis auf eine, die drei hat. Ihre überzählige Ziffer ist die, die in den Einheiten der Zelle drei Plätze hat. Ohne sie wäre das Gitter ein BUG, also ist die Zelle diese Ziffer.',
        examples: [
          [
            'Hier hat jede leere Zelle genau zwei Kandidaten, außer Zeile 1, Spalte 2, die drei hat: eine 1, eine 8 und eine 9.',
            'Sieh dir ihre 9 an. Die drei Einheiten der Zelle, Zeile 1, Spalte 2 und der Block oben links, haben jeweils drei Plätze für eine 9, einen zu viel.',
            'Ohne diese 9 hätte jeder Kandidat in jeder seiner Einheiten genau zwei Plätze: Das Gitter wäre ein BUG, ohne Lösung oder mit mehreren. Das Rätsel hat genau eine, also bleibt die 9: Zeile 1, Spalte 2 ist die 9, und ihre 1 und ihre 8 entfallen. Das ist BUG type 1.',
          ],
        ],
      },
      {
        text: 'Ein paar Zellen haben einen dritten Kandidaten, und es ist in allen dieselbe Ziffer. Ohne sie wäre das Gitter ein BUG, also enthält eine dieser Zellen die Ziffer, und sie entfällt in jeder Zelle, die Nachbarzelle von allen ist.',
        examples: [
          [
            'Hier hat jede leere Zelle genau zwei Kandidaten, außer zwei in Zeile 4: Spalte 4 mit einer 2, einer 3 und einer 8 sowie Spalte 6 mit einer 1, einer 3 und einer 5.',
            'Beide haben eine 3 zu viel: Zeile 4 hat vier Plätze für eine 3. Ohne diese beiden 3en hätte jeder Kandidat in jeder seiner Einheiten genau zwei Plätze: Das Gitter wäre ein BUG, ohne Lösung oder mit mehreren.',
            'Also ist eine der beiden eine 3. Welche es auch ist, eine Nachbarzelle von beiden kann es nicht sein: Die 3en in Zeile 4, Spalte 3 und 9, in Zeile 5, Spalte 6 und in Zeile 6, Spalte 4 entfallen. Das ist BUG type 2.',
          ],
        ],
      },
      {
        text: 'Ein paar Zellen einer Einheit haben einen dritten Kandidaten, nicht immer dieselbe Ziffer. Ohne sie wäre das Gitter ein BUG, also enthält eine dieser Zellen ihre überzählige Ziffer. Zusammen wirken sie wie eine einzige Zelle, die nur die überzähligen Ziffern enthält und mit anderen Zellen der Einheit eine nackte Teilmenge bilden kann.',
        examples: [
          [
            'Hier hat jede leere Zelle genau zwei Kandidaten, außer zwei in Zeile 4: Spalte 3 mit einer 1, einer 3 und einer 9 sowie Spalte 6 mit einer 5, einer 8 und einer 9.',
            'Spalte 3 hat drei Plätze für eine 3, einen zu viel, und Spalte 6 drei für eine 9. Ohne diese 3 und diese 9 hätte jeder Kandidat in jeder seiner Einheiten genau zwei Plätze: Das Gitter wäre ein BUG, ohne Lösung oder mit mehreren.',
            'Also ist Zeile 4, Spalte 3 die 3, oder Zeile 4, Spalte 6 ist die 9. Zusammen wirken sie wie eine Zelle der Zeile 4, die eine 3 oder eine 9 enthält.',
            'Zeile 4, Spalte 1 enthält eine 3 oder eine 4 und Spalte 9 eine 4 oder eine 9. Mit dieser einen Zelle sind das drei Plätze für drei Ziffern, die 3, die 4 und die 9: ein nacktes Tripel in Zeile 4.',
            'Also kann keine Zelle der Zeile 4 außerhalb des Tripels sie enthalten: Die 3 in Spalte 2 entfällt. Das ist BUG type 3.',
          ],
        ],
      },
      {
        text: 'Zwei Zellen, die eine Einheit teilen, haben jeweils einen dritten Kandidaten. Ohne die überzähligen Ziffern wäre das Gitter ein BUG, also enthält eine der beiden ihre überzählige Ziffer. Hat eine Ziffer, die beide Zellen teilen, in der Einheit keinen anderen Platz, enthält die andere Zelle sie. So bleibt jeder Zelle ihre überzählige Ziffer und die gemeinsame.',
        examples: [
          [
            'Hier hat jede leere Zelle genau zwei Kandidaten, außer zwei in Spalte 1: Zeile 7 mit einer 1, einer 4 und einer 5 sowie Zeile 8 mit einer 1, einer 5 und einer 7.',
            'Zeile 7 hat drei Plätze für eine 5, einen zu viel, und Spalte 1 drei für eine 7. Ohne die 5 in Zeile 7, Spalte 1 und die 7 in Zeile 8, Spalte 1 hätte jeder Kandidat in jeder seiner Einheiten genau zwei Plätze: Das Gitter wäre ein BUG. Also ist eine davon wahr.',
            'Die 1 des Blocks unten links kann nur in diese beiden Zellen. Welche auch immer ihre überzählige Ziffer enthält, die andere ist die 1.',
            'Also ist Zeile 7, Spalte 1 eine 1 oder eine 5, und Zeile 8, Spalte 1 eine 1 oder eine 7: Die 4 in der einen und die 5 in der anderen entfallen. Das ist BUG type 4.',
          ],
        ],
      },
    ],
  },
  Exclusion: {
    text: 'Exclusion probiert die Ziffern durch, die ein paar Zellen zusammen enthalten könnten. Eine Kombination scheidet aus, wenn sie dieselbe Ziffer zweimal in eine Einheit setzt oder eine Zelle ohne Kandidaten zurückließe, die Nachbarzelle von allen ist. Ein Kandidat, der in keiner übrigen Kombination vorkommt, entfällt.',
    sections: [
      {
        text: 'Nimm zwei Zellen, die eine Einheit teilen, und liste die Ziffernpaare auf, die sie enthalten könnten. Ein Paar scheidet aus, wenn eine andere Zelle, die Nachbarzelle von beiden ist, nur diese zwei Ziffern enthält: Sie bliebe leer. Scheiden alle Paare mit einem bestimmten Kandidaten einer Zelle aus, entfällt dieser Kandidat.',
        examples: [
          [
            'Zeile 3, Spalte 2 und 3 teilen eine Zeile und einen Block, also können sie nicht dieselbe Ziffer enthalten. Angenommen, Spalte 2 wäre eine 2: Spalte 3 wäre dann eine 5, eine 6 oder eine 7. Probiere jede durch.',
            'Eine 2 und eine 5 gehen nicht: Zeile 3, Spalte 8 enthält nur eine 2 oder eine 5 und teilt Zeile 3 mit beiden Zellen. Sie bliebe ohne alles.',
            'Eine 2 und eine 6 gehen auch nicht: Zeile 3, Spalte 4 enthält nur eine 2 oder eine 6.',
            'Eine 2 und eine 7 ebenso wenig: Zeile 2, Spalte 2 enthält nur eine 2 oder eine 7 und teilt den Block oben links mit beiden Zellen.',
            'Alle Paare mit einer 2 in Zeile 3, Spalte 2 scheiden aus, also entfällt ihre 2. Das ist eine Aligned Pair Exclusion.',
          ],
        ],
      },
      {
        text: 'Dasselbe mit drei Zellen: Liste die Ziffernkombinationen auf, die sie enthalten könnten. Eine Kombination scheidet aus, wenn sie dieselbe Ziffer zweimal in eine Einheit setzt oder wenn eine andere Zelle, die Nachbarzelle von allen dreien ist, nur Ziffern daraus enthält: Sie bliebe leer. Scheiden alle Kombinationen mit einem bestimmten Kandidaten einer Zelle aus, entfällt dieser Kandidat.',
        examples: [
          [
            'Nimm drei Zellen: Zeile 1, Spalte 5 und 6, und Zeile 2, Spalte 1. Angenommen, Zeile 1, Spalte 6 wäre eine 6.',
            'Zeile 1, Spalte 5 in derselben Zeile könnte nicht auch eine 6 sein, wäre also ihre 3. Zeile 2, Spalte 1 wäre eine 2 oder eine 4. Probiere jede durch.',
            'Eine 3, eine 6 und eine 4 gehen nicht: Zeile 2, Spalte 5 enthält nur eine 3, eine 4 oder eine 6 und ist Nachbarzelle von allen dreien, da sie Zeile 2 mit einer und den Block oben Mitte mit den anderen teilt. Sie bliebe ohne alles.',
            'Eine 3, eine 6 und eine 2 gehen auch nicht: Zeile 1, Spalte 3 enthält nur eine 2 oder eine 3 und teilt Zeile 1 mit zwei der Zellen und den Block oben links mit der dritten.',
            'Alle Kombinationen mit einer 6 in Zeile 1, Spalte 6 scheiden aus, also entfällt ihre 6. Das ist eine Aligned Triplet Exclusion.',
          ],
        ],
      },
    ],
  },
}
