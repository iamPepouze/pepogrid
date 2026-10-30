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
  'Hidden subsets': {
    text: 'Quand certains chiffres dont une unité a besoin ne peuvent aller que dans autant de ses cases, ces cases contiennent exactement ces chiffres, et leurs autres candidats sont exclus. Un sous-ensemble caché direct laisse à un chiffre une seule place où aller.',
    sections: [
      {
        text: 'Cherche deux chiffres qui ont les deux mêmes cases, et seulement celles-là, dans une ligne, une colonne ou un bloc. Ces cases contiennent la paire, dans un ordre ou dans l’autre, donc tout autre candidat y disparaît. Ici, cela laisse à un autre chiffre une seule place dans l’unité.',
        examples: [
          [
            'La ligne 5 a encore besoin d’un 1, d’un 2, d’un 4, d’un 5, d’un 6, d’un 7 et d’un 8. Où peuvent aller son 1 et son 2 ?',
            'Chacun n’est candidat que dans les colonnes 2 et 3. Deux chiffres, deux cases : ces cases contiennent le 1 et le 2, dans un ordre ou dans l’autre. C’est une paire cachée.',
            'Le 1 et le 2 prenant les deux cases, rien d’autre n’y tient : leurs autres candidats disparaissent.',
            'Le 8 de la ligne 5 n’a plus qu’une seule place, la colonne 9, donc le 8 va là. La paire cachée a mené droit à un singleton : c’est ce qui la rend directe.',
          ],
        ],
      },
      {
        text: 'Trois chiffres dont les seules places dans une unité sont les trois mêmes cases forment un triplet caché. Les trois cases contiennent ces chiffres, donc leurs autres candidats disparaissent. Toutes les cases n’ont pas besoin des trois chiffres comme candidats : ce qui compte, c’est que les chiffres n’aient aucune autre place.',
        examples: [
          [
            'La ligne 7 a encore besoin d’un 1, d’un 2, d’un 3, d’un 4, d’un 8 et d’un 9. Où peuvent aller son 3, son 4 et son 9 ?',
            'Tous les trois ne sont candidats que dans les colonnes 5, 6 et 7. Trois chiffres, trois cases : ces cases les contiennent, dans un ordre ou dans l’autre. C’est un triplet caché, même si une seule des cases a les trois.',
            'Le 3, le 4 et le 9 prenant ces cases, rien d’autre n’y tient : leurs autres candidats disparaissent.',
            'Le 8 de la ligne 7 n’a plus qu’une seule place, la colonne 1, donc le 8 va là. Le triplet caché a mené droit à un singleton : c’est ce qui le rend direct.',
          ],
        ],
      },
    ],
  },
  Intersections: {
    text: 'Un bloc croise une ligne ou une colonne en trois cases. Quand toutes les places d’un chiffre dans un bloc sont dans une même ligne ou colonne, le chiffre de cette ligne est dans le bloc, donc le reste de la ligne ne peut pas le contenir. C’est Pointing. Claiming fonctionne à l’inverse : quand toutes les places d’un chiffre dans une ligne sont dans un même bloc, le reste du bloc ne peut pas le contenir.',
    sections: [
      {
        text: 'Choisis un bloc et un chiffre dont il a encore besoin. Si toutes les cases du bloc ayant ce candidat sont dans la même ligne ou colonne, le bloc pointe le long de cette ligne : le chiffre est exclu du reste de la ligne, hors du bloc.',
        examples: [
          [
            'Le bloc en haut à gauche a encore besoin d’un 6. Lesquelles de ses cases peuvent le contenir ?',
            'Seulement deux, dans les lignes 1 et 2, et toutes deux sont dans la colonne 2. Donc celle qui contient le 6 du bloc contient aussi le 6 de la colonne 2.',
            'Aucune autre case de la colonne 2 ne peut donc être un 6, et le 6 de la ligne 4 disparaît. C’est Pointing : le bloc pointe le long de la colonne.',
          ],
        ],
      },
      {
        text: 'Pointing est direct quand les candidats qu’il exclut laissent à un chiffre une seule place dans une autre unité : il mène droit à un singleton.',
        examples: [
          [
            'Le bloc au milieu à gauche a encore besoin d’un 2, et toutes les cases qui peuvent le contenir sont dans la ligne 4.',
            'Le 2 de la ligne 4 est donc dans ce bloc, et aucune autre case de la ligne 4 ne peut être un 2 : le bloc pointe le long de la ligne.',
            'Le bloc au milieu à droite a aussi besoin d’un 2. La ligne 4 étant exclue, seule la ligne 5, colonne 8 peut le contenir, donc le 2 va là. Pointing a mené droit à un singleton : c’est ce qui le rend direct.',
          ],
        ],
      },
      {
        text: 'Choisis une ligne ou une colonne et un chiffre dont elle a encore besoin. Si toutes les cases de la ligne ayant ce candidat sont dans le même bloc, la ligne réclame le chiffre pour ce bloc : il est exclu du reste du bloc, hors de la ligne.',
        examples: [
          [
            'La ligne 1 a encore besoin d’un 4, d’un 5, d’un 6 et d’un 8. Lesquelles de ses cases peuvent contenir le 8 ?',
            'Seulement deux, dans les colonnes 7 et 9, et toutes deux sont dans le bloc en haut à droite. Donc celle qui contient le 8 de la ligne 1 contient aussi le 8 du bloc.',
            'Aucune autre case du bloc ne peut donc être un 8 : les 8 de la ligne 2, colonne 7 et de la ligne 3, colonne 9 disparaissent. C’est Claiming : la ligne réclame le 8 pour le bloc.',
          ],
        ],
      },
    ],
  },
  Subsets: {
    text: 'Un sous-ensemble relie quelques cases d’une unité à autant de chiffres. Dans un sous-ensemble nu, les candidats de ces cases sont uniquement ces chiffres : ils remplissent donc les cases, et le reste de l’unité ne peut pas les contenir. Dans un sous-ensemble caché, ces chiffres n’ont pas d’autre place dans l’unité : les cases les contiennent, et leurs autres candidats disparaissent.',
    sections: [
      {
        text: 'Cherche deux cases d’une ligne, d’une colonne ou d’un bloc qui ont les deux mêmes candidats et aucun autre. L’une contient chaque chiffre, dans un certain ordre : aucune autre case de cette unité ne peut donc en contenir un.',
        examples: [
          [
            'La colonne 8 a cinq cases vides. Regarde les lignes 3 et 4 : chacune ne peut contenir qu’un 5 ou un 7.',
            'Deux cases, deux chiffres : l’une est le 5 et l’autre le 7, dans un certain ordre. C’est une paire nue.',
            'Le 5 et le 7 étant pris, aucune autre case de la colonne 8 ne peut les contenir : le 5 en ligne 5 et les 7 en lignes 7 et 9 disparaissent.',
          ],
        ],
      },
      {
        text: 'Trois cases d’une unité dont les candidats, ensemble, ne sont que trois chiffres forment un triplet nu. Les trois chiffres remplissent ces cases, dans un certain ordre : aucune autre case de l’unité ne peut les contenir. Une case n’a pas besoin des trois : des cases avec un 4 ou un 5, un 5 ou un 6, et un 4 ou un 6 forment aussi un triplet.',
        examples: [
          [
            'La colonne 8 a six cases vides. Regarde les lignes 2, 4 et 5 : chacune ne peut contenir qu’un 4, un 5 ou un 6.',
            'Trois cases, trois chiffres : le 4, le 5 et le 6 remplissent ces cases, dans un certain ordre. C’est un triplet nu.',
            'Ces trois chiffres étant pris, aucune autre case de la colonne 8 ne peut les contenir : le 4 et le 5 en ligne 3 disparaissent.',
          ],
        ],
      },
      {
        text: 'Quatre cases d’une unité dont les candidats, ensemble, ne sont que quatre chiffres forment un quadruplet nu. Les quatre chiffres remplissent ces cases, dans un certain ordre : aucune autre case de l’unité ne peut les contenir. Comme pour un triplet, une case n’a pas besoin des quatre.',
        examples: [
          [
            'Le bloc en bas à gauche a neuf cases vides. Regarde-en quatre : les trois de la ligne 7 et la ligne 8, colonne 3.',
            'Ensemble, elles ne contiennent qu’un 1, un 2, un 5 ou un 9. Quatre cases, quatre chiffres : ces chiffres remplissent ces cases, dans un certain ordre. C’est un quadruplet nu.',
            'Ces quatre chiffres étant pris, aucune autre case du bloc ne peut les contenir : le 9 en ligne 8, colonne 2 et le 1 et le 2 en ligne 9, colonne 3 disparaissent.',
          ],
        ],
      },
      {
        text: 'Cherche deux chiffres dont une unité a besoin et dont les seules places sont les deux mêmes cases. Ces cases doivent contenir la paire, dans un certain ordre : tout autre candidat qu’elles ont disparaît. La paire se cachait parmi ces candidats.',
        examples: [
          [
            'Le bloc en bas au milieu a encore besoin d’un 2, d’un 3, d’un 5, d’un 6, d’un 7, d’un 8 et d’un 9. Où peuvent aller son 8 et son 9 ?',
            'Chacun n’est candidat que dans la ligne 9, colonnes 5 et 6. Deux chiffres, deux cases : ces cases doivent contenir le 8 et le 9, dans un certain ordre. C’est une paire cachée.',
            'Le 8 et le 9 prenant les deux cases, rien d’autre n’y tient : le 3 en colonne 5 et le 5 en colonne 6 disparaissent.',
          ],
        ],
      },
      {
        text: 'Trois chiffres dont les seules places dans une unité sont les trois mêmes cases forment un triplet caché. Les trois cases doivent contenir ces chiffres : leurs autres candidats disparaissent. Il n’est pas nécessaire que chaque case ait les trois chiffres comme candidats : ce qui compte, c’est que ces chiffres n’aient pas d’autre place.',
        examples: [
          [
            'Le bloc au milieu à droite a encore besoin de tous les chiffres sauf le 2. Où peuvent aller son 1, son 8 et son 9 ?',
            'Tous trois ne sont candidats que dans la ligne 5, colonne 9 et la ligne 6, colonnes 8 et 9. Trois chiffres, trois cases : ces cases doivent les contenir, dans un certain ordre. C’est un triplet caché, même si la ligne 5, colonne 9 n’a pas de 9.',
            'Le 1, le 8 et le 9 prenant ces cases, rien d’autre n’y tient : le 6 et le 7 en ligne 5, colonne 9 disparaissent.',
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
