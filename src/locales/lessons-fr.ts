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
