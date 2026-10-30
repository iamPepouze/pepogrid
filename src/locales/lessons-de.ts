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
  Cycles: {
    text: 'Ein Cycle folgt Ziffern um eine geschlossene Schleife aus Zellen, Glied für Glied: Wenn diese Zelle die Ziffer hat, kann jene sie nicht haben, oder wenn diese sie nicht haben kann, muss jene sie haben. Schließt sich die Schleife, und jedes Glied wirkt in beide Richtungen, nehmen ihre Zellen die Ziffern auf genau zwei Arten an. Was in beiden gilt, gilt für den Rest des Rätsels. Eine Kette, die sich nicht schließt, setzt die Ziffer trotzdem an eines ihrer beiden Enden, also kann eine Nachbarzelle von beiden sie nicht haben.',
    sections: [
      {
        text: 'Ein X-Cycle folgt einer einzigen Ziffer. Seine Glieder wechseln sich ab: zwei Zellen einer Einheit, in der die Ziffer nur diese zwei Plätze hat, also hat eine sie, dann zwei Zellen einer Einheit, die sie nicht beide haben können. Rund um die Schleife nimmt die Ziffer jede zweite Zelle, auf die eine oder die andere Art. In jeder Einheit eines „nicht beide“-Glieds ist eine der beiden Zellen in jedem Fall die Ziffer, also kann es der Rest der Einheit nicht sein.',
        examples: [
          [
            'Folge den 3en rund um eine Schleife. Angenommen, Zeile 1, Spalte 6 ist eine 3. Dann kann Zeile 3, Spalte 4, im selben Block, keine sein.',
            'Die 3 in Zeile 3 hat nur zwei Plätze, die Spalten 2 und 4, also steht sie in Spalte 2.',
            'Dann kann Zeile 2, Spalte 1, im selben Block wie Zeile 3, Spalte 2, keine 3 sein.',
            'Die 3 in Spalte 1 hat nur zwei Plätze, die Zeilen 2 und 6, also steht sie in Zeile 6.',
            'Dann kann Zeile 6, Spalte 6, in derselben Zeile, keine 3 sein.',
            'Die 3 in Spalte 6 hat nur zwei Plätze, die Zeilen 1 und 6, also steht sie in Zeile 1: zurück am Anfang der Schleife, und sie geht auf.',
            'Angenommen stattdessen, Zeile 1, Spalte 6 ist keine 3: Jedes Glied kehrt sich um, und die anderen drei Zellen nehmen die 3en. In jedem Fall nehmen die 3en jede zweite Zelle der Schleife. Das ist ein bidirektionaler X-Cycle.',
            'Der Block oben in der Mitte, der Block oben links und Zeile 6 enthalten je zwei Zellen der Schleife, die nicht beide 3 sein können, und eine davon ist in jedem Fall die 3. Der Rest dieser Einheiten kann also keine 3 sein: Ihre anderen 3en entfallen.',
          ],
        ],
      },
      {
        text: 'Ein Turbot Fish ist eine kurze Kette aus einer Ziffer: eine Einheit, in der die Ziffer nur zwei Plätze hat, ein Glied zwischen zwei Zellen, die sie nicht beide haben können, und eine weitere Einheit mit nur zwei Plätzen. Ist das erste Ende der Kette nicht die Ziffer, ist es das letzte, also hat eines der beiden Enden sie. Eine Nachbarzelle beider Enden kann sie nicht haben.',
        examples: [
          [
            'Die 6 in Spalte 5 hat nur zwei Plätze, die Zeilen 5 und 8, also ist eine davon die 6.',
            'Ist es Zeile 8, dann kann Zeile 9, Spalte 6, im selben Block, keine 6 sein.',
            'Die 6 in Zeile 9 hat nur zwei Plätze, die Spalten 2 und 6, also steht sie in Spalte 2.',
            'Also steht die 6 aus Spalte 5 entweder in Zeile 5, oder Zeile 9, Spalte 2 ist eine 6: Ein Ende der Kette oder das andere hat die 6. Das ist ein Turbot Fish.',
            'Zeile 5, Spalte 2 ist eine Nachbarzelle beider Enden: Sie teilt Zeile 5 mit dem einen und Spalte 2 mit dem anderen. Welches auch die 6 ist, sie kann es nicht sein, also entfällt ihre 6.',
          ],
        ],
      },
      {
        text: 'Ein Y-Cycle läuft durch Zellen mit je zwei Kandidaten. Jedes Glied verbindet zwei Zellen einer Einheit, die einen Kandidaten teilen: Ist die eine diese Ziffer, bleibt der anderen ihre andere Ziffer. Schließt sich die Schleife, nimmt jede Zelle eine ihrer zwei Ziffern an, auf genau zwei Arten, und jedes Paar benachbarter Zellen hat seine gemeinsame Ziffer in jedem Fall. Also kann der Rest ihrer Einheit sie nicht haben.',
        examples: [
          [
            'Diese vier Zellen haben je zwei Kandidaten: Zeile 5, Spalte 2 eine 3 oder 6, Zeile 7, Spalte 2 eine 3 oder 5, Zeile 7, Spalte 9 eine 4 oder 5 und Zeile 5, Spalte 9 eine 4 oder 6.',
            'Angenommen, Zeile 5, Spalte 2 ist die 3. Zeile 7, Spalte 2, in derselben Spalte, kann keine 3 sein, also ist sie die 5.',
            'Dann kann Zeile 7, Spalte 9, in derselben Zeile, keine 5 sein, also ist sie die 4.',
            'Dann kann Zeile 5, Spalte 9, in derselben Spalte, keine 4 sein, also ist sie die 6.',
            'Dann kann Zeile 5, Spalte 2, in derselben Zeile, keine 6 sein, also ist sie die 3: zurück am Anfang der Schleife, und sie geht auf.',
            'Angenommen stattdessen, Zeile 5, Spalte 2 ist die 6: Jedes Glied kehrt sich um, und jede Zelle nimmt ihre andere Ziffer an. In jedem Fall geht die Schleife auf. Das ist ein bidirektionaler Y-Cycle.',
            'In jedem Fall hat Spalte 2 ihre 3 in der Schleife, Zeile 7 ihre 5, Spalte 9 ihre 4 und Zeile 5 ihre 6. Keine andere Zelle dieser Einheiten kann sie haben: Die 3en in den Zeilen 3 und 6 von Spalte 2, die 5 in Zeile 7, Spalte 3, die 4 in Zeile 8, Spalte 9 und die 6 in Zeile 5, Spalte 3 entfallen.',
          ],
        ],
      },
      {
        text: 'Ein Cycle kann mehreren Ziffern folgen und alle Arten von Gliedern mischen: eine Einheit, in der eine Ziffer nur zwei Plätze hat, zwei Zellen einer Einheit, die eine Ziffer nicht beide haben können, und eine Zelle, die eine Ziffer hat, also keine ihrer anderen. Schließt sich die Schleife, und jedes Glied wirkt in beide Richtungen, nehmen ihre Zellen die Ziffern auf genau zwei Arten an, und was eine Einheit in jedem Fall enthält, entfällt im Rest dieser Einheit.',
        examples: [
          [
            'Folge den 3en und den 4en rund um eine Schleife. Angenommen, Zeile 2, Spalte 8 ist eine 3. Dann kann sie nicht ihre 4 sein.',
            'Die 4 im Block oben rechts hat nur zwei Plätze, Zeile 2, Spalten 8 und 9, also steht sie in Spalte 9.',
            'Dann kann Zeile 9, Spalte 9, in derselben Spalte, keine 4 sein.',
            'Die 4 in Zeile 9 hat nur zwei Plätze, die Spalten 4 und 9, also steht sie in Spalte 4.',
            'Zeile 9, Spalte 4 ist die 4, also kann sie nicht ihre 3 sein.',
            'Die 3 in Spalte 4 hat nur zwei Plätze, die Zeilen 3 und 9, also steht sie in Zeile 3.',
            'Dann kann Zeile 3, Spalte 8, in derselben Zeile, keine 3 sein.',
            'Die 3 im Block oben rechts hat nur zwei Plätze, Spalte 8, Zeilen 2 und 3, also steht sie in Zeile 2: zurück am Anfang der Schleife, und sie geht auf.',
            'Angenommen stattdessen, Zeile 2, Spalte 8 ist keine 3: Jedes Glied kehrt sich um. Sie ist die 4, Zeile 9, Spalte 9 die 4, und Zeile 9, Spalte 4 und Zeile 3, Spalte 8 die 3en. In jedem Fall geht die Schleife auf. Das ist ein bidirektionaler Cycle: Anders als ein X-Cycle folgt er mehreren Ziffern.',
            'In jedem Fall hat Zeile 3 ihre 3 in der Schleife, in Spalte 4 oder Spalte 8. Keine andere Zelle von Zeile 3 kann also 3 sein: Die 3en in den Spalten 2 und 6 entfallen.',
          ],
        ],
      },
    ],
  },
}
