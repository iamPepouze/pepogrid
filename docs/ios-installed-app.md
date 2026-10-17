# The installed iOS app

How PepoGrid behaves when added to an iPhone or iPad home screen (Share → Add to Home Screen). Read before changing the installed app's layout, dialogs or update flow; reviewers check iOS-only changes against it.

**Documented** means a primary source (WebKit, Apple, MDN, specs, plugin docs, this repo). **Reported** means only community PRs or issues say so; treat it as unverified.

## Top-edge blur (Liquid Glass)

- Reported: since iOS 26, a home-screen web app gets a system Liquid Glass progressive blur over its top edge, drawn above the web view and reaching about 38–40pt past the status bar ([xdoubleu/tools.xdoubleu.com#1987](https://github.com/xdoubleu/tools.xdoubleu.com/issues/1987), [#1988](https://github.com/xdoubleu/tools.xdoubleu.com/pull/1988), [tomallison24/tomallison24#62](https://github.com/tomallison24/tomallison24/pull/62), [klbsjpolp/skip-bo#279](https://github.com/klbsjpolp/skip-bo/pull/279)).
- Reported: iOS 27 made the band much more contrasty ([tmshv/vcsudoku#38](https://github.com/tmshv/vcsudoku/pull/38), [cplieger/subflux#960](https://github.com/cplieger/subflux/pull/960)).
- No web-facing CSS or meta switch is documented. WebKit added a way to hide scroll edge effects for *clients*, meaning apps that embed WKWebView, not for web pages ([WebKit bug 295843](https://bugs.webkit.org/show_bug.cgi?id=295843)).
- Reported, and the reports disagree on whether anything besides moving content works:
  - An opaque, full-width fixed or sticky box at the top edge makes WebKit extend that box's color instead of blurring ([devswha/herdr-web-ui#106](https://github.com/devswha/herdr-web-ui/pull/106), [mbryantms/folio#994](https://github.com/mbryantms/folio/pull/994)). Others say an opaque fixed strip doesn't help on iOS 27 ([xdoubleu#1987](https://github.com/xdoubleu/tools.xdoubleu.com/issues/1987)).
  - Dropping `apple-mobile-web-app-status-bar-style: black-translucent` so content starts below an opaque bar ([devswha/herdr-web-ui#199](https://github.com/devswha/herdr-web-ui/pull/199), [coder/xum#5656](https://github.com/coder/xum/pull/5656), [jaylfc/taOS#3427](https://github.com/jaylfc/taOS/pull/3427), [tmshv/vcsudoku#38](https://github.com/tmshv/vcsudoku/pull/38)). Others report the blur still sits below the bar afterwards ([xdoubleu#1987](https://github.com/xdoubleu/tools.xdoubleu.com/issues/1987)). PepoGrid never had that meta and still saw the blur.
  - Keeping content out of the band is the fix most often reported as confirmed on a device ([xdoubleu#1988](https://github.com/xdoubleu/tools.xdoubleu.com/pull/1988), [klbsjpolp/skip-bo#279](https://github.com/klbsjpolp/skip-bo/pull/279), which cites a player-confirmed iPad fix).
- iPadOS: reported for the iPad too ([cplieger/subflux#960](https://github.com/cplieger/subflux/pull/960), [mbryantms/folio#994](https://github.com/mbryantms/folio/pull/994), [mval23/remy#12](https://github.com/mval23/remy/pull/12)). None of those PRs shows a check on an iPad, and PepoGrid hasn't been checked on one.
- What PepoGrid does: the last rule in [src/App.vue](../src/App.vue)'s `<style>` sets `.app` top padding to `env(safe-area-inset-top) + 48px` under `@media (display-mode: standalone) and (min-height: 500px)` and `@supports (-webkit-touch-callout: none)`. That is about 40px of blur plus 8px. The rule is last so that it wins over the desktop-sized query on an iPad. Elsewhere the padding is inset + 12px.

## Status bar and safe area

- `index.html` has `viewport-fit=cover`, `apple-mobile-web-app-capable` and no `apple-mobile-web-app-status-bar-style` ([index.html](../index.html)).
- Documented, in Apple's archived guide: the status-bar-style default is `default`. With `default` or `black`, content sits below the status bar. Only `black-translucent` puts content on the whole screen, under the bar ([Safari HTML Reference: meta tags](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html)).
- Observed on device, which contradicts that guide: on an iPhone 17 Pro with iOS 27, PepoGrid with no meta still draws under the status bar. Before the blur rule, its header sat at about inset + 12px below the clock. Don't assume that `default` insets the web view.
- Reported: changing the status-bar-style meta only takes effect after the user removes the app and adds it again ([devswha/herdr-web-ui#199](https://github.com/devswha/herdr-web-ui/pull/199), [coder/xum#5656](https://github.com/coder/xum/pull/5656)). Any change to this meta is invisible to existing installs.
- Documented WebKit bug, reopened: since iOS 26.1, some home-screen apps show a solid status-bar-height band, and `env(safe-area-inset-top)` returns 0 instead of about 44pt. A WebKit engineer confirmed it on the iOS 27 beta ([WebKit bug 301994](https://bugs.webkit.org/show_bug.cgi?id=301994)). Don't rely on the inset alone to clear the status bar.
- `theme-color`: from Safari 26, the theme color is used only for installed web apps ([MDN browser-compat-data, meta theme-color](https://github.com/mdn/browser-compat-data/blob/main/html/elements/meta.json)). PepoGrid sets `#1565c0` (light) or `#1e1e1e` (dark), first in index.html's early script and then in [src/composables/useTheme.ts](../src/composables/useTheme.ts). The two must stay in sync.

## Detecting iOS and the installed app in CSS

- `@supports (-webkit-touch-callout: none)` matches only WebKit on iOS and iPadOS. It isn't supported in desktop Safari, Chrome, Edge or Firefox, including on Android ([MDN BCD, -webkit-touch-callout](https://github.com/mdn/browser-compat-data/blob/main/css/properties/-webkit-touch-callout.json); [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/-webkit-touch-callout)). Every iOS browser uses WebKit, so the query also matches Chrome or Edge on iOS. Combine it with `display-mode` to target the installed app only.
- `@media (display-mode: standalone)` is supported from iOS Safari 12.2 and desktop Safari 13 ([MDN BCD, media display-mode](https://github.com/mdn/browser-compat-data/blob/main/css/at-rules/media.json)). It also matches installed PWAs on Android and desktop, which is why PepoGrid adds the `@supports` guard.

## Viewport sizes that rules depend on

- Largest iPhone viewport: 440×956pt, on the iPhone 16 Pro Max and 17 Pro Max ([Use Your Loaf, iPhone 17 screen sizes](https://useyourloaf.com/blog/iphone-17-screen-sizes/)). A landscape iPhone is at most 440 CSS px tall, so `min-height: 500px` excludes every landscape iPhone.
- Small iPhones: the iPhone SE (2nd/3rd gen) is 375×667, and 320×568 is the 4-inch size ([Use Your Loaf](https://useyourloaf.com/blog/iphone-17-screen-sizes/)). Not found: a primary source that Display Zoom on an SE gives 320×568. Treat it as unverified.
- iPad mini (6th/7th gen): 744×1133 CSS px, the smallest current iPad. This is a community figure ([yesviz](https://yesviz.com/devices/ipad-mini-7/)); Apple's HIG no longer lists device sizes. Its landscape height, 744, is above 500, so the blur rule applies to every iPad in both orientations.
- Status bar by orientation: by default UIKit hides the status bar in a vertically compact environment, which is an iPhone in landscape. An iPad is regular height in both orientations, so it keeps the bar ([UIViewController.prefersStatusBarHidden](https://developer.apple.com/documentation/uikit/uiviewcontroller/prefersstatusbarhidden)). This is documented for native apps. For web apps, only reports confirm it ([xdoubleu#1988](https://github.com/xdoubleu/tools.xdoubleu.com/pull/1988), [mval23/remy#12](https://github.com/mval23/remy/pull/12)).

## Dialogs

- PepoGrid never calls `window.confirm` or `window.alert`. It uses [src/components/AppDialog.vue](../src/components/AppDialog.vue), a `<dialog>` opened with `showModal()`, for the new-game prompt and the load-failure message. New prompts should use it too.
- Not found: a primary source that native dialogs fail in iOS home-screen apps. The swap was a precaution based on community reports. Reports that do exist are for embedded web views or old iOS versions ([Apple forums 65054](https://developer.apple.com/forums/thread/65054), [cordova-ios#1734](https://github.com/apache/cordova-ios/issues/1734)).
- Documented: the HTML spec lets a browser decline to show these dialogs. In that case `confirm()` returns false without asking the user ([HTML spec, simple dialogs](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-confirm)).
- Safari doesn't focus a button on tap, so the code that opens a dialog passes along the button that opened it, and focus returns there ([AppDialog.vue](../src/components/AppDialog.vue) header comment).

## Updates

- [vite.config.ts](../vite.config.ts) sets vite-plugin-pwa `registerType: 'prompt'` with `injectRegister: 'script'`. No code calls `updateServiceWorker`, so no prompt ever appears.
- In the generated code, `registerSW.js` only calls `navigator.serviceWorker.register('/pepogrid/sw.js')` on `load` ([vite-plugin-pwa: register service worker](https://vite-pwa-org.netlify.app/guide/register-service-worker)). `sw.js` calls `skipWaiting()` only when it receives a `SKIP_WAITING` message, and it never calls `clientsClaim` (check with `npm run build`, then `dist/sw.js`). With prompt mode, the app is expected to call `updateSW()` to apply an update ([vite-plugin-pwa: prompt for update](https://vite-pwa-org.netlify.app/guide/prompt-for-update)).
- Documented lifecycle: a new worker found on page load installs in the background. It activates only once no page still uses the old worker, and a refresh isn't enough ([MDN: Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), [web.dev: service worker lifecycle](https://web.dev/articles/service-worker-lifecycle)).
- So on iOS, after a deploy:
  1. On the first full launch, the old version runs and the new one installs.
  2. Closing the app from the app switcher frees the old worker.
  3. On the second full launch, the new version runs.
- Resuming the app from the background doesn't load the page, so it neither checks for nor applies an update. This last point is inferred from the lifecycle, not documented for iOS.
- To check a fix on a device: deploy, launch, close the app from the app switcher, and launch again.

## Haptics

- `navigator.vibrate` isn't supported in Safari or any iOS browser ([MDN BCD, Navigator.vibrate](https://github.com/mdn/browser-compat-data/blob/main/api/Navigator.json); [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate)). PepoGrid's mistake vibration is Android only ([README.md](../README.md)).

## What can be checked off-device

- The drive-app skill drives Microsoft Edge, which is Chromium, through playwright-core (`chromium.launch({ channel: 'msedge' })` in [.claude/skills/drive-app/drive.mjs](../.claude/skills/drive-app/drive.mjs)). Chromium doesn't support `-webkit-touch-callout`, so `@supports` blocks guarded by it never apply there.
- `display-mode: standalone` couldn't be emulated: in one quick test, CDP `Emulation.setEmulatedMedia` had no effect. klbsjpolp/skip-bo#279 reports the same.
- You can check off-device:
  - layout at a given viewport size, by temporarily applying the iOS rule's declarations unguarded;
  - that the rule doesn't leak into a normal tab or desktop;
  - dialog behavior;
  - service worker caching in Chromium.
- You can't check off-device:
  - the blur, which is system chrome and can't be reproduced headless;
  - real `env(safe-area-inset-*)` values;
  - status-bar placement and status-bar-style effects;
  - iOS's update timing.

  These need an iPhone or iPad, and for meta changes, a fresh install.
