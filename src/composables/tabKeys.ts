/**
 * The keys of the WAI-ARIA tabs pattern, shared by the views with tabs: `←` / `→` wrap round,
 * `Home` and `End` go to either end. Each view decides whether reaching a tab also selects it.
 */

/** The index of the tab `key` moves to from tab `index` among `count`, or undefined for any other key. */
export function tabKeyTarget(key: string, index: number, count: number): number | undefined {
  const last = count - 1
  return { ArrowRight: index >= last ? 0 : index + 1, ArrowLeft: index <= 0 ? last : index - 1, Home: 0, End: last }[key]
}
