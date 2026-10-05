---
source: guides/40-selfcheck-sources.md
source-sha256: c9091c7758496fa5
translated-at: 2026-10-05
---
# Self-checks and evidence sources

> Before you submit, check interface behaviour and accessibility, and confirm that every key number carries a version, a date and a source you can reproduce.

This page is for third-party DSH plugin authors. It is not about how to design; it is about how to **check**: which checks to run first, which checks you cannot run at all, where each number comes from, and which things that look like requirements are really internal constraints of the official monorepo and none of your concern.

## Source markers: pick one of five

This repository has exactly five source markers, and every number has to carry one of them. A number with no marker is a defect (source: `spec/00-overview.md` §4, "any value without a source marker is a defect") `[Proposed here]`.

| Marker | Meaning | When to use it |
| --- | --- | --- |
| `[Official source]` | Verbatim text from a public repository, or from source, packages and documentation shipped with the product | Quoting the official `docs/`, `packages/client/`, or npm package contents distributed with the product |
| `[Runtime measurement]` | A value measured on the local DSH, with a reproducible method and a collection date | Seat occupancy counts, geometry readings, computed styles, contrast |
| `[Borrowed principle]` | A clause from an outside guide, rewritten here before it is cited, with no platform-specific values carried over | General criteria such as hit area and contrast |
| `[Proposed here]` | The value this repository suggests when no authoritative number exists, plus the reasoning | order bands, 8/16 spacing, turning a switch off |
| `[Known deviation]` | The official implementation conflicts with this repository's spec, or two pieces of evidence contradict each other | Record it; do not override the official |

Note that the old markers listed in `spec/00-overview.md` §4 are `[HIG]` / `[OH]` / `[DSH-CSS]` / `[measured]` / `[Proposed here]`; `guides/` uses the set in the table above — the two correspond in meaning, so do not mix them when you cite.

## A comparative review against the Apple and Huawei design guides

This comparison focuses on two practical questions: which level a plugin's settings belong at, and how a button example should be shown. It borrows the way the judgement is made and the way the document is arranged; it does not turn platform sizes, appearances or APIs into DSH spec.

| Official guide | Review question that carries over | What this guide changed in response | The gap and the limit for DSH |
| --- | --- | --- | --- |
| [Apple HIG: Settings](https://developer.apple.com/cn/design/human-interface-guidelines/settings) | Is this a preference that affects the whole experience and is adjusted rarely, or an option that only affects the current task/session? | `00-start` and `20-pattern-settings` first decide between a global preference, a full settings section and an in-session option, then pick the `settings.general.item`, `settings.section` or `conversation.*` seat. | The platform settings entry point and window Apple describes are not the DSH plugin API. The public DSH seat table has no separate plugin-settings-window entry; this guide says plainly that the case is unsupported today, and it does not generate concept HTML. |
| [Apple HIG: Sidebars](https://developer.apple.com/cn/design/human-interface-guidelines/sidebars) | Does the sidebar carry top-level navigation only? Can a key action be found only at the bottom of the sidebar? | `21-pattern-sidebar-panel` splits the left sidebar into branding, global panels, workspace and host settings, and limits `sidebar.footer.action` to a secondary shortcut. | Apple's sidebar hierarchy rules do not become DSH API; `data/slots.json` is still the authority on where you can actually mount. |
| [Apple HIG: Buttons](https://developer.apple.com/cn/design/human-interface-guidelines/buttons) | Does the control act immediately, or express a continuing state or a set of options? Is hierarchy carried by style or by size? Does a custom button give press feedback? | The settings guide separates action buttons from dropdowns, appearance options and switches; the Button page shows, variant by variant, the real copy you can check in a clean capture, and ships the implementation source. | A DSH capture proves only the state that was captured; Apple's hit-area numbers and platform state appearances are not copied into DSH. In the button source, what counts as official geometry and what is proposed here are labelled separately. |
| [HUAWEI Vision Design Guide: Buttons](https://developer.huawei.com/consumer/en/doc/design-guides-V1/button-0000001052807858-V1) | Are buttons organised by purpose, visual type and state? Does the copy name the action directly? Do adjacent buttons stay consistent? | The Button page borrows the classification and the side-by-side comparison, listing the DSH buttons that actually exist first and then this repository's TSX/CSS implementation. | Huawei's visual types, states and spacing rules belong to its platform. This site does not map HarmonyOS categories onto official DSH components. |
| [HUAWEI HarmonyOS: Button development guide](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V13/arkts-common-components-button-V13) | Can the example lead you back from the finished result to the actual component declaration and event implementation? | The Button page shows copyable `components/controls/Button/index.tsx` and `button.module.css`, labelled as this repository's implementation. | This repository's implementation follows the official DSH CSS geometry, but it is not official DSH React component source; HarmonyOS ArkTS code cannot be used in a DSH plugin as it stands. |

This round also leaves two things unverified: there is no clean Web capture of the Desktop account/signed-in state, so this page only describes the host-managed `settings.launcher`; and no clean full-screen capture of the conversation tabs was obtained, so only the tab crop from the user's image five is cross-checked against the UI inventory and marked `source-verified` in the evidence map. The Button gallery shows only the normal state from a clean capture; keyboard focus, disabled and pressed states that were not captured are not drawn as current DSH behaviour.

## The official checklist

| Group | Items | What failing costs you | Source |
| --- | --- | --- | --- |
| A Required | 51 | A single "no" means you cannot submit | `spec/70-checklist.md` `[Proposed here]` |
| B Recommended | 13 | A "no" needs the reason written in your README | Same `[Proposed here]` |
| Total | 64 | — | Same; `counts.total` = 64 in `rules/rules.json` reconciles with it `[Runtime measurement]` |

By how they can be detected: 36 automatic / 19 semi-automatic / 9 human review (source: `counts.byDetection` in `rules/rules.json`) `[Runtime measurement]`. These three numbers decide your checking strategy: **the 36 automatic ones belong in CI; the 9 human-review ones only you can look at**.

The human-review items cluster in A01–A04, A12, A14, A35, A38, A41, A51 (source: "reviewer notes" at lines 85–89 of `spec/70-checklist.md`) `[Proposed here]`. They are: whether ownership is unique, whether the main flow lives only in the rightbar, whether the toolbar row holds only the controls for the current input, whether an overlay carries permanent UI, whether a sole entry point is covered, whether chain falls back, frame rate, the visual weight of your own icon, optical centring, 200% zoom, and whether functionality disappears in a narrow window.

## How this repository self-checks

| Command | What it does | What it covers | Source |
| --- | --- | --- | --- |
| `npm run verify` | Three passes: structural (required files and generated data are all present), static (`website/js/data.js` parses and its counts match the collected JSON), browser (headless Edge/Chrome visits each route, collects console errors, takes a home-page screenshot) | Consistency between the site and the generated data | `website/verify.mjs` file header `[Proposed here]` |
| `npm run audit` | In a real browser, opens every demo page and expands each one, synthesises one click on **every interactive element** inside the shadow root, then measures three things: whether any box covers ≥85% of the viewport, whether any box spills more than 60px outside the demo frame, and whether the demo frame height jumps | The interactive side effects of a demo (the kind static checks cannot see) | `scripts/audit-demos.mjs` file header and lines 8–13 `[Proposed here]` |
| `npm run refs` | Takes every dotted identifier in backticks across `spec/`, `README*.md` and `icons/README.md` (whose first segment is one of `sidebar`/`conversation`/`settings`/`shell`/`rightbar`/`main`/`plugins`) and checks it one by one against `data/slots.json` | **Does not include `guides/`** — the seat names on this page and in the 30-series pages are not covered by this check | `scripts/check-refs.mjs` lines 30, 36–47 `[Proposed here]` |
| `npm run build` | Runs `gen-rules.mjs` → `gen-site.mjs` → `check-refs.mjs` → `verify.mjs` in order | The full chain before you submit | `scripts.build` in `package.json` `[Proposed here]` |

The third row is worth remembering on its own: `guides/` is outside what `check-refs.mjs` scans (the script's `targets()` only takes `spec/*.md`, `README.md`, `README.zh-CN.md` and `icons/README.md`; source: `scripts/check-refs.mjs` lines 36–47) `[Proposed here]`. So if you get a seat name wrong in a guide, no tool will tell you.

## Why each number can be trusted

| Number | Basis (must be stated with it) | Source |
| --- | --- | --- |
| Seats 90 · single 38 / list 34 / keyed 15 / chain 3 | The seat tree of local build 0.2.0-rc.2, collected 2026-10-01 | `counts` in `data/slots.json` `[Runtime measurement]` |
| Scope root 42 / session 43 / session-maybe 5 | Same; the three are mutually exclusive and add up to 90 | Same `[Runtime measurement]` |
| Occupancy risk 41 / 49 | Same; `shadows-shipped-ui` 41, `none` 49 | Same `[Runtime measurement]` |
| Seat occupants 14 / 11 / 4 / 4 | Sampled **on 4 seats only**; the count depends on which plugins were installed at the time, so any citation must carry the collection time 2026-10-01 19:02 | `data/raw/occupancy-2026-10-01.json` `[Runtime measurement]` |
| UI identities 436 · coverage covered 390 / described 102 / referenced 8 / missing 38 · plugin-owned 119 | Identity = a deduplicated element family found by collection; covered = matched by a manual anchor, described = a measured size is written down in the target file, missing = to-do | `counts` in `data/ui-coverage.json`, `counts` in `data/ui-inventory.json` `[Runtime measurement]` |
| Component origins official 23 / proposed 3 | official = it really exists in the product (the official primitives have a component of that name, or the product's own CSS module renders it); proposed = the product has no such interface, and the geometry is a proposal anchored to official selectors | `components/origins.json` `[Runtime measurement]` |
| token counts palette 77 / lightAliases 115 / darkAliases 119 / scale 207 | **The four groups sit on different selector bases**: palette and scale come from `:root`, lightAliases from `body`, darkAliases from `body[data-ds-dark-theme]`; the four numbers cannot be added together, and they are not "how many tokens DSH has in total" | `blocks` and `counts` in `data/tokens.json` `[Runtime measurement]` |
| Icons 75 | The collected count of the official icon set | `counts.total` in `data/icons.json` `[Runtime measurement]` |

### What a "basis" looks like

The four token numbers are the easiest ones to misquote. Their source selectors differ, so they can neither be added together nor described as "the total number of tokens in DSH" (source: `blocks` and `$comment` in `data/tokens.json`) `[Official source]`:

| Group | Count | Selector | What is being counted |
| --- | --- | --- | --- |
| palette | 77 | `:root` | Static palette variables |
| lightAliases | 115 | `body` | Semantic aliases in the light theme |
| darkAliases | 119 | `body[data-ds-dark-theme]` | Semantic aliases in the dark theme |
| scale | 207 | `:root` | Non-colour scales such as size, font size, corner radius and motion |

The collection script is `scripts/collect-tokens.mjs`, and its source is the bundle distributed with the product (`source` in `data/tokens.json` points at the local `app.asar`) `[Official source]`. That the dark aliases outnumber the light ones by 4 (119 against 115) is a fact about the product, not a collection error; do not treat 115 as "the one correct value".

### How to trace one number back to its source

Take "tertiary text on a light white background is about 3.7:1" as an example; the full chain you can recompute is:

1. The semantic alias definition: `--dsw-alias-label-tertiary: var(--dsw-static-neutral-bluish-600)`, light in `body`, dark in `body[data-ds-dark-theme]` (source: `data/tokens.json` lines 157, 272) `[Official source]`.
2. The resolved hex values: light `#81858c`, dark `#adb2b8` (source: `resolved.light` and `resolved.dark` in `data/tokens.json`) `[Official source]`.
3. The background is `#ffffff` (light white background; the measured background value comes from the `bg` field of `docs/reference/composer-geometry.json`) `[Runtime measurement]`.
4. Computing it on the spot with the WCAG relative luminance formula gives 3.7:1, which is not a table lookup (source: `website/demos/a11y-board.html`; both the formula and the inputs are in that page's script) `[Runtime measurement]`.

Other text colours follow the same chain: `label-primary` light `#0f1115`, about 18.9:1; `label-secondary` light `#61666b`, about 5.8:1 (source: `resolved.light` in `data/tokens.json`; the ratios are computed on the spot in §3 of `spec/60-accessibility.md`) `[Runtime measurement]`. Only all three values together make the point: it is not that "the contrast fails", it is that **only the third level fails**.

## How deep the check goes: what static checks cannot see

That `npm run audit` exists at all is itself evidence (source: `scripts/audit-demos.mjs` file header) `[Proposed here]`. The two incidents it records are: clicking a selector turned the whole window white (an overlay escaped the demo frame and covered the page), and in a collapsed directory the button's built-in border drew each row as a little box. In both kinds of problem the DOM is right and the **geometry is wrong**, so no check that only looks at the DOM can catch them.

Three conclusions carry over to your plugin: re-measure geometry once an interaction appears, confirm an overlay has not escaped its own container, and confirm a third-party control that brings its own border has not wrecked the layout. None of the three is in the 64-item checklist; they are the part of the check you have to add yourself.

There are two traps in the collection method, and anyone recomputing has to know them (source: `docs/reference/README.md` lines 89–97) `[Proposed here]`:

1. A `[data-slot]` node is a logical seat with `display: contents`; **it has no box of its own**, so measuring it gives you 0 everywhere. Measure the element the seat renders, not the seat.
2. `profiles/node_modules/@deepseek-ai/dsh-client-ui-primitives/lib` is an **old copy** (only 24 CSS modules, with no `SegmentedControl` / `MenuGroup` / `SegmentedTabs` / `TextShimmer` / `SettingsForm` / `Checkbox`). To decide "does the official product have this control or this font size", you have to look at the copy the product actually loads (`node_modules/@deepseek-ai/dsh-client-ui-primitives/lib/` inside `app.asar`); looking only at the profiles copy gives you the opposite of the truth.

## Which constraints are internal to the official repo and need not be copied

The items below are written in the official `packages/client/AGENTS.md` (and the repository rules it cites). They serve the official monorepo's own development flow and are **not a submission bar for third-party plugins**. They are listed here so that when you run into them you do not wrongly think you are in violation.

| Internal official constraint | Who it binds | What a third party should do |
| --- | --- | --- |
| Three registration surfaces: `references` in `tsconfig.client.json`, the `dsh.client` line in `packages/bundle/web-app/cordis.patch.yml`, and the dependencies in `bundle/web-app/package.json` | `packages/client/*` inside the official workspace | You load your plugin from your own profile/package and touch none of the three |
| `pnpm run test:gui`, and `DSH_SNAPSHOT=replay/refresh/record` snapshot replay | Changes in the official repository | Just run your own tests |
| A 100% coverage bar for every client source file, and the discipline around `/* v8 ignore */` comments | Official `packages/client/*` | Does not apply |
| Landing an Agent Note in the same PR (for non-trivial changes) | The official repository | Does not apply; your README plays the same role |
| `verify-package-dependencies` / `verify-client-packages` / `verify-client-ui-i18n` / `verify-client-domain-graph` | Official repository scripts | Does not apply |
| The workspace protocol and `pnpm --filter … bundle` (the registry serves `lib/client.js`, not the source) | Official packages | This one is useful to you: after changing a plugin you have to rebuild before the running interface can see it |
| `PLATFORM_MODULES` / `ClientModuleSystem` / baseline externals / `dsh.client.external` for infrastructure only | The official module graph | Declare only the imports you genuinely need; `external` is not a channel for a feature plugin to get at other packages |
| "One UI feature = one plugin package", plus a `dsh.client` with a fixed `platform:'web'` and a required `./client` export | The official directory regime | This one applies to third parties too, and costs you very little; follow it |
| The design-review list and brand assets (FishLogo / Wordmark / Montserrat) | Official branding | Does not apply; do not copy brand assets into your own plugin |

Source: the Export discipline / Directory regime / Testing and coverage / New plugin package checklist / Shared modules and the module graph sections of `packages/client/AGENTS.md` `[Official source]`.

## Known deviations

The following deviations are on record in this repository and do **not** override the official implementation. The handling is uniform: "record it, and give plugin authors a conclusion they can act on", following §4.1 "official first" in `spec/00-overview.md`.

| # | Deviation | Evidence | How this repository handles it |
| --- | --- | --- | --- |
| 1 | The official Button's own corner radius does not match the official radius spec this repository records: `spec/20-controls.md` lines 13 and 14 and `components/controls/Button/SPEC.md` record `md` r18 / `sm` r14; `docs/ui-radius.md` allows only 4/8/12/16/20/28 and states Button `sm` R8 / `md` R12. Re-checking the `Button.module.css` the product actually loads (`@deepseek-ai/dsh-client-ui-primitives` inside `app.asar`), it uses `border-radius: var(--dsw-radius-md)` and `--dsw-radius-sm`, that is 12 and 8, **which agrees with `docs/ui-radius.md` and disagrees with the r18/r14 this repository recorded** (source: that module inside `app.asar`, `[Official source]`) | `components/controls/Button/SPEC.md`, `spec/20-controls.md`, `docs/ui-radius.md`, `app.asar` | Recorded as this deviation, without changing the official implementation; the conclusion on the author side is that **a newly written control should take only 4/8/12/16/20/28**, not copy r18/r14. `A15` / `A25` are judged by the radius ladder |
| 2 | On a light white background `--dsw-alias-label-tertiary` is about 3.7:1, below 4.5:1, and it is exactly what 13px caption text and 10px status labels use | `spec/60-accessibility.md` §3, `guides/24-pattern-feedback.md`, `website/demos/a11y-board.html` (computed on the spot in the browser); the resolved value is `#81858c` (`resolved.light` in `data/tokens.json`), dark `#adb2b8` | Recorded as a known deviation, without overriding the official control. Conclusion on the author side: prefer `label-primary` / `label-secondary` for body and caption text; when you use the tertiary colour, do not leave key information only there |
| 3 | Three components have only a scene and no measured body: `key-value-list` (the product has no key-value list, only the key-value rows a plugin renders in the usage panel), `mini-bar` (the position of the ratio readout was measured, but the bar's own track/fill was not), `panel-seat` (the seat system is real, but the "block a plugin inserts" itself was not measured) | `proposed` and `scenes` in `components/origins.json` | Marked `proposed` and shown separately on the site; if you copy it, you carry the risk of it differing from the real interface, so do not cite it as an official interface |

Items 1–3 above are the three you most need to know first: one where an official reading contradicts an official spec, one where a hard accessibility measure is not met, and one where a component has only a scene and no measured body. Below is the complete index of deviations this repository currently has on record, each traceable to an evidence file.

| # | Deviation | Evidence |
| --- | --- | --- |
| 4 | The parent seat of `conversation.input.dock`: `data/slots.json` records the parent as `conversation.content` (depth 0), while the raw tree puts it under `conversation.composer.bar`, and its `purpose` says "above the composer card". The two snapshots disagree; the seat name / kind / purpose agree | `data/slots.json`, `data/raw/slot-tree-2026-10-01.json`, `guides/22-pattern-composer.md` |
| 5 | Which seat "the dock below the card" corresponds to: in the raw tree "below the composer card" is `conversation.composer.dock`, but the `.sh-status` comment in `website/shell/shell.css` calls it `conversation.input.dock` | Same |
| 6 | The composer card height has two values: `docs/reference/composer-geometry.json` measures 780 × 114 (new-conversation page), while a comment in `website/shell/parts/composer.js` writes 780 × 98 for a single draft line in a conversation. Not a contradiction, but two different draft line counts | `docs/reference/composer-geometry.json`, `website/shell/parts/composer.js` |
| 7 | The composer card's corner radius 28 is not in the literal scale of `TK-MF-03`; it counts as "the official container's own corner radius" | `spec/30-tokens.md`, `docs/ui-radius.md` |
| 8 | Toolbar row horizontal spacing: `CT-RC-14` suggests 8px between adjacent controls in a row, while the measured toolbar row is `gap 12`. Where a measurement exists, the measurement wins | `spec/20-controls.md`, `components/layout/ToolbarRow/SPEC.md` |
| 9 | The Switch thumb transition is the official `120ms ease`, which is not one of the five steps | `spec/40-motion.md`, `spec/00-overview.md` §4.1 |
| 10 | Toast entry `160ms ease-out`, fade-out `1000ms ease`: neither is one of the five steps, both exceed 350ms, and the curves are not standard curves; the official anchor takes priority, and `A30` / `A31` need human confirmation | `components/feedback/Toast/SPEC.md` items 119, 120 |
| 11 | Ongoing motion curves: the official code has both `ease-in-out` and `linear`, and `MO-MF-06` forbids non-standard curves for interactive transitions; ongoing motion is outside that item's scope | `spec/40-motion.md` lines 52–56 |
| 12 | The `ongoing` state has two official implementations (the pixel-chase matrix in the primitives package and the spinner ring the product actually renders); only the latter appears in the real interface | `guides/24-pattern-feedback.md` |
| 13 | The "icon + title + description + action" combination in EmptyState and the `info` / `error` tones of InlineNotice have no counterpart in the product; the whole group's geometry is `[Proposed here]` | `components/feedback/EmptyState/SPEC.md`, `components/feedback/InlineNotice/SPEC.md` |
| 14 | Dark theme contrast, and the behaviour of the official `ConnectionIndicator` in a narrow container | No evidence |

For the detail behind items 4–5 and 11–13, see the "Sources and known deviations" section at the end of `guides/22-pattern-composer.md` and `guides/24-pattern-feedback.md`. **The handling principle is uniform**: record it, write down a conclusion the author can act on, and do not change the official implementation (basis: §4.1 of `spec/00-overview.md`).

## How to check yourself before you submit

| Step | Action | Verdict |
| --- | --- | --- |
| 1 | Take the 51 items with `level: "required"` from `rules/rules.json` and go through them one by one | Any "no" → do not submit |
| 2 | Turn the 36 `detection.tier: "auto"` items into a script (a static scan of source and build output) | Should be all green |
| 3 | Go through the 19 `detection.tier: "semi"` items by hand, confirming the candidates the script gives | Write down what you confirmed |
| 4 | Read the 9 human-review items one by one by the basis each document states, especially A01–A04, A12, A51 | No script to lean on |
| 5 | If any of the 13 recommended items is a "no", write the reason in your README | Just write it clearly |
| 6 | Check that every number you wrote down carries one of the five markers; for one with no marker, add a source there and then or delete it | The iron rule in §4 of `spec/00-overview.md` |
| 7 | Confirm you have not treated the "internal official constraints" from the section above as a bar of your own to meet | No need to copy them |

## Sources

The files and URLs actually read:

- `spec/00-overview.md` (§4 source markers, §4.1 "official first"), `spec/70-checklist.md` (A 51 / B 13, detection method, reviewer notes), `spec/60-accessibility.md` (§3 contrast)
- `rules/rules.json` (`counts.total` 64, `byLevel` 51/13, `byDetection` 36/19/9)
- `website/verify.mjs` (the three check passes), `scripts/audit-demos.mjs` (interaction audit), `scripts/check-refs.mjs` (scan scope), `package.json` (`scripts.build`)
- `docs/reference/README.md` (collection method and the two traps), `components/origins.json` (official / proposed / scenes)
- `data/slots.json`, `data/raw/occupancy-2026-10-01.json`, `data/tokens.json`, `data/ui-inventory.json`, `data/ui-coverage.json`, `data/icons.json`
- `components/controls/Button/SPEC.md`, `components/controls/Button/button.module.css`, `spec/20-controls.md`, `website/demos/a11y-board.html`
- https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/AGENTS.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md
