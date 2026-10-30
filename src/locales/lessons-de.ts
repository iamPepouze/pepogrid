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
}
