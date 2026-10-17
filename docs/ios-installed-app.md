# The installed iOS app

How PepoGrid behaves when added to an iPhone or iPad home screen (Share → Add to Home Screen).

Each claim carries a label:

- **Documented**: a primary source (WebKit, Apple, MDN, specs, plugin docs).
- **Reported**: only community PRs, issues or secondary sites say so. Treat it as unverified.
- **Observed**: seen on the owner's iPhone.
- **Inferred**: follows from documented behaviour, not stated anywhere.

## Top-edge blur (Liquid Glass)

- Reported: since iOS 26, a home-screen web app gets a system Liquid Glass progressive blur over its top edge, drawn above the web view and reaching about 38–40pt past the status bar ([xdoubleu/tools.xdoubleu.com#1987](https://github.com/xdoubleu/tools.xdoubleu.com/issues/1987), [#1988](https://github.com/xdoubleu/tools.xdoubleu.com/pull/1988), [tomallison24/tomallison24#62](https://github.com/tomallison24/tomallison24/pull/62), [klbsjpolp/skip-bo#279](https://github.com/klbsjpolp/skip-bo/pull/279)).
- Observed: on an iPhone 17 Pro with iOS 27, the blur covered the header (title, icon buttons, difficulty menu) and part of the Mistakes line (#31).
- Reported: iOS 27 made the band much more contrasty ([tmshv/vcsudoku#38](https://github.com/tmshv/vcsudoku/pull/38), [cplieger/subflux#960](https://github.com/cplieger/subflux/pull/960)).
- Documented: no CSS or meta switch for web pages. WebKit added a way to hide scroll edge effects for *clients*, meaning apps that embed WKWebView ([WebKit bug 295843](https://bugs.webkit.org/show_bug.cgi?id=295843)).
- Reported, and the reports disagree on whether anything besides moving content works:
  - **Opaque box at the top:** an opaque, full-width fixed or sticky box at the top edge makes WebKit extend that box's color instead of blurring ([devswha/herdr-web-ui#106](https://github.com/devswha/herdr-web-ui/pull/106), [mbryantms/folio#994](https://github.com/mbryantms/folio/pull/994)). Others say an opaque fixed strip doesn't help on iOS 27 ([xdoubleu#1987](https://github.com/xdoubleu/tools.xdoubleu.com/issues/1987)).
  - **Dropping `black-translucent`:** removing `apple-mobile-web-app-status-bar-style: black-translucent` puts content below an opaque bar ([devswha/herdr-web-ui#199](https://github.com/devswha/herdr-web-ui/pull/199), [coder/xum#5656](https://github.com/coder/xum/pull/5656), [jaylfc/taOS#3427](https://github.com/jaylfc/taOS/pull/3427), [tmshv/vcsudoku#38](https://github.com/tmshv/vcsudoku/pull/38)). Others report the blur still sits below the bar afterwards ([xdoubleu#1987](https://github.com/xdoubleu/tools.xdoubleu.com/issues/1987)). PepoGrid never had that meta and still got the blur.
  - **Moving content below the band:** the fix most often reported as confirmed on a device ([xdoubleu#1988](https://github.com/xdoubleu/tools.xdoubleu.com/pull/1988), [klbsjpolp/skip-bo#279](https://github.com/klbsjpolp/skip-bo/pull/279), which cites a player-confirmed iPad fix).
- Reported for the iPad too ([cplieger/subflux#960](https://github.com/cplieger/subflux/pull/960), [mbryantms/folio#994](https://github.com/mbryantms/folio/pull/994), [mval23/remy#12](https://github.com/mval23/remy/pull/12)). None of those PRs shows a check on an iPad, and PepoGrid hasn't been checked on one.
- PepoGrid's fix (#32) is the last rule in [App.vue](../src/App.vue)'s style. It sets the top padding to the safe-area inset plus 48px: about 40px of blur plus 8px. It comes last so it beats the desktop-sized query's flat 20px on an iPad.

## Status bar and safe area

- Documented, in Apple's archived guide: the default status-bar style is `default`. With `default` or `black`, content sits below the status bar. Only `black-translucent` puts content under the bar ([Safari HTML Reference: meta tags](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html)).
- Observed, contradicting that guide: on an iPhone 17 Pro with iOS 27, PepoGrid (`viewport-fit=cover`, no status-bar-style meta) still draws under the status bar. Before #32, its header sat about 12px below the clock, at the inset plus 12px. Don't assume `default` insets the web view.
- Reported: a change to the status-bar-style meta takes effect only after the user removes the app and adds it again ([devswha/herdr-web-ui#199](https://github.com/devswha/herdr-web-ui/pull/199), [coder/xum#5656](https://github.com/coder/xum/pull/5656)), so existing installs never see it.
- Reported in a WebKit bug that is open again: some home-screen apps show a solid band the height of the status bar, and `env(safe-area-inset-top)` returns 0 instead of about 44pt. It was reported on iOS 18.6, 26.0 and 26.1, and a WebKit engineer reproduced it on the iOS 27 beta ([WebKit bug 301994](https://bugs.webkit.org/show_bug.cgi?id=301994)). Don't rely on the inset alone to clear the status bar.
- Documented: from Safari 26, `theme-color` is used only by installed web apps ([MDN browser-compat-data, meta theme-color](https://github.com/mdn/browser-compat-data/blob/main/html/elements/meta.json)). index.html's early script and [useTheme.ts](../src/composables/useTheme.ts) both set it, and the two must stay in sync.

## Detecting iOS and the installed app in CSS

- Documented: `@supports (-webkit-touch-callout: none)` matches only WebKit on iOS and iPadOS. Desktop Safari, Chrome, Edge and Firefox don't support the property, including on Android ([MDN BCD, -webkit-touch-callout](https://github.com/mdn/browser-compat-data/blob/main/css/properties/-webkit-touch-callout.json); [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/-webkit-touch-callout)). Every iOS browser uses WebKit, so the check also matches Chrome or Edge on iOS. Pair it with `display-mode` to reach the installed app only.
- Documented: `@media (display-mode: standalone)` works from iOS Safari 12.2 and desktop Safari 13 ([MDN BCD, media display-mode](https://github.com/mdn/browser-compat-data/blob/main/css/at-rules/media.json)). It also matches installed apps on Android and desktop, so it needs the `@supports` check beside it.

## Viewport sizes that rules depend on

- Reported: the largest iPhone viewport is 440×956pt, on the iPhone 16 Pro Max and 17 Pro Max ([Use Your Loaf, iPhone 17 screen sizes](https://useyourloaf.com/blog/iphone-17-screen-sizes/)). An iPhone in landscape is therefore at most 440 CSS px tall, so `min-height: 500px` excludes every iPhone in landscape.
- Reported: the iPhone SE (2nd and 3rd gen) is 375×667, and 320×568 is the 4-inch size ([Use Your Loaf](https://useyourloaf.com/blog/iphone-17-screen-sizes/)). Unverified: that Display Zoom on an SE gives 320×568.
- Reported: the iPad mini (6th and 7th gen) is 744×1133 CSS px, the smallest current iPad ([yesviz](https://yesviz.com/devices/ipad-mini-7/)). Apple's HIG no longer lists device sizes. In landscape it is 744 tall, above 500, so the blur rule applies to every iPad in both orientations.
- Documented for native apps: by default, UIKit hides the status bar when the screen is vertically compact, which is an iPhone in landscape. An iPad is regular height either way, so it keeps the bar ([UIViewController.prefersStatusBarHidden](https://developer.apple.com/documentation/uikit/uiviewcontroller/prefersstatusbarhidden)). Reported for web apps ([xdoubleu#1988](https://github.com/xdoubleu/tools.xdoubleu.com/pull/1988), [mval23/remy#12](https://github.com/mval23/remy/pull/12)).

## Dialogs

- Reported only: native `confirm` and `alert` failing in home-screen apps. The reports found are for embedded web views or old iOS versions ([Apple forums 65054](https://developer.apple.com/forums/thread/65054), [cordova-ios#1734](https://github.com/apache/cordova-ios/issues/1734)). PepoGrid's in-app dialog (CODING_STANDARDS.md C8) is a precaution.
- Documented: the HTML spec lets a browser decline to show these dialogs, and then `confirm()` returns false without asking ([HTML spec, simple dialogs](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-confirm)).

## Updates

- Documented, for the service worker lifecycle: a new worker found on page load installs in the background. It activates only once no page uses the old worker, and a refresh isn't enough ([MDN: Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), [web.dev: service worker lifecycle](https://web.dev/articles/service-worker-lifecycle)).
- Documented: [vite.config.ts](../vite.config.ts)'s prompt mode never calls `skipWaiting()` on its own. The app has to call `updateSW()` ([vite-plugin-pwa: prompt for update](https://vite-pwa-org.netlify.app/guide/prompt-for-update)).
- PepoGrid calls `updateSW()` only when the player taps the header's **Update** button, which [useUpdate.ts](../src/composables/useUpdate.ts) shows once a new version is waiting. The tap reloads the page, and the saved game resumes.
- What happens on iOS after a deploy, if the player never taps Update:
  1. On the first full launch, the old version runs and the new one installs.
  2. Closing the app from the app switcher frees the old worker.
  3. On the second full launch, the new version runs.
- Inferred: resuming the app from the background doesn't load the page, so on its own it neither checks for an update nor applies one. useUpdate.ts therefore checks whenever the page becomes visible again, so a version deployed since launch shows the Update button without a relaunch.
- Seen off-device, in Edge with a changed `sw.js` served under `vite preview`: the check on resume found the new version and Update appeared. Tapping it loaded the new version with the game intact, both on a page an older worker controlled and on a first visit, where none did. Not yet seen on an iPhone.
- Documented, in workbox-window's source, which `updateSW()` uses: the page reloads on the new worker's `controlling` event only if a worker controlled the page when it registered (`isUpdate`). On a first visit nothing does, so useUpdate.ts reloads the page itself after `updateSW()`. That call still asks a waiting worker to take over, so the reload gets the new version even while another tab holds the old one.
- To check a fix on a device without the button: deploy, launch, close the app from the app switcher, and launch again. With it: deploy, bring the open app back from the background, and tap Update.

## Haptics

- Documented: `navigator.vibrate` isn't supported in Safari or in any iOS browser ([MDN BCD, Navigator.vibrate](https://github.com/mdn/browser-compat-data/blob/main/api/Navigator.json); [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate)).

## What can be checked off-device

- The drive-app skill's browser is Chromium-based. Chromium doesn't support `-webkit-touch-callout`, so an iOS-only rule never applies there.
- Observed: `display-mode: standalone` couldn't be emulated, because CDP `Emulation.setEmulatedMedia` had no effect. klbsjpolp/skip-bo#279 reports the same.
- You can check off-device:
  - layout at a given viewport size, by temporarily applying the iOS rule without its `@media` and `@supports` checks;
  - that the rule doesn't leak into a normal tab or desktop;
  - dialog behavior;
  - service worker caching in Chromium.
- These need an iPhone or iPad, and a fresh install for meta changes:
  - the blur, which is system chrome and can't be reproduced headless;
  - real `env(safe-area-inset-*)` values;
  - status-bar placement and the effects of the status-bar style;
  - iOS update timing.
