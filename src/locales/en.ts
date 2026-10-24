/**
 * The English messages. They define the shape every language must match (ADR 0009): French and
 * German are typed as `Messages`, so the build fails when one lacks a key English has. Later
 * tickets add their screens' keys here and to each language.
 */
export const en = {
  settings: {
    title: 'Settings',
    language: 'Language',
    /** The Language group's first option; `resolved` is the language it gives, in its own name. */
    system: (resolved: string) => `System (${resolved})`,
    theme: 'Theme',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    board: 'Board',
    highlightMatching: 'Highlight matching numbers',
    license: 'License',
  },
}

type Widen<T> = T extends string ? string : T extends (...args: infer A) => string ? (...args: A) => string : { [K in keyof T]: Widen<T[K]> }

export type Messages = Widen<typeof en>
