import type { LessonTexts } from '../lib/lessons'

/** The lessons translated into French, by family. A family left out is shown in English. */
export const frLessons: LessonTexts = {
  Singles: {
    text: 'Chaque ligne, chaque colonne et chaque bloc a besoin de chaque chiffre une seule fois. Un singleton est un chiffre qui n’a plus qu’une seule place où aller.',
    sections: [
      {
        text: 'Choisis un bloc, une ligne ou une colonne et un chiffre dont elle a encore besoin. Exclus chaque case vide qui voit déjà ce chiffre dans sa ligne, sa colonne ou son bloc. Quand il ne reste qu’une case, le chiffre y va, même si cette case a d’autres candidats : le chiffre se cachait parmi eux.',
        examples: [
          [
            'Le bloc en haut au milieu a encore besoin d’un 3. Quatre de ses cases sont vides : lesquelles peuvent le contenir ?',
            'La ligne 1 a déjà un 3, tout à gauche, donc la case vide du bloc dans la ligne 1 ne peut pas être un 3.',
            'Les colonnes 5 et 6 ont chacune un 3 plus bas, donc les cases du bloc dans ces colonnes, en ligne 2, ne peuvent pas non plus être un 3.',
            'Il ne reste que la ligne 2, colonne 4, donc le 3 va là, même si cette case pourrait aussi contenir un 6. C’est un singleton caché.',
          ],
        ],
      },
    ],
  },
  'Naked Single': {
    text: 'Les voisines d’une case sont les 20 cases qui partagent sa ligne, sa colonne ou son bloc. Un singleton nu est une case dont les voisines contiennent déjà tous les chiffres sauf un.',
    sections: [
      {
        text: 'Choisis une case vide et liste les chiffres que ses voisines contiennent. Chacun est exclu pour la case. Quand huit chiffres sont exclus, le neuvième va là : c’est l’unique candidat de la case, bien en vue.',
        examples: [
          [
            'La ligne 2, colonne 8 est vide. Quels chiffres peut-elle encore contenir ? Regarde ses voisines : sa ligne, sa colonne et son bloc.',
            'La ligne 2 a déjà un 2, un 3, un 5 et un 6, donc la case ne peut contenir aucun d’eux.',
            'La colonne 8 ajoute un 1, un 4, un 7 et un 8. Son bloc a un 1, un 3 et un 5, déjà tous exclus.',
            'Tous les chiffres sauf le 9 sont exclus, donc le 9 va là. C’est un singleton nu : l’unique candidat de la case.',
          ],
        ],
      },
    ],
  },
  Fish: {
    text: 'Un poisson travaille sur un seul chiffre. Quand les seules places du chiffre dans quelques colonnes se trouvent toutes dans autant de lignes, ces colonnes mettent leurs exemplaires du chiffre dans ces lignes, donc aucune autre case de ces lignes ne peut le contenir. C’est pareil en échangeant lignes et colonnes.',
    sections: [
      {
        text: 'Choisis un chiffre et trouve deux colonnes où il n’a que deux places chacune, dans les deux mêmes lignes. L’exemplaire de chaque colonne est dans l’une de ces lignes, et les deux ne peuvent pas partager une ligne, donc ils prennent les deux lignes. Aucune autre case de ces lignes ne peut contenir le chiffre.',
        examples: [
          [
            'La colonne 4 a encore besoin d’un 8, et seules deux de ses cases peuvent le contenir : dans les lignes 3 et 6.',
            'La colonne 7 a aussi besoin d’un 8, et il ne peut aller que dans les lignes 3 ou 6.',
            'Les deux 8 ne peuvent pas partager une ligne : l’un est dans la ligne 3 et l’autre dans la ligne 6. Dans les deux cas, les lignes 3 et 6 ont leur 8 dans les colonnes 4 et 7. C’est un X-Wing.',
            'Donc aucune autre case des lignes 3 et 6 ne peut être un 8 : les 8 des colonnes 6, 8 et 9 disparaissent.',
          ],
        ],
      },
      {
        text: 'Un Swordfish est un X-Wing avec trois colonnes et trois lignes. Les places du chiffre dans trois colonnes se trouvent toutes dans les trois mêmes lignes, donc les colonnes prennent une ligne chacune et aucune autre case de ces lignes ne peut le contenir. Une colonne peut n’avoir que deux des trois places.',
        examples: [
          [
            'La colonne 6 a encore besoin d’un 9, et seules les lignes 5 et 8 peuvent le contenir.',
            'Le 9 de la colonne 7 peut aller dans les lignes 1, 5 ou 8.',
            'Et le 9 de la colonne 8 seulement dans les lignes 1 ou 8. Trois colonnes, et toutes leurs places pour un 9 sont dans les lignes 1, 5 et 8.',
            'Les trois 9 ne peuvent pas partager une ligne, donc ils prennent une ligne chacun : les lignes 1, 5 et 8 ont leur 9 dans ces colonnes. C’est un Swordfish.',
            'Donc aucune autre case des lignes 1, 5 et 8 ne peut être un 9 : les 9 des colonnes 4, 5 et 9 disparaissent.',
          ],
        ],
      },
    ],
  },
  Wings: {
    text: 'Une wing est une case pivot et deux ailes : des voisines du pivot avec deux candidats chacune, qui partagent un chiffre. Quoi que contienne le pivot, ce chiffre finit dans l’une des cases du motif, donc une case voisine de toutes celles qui peuvent le contenir ne peut pas le contenir non plus.',
    sections: [
      {
        text: 'Le pivot a deux candidats, X et Y. Une aile a X et Z, l’autre Y et Z. Si le pivot est X, la première aile garde Z ; s’il est Y, c’est la seconde. Dans les deux cas une aile contient Z, donc Z disparaît de toute case voisine des deux ailes.',
        examples: [
          [
            'La ligne 1, colonne 2 ne peut contenir qu’un 1 ou un 7. C’est le pivot.',
            'Si le pivot est 1, la ligne 1, colonne 4, dans la même ligne, ne peut pas être 1, donc il lui reste son 2.',
            'Si le pivot est 7 au contraire, la ligne 3, colonne 3, dans le même bloc, ne peut pas être 7, donc il lui reste son 2.',
            'Dans les deux cas, l’une des deux ailes est un 2. C’est un XY-Wing : un pivot et deux ailes.',
            'La ligne 3, colonne 5 est voisine des deux ailes : elle partage la ligne 3 avec l’une et le bloc en haut au milieu avec l’autre. Quelle que soit l’aile qui est le 2, cette case ne peut pas l’être, donc son 2 disparaît.',
          ],
        ],
      },
      {
        text: 'Un XYZ-Wing est un XY-Wing dont le pivot peut aussi contenir le chiffre partagé : le pivot a X, Y et Z, une aile X et Z, l’autre Y et Z. Quoi que contienne le pivot, Z finit dans le pivot ou une aile, donc Z disparaît de toute case voisine des trois.',
        examples: [
          [
            'La ligne 8, colonne 6 peut contenir un 6, un 8 ou un 9. C’est le pivot.',
            'Si le pivot est 6, la ligne 3, colonne 6, dans la même colonne, ne peut pas être 6, donc il lui reste son 8.',
            'Si le pivot est 9, la ligne 8, colonne 5, dans la même ligne, ne peut pas être 9, donc il lui reste son 8.',
            'Et si le pivot n’est ni l’un ni l’autre, c’est lui le 8. Dans tous les cas, l’une des trois cases est un 8. C’est un XYZ-Wing.',
            'La ligne 7, colonne 6 est voisine des trois : elle partage la colonne 6 avec le pivot et une aile, et le bloc en bas au milieu avec le pivot et l’autre. Quelle que soit celle qui est le 8, cette case ne peut pas l’être, donc son 8 disparaît.',
          ],
        ],
      },
    ],
  },
  BUG: {
    text: 'Un BUG, ou bivalue universal grave, est une grille où chaque case vide a exactement deux candidats et où chaque candidat a exactement deux places dans chacune de ses unités. Une telle grille n’a aucune solution ou plusieurs, jamais une seule. Donc, quand quelques candidats en trop séparent la grille d’un BUG, l’un d’eux est vrai.',
    sections: [
      {
        text: 'Toutes les cases vides ont deux candidats sauf une, qui en a trois. Son chiffre en trop est celui qui a trois places dans les unités de la case. Sans lui, la grille serait un BUG, donc la case est ce chiffre.',
        examples: [
          [
            'Ici, chaque case vide a exactement deux candidats, sauf la ligne 1, colonne 2, qui en a trois : un 1, un 8 et un 9.',
            'Regarde son 9. Les trois unités de la case, la ligne 1, la colonne 2 et le bloc en haut à gauche, ont chacune trois places pour un 9, une de trop.',
            'Sans ce 9, chaque candidat aurait exactement deux places dans chacune de ses unités : la grille serait un BUG, sans solution ou avec plusieurs. La grille en a une seule, donc le 9 reste : la ligne 1, colonne 2 est le 9, et son 1 et son 8 disparaissent. C’est un BUG type 1.',
          ],
        ],
      },
      {
        text: 'Quelques cases ont un troisième candidat, et c’est le même chiffre pour toutes. Sans lui, la grille serait un BUG, donc l’une de ces cases contient ce chiffre, et il disparaît de toute case voisine de toutes.',
        examples: [
          [
            'Ici, chaque case vide a exactement deux candidats, sauf deux dans la ligne 4 : la colonne 4, avec un 2, un 3 et un 8, et la colonne 6, avec un 1, un 3 et un 5.',
            'Toutes deux ont un 3 en trop : la ligne 4 a quatre places pour un 3. Sans ces deux 3, chaque candidat aurait exactement deux places dans chacune de ses unités : la grille serait un BUG, sans solution ou avec plusieurs.',
            'Donc l’une des deux est un 3. Peu importe laquelle, une case voisine des deux ne peut pas l’être : les 3 de la ligne 4, colonnes 3 et 9, de la ligne 5, colonne 6, et de la ligne 6, colonne 4 disparaissent. C’est un BUG type 2.',
          ],
        ],
      },
      {
        text: 'Quelques cases d’une unité ont un troisième candidat, pas toujours le même chiffre. Sans eux, la grille serait un BUG, donc l’une de ces cases contient son chiffre en trop. Ensemble, elles agissent comme une seule case qui ne contient que ces chiffres en trop, et qui peut former un sous-ensemble nu avec d’autres cases de l’unité.',
        examples: [
          [
            'Ici, chaque case vide a exactement deux candidats, sauf deux dans la ligne 4 : la colonne 3, avec un 1, un 3 et un 9, et la colonne 6, avec un 5, un 8 et un 9.',
            'La colonne 3 a trois places pour un 3, une de trop, et la colonne 6 trois pour un 9. Sans ce 3 et ce 9, chaque candidat aurait exactement deux places dans chacune de ses unités : la grille serait un BUG, sans solution ou avec plusieurs.',
            'Donc la ligne 4, colonne 3 est le 3, ou la ligne 4, colonne 6 est le 9. Ensemble, elles agissent comme une seule case de la ligne 4 qui contient un 3 ou un 9.',
            'La ligne 4, colonne 1 contient un 3 ou un 4, et la colonne 9 un 4 ou un 9. Avec cette case unique, cela fait trois places pour trois chiffres, le 3, le 4 et le 9 : un triplet nu dans la ligne 4.',
            'Donc aucune case de la ligne 4 hors du triplet ne peut les contenir : le 3 de la colonne 2 disparaît. C’est un BUG type 3.',
          ],
        ],
      },
      {
        text: 'Deux cases qui partagent une unité ont chacune un troisième candidat. Sans ces chiffres en trop, la grille serait un BUG, donc l’une des deux contient son chiffre en trop. Quand un chiffre commun aux deux cases n’a pas d’autre place dans l’unité, l’autre case le contient, donc chaque case ne garde que son chiffre en trop et ce chiffre commun.',
        examples: [
          [
            'Ici, chaque case vide a exactement deux candidats, sauf deux dans la colonne 1 : la ligne 7, avec un 1, un 4 et un 5, et la ligne 8, avec un 1, un 5 et un 7.',
            'La ligne 7 a trois places pour un 5, une de trop, et la colonne 1 trois pour un 7. Sans le 5 de la ligne 7, colonne 1 et le 7 de la ligne 8, colonne 1, chaque candidat aurait exactement deux places dans chacune de ses unités : la grille serait un BUG. Donc l’un des deux est vrai.',
            'Le 1 du bloc en bas à gauche ne peut aller que dans ces deux cases. Donc, quelle que soit celle qui contient son chiffre en trop, l’autre est le 1.',
            'Donc la ligne 7, colonne 1 est un 1 ou un 5, et la ligne 8, colonne 1 un 1 ou un 7 : le 4 de l’une et le 5 de l’autre disparaissent. C’est un BUG type 4.',
          ],
        ],
      },
    ],
  },
  Exclusion: {
    text: 'L’exclusion essaie les chiffres que quelques cases pourraient contenir ensemble. Une combinaison est exclue quand elle met deux fois le même chiffre dans une unité, ou quand elle laisserait sans candidat une case voisine de toutes. Un candidat présent dans aucune combinaison restante disparaît.',
    sections: [
      {
        text: 'Prends deux cases qui partagent une unité et liste les paires de chiffres qu’elles pourraient contenir. Exclus une paire quand une autre case voisine des deux ne contient que ces deux chiffres : elle resterait vide. Quand toutes les paires avec un candidat donné d’une case sont exclues, ce candidat disparaît.',
        examples: [
          [
            'La ligne 3, colonnes 2 et 3 partagent une ligne et un bloc, donc elles ne peuvent pas contenir le même chiffre. Imagine que la colonne 2 soit un 2 : la colonne 3 serait alors un 5, un 6 ou un 7. Essaie chacun.',
            'Un 2 et un 5 sont impossibles : la ligne 3, colonne 8 ne contient qu’un 2 ou un 5, et elle partage la ligne 3 avec les deux cases. Elle resterait sans rien.',
            'Un 2 et un 6 sont impossibles aussi : la ligne 3, colonne 4 ne contient qu’un 2 ou un 6.',
            'Un 2 et un 7 non plus : la ligne 2, colonne 2 ne contient qu’un 2 ou un 7, et elle partage le bloc en haut à gauche avec les deux cases.',
            'Toutes les paires avec un 2 dans la ligne 3, colonne 2 sont exclues, donc son 2 disparaît. C’est une Aligned Pair Exclusion.',
          ],
        ],
      },
      {
        text: 'Pareil avec trois cases : liste les combinaisons de chiffres qu’elles pourraient contenir. Exclus une combinaison quand elle met deux fois le même chiffre dans une unité, ou quand une autre case voisine des trois ne contient que des chiffres de cette combinaison : elle resterait vide. Quand toutes les combinaisons avec un candidat donné d’une case sont exclues, ce candidat disparaît.',
        examples: [
          [
            'Prends trois cases : la ligne 1, colonnes 5 et 6, et la ligne 2, colonne 1. Imagine que la ligne 1, colonne 6 soit un 6.',
            'La ligne 1, colonne 5, dans la même ligne, ne pourrait pas être un 6 aussi, donc ce serait son 3. La ligne 2, colonne 1 serait un 2 ou un 4. Essaie chacun.',
            'Un 3, un 6 et un 4 sont impossibles : la ligne 2, colonne 5 ne contient qu’un 3, un 4 ou un 6, et elle est voisine des trois, car elle partage la ligne 2 avec l’une et le bloc en haut au milieu avec les autres. Elle resterait sans rien.',
            'Un 3, un 6 et un 2 sont impossibles aussi : la ligne 1, colonne 3 ne contient qu’un 2 ou un 3, et elle partage la ligne 1 avec deux des cases et le bloc en haut à gauche avec la troisième.',
            'Toutes les combinaisons avec un 6 dans la ligne 1, colonne 6 sont exclues, donc son 6 disparaît. C’est une Aligned Triplet Exclusion.',
          ],
        ],
      },
    ],
  },
  'Forcing chains': {
    text: 'Une chaîne forcée suppose qu’un candidat est vrai et suit ce qui en découle, maillon après maillon : si cette case contient le chiffre, ses voisines ne le peuvent pas, et si une unité n’a plus qu’une place pour un chiffre, ou une case qu’un candidat, ce chiffre y va. Quand la chaîne tombe sur une contradiction, comme deux fois le même chiffre dans une unité, la supposition était fausse, et le candidat de départ disparaît.',
    sections: [
      {
        text: 'Une Forcing X-Chain suit un seul chiffre. Chaque maillon est soit une case qui contient le chiffre, donc ses voisines ne le peuvent pas, soit une unité qui n’a plus qu’une place pour lui, donc il y va. Quand la chaîne revient mettre le chiffre dans une voisine de la case de départ, la supposition se contredit elle-même.',
        examples: [
          [
            'Suppose que la ligne 4, colonne 6 est un 4. Alors la ligne 4, colonne 9, dans la même ligne, ne peut pas être un 4.',
            'Le 4 de la colonne 9 n’a que deux places, les lignes 4 et 8, donc il est en ligne 8.',
            'Alors la ligne 7, colonne 7, dans le même bloc que la ligne 8, colonne 9, ne peut pas être un 4.',
            'Le 4 de la ligne 7 n’a que deux places, les colonnes 5 et 7, donc il est en colonne 5.',
            'Alors la ligne 2, colonne 5, dans la même colonne, ne peut pas être un 4.',
            'Le 4 du bloc en haut au milieu n’a que deux places, la ligne 2, colonne 5 et la ligne 1, colonne 6, donc il est en ligne 1, colonne 6.',
            'Mais la ligne 1, colonne 6 partage la colonne 6 avec la ligne 4, colonne 6, supposée être le 4 : la colonne 6 aurait deux 4. La supposition est fausse, donc le 4 de la ligne 4, colonne 6 disparaît. C’est une Forcing X-Chain.',
          ],
        ],
      },
      {
        text: 'Une Forcing Chain peut changer de chiffre en route : une case à deux candidats qui en perd un garde l’autre, et la chaîne continue avec ce chiffre. Quand elle revient mettre le chiffre de départ dans une voisine de la case de départ, la supposition se contredit elle-même.',
        examples: [
          [
            'Suppose que la ligne 3, colonne 6 est un 4. Alors la ligne 3, colonne 1, dans la même ligne, ne peut pas être un 4.',
            'La ligne 3, colonne 1 ne contient qu’un 2 ou un 4, donc c’est le 2.',
            'Alors la ligne 3, colonne 4, dans la même ligne, ne peut pas être un 2.',
            'Le 2 de la colonne 4 n’a que deux places, les lignes 3 et 7, donc il est en ligne 7.',
            'Alors la ligne 9, colonne 6, dans le même bloc, ne peut pas être un 2.',
            'La ligne 9, colonne 6 ne contient qu’un 2 ou un 4, donc c’est le 4.',
            'Mais la ligne 9, colonne 6 partage la colonne 6 avec la ligne 3, colonne 6, supposée être le 4 : la colonne 6 aurait deux 4. La supposition est fausse, donc le 4 de la ligne 3, colonne 6 disparaît. C’est une Forcing Chain.',
          ],
        ],
      },
      {
        text: 'Comme une X-Chain, une chaîne Nishio suit un seul chiffre, mais d’une même supposition elle suit plusieurs chaînes. Quand deux d’entre elles se contredisent, l’une mettant le chiffre dans une case et l’autre l’excluant, ou toutes deux le mettant dans la même unité, la supposition était fausse.',
        examples: [
          [
            'Suppose que la ligne 2, colonne 5 est un 8. Alors la ligne 9, colonne 5, dans la même colonne, ne peut pas être un 8.',
            'Le 8 de la ligne 9 n’a que deux places, les colonnes 1 et 5, donc il est en colonne 1.',
            'Reviens à la supposition. La ligne 3, colonnes 4 et 5, dans le même bloc que la ligne 2, colonne 5, ne peut pas être un 8 non plus.',
            'Le 8 de la ligne 3 avait trois places, les colonnes 1, 4 et 5. Deux sont exclues, donc il est en colonne 1.',
            'Mais les lignes 3 et 9 de la colonne 1 ne peuvent pas être toutes deux un 8 : la colonne 1 en aurait deux. La supposition est fausse, donc le 8 de la ligne 2, colonne 5 disparaît. C’est une chaîne Nishio.',
          ],
        ],
      },
    ],
  },
}
