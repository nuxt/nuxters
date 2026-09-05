# Build on the People explorer

The homepage globe links to `/people`, where visitors can select a country, search usernames, and open contributor profiles. The map uses country centroids. It does not claim to locate individual contributors within a city.

## Keep state in the right place

| State | Implementation | Reason |
| --- | --- | --- |
| Country, search, page | `route.query`, updated through the router | Links can be shared; back and forward restore filters. |
| Search input, expanded mobile panel, camera, rotation preference | Named Nuxt `useState` calls | Serializable preferences survive navigation without retaining the rendered page. |
| Country summary | `useAsyncData('people-map')` | Nuxt transfers the SSR payload and shares the response between homepage and directory. |
| Contributor results | Reactive `useFetch`, `deep: false` | Nuxt refreshes on filter changes and cancels superseded requests. |
| WebGL context, observers, pointer coordinates, interpolation | Local renderer variables | These objects are not serializable and must be released when the component unmounts. |

The country filter uses Nuxt UI `USelectMenu` with built-in search and flag icons. `UCollapsible` owns the location disclosure, and `UButton` owns the mobile panel toggle. Search waits 200 ms after the last keystroke. Selecting a country or leaving the route cancels the pending input update. Data objects are shallow because the UI replaces responses instead of mutating entries.

The app uses Nuxt layouts and does not keep inactive pages mounted. Camera preferences can survive through `useState` without a hidden globe continuing to render.

## Request summaries and pages

`GET /api/people` returns country names, counts, centroids, up to three preview usernames per country, and snapshot totals. The homepage draws at most 64 avatar markers.

`GET /api/people/contributors?country=country-fr&q=alex&page=1` returns at most 48 usernames and their countries, plus `total`, `page`, and `pageSize`. Search is case-insensitive and results are ordered by username. Unknown countries return an empty result. Out-of-range pages clamp to the last page; malformed page values and filters longer than 100 characters return HTTP 400.

The immutable country index is built once per server instance from `public/people.json`. It contains no request or session state. Responses have bounded HTTP cache lifetimes; there is no unbounded server-side cache of arbitrary search terms.

## Render only when needed

COBE renders directly into the available map area. Marker coordinates use the canvas height, matching COBE's aspect-ratio correction. Desktop overlays a two-column people directory; mobile overlays an expandable bottom panel with the same grid. Location details are expandable in the footer. A gradient fades the top of the globe into the header background. There is no separate square globe window exposed by zoom.

The explorer rotates automatically until paused or interacted with. Selecting a country, dragging, using arrow keys, or zooming pauses rotation; the play control resumes it. The homepage rotates unless paused, hovered, or reduced motion is enabled. Reduced motion disables automatic rotation in both modes. Both stop when hidden or outside the viewport, and a paused globe stops drawing once the camera settles. Unmounting cancels the pending frame, disconnects observers, removes listeners, and destroys WebGL resources.

Drawing-buffer dimensions are sent to COBE only after a resize. Pixel density is capped at 1.5 on small screens and 2 on larger screens. Country markers avoid overlaps; the searchable list remains the complete way to find people whose markers are hidden.

The canvas supports arrow keys, plus/minus, and zero to reset. Trackpad pinch uses Ctrl+wheel inside the globe only; ordinary wheel scrolling and browser zoom elsewhere remain native. At zoom 1.6 or above, country counts fade into avatar previews. The selected country shows up to three avatars; other countries show one. Zooming out restores the count pills. Clicking a person in the directory turns the globe to their country without changing the directory filters. Their avatar appears first in the country preview, and their linked username opens their contributions. These are country samples, not precise individual locations. Country selection and pagination also work without the canvas. WebGL failure leaves the directory available.

## Maintain the COBE patch

`patches/cobe@2.0.1.patch` contains two lifecycle fixes verified in Chromium:

- Redraw after the map texture loads. Upstream already includes this fix after 2.0.1; a static globe otherwise waits for interaction before showing its land texture.
- Clear the pending image callback and delete the WebGL texture during `destroy()`. The released implementation leaves both behind after navigation. [Upstream cleanup fix](https://github.com/shuding/cobe/pull/125).

The reproduction observed zero texture-load draws and zero texture deletions before the patch, and one of each afterward. The image callback is also cleared. Remove the corresponding patch hunks when upgrading to a COBE release containing these fixes. Keep the frozen lockfile and patch together.

## Publish complete snapshots

`pnpm collect:people` reads public GitHub locations. The collector rejects missing fields and partial GraphQL errors even when GitHub returns HTTP 200. It permits only an explicit `NOT_FOUND` error at a requested user alias whose data is null. A temporary file is renamed into place only after the whole collection succeeds.

Country inference still depends on free-form GitHub locations and GeoNames name matching. Ambiguous names can resolve incorrectly. Restoring city-level exploration requires improving that matching and retaining city data first.

## Verify changes

```sh
pnpm test:types
pnpm lint
pnpm test:unit --run
pnpm exec playwright install chromium
pnpm exec playwright test test/browser/index.spec.ts --workers=1
```

Browser checks cover navigation, filters, pagination, empty and failed results, keyboard controls, resizing, mobile expansion, WebGL failure, and idle drawing. The drawing check also detects accidental canvas-buffer reallocations while rotating. Use the performance benchmark for machine-specific timings; browser emulation does not replace testing on a physical phone.

## Sources behind these choices

- [Nuxt state management](https://nuxt.com/docs/4.x/getting-started/state-management): request-safe shared state and serialization constraints.
- [Nuxt useAsyncData](https://nuxt.com/docs/4.x/api/composables/use-async-data): shared keys, shallow responses, and cancellation.
- [Google Maps marker clustering](https://developers.google.com/maps/documentation/javascript/marker-clustering): aggregating dense markers. This explorer aggregates by country because its data already uses country centroids.
- [COBE source](https://github.com/shuding/cobe): viewport projection, update behavior, and resource disposal.
- [GitHub GraphQL resource limits](https://docs.github.com/en/graphql/overview/resource-limitations): rate limits and incomplete responses.

The desktop side panel and mobile bottom panel are product choices tested for this layout, not a universal map-interface standard.
