# Hosted as a GitHub Pages project site at /pepogrid/

PepoGrid is served from https://iampepouze.github.io/pepogrid/, built and deployed by a GitHub Actions workflow on every push to `main`, because it is free, needs no domain or DNS, and keeps built output out of the repo (no `gh-pages` branch). The app therefore runs under base `/pepogrid/` everywhere, including `npm run dev`, so path bugs show up locally.

## Consequences

The persisted stores (`pepogrid.settings`, `pepogrid.game`, `pepogrid.results`) live in `localStorage`, which is tied to the `iampepouze.github.io` origin, and the service worker is registered for scope `/pepogrid/`. Any move to another origin (a custom domain) or path (renaming the repo) would start every player from an empty history and an uninstalled app unless a migration is built first.

## Amendment: two hosts, two bases

The app is also built into a container image that the Server serves at the root `/` of its own origin, while GitHub Pages keeps `/pepogrid/`. So the base is a build-time setting: `/pepogrid/` by default, which `npm run dev`, `npm run build` and the Pages deploy use, and `/` when `PEPOGRID_BASE=/` is set, as the Dockerfile does. The manifest's `scope` and `start_url` follow the base.

The two hosts are separate origins. A player who uses both has two independent `localStorage` histories (settings, game in progress, results) and two installs, each with its own service worker: scope `/pepogrid/` on Pages, scope `/` on the Server. Nothing syncs them, and the first visit to the Server starts from an empty history. The same warning as above applies to each host on its own: moving the Server's origin or path would lose its players' history.
