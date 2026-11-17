/**
 * Bump when saved games or results change meaning; older data is dropped once.
 * 2: five rated difficulty tiers (results gained SE/HoDoKu ratings).
 * Read at launch (src/main.ts) and by the transfer code, which holds an older snapshot to the same rule.
 */
export const SCHEMA_VERSION = 2
