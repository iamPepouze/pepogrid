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
  Uniqueness: {
    text: 'Une grille a une seule solution. Si des cases ne pouvaient contenir que deux chiffres, dans un ordre ou dans l’autre, et que chaque ligne, colonne et bloc qu’elles touchent contenait les deux chiffres dans les deux cas, rien ne permettrait de distinguer les deux ordres : la grille aurait deux solutions. Donc ce qui complèterait un tel motif ne peut pas arriver.',
    sections: [
      {
        text: 'Cherche quatre cases aux coins d’un rectangle, dans deux lignes, deux colonnes et deux blocs, dont trois coins ne contiennent que les deux mêmes candidats. Si le quatrième n’avait que ces deux-là aussi, les chiffres pourraient s’échanger entre les coins. Donc le quatrième coin ne peut contenir ni l’un ni l’autre.',
        examples: [
          [
            'Lignes 1 et 2, colonnes 2 et 4 : ces cases sont les coins d’un rectangle sur deux blocs. Trois d’entre elles ne peuvent contenir qu’un 2 ou un 4.',
            'Si la ligne 2, colonne 2 n’avait aussi qu’un 2 ou un 4, les 2 et les 4 seraient en diagonale, dans un sens ou dans l’autre. Chaque ligne, colonne et bloc aurait un de chaque dans les deux cas, donc la grille aurait deux solutions.',
            'Elle n’en a qu’une, donc la ligne 2, colonne 2 ne peut pas être 2 ou 4 : les deux disparaissent, il reste son 3. C’est un Unique Rectangle de type 1.',
          ],
        ],
      },
      {
        text: 'Deux coins du rectangle ne contiennent que la paire. Les deux autres, qui partagent une unité, contiennent la paire et le même candidat en plus. L’un d’eux doit être ce chiffre en plus, sinon la paire pourrait s’échanger entre les coins : il disparaît donc de chaque case qui est voisine des deux.',
        examples: [
          [
            'Lignes 3 et 7, colonnes 1 et 3 : ces cases sont les coins d’un rectangle sur deux blocs. Les quatre peuvent contenir un 2 ou un 6, et les deux de la ligne 3 rien d’autre.',
            'Les deux de la ligne 7 peuvent aussi contenir un 1. Si aucune n’était un 1, les quatre n’auraient plus que le 2 et le 6, qui pourraient s’échanger : deux solutions. Donc l’une d’elles est le 1.',
            'Laquelle que ce soit, une case voisine des deux ne peut pas être 1 : les 1 de la ligne 7, colonnes 4 et 7, et de la ligne 8, colonne 3 disparaissent. C’est un Unique Rectangle de type 2.',
          ],
        ],
      },
      {
        text: 'Deux coins du rectangle ne contiennent que la paire. Les deux autres, qui partagent une unité, ont des candidats en plus, et l’un d’eux doit contenir un de ces chiffres, sinon la paire pourrait s’échanger. Dans leur unité commune, cette case est prise : les chiffres en plus agissent comme une seule case qui ne les contient qu’eux, ce qui peut former un sous-ensemble avec d’autres cases de l’unité, et les chiffres de la paire ont une place de moins, ce qui peut donner un sous-ensemble caché.',
        examples: [
          [
            'Lignes 1 et 2, colonnes 2 et 6 : ces cases sont les coins d’un rectangle sur deux blocs. Les quatre peuvent contenir un 3 ou un 5, et les deux de la colonne 6 rien d’autre.',
            'Les deux de la colonne 2 ont davantage : un 1 et un 7 en ligne 1, un 6 en ligne 2. L’une d’elles doit contenir l’un d’eux, sinon les 3 et les 5 pourraient s’échanger entre les coins.',
            'Maintenant le 3 et le 5 du bloc en haut à gauche : tous deux ne peuvent aller que dans la colonne 2, lignes 1 à 3. L’une des deux premières cases est prise, donc le 3 et le 5 prennent l’autre et la ligne 3 : une paire cachée.',
            'Donc la ligne 3, colonne 2 est un 3 ou un 5, et son 7 disparaît. C’est un Unique Rectangle de type 3.',
          ],
        ],
      },
      {
        text: 'Deux coins du rectangle ne contiennent que la paire. Les deux autres, qui partagent une unité, contiennent davantage. Quand un chiffre de la paire n’a pas d’autre place dans cette unité, l’une des deux cases le contient, donc aucune ne peut contenir l’autre chiffre de la paire : cela compléterait le rectangle.',
        examples: [
          [
            'Lignes 5 et 6, colonnes 3 et 9 : ces cases sont les coins d’un rectangle sur deux blocs. Les quatre peuvent contenir un 3 ou un 5, et les deux de la ligne 6 rien d’autre.',
            'Le 3 de la ligne 5 ne peut aller que dans ses deux coins, colonnes 3 et 9, donc l’un d’eux est le 3.',
            'Si l’autre était un 5, les quatre coins ne contiendraient que des 3 et des 5, qui pourraient s’échanger : deux solutions. Donc aucun ne peut être 5, et les deux 5 disparaissent. C’est un Unique Rectangle de type 4.',
          ],
        ],
      },
      {
        text: 'Une boucle unique est un rectangle avec plus de coins : un chemin fermé de 6, 8 ou 10 cases où chaque ligne, colonne et bloc touché en contient exactement deux. Quand toutes les cases sauf une ne contiennent que les deux mêmes candidats, les chiffres pourraient alterner le long de la boucle dans un sens ou dans l’autre, donc la dernière case ne peut contenir ni l’un ni l’autre.',
        examples: [
          [
            'Ces six cases forment une boucle fermée sur les lignes 2, 4 et 6. Chaque ligne, colonne et bloc qu’elle touche en contient deux.',
            'Cinq d’entre elles ne peuvent contenir qu’un 4 ou un 7. La ligne 2, colonne 8 peut aussi contenir un 9.',
            'Si la ligne 2, colonne 8 n’avait aussi qu’un 4 ou un 7, les chiffres alterneraient le long de la boucle, 4, 7, 4, 7, dans un sens ou dans l’autre. Chaque ligne, colonne et bloc aurait un de chaque dans les deux cas, donc la grille aurait deux solutions.',
            'Elle n’en a qu’une, donc la ligne 2, colonne 8 ne peut pas être 4 ou 7 : les deux disparaissent, il reste son 9. C’est une boucle unique de type 1.',
          ],
        ],
      },
      {
        text: 'Comme pour un rectangle de type 2, les cases de la boucle contiennent la paire, et certaines le même candidat en plus. L’une d’elles doit être ce chiffre en plus, sinon la paire pourrait alterner le long de la boucle : il disparaît donc de chaque case voisine de toutes ces cases. Les boucles de 8 et 10 cases fonctionnent de la même façon.',
        examples: [
          [
            'Ces six cases forment une boucle fermée sur les lignes 3, 4 et 7, chaque ligne, colonne et bloc qu’elle touche en contenant deux. Les six peuvent contenir un 3 ou un 6.',
            'Deux d’entre elles, ligne 4, colonne 3 et ligne 7, colonne 2, peuvent aussi contenir un 7. Si aucune n’était un 7, les 3 et les 6 pourraient alterner le long de la boucle dans les deux sens : deux solutions. Donc l’une d’elles est le 7.',
            'Laquelle que ce soit, une case voisine des deux ne peut pas être 7 : les 7 de la ligne 5, colonne 2 et de la ligne 7, colonne 3 disparaissent. C’est une boucle unique de type 2.',
          ],
        ],
      },
      {
        text: 'Comme pour un rectangle de type 3, deux cases de la boucle qui partagent une unité ont des candidats en plus, et l’une d’elles doit contenir un de ces chiffres. Dans leur unité commune, cette case est prise : les chiffres en plus peuvent former un sous-ensemble nu avec d’autres cases, ou ceux de la paire, avec une place de moins, un sous-ensemble caché. Les boucles de 8 et 10 cases fonctionnent de la même façon.',
        examples: [
          [
            'Ces six cases forment une boucle fermée sur les lignes 1 à 3, chaque ligne, colonne et bloc qu’elle touche en contenant deux. Les six peuvent contenir un 2 ou un 7, et quatre d’entre elles rien d’autre.',
            'Les deux de la colonne 8 peuvent aussi contenir un 3 ou un 9. L’une d’elles doit contenir l’un d’eux, sinon les 2 et les 7 pourraient alterner le long de la boucle dans les deux sens.',
            'Maintenant le 2 et le 7 de la colonne 8 : ils ne peuvent aller que dans les lignes 1, 2 et 8. L’une des deux premières cases est prise, donc le 2 et le 7 prennent l’autre et la ligne 8 : une paire cachée.',
            'Donc la ligne 8, colonne 8 est un 2 ou un 7. Elle n’a pas de 2, c’est donc le 7, et ses 3 et 4 disparaissent. C’est une boucle unique de type 3.',
          ],
        ],
      },
      {
        text: 'Comme pour un rectangle de type 4, deux cases de la boucle qui partagent une unité contiennent plus que la paire. Quand un chiffre de la paire n’a pas d’autre place dans cette unité, l’une des deux le contient, donc aucune ne peut contenir l’autre chiffre de la paire. Les boucles de 8 et 10 cases fonctionnent de la même façon.',
        examples: [
          [
            'Ces six cases forment une boucle fermée sur les lignes 7 à 9, chaque ligne, colonne et bloc qu’elle touche en contenant deux. Les six peuvent contenir un 7 ou un 9, et quatre d’entre elles rien d’autre.',
            'Le 9 de la colonne 8 ne peut aller que dans deux d’entre elles, lignes 7 et 9, donc l’une des deux est le 9.',
            'Si l’autre était un 7, chaque case de la boucle ne contiendrait que des 7 et des 9, qui pourraient alterner dans les deux sens : deux solutions. Donc aucune ne peut être 7, et les deux 7 disparaissent. C’est une boucle unique de type 4.',
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
}
