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
  'Forcing chains': {
    text: 'Eine Forcing Chain nimmt an, dass ein Kandidat wahr ist, und folgt Glied für Glied dem, was daraus folgen muss: Hat diese Zelle die Ziffer, können ihre Nachbarzellen sie nicht haben, und bleibt in einer Einheit nur ein Platz für eine Ziffer übrig oder in einer Zelle nur ein Kandidat, kommt diese Ziffer dorthin. Läuft die Kette in einen Widerspruch, etwa zwei gleiche Ziffern in einer Einheit, war die Annahme falsch, und der Kandidat, von dem sie ausging, entfällt.',
    sections: [
      {
        text: 'Eine Forcing X-Chain folgt einer einzigen Ziffer. Jedes Glied ist entweder eine Zelle mit der Ziffer, sodass ihre Nachbarzellen sie nicht haben können, oder eine Einheit, in der nur ein Platz für sie bleibt, sodass sie dorthin kommt. Kehrt die Kette zurück und setzt die Ziffer in eine Nachbarzelle der Startzelle, widerspricht sich die Annahme selbst.',
        examples: [
          [
            'Nimm an, Zeile 4, Spalte 6 ist eine 4. Dann kann Zeile 4, Spalte 9, in derselben Zeile, keine 4 sein.',
            'Die 4 in Spalte 9 hat nur zwei Plätze, die Zeilen 4 und 8, also steht sie in Zeile 8.',
            'Dann kann Zeile 7, Spalte 7, im selben Block wie Zeile 8, Spalte 9, keine 4 sein.',
            'Die 4 in Zeile 7 hat nur zwei Plätze, die Spalten 5 und 7, also steht sie in Spalte 5.',
            'Dann kann Zeile 2, Spalte 5, in derselben Spalte, keine 4 sein.',
            'Die 4 im Block oben in der Mitte hat nur zwei Plätze, Zeile 2, Spalte 5 und Zeile 1, Spalte 6, also steht sie in Zeile 1, Spalte 6.',
            'Aber Zeile 1, Spalte 6 teilt Spalte 6 mit Zeile 4, Spalte 6, die als 4 angenommen war: Spalte 6 hätte zwei 4en. Die Annahme ist falsch, also entfällt die 4 in Zeile 4, Spalte 6. Das ist eine Forcing X-Chain.',
          ],
        ],
      },
      {
        text: 'Eine Forcing Chain kann unterwegs die Ziffer wechseln: Eine Zelle mit zwei Kandidaten, die einen verliert, behält den anderen, und die Kette geht mit dieser Ziffer weiter. Kehrt sie zurück und setzt die Startziffer in eine Nachbarzelle der Startzelle, widerspricht sich die Annahme selbst.',
        examples: [
          [
            'Nimm an, Zeile 3, Spalte 6 ist eine 4. Dann kann Zeile 3, Spalte 1, in derselben Zeile, keine 4 sein.',
            'Zeile 3, Spalte 1 hat nur eine 2 oder eine 4 als Kandidaten, also ist es die 2.',
            'Dann kann Zeile 3, Spalte 4, in derselben Zeile, keine 2 sein.',
            'Die 2 in Spalte 4 hat nur zwei Plätze, die Zeilen 3 und 7, also steht sie in Zeile 7.',
            'Dann kann Zeile 9, Spalte 6, im selben Block, keine 2 sein.',
            'Zeile 9, Spalte 6 hat nur eine 2 oder eine 4 als Kandidaten, also ist es die 4.',
            'Aber Zeile 9, Spalte 6 teilt Spalte 6 mit Zeile 3, Spalte 6, die als 4 angenommen war: Spalte 6 hätte zwei 4en. Die Annahme ist falsch, also entfällt die 4 in Zeile 3, Spalte 6. Das ist eine Forcing Chain.',
          ],
        ],
      },
      {
        text: 'Wie eine X-Chain folgt eine Nishio-Kette einer einzigen Ziffer, aber aus einer Annahme folgt sie mehreren Ketten. Widersprechen sich zwei davon, weil die eine die Ziffer in eine Zelle setzt und die andere sie dort ausschließt, oder weil beide sie in dieselbe Einheit setzen, war die Annahme falsch.',
        examples: [
          [
            'Nimm an, Zeile 2, Spalte 5 ist eine 8. Dann kann Zeile 9, Spalte 5, in derselben Spalte, keine 8 sein.',
            'Die 8 in Zeile 9 hat nur zwei Plätze, die Spalten 1 und 5, also steht sie in Spalte 1.',
            'Geh zurück zur Annahme. Zeile 3, Spalten 4 und 5, im selben Block wie Zeile 2, Spalte 5, können auch keine 8 sein.',
            'Die 8 in Zeile 3 hatte drei Plätze, die Spalten 1, 4 und 5. Zwei sind ausgeschlossen, also steht sie in Spalte 1.',
            'Aber die Zeilen 3 und 9 in Spalte 1 können nicht beide eine 8 sein: Spalte 1 hätte zwei. Die Annahme ist falsch, also entfällt die 8 in Zeile 2, Spalte 5. Das ist eine Nishio-Kette.',
          ],
        ],
      },
    ],
  },
}
