# Hosted as a GitHub Pages project site at /pepogrid/

PepoGrid is served from https://iampepouze.github.io/pepogrid/, built and deployed by a GitHub Actions workflow on every push to `main`, because it is free, needs no domain or DNS, and keeps built output out of the repo (no `gh-pages` branch). The app therefore runs under base `/pepogrid/` everywhere, including `npm run dev`, so path bugs show up locally.

## Consequences

Saved games, results and settings live in `localStorage`, and the service worker is registered for scope `/pepogrid/`; both are tied to the `iampepouze.github.io` origin. Moving to a custom domain later would start every player from an empty history unless a migration is built first.
