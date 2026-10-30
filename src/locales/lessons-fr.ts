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
}
