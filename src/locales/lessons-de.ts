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
  Uniqueness: {
    text: 'Ein Rätsel hat genau eine Lösung. Könnten einige Zellen nur zwei Ziffern aufnehmen, in der einen oder der anderen Reihenfolge, und enthielte jede Zeile, Spalte und jeder Block, die sie berühren, in beiden Fällen beide Ziffern, ließen sich die beiden Reihenfolgen nicht unterscheiden: Das Rätsel hätte zwei Lösungen. Also kann nicht eintreten, was ein solches Muster vervollständigen würde.',
    sections: [
      {
        text: 'Suche vier Zellen an den Ecken eines Rechtecks, in zwei Zeilen, zwei Spalten und zwei Blöcken, von denen drei Ecken nur dieselben zwei Kandidaten haben. Hätte die vierte auch nur diese beiden, könnten die Ziffern an den Ecken tauschen. Also kann die vierte Ecke keine der beiden enthalten.',
        examples: [
          [
            'Zeilen 1 und 2, Spalten 2 und 4: Diese Zellen sind die Ecken eines Rechtecks in zwei Blöcken. Drei davon können nur eine 2 oder eine 4 aufnehmen.',
            'Hätte Zeile 2, Spalte 2 auch nur eine 2 oder eine 4, stünden die 2en und die 4en diagonal, so oder so herum. Jede Zeile, Spalte und jeder Block hätte in beiden Fällen von jeder eine, also hätte das Rätsel zwei Lösungen.',
            'Es hat aber nur eine, also kann Zeile 2, Spalte 2 keine 2 und keine 4 sein: Beide fallen weg, übrig bleibt die 3. Das ist ein Unique Rectangle vom Typ 1.',
          ],
        ],
      },
      {
        text: 'Zwei Ecken des Rechtecks enthalten nur das Paar. Die anderen beiden, die eine Einheit teilen, enthalten das Paar und denselben zusätzlichen Kandidaten. Eine davon muss diese zusätzliche Ziffer sein, sonst könnte das Paar an den Ecken tauschen: Sie fällt also aus jeder Zelle weg, die Nachbarzelle von beiden ist.',
        examples: [
          [
            'Zeilen 3 und 7, Spalten 1 und 3: Diese Zellen sind die Ecken eines Rechtecks in zwei Blöcken. Alle vier können eine 2 oder eine 6 aufnehmen, die zwei in Zeile 3 nichts anderes.',
            'Die zwei in Zeile 7 können auch eine 1 aufnehmen. Wäre keine davon die 1, blieben allen vier nur die 2 und die 6, die tauschen könnten: zwei Lösungen. Also ist eine davon die 1.',
            'Welche es auch ist: Eine Zelle, die Nachbarzelle von beiden ist, kann keine 1 sein. Die 1en in Zeile 7, Spalten 4 und 7, und in Zeile 8, Spalte 3 fallen weg. Das ist ein Unique Rectangle vom Typ 2.',
          ],
        ],
      },
      {
        text: 'Zwei Ecken des Rechtecks enthalten nur das Paar. Die anderen beiden, die eine Einheit teilen, haben zusätzliche Kandidaten, und eine davon muss eine zusätzliche Ziffer enthalten, sonst könnte das Paar tauschen. In ihrer gemeinsamen Einheit ist diese Zelle vergeben: Die Zusätzlichen wirken wie eine Zelle, die nur sie enthält, was mit anderen Zellen der Einheit eine Teilmenge bilden kann, und die Ziffern des Paars haben einen Platz weniger, was eine versteckte Teilmenge ergeben kann.',
        examples: [
          [
            'Zeilen 1 und 2, Spalten 2 und 6: Diese Zellen sind die Ecken eines Rechtecks in zwei Blöcken. Alle vier können eine 3 oder eine 5 aufnehmen, die zwei in Spalte 6 nichts anderes.',
            'Die zwei in Spalte 2 haben mehr: eine 1 und eine 7 in Zeile 1, eine 6 in Zeile 2. Eine davon muss eine dieser Ziffern enthalten, sonst könnten die 3en und die 5en an den Ecken tauschen.',
            'Nun die 3 und die 5 im Block oben links: Beide können nur in Spalte 2, Zeilen 1 bis 3. Eine der ersten beiden Zellen ist vergeben, also nehmen die 3 und die 5 die andere und Zeile 3: ein verstecktes Paar.',
            'Also ist Zeile 3, Spalte 2 eine 3 oder eine 5, und ihre 7 fällt weg. Das ist ein Unique Rectangle vom Typ 3.',
          ],
        ],
      },
      {
        text: 'Zwei Ecken des Rechtecks enthalten nur das Paar. Die anderen beiden, die eine Einheit teilen, enthalten mehr. Hat eine Ziffer des Paars in dieser Einheit keinen anderen Platz, enthält eine der beiden Zellen sie, also kann keine die andere Ziffer des Paars enthalten: Das würde das Rechteck vervollständigen.',
        examples: [
          [
            'Zeilen 5 und 6, Spalten 3 und 9: Diese Zellen sind die Ecken eines Rechtecks in zwei Blöcken. Alle vier können eine 3 oder eine 5 aufnehmen, die zwei in Zeile 6 nichts anderes.',
            'Die 3 in Zeile 5 kann nur in ihre zwei Ecken, Spalten 3 und 9, also ist eine davon die 3.',
            'Wäre die andere eine 5, enthielten alle vier Ecken nur 3en und 5en, die tauschen könnten: zwei Lösungen. Also kann keine eine 5 sein, und beide 5en fallen weg. Das ist ein Unique Rectangle vom Typ 4.',
          ],
        ],
      },
      {
        text: 'Eine Unique Loop ist ein Rechteck mit mehr Ecken: ein geschlossener Pfad aus 6, 8 oder 10 Zellen, bei dem jede berührte Zeile, Spalte und jeder Block genau zwei davon enthält. Haben alle Zellen bis auf eine nur dieselben zwei Kandidaten, könnten die Ziffern rund um die Schleife abwechseln, so oder so herum, also kann die letzte Zelle keine der beiden enthalten.',
        examples: [
          [
            'Diese sechs Zellen bilden eine geschlossene Schleife durch die Zeilen 2, 4 und 6. Jede Zeile, Spalte und jeder Block, die sie berührt, enthält zwei davon.',
            'Fünf davon können nur eine 4 oder eine 7 aufnehmen. Zeile 2, Spalte 8 kann auch eine 9 aufnehmen.',
            'Hätte Zeile 2, Spalte 8 auch nur eine 4 oder eine 7, würden die Ziffern rund um die Schleife abwechseln, 4, 7, 4, 7, so oder so herum. Jede Zeile, Spalte und jeder Block hätte in beiden Fällen von jeder eine, also hätte das Rätsel zwei Lösungen.',
            'Es hat aber nur eine, also kann Zeile 2, Spalte 8 keine 4 und keine 7 sein: Beide fallen weg, übrig bleibt die 9. Das ist eine Unique Loop vom Typ 1.',
          ],
        ],
      },
      {
        text: 'Wie bei einem Rechteck vom Typ 2 enthalten die Zellen der Schleife das Paar, einige davon denselben zusätzlichen Kandidaten. Eine davon muss diese zusätzliche Ziffer sein, sonst könnte das Paar rund um die Schleife abwechseln: Sie fällt also aus jeder Zelle weg, die Nachbarzelle von allen ist. Schleifen aus 8 und 10 Zellen funktionieren genauso.',
        examples: [
          [
            'Diese sechs Zellen bilden eine geschlossene Schleife durch die Zeilen 3, 4 und 7, wobei jede berührte Zeile, Spalte und jeder Block zwei davon enthält. Alle sechs können eine 3 oder eine 6 aufnehmen.',
            'Zwei davon, Zeile 4, Spalte 3 und Zeile 7, Spalte 2, können auch eine 7 aufnehmen. Wäre keine die 7, könnten die 3en und die 6en rund um die Schleife in beide Richtungen abwechseln: zwei Lösungen. Also ist eine davon die 7.',
            'Welche es auch ist: Eine Zelle, die Nachbarzelle von beiden ist, kann keine 7 sein. Die 7en in Zeile 5, Spalte 2 und in Zeile 7, Spalte 3 fallen weg. Das ist eine Unique Loop vom Typ 2.',
          ],
        ],
      },
      {
        text: 'Wie bei einem Rechteck vom Typ 3 haben zwei Zellen der Schleife, die eine Einheit teilen, zusätzliche Kandidaten, und eine davon muss eine zusätzliche Ziffer enthalten. In ihrer gemeinsamen Einheit ist diese Zelle vergeben: Die Zusätzlichen können mit anderen Zellen eine nackte Teilmenge bilden, oder die Ziffern des Paars mit einem Platz weniger eine versteckte Teilmenge. Schleifen aus 8 und 10 Zellen funktionieren genauso.',
        examples: [
          [
            'Diese sechs Zellen bilden eine geschlossene Schleife durch die Zeilen 1 bis 3, wobei jede berührte Zeile, Spalte und jeder Block zwei davon enthält. Alle sechs können eine 2 oder eine 7 aufnehmen, vier davon nichts anderes.',
            'Die zwei in Spalte 8 können auch eine 3 oder eine 9 aufnehmen. Eine davon muss eine dieser Ziffern enthalten, sonst könnten die 2en und die 7en rund um die Schleife in beide Richtungen abwechseln.',
            'Nun die 2 und die 7 in Spalte 8: Sie können nur in die Zeilen 1, 2 und 8. Eine der ersten beiden Zellen ist vergeben, also nehmen die 2 und die 7 die andere und Zeile 8: ein verstecktes Paar.',
            'Also ist Zeile 8, Spalte 8 eine 2 oder eine 7. Sie hat keine 2, also ist es die 7, und ihre 3 und 4 fallen weg. Das ist eine Unique Loop vom Typ 3.',
          ],
        ],
      },
      {
        text: 'Wie bei einem Rechteck vom Typ 4 enthalten zwei Zellen der Schleife, die eine Einheit teilen, mehr als das Paar. Hat eine Ziffer des Paars in dieser Einheit keinen anderen Platz, enthält eine der beiden sie, also kann keine die andere Ziffer des Paars enthalten. Schleifen aus 8 und 10 Zellen funktionieren genauso.',
        examples: [
          [
            'Diese sechs Zellen bilden eine geschlossene Schleife durch die Zeilen 7 bis 9, wobei jede berührte Zeile, Spalte und jeder Block zwei davon enthält. Alle sechs können eine 7 oder eine 9 aufnehmen, vier davon nichts anderes.',
            'Die 9 in Spalte 8 kann nur in zwei davon, Zeilen 7 und 9, also ist eine davon die 9.',
            'Wäre die andere eine 7, enthielte jede Zelle der Schleife nur 7en und 9en, die in beide Richtungen abwechseln könnten: zwei Lösungen. Also kann keine eine 7 sein, und beide 7en fallen weg. Das ist eine Unique Loop vom Typ 4.',
          ],
        ],
      },
    ],
  },
}
