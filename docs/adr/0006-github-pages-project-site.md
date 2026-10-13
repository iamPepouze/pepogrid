# Hosted as a GitHub Pages project site at /pepogrid/

PepoGrid is served from https://iampepouze.github.io/pepogrid/, built and deployed by a GitHub Actions workflow on every push to `main`, because it is free, needs no domain or DNS, and keeps built output out of the repo (no `gh-pages` branch). The app therefore runs under base `/pepogrid/` everywhere, including `npm run dev`, so path bugs show up locally.

## Consequences

The persisted stores (`pepogrid.settings`, `pepogrid.game`, `pepogrid.results`) live in `localStorage`, which is tied to the `iampepouze.github.io` origin, and the service worker is registered for scope `/pepogrid/`. Any move to another origin (a custom domain) or path (renaming the repo) would start every player from an empty history and an uninstalled app unless a migration is built first.
