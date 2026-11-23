# The Server is PepoGrid's home; GitHub Pages is frozen on the move build

PepoGrid lives at https://pepogrid.adrienmg.eu, served by the Server from the container image that `image.yml` publishes. This replaces [ADR 0006](0006-github-pages-project-site.md), which made GitHub Pages the home.

## Decisions

- **No deploy to Pages.** No workflow deploys to Pages any more, and `check` no longer uploads a Pages artifact. GitHub Pages stays switched on in the repo settings, so it keeps serving its last deploy: the move build, the one made with `VITE_PEPOGRID_PAGES=true`, which shows the move screen and *Copy transfer code* (README, "Transfer code").
- **Frozen, not redirected.** A redirect from the old address would leave installed copies on the old game for good: a service worker's update check refuses a redirected script (Service Worker spec, Update algorithm), so an install never learns the new address. Serving the move build at the old address lets each install update to it by the normal route.
- **It outlives the site.** Once an install has opened the move build, its service worker has it cached, so it keeps working offline, *Copy transfer code* included, even after the Pages site is deleted.

## Consequences

The old address and the Server are separate origins, each with its own `localStorage` and install; the transfer code is the only bridge. The move build can't change, because nothing builds it again. A change to the transfer code's format would need the Pages deploy brought back for one run.

Pages is not deleted yet: an install that hasn't opened the move build only gets it by visiting the old address while it is online.
