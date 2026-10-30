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
        text: 'Drei Ziffern, deren einzige Plätze in einer Einheit dieselben drei Zellen sind, bilden ein versteckter Dreier. Die drei Zellen müssen diese Ziffern enthalten, also fallen ihre anderen Kandidaten weg. Nicht jede Zelle braucht alle drei Ziffern als Kandidaten: Entscheidend ist, dass die Ziffern keinen anderen Platz haben.',
        examples: [
          [
            'Zeile 7 braucht noch eine 1, eine 2, eine 3, eine 4, eine 8 und eine 9. Wohin können ihre 3, ihre 4 und ihre 9?',
            'Alle drei sind nur in den Spalten 5, 6 und 7 Kandidaten. Drei Ziffern, drei Zellen: Diese Zellen müssen sie enthalten, in beliebiger Reihenfolge. Das ist ein versteckter Dreier, auch wenn nur eine der Zellen alle drei hat.',
            'Da die 3, die 4 und die 9 diese Zellen belegen, passt dort nichts anderes: Ihre anderen Kandidaten fallen weg.',
            'Die 8 in Zeile 7 hat nur noch einen Platz, Spalte 1, also kommt die 8 dorthin. Der versteckte Dreier führte direkt zu einem Single: Deshalb heißt es direkt.',
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
        text: 'Drei Zellen einer Einheit, deren Kandidaten zusammen nur drei Ziffern sind, bilden ein nackter Dreier. Die drei Ziffern füllen diese Zellen in beliebiger Reihenfolge, also kann keine andere Zelle der Einheit sie aufnehmen. Eine Zelle braucht nicht alle drei: Zellen mit einer 4 oder 5, einer 5 oder 6 und einer 4 oder 6 sind auch ein Tripel.',
        examples: [
          [
            'Spalte 8 hat sechs leere Zellen. Sieh dir die Zeilen 2, 4 und 5 an: Jede kann nur eine 4, eine 5 oder eine 6 aufnehmen.',
            'Drei Zellen, drei Ziffern: Die 4, die 5 und die 6 füllen diese Zellen in beliebiger Reihenfolge. Das ist ein nackter Dreier.',
            'Da diese drei Ziffern vergeben sind, kann keine andere Zelle in Spalte 8 sie aufnehmen: Die 4 und die 5 in Zeile 3 entfallen.',
          ],
        ],
      },
      {
        text: 'Vier Zellen einer Einheit, deren Kandidaten zusammen nur vier Ziffern sind, bilden ein nackter Vierer. Die vier Ziffern füllen diese Zellen in beliebiger Reihenfolge, also kann keine andere Zelle der Einheit sie aufnehmen. Wie beim Dreier braucht eine Zelle nicht alle vier.',
        examples: [
          [
            'Der Block unten links hat neun leere Zellen. Sieh dir vier davon an: die drei in Zeile 7 und Zeile 8, Spalte 3.',
            'Zusammen enthalten sie nur eine 1, 2, 5 oder 9. Vier Zellen, vier Ziffern: Diese Ziffern füllen diese Zellen in beliebiger Reihenfolge. Das ist ein nackter Vierer.',
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
        text: 'Drei Ziffern, deren einzige Plätze in einer Einheit dieselben drei Zellen sind, bilden ein versteckter Dreier. Die drei Zellen müssen diese Ziffern aufnehmen, also entfallen ihre anderen Kandidaten. Nicht jede Zelle braucht alle drei Ziffern als Kandidaten: Entscheidend ist, dass die Ziffern keinen anderen Platz haben.',
        examples: [
          [
            'Der Block rechts in der Mitte braucht noch jede Ziffer außer der 2. Wohin können seine 1, seine 8 und seine 9?',
            'Alle drei sind nur in Zeile 5, Spalte 9 und Zeile 6, Spalten 8 und 9 Kandidaten. Drei Ziffern, drei Zellen: Diese Zellen müssen sie aufnehmen, in beliebiger Reihenfolge. Das ist ein versteckter Dreier, auch wenn Zeile 5, Spalte 9 keine 9 hat.',
            'Da 1, 8 und 9 diese Zellen belegen, passt dort nichts anderes: Die 6 und die 7 in Zeile 5, Spalte 9 entfallen.',
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
        text: 'Wie bei einem Unique Rectangle vom Typ 2 enthalten die Zellen der Schleife das Paar, einige davon denselben zusätzlichen Kandidaten. Eine davon muss diese zusätzliche Ziffer sein, sonst könnte das Paar rund um die Schleife abwechseln: Sie fällt also aus jeder Zelle weg, die Nachbarzelle von allen ist. Schleifen aus 8 und 10 Zellen funktionieren genauso.',
        examples: [
          [
            'Diese sechs Zellen bilden eine geschlossene Schleife durch die Zeilen 3, 4 und 7, wobei jede berührte Zeile, Spalte und jeder Block zwei davon enthält. Alle sechs können eine 3 oder eine 6 aufnehmen.',
            'Zwei davon, Zeile 4, Spalte 3 und Zeile 7, Spalte 2, können auch eine 7 aufnehmen. Wäre keine die 7, könnten die 3en und die 6en rund um die Schleife in beide Richtungen abwechseln: zwei Lösungen. Also ist eine davon die 7.',
            'Welche es auch ist: Eine Zelle, die Nachbarzelle von beiden ist, kann keine 7 sein. Die 7en in Zeile 5, Spalte 2 und in Zeile 7, Spalte 3 fallen weg. Das ist eine Unique Loop vom Typ 2.',
          ],
        ],
      },
      {
        text: 'Wie bei einem Unique Rectangle vom Typ 3 haben zwei Zellen der Schleife, die eine Einheit teilen, zusätzliche Kandidaten, und eine davon muss eine zusätzliche Ziffer enthalten. In ihrer gemeinsamen Einheit ist diese Zelle vergeben: Die Zusätzlichen können mit anderen Zellen eine nackte Teilmenge bilden, oder die Ziffern des Paars mit einem Platz weniger eine versteckte Teilmenge. Schleifen aus 8 und 10 Zellen funktionieren genauso.',
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
        text: 'Wie bei einem Unique Rectangle vom Typ 4 enthalten zwei Zellen der Schleife, die eine Einheit teilen, mehr als das Paar. Hat eine Ziffer des Paars in dieser Einheit keinen anderen Platz, enthält eine der beiden sie, also kann keine die andere Ziffer des Paars enthalten. Schleifen aus 8 und 10 Zellen funktionieren genauso.',
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
  BUG: {
    text: 'Ein BUG, kurz für Bivalue Universal Grave, ist ein Gitter, in dem jede leere Zelle genau zwei Kandidaten hat und jeder Kandidat in jeder seiner Einheiten genau zwei Plätze. Ein solches Gitter hat keine Lösung oder mehrere, nie genau eine. Trennen also nur ein paar überzählige Kandidaten das Gitter von einem BUG, ist einer von ihnen wahr.',
    sections: [
      {
        text: 'Jede leere Zelle hat zwei Kandidaten bis auf eine, die drei hat. Ihre überzählige Ziffer ist die, die in den Einheiten der Zelle drei Plätze hat. Ohne sie wäre das Gitter ein BUG, also ist die Zelle diese Ziffer.',
        examples: [
          [
            'Hier hat jede leere Zelle genau zwei Kandidaten, außer Zeile 1, Spalte 2, die drei hat: eine 1, eine 8 und eine 9.',
            'Sieh dir ihre 9 an. Die drei Einheiten der Zelle, Zeile 1, Spalte 2 und der Block oben links, haben jeweils drei Plätze für eine 9, einen zu viel.',
            'Ohne diese 9 hätte jeder Kandidat in jeder seiner Einheiten genau zwei Plätze: Das Gitter wäre ein BUG, ohne Lösung oder mit mehreren. Das Rätsel hat genau eine, also bleibt die 9: Zeile 1, Spalte 2 ist die 9, und ihre 1 und ihre 8 entfallen. Das ist ein BUG vom Typ 1.',
          ],
        ],
      },
      {
        text: 'Ein paar Zellen haben einen dritten Kandidaten, und es ist in allen dieselbe Ziffer. Ohne sie wäre das Gitter ein BUG, also enthält eine dieser Zellen die Ziffer, und sie entfällt in jeder Zelle, die Nachbarzelle von allen ist.',
        examples: [
          [
            'Hier hat jede leere Zelle genau zwei Kandidaten, außer zwei in Zeile 4: Spalte 4 mit einer 2, einer 3 und einer 8 sowie Spalte 6 mit einer 1, einer 3 und einer 5.',
            'Beide haben eine 3 zu viel: Zeile 4 hat vier Plätze für eine 3. Ohne diese beiden 3en hätte jeder Kandidat in jeder seiner Einheiten genau zwei Plätze: Das Gitter wäre ein BUG, ohne Lösung oder mit mehreren.',
            'Also ist eine der beiden eine 3. Welche es auch ist, eine Nachbarzelle von beiden kann es nicht sein: Die 3en in Zeile 4, Spalte 3 und 9, in Zeile 5, Spalte 6 und in Zeile 6, Spalte 4 entfallen. Das ist ein BUG vom Typ 2.',
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
            'Zeile 4, Spalte 1 enthält eine 3 oder eine 4 und Spalte 9 eine 4 oder eine 9. Mit dieser einen Zelle sind das drei Plätze für drei Ziffern, die 3, die 4 und die 9: ein nackter Dreier in Zeile 4.',
            'Also kann keine Zelle der Zeile 4 außerhalb des Dreiers sie enthalten: Die 3 in Spalte 2 entfällt. Das ist ein BUG vom Typ 3.',
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
            'Also ist Zeile 7, Spalte 1 eine 1 oder eine 5, und Zeile 8, Spalte 1 eine 1 oder eine 7: Die 4 in der einen und die 5 in der anderen entfallen. Das ist ein BUG vom Typ 4.',
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
            'Angenommen stattdessen, Zeile 1, Spalte 6 ist keine 3: Jedes Glied kehrt sich um, und die anderen drei Zellen nehmen die 3en. In jedem Fall nehmen die 3en jede zweite Zelle der Schleife. Das ist ein Bidirectional X-Cycle.',
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
            'Angenommen stattdessen, Zeile 5, Spalte 2 ist die 6: Jedes Glied kehrt sich um, und jede Zelle nimmt ihre andere Ziffer an. In jedem Fall geht die Schleife auf. Das ist ein Bidirectional Y-Cycle.',
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
            'Angenommen stattdessen, Zeile 2, Spalte 8 ist keine 3: Jedes Glied kehrt sich um. Sie ist die 4, Zeile 9, Spalte 9 die 4, und Zeile 9, Spalte 4 und Zeile 3, Spalte 8 die 3en. In jedem Fall geht die Schleife auf. Das ist ein Bidirectional Cycle: Anders als ein X-Cycle folgt er mehreren Ziffern.',
            'In jedem Fall hat Zeile 3 ihre 3 in der Schleife, in Spalte 4 oder Spalte 8. Keine andere Zelle von Zeile 3 kann also 3 sein: Die 3en in den Spalten 2 und 6 entfallen.',
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
        text: 'Wie eine X-Chain folgt eine Nishio Forcing Chain einer einzigen Ziffer, aber aus einer Annahme folgt sie mehreren Ketten. Widersprechen sich zwei davon, weil die eine die Ziffer in eine Zelle setzt und die andere sie dort ausschließt, oder weil beide sie in dieselbe Einheit setzen, war die Annahme falsch.',
        examples: [
          [
            'Nimm an, Zeile 2, Spalte 5 ist eine 8. Dann kann Zeile 9, Spalte 5, in derselben Spalte, keine 8 sein.',
            'Die 8 in Zeile 9 hat nur zwei Plätze, die Spalten 1 und 5, also steht sie in Spalte 1.',
            'Geh zurück zur Annahme. Zeile 3, Spalten 4 und 5, im selben Block wie Zeile 2, Spalte 5, können auch keine 8 sein.',
            'Die 8 in Zeile 3 hatte drei Plätze, die Spalten 1, 4 und 5. Zwei sind ausgeschlossen, also steht sie in Spalte 1.',
            'Aber die Zeilen 3 und 9 in Spalte 1 können nicht beide eine 8 sein: Spalte 1 hätte zwei. Die Annahme ist falsch, also entfällt die 8 in Zeile 2, Spalte 5. Das ist eine Nishio Forcing Chain.',
          ],
        ],
      },
    ],
  },
}
