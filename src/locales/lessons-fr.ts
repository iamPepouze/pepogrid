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
  Cycles: {
    text: 'Un cycle suit des chiffres autour d’une boucle fermée de cases, un lien à la fois :si cette case contient le chiffre, celle-là ne le peut pas, ou si celle-ci ne le peut pas, celle-là le contient. Quand la boucle se ferme avec tous les liens valables dans les deux sens, ses cases prennent les chiffres d’exactement deux façons. Ce qui vaut dans les deux vaut pour le reste de la grille. Une chaîne qui ne se ferme pas place quand même le chiffre à l’une de ses deux extrémités, donc une case voisine des deux ne peut pas le contenir.',
    sections: [
      {
        text: 'Un X-Cycle suit un seul chiffre. Ses liens alternent :deux cases d’une unité où le chiffre n’a que ces deux places, donc l’une le contient, puis deux cases d’une unité qui ne peuvent pas toutes deux le contenir. Tout autour de la boucle, le chiffre prend une case sur deux, dans un sens ou dans l’autre. Dans chaque unité d’un lien « pas les deux », l’une des deux cases est le chiffre dans les deux cas, donc le reste de l’unité ne peut pas l’être.',
        examples: [
          [
            'Suis les 3 autour d’une boucle. Supposons que la ligne 1, colonne 6 soit un 3. Alors la ligne 3, colonne 4, dans le même bloc, ne peut pas l’être.',
            'Le 3 de la ligne 3 n’a que deux places, les colonnes 2 et 4, donc il est dans la colonne 2.',
            'Alors la ligne 2, colonne 1, dans le même bloc que la ligne 3, colonne 2, ne peut pas être un 3.',
            'Le 3 de la colonne 1 n’a que deux places, les lignes 2 et 6, donc il est dans la ligne 6.',
            'Alors la ligne 6, colonne 6, dans la même ligne, ne peut pas être un 3.',
            'Le 3 de la colonne 6 n’a que deux places, les lignes 1 et 6, donc il est dans la ligne 1 :retour au départ de la boucle, et elle tient.',
            'Supposons au contraire que la ligne 1, colonne 6 ne soit pas un 3 :chaque lien s’inverse, et les trois autres cases prennent les 3. Dans les deux cas, les 3 prennent une case sur deux de la boucle. C’est un X-Cycle bidirectionnel.',
            'Le bloc en haut au milieu, le bloc en haut à gauche et la ligne 6 contiennent chacun deux cases de la boucle qui ne peuvent pas toutes deux être 3, et l’une d’elles est le 3 dans les deux cas. Le reste de ces unités ne peut donc pas être 3 :leurs autres 3 disparaissent.',
          ],
        ],
      },
      {
        text: 'Un Turbot Fish est une courte chaîne d’un seul chiffre :une unité où le chiffre n’a que deux places, un lien entre deux cases qui ne peuvent pas toutes deux le contenir, et une autre unité avec seulement deux places. Si la première extrémité de la chaîne n’est pas le chiffre, la dernière l’est, donc l’une des deux extrémités le contient. Une case voisine des deux extrémités ne peut pas le contenir.',
        examples: [
          [
            'Le 6 de la colonne 5 n’a que deux places, les lignes 5 et 8, donc l’une des deux est le 6.',
            'Si c’est la ligne 8, alors la ligne 9, colonne 6, dans le même bloc, ne peut pas être 6.',
            'Le 6 de la ligne 9 n’a que deux places, les colonnes 2 et 6, donc il est dans la colonne 2.',
            'Donc soit le 6 de la colonne 5 est dans la ligne 5, soit la ligne 9, colonne 2 est un 6 :une extrémité de la chaîne ou l’autre contient le 6. C’est un Turbot Fish.',
            'La ligne 5, colonne 2 est voisine des deux extrémités :elle partage la ligne 5 avec l’une et la colonne 2 avec l’autre. Quelle que soit celle qui est le 6, elle ne peut pas l’être, donc son 6 disparaît.',
          ],
        ],
      },
      {
        text: 'Un Y-Cycle traverse des cases à deux candidats chacune. Chaque lien joint deux cases d’une unité qui partagent un candidat :si l’une est ce chiffre, l’autre garde son autre chiffre. Quand la boucle se ferme, chaque case prend l’un de ses deux chiffres, d’exactement deux façons, et chaque paire de cases voisines contient son chiffre commun dans les deux cas. Le reste de leur unité ne peut donc pas le contenir.',
        examples: [
          [
            'Ces quatre cases ont deux candidats chacune :la ligne 5, colonne 2 un 3 ou un 6, la ligne 7, colonne 2 un 3 ou un 5, la ligne 7, colonne 9 un 4 ou un 5, et la ligne 5, colonne 9 un 4 ou un 6.',
            'Supposons que la ligne 5, colonne 2 soit le 3. La ligne 7, colonne 2, dans la même colonne, ne peut pas être 3, donc c’est le 5.',
            'Alors la ligne 7, colonne 9, dans la même ligne, ne peut pas être 5, donc c’est le 4.',
            'Alors la ligne 5, colonne 9, dans la même colonne, ne peut pas être 4, donc c’est le 6.',
            'Alors la ligne 5, colonne 2, dans la même ligne, ne peut pas être 6, donc c’est le 3 :retour au départ de la boucle, et elle tient.',
            'Supposons au contraire que la ligne 5, colonne 2 soit le 6 :chaque lien s’inverse, et chaque case prend son autre chiffre. Dans les deux cas, la boucle tient. C’est un Y-Cycle bidirectionnel.',
            'Dans les deux cas, la colonne 2 a son 3 dans la boucle, la ligne 7 son 5, la colonne 9 son 4 et la ligne 5 son 6. Aucune autre case de ces unités ne peut les contenir :les 3 des lignes 3 et 6 de la colonne 2, le 5 de la ligne 7, colonne 3, le 4 de la ligne 8, colonne 9 et le 6 de la ligne 5, colonne 3 disparaissent.',
          ],
        ],
      },
      {
        text: 'Un cycle peut suivre plusieurs chiffres, en mêlant tous les types de liens :une unité où un chiffre n’a que deux places, deux cases d’une unité qui ne peuvent pas toutes deux contenir un chiffre, et une case qui contient un chiffre, donc aucun de ses autres. Quand la boucle se ferme avec tous les liens valables dans les deux sens, ses cases prennent les chiffres d’exactement deux façons, et ce qu’une unité contient dans les deux cas disparaît du reste de cette unité.',
        examples: [
          [
            'Suis les 3 et les 4 autour d’une boucle. Supposons que la ligne 2, colonne 8 soit un 3. Alors elle ne peut pas être son 4.',
            'Le 4 du bloc en haut à droite n’a que deux places, la ligne 2, colonnes 8 et 9, donc il est dans la colonne 9.',
            'Alors la ligne 9, colonne 9, dans la même colonne, ne peut pas être 4.',
            'Le 4 de la ligne 9 n’a que deux places, les colonnes 4 et 9, donc il est dans la colonne 4.',
            'La ligne 9, colonne 4 est le 4, donc elle ne peut pas être son 3.',
            'Le 3 de la colonne 4 n’a que deux places, les lignes 3 et 9, donc il est dans la ligne 3.',
            'Alors la ligne 3, colonne 8, dans la même ligne, ne peut pas être 3.',
            'Le 3 du bloc en haut à droite n’a que deux places, la colonne 8, lignes 2 et 3, donc il est dans la ligne 2 :retour au départ de la boucle, et elle tient.',
            'Supposons au contraire que la ligne 2, colonne 8 ne soit pas un 3 :chaque lien s’inverse. C’est le 4, la ligne 9, colonne 9 le 4, et la ligne 9, colonne 4 et la ligne 3, colonne 8 les 3. Dans les deux cas, la boucle tient. C’est un cycle bidirectionnel :contrairement à un X-Cycle, il suit plusieurs chiffres.',
            'Dans les deux cas, la ligne 3 a son 3 dans la boucle, en colonne 4 ou en colonne 8. Aucune autre case de la ligne 3 ne peut donc être 3 :les 3 des colonnes 2 et 6 disparaissent.',
          ],
        ],
      },
    ],
  },
}
