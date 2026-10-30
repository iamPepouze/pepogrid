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
}
