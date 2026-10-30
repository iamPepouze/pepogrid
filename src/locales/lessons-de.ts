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
