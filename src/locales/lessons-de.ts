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
  Fish: {
    text: 'Ein Fisch arbeitet mit einer einzigen Ziffer. Liegen die einzigen Plätze der Ziffer in einigen Spalten alle in ebenso vielen Zeilen, setzen diese Spalten ihre Ziffern in diese Zeilen, also kann keine andere Zelle dieser Zeilen sie enthalten. Mit vertauschten Zeilen und Spalten gilt dasselbe.',
    sections: [
      {
        text: 'Wähle eine Ziffer und finde zwei Spalten, in denen sie nur je zwei Plätze hat, in denselben zwei Zeilen. Die Ziffer jeder Spalte steht in einer dieser Zeilen, und beide können sich keine Zeile teilen, also belegen sie beide Zeilen. Keine andere Zelle dieser Zeilen kann die Ziffer enthalten.',
        examples: [
          [
            'Spalte 4 braucht noch eine 8, und nur zwei ihrer Zellen können sie aufnehmen: in den Zeilen 3 und 6.',
            'Auch Spalte 7 braucht eine 8, und sie kann ebenfalls nur in die Zeilen 3 oder 6.',
            'Die beiden 8en können sich keine Zeile teilen: Eine steht in Zeile 3, die andere in Zeile 6. So oder so haben die Zeilen 3 und 6 ihre 8 in den Spalten 4 und 7. Das ist ein X-Wing.',
            'Also kann keine andere Zelle der Zeilen 3 und 6 eine 8 sein: Die 8en in den Spalten 6, 8 und 9 entfallen.',
          ],
        ],
      },
      {
        text: 'Ein Swordfish ist ein X-Wing mit drei Spalten und drei Zeilen. Die Plätze der Ziffer in drei Spalten liegen alle in denselben drei Zeilen, also belegen die Spalten je eine Zeile und keine andere Zelle dieser Zeilen kann sie enthalten. Eine Spalte darf nur zwei der drei Plätze haben.',
        examples: [
          [
            'Spalte 6 braucht noch eine 9, und nur die Zeilen 5 und 8 können sie aufnehmen.',
            'Die 9 in Spalte 7 kann in die Zeilen 1, 5 oder 8.',
            'Und die 9 in Spalte 8 nur in die Zeilen 1 oder 8. Drei Spalten, und alle ihre Plätze für eine 9 liegen in den Zeilen 1, 5 und 8.',
            'Die drei 9en können sich keine Zeile teilen, also belegen sie je eine Zeile: Die Zeilen 1, 5 und 8 haben ihre 9 in diesen Spalten. Das ist ein Swordfish.',
            'Also kann keine andere Zelle der Zeilen 1, 5 und 8 eine 9 sein: Die 9en in den Spalten 4, 5 und 9 entfallen.',
          ],
        ],
      },
    ],
  },
  Wings: {
    text: 'Ein Wing besteht aus einer Pivot-Zelle und zwei Flügeln: Nachbarzellen des Pivots mit je zwei Kandidaten, die eine Ziffer gemeinsam haben. Was auch immer das Pivot enthält, diese Ziffer landet in einer Zelle des Musters, also kann sie auch eine Zelle nicht enthalten, die Nachbarzelle aller Zellen ist, die sie enthalten könnten.',
    sections: [
      {
        text: 'Das Pivot hat zwei Kandidaten, X und Y. Ein Flügel hat X und Z, der andere Y und Z. Ist das Pivot X, bleibt dem ersten Flügel Z; ist es Y, dem zweiten. So oder so enthält ein Flügel Z, also entfällt Z in jeder Zelle, die Nachbarzelle beider Flügel ist.',
        examples: [
          [
            'Zeile 1, Spalte 2 kann nur eine 1 oder eine 7 aufnehmen. Sie ist das Pivot.',
            'Ist das Pivot 1, kann Zeile 1, Spalte 4, in derselben Zeile, keine 1 sein, also bleibt ihr die 2.',
            'Ist das Pivot stattdessen 7, kann Zeile 3, Spalte 3, im selben Block, keine 7 sein, also bleibt ihr die 2.',
            'So oder so ist einer der beiden Flügel eine 2. Das ist ein XY-Wing: ein Pivot und zwei Flügel.',
            'Zeile 3, Spalte 5 ist Nachbarzelle beider Flügel: Sie teilt Zeile 3 mit dem einen und den Block oben in der Mitte mit dem anderen. Welcher Flügel auch die 2 ist, diese Zelle kann es nicht sein, also entfällt ihre 2.',
          ],
        ],
      },
      {
        text: 'Ein XYZ-Wing ist ein XY-Wing, dessen Pivot auch die gemeinsame Ziffer aufnehmen kann: Das Pivot hat X, Y und Z, ein Flügel X und Z, der andere Y und Z. Was auch immer das Pivot enthält, Z landet im Pivot oder in einem Flügel, also entfällt Z in jeder Zelle, die Nachbarzelle aller drei ist.',
        examples: [
          [
            'Zeile 8, Spalte 6 kann eine 6, eine 8 oder eine 9 aufnehmen. Sie ist das Pivot.',
            'Ist das Pivot 6, kann Zeile 3, Spalte 6, in derselben Spalte, keine 6 sein, also bleibt ihr die 8.',
            'Ist das Pivot 9, kann Zeile 8, Spalte 5, in derselben Zeile, keine 9 sein, also bleibt ihr die 8.',
            'Und ist das Pivot keins von beiden, ist es selbst die 8. So oder so ist eine der drei Zellen eine 8. Das ist ein XYZ-Wing.',
            'Zeile 7, Spalte 6 ist Nachbarzelle aller drei: Sie teilt Spalte 6 mit dem Pivot und einem Flügel und den Block unten in der Mitte mit dem Pivot und dem anderen. Welche davon auch die 8 ist, diese Zelle kann es nicht sein, also entfällt ihre 8.',
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
