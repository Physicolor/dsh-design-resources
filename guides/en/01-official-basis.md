---
source: guides/01-official-basis.md
source-sha256: 9cc447dd92165b28
translated-at: 2026-10-07
---
# Official basis and where it applies

> The official basis for styling, interaction and the plugin API is spread across repository documents, agent guidance and source code. This page separates the rules a community plugin can use, the engineering constraints that only apply to the official client, and the proposals this repository adds.

## What this page gets you

- Know where the public official repository is, and which file each rule quoted here comes from.
- Get the official rules a plugin author has to follow, each with its original wording and a link.
- Tell apart the constraints that hold only in the official monorepo and that a third party need not copy.
- Know where official material is silent, and where this repository's proposals fill the gap.

## Sources and version

| Item | Value |
| --- | --- |
| Public repository | `https://github.com/deepseek-ai/deepseek-harness` (`DeepSeek-Harness` redirects to that lowercase name) |
| Default branch | `master` (not `main`; every `/main/...` path 404s) |
| Repository version | root `package.json`: `@deepseek-ai/dsh-root` **0.2.0-rc.2**, MIT |
| Version running on this machine | `@deepseek-ai/dsh-*` **0.2.0-rc.2** (nightly channel, Windows x64 10.0.26200) `[Runtime measurement]` |
| Capture date | 2026-10-02 `[Runtime measurement]` |

**The version numbers match, but they are not the same code**: `master` is a moving reference (last push 2026-09-29), while this machine holds one build snapshot. Everything quoted here comes from the document text; the built artefacts were not compared word for word. The local `app.asar` holds only the built `node_modules/@deepseek-ai/**` (62 `dsh-client-*` packages) and **no** `AGENTS.md` / `docs/` / skill text, so the documents cannot be re-checked word for word on this machine.

## Up front: does official material include a design spec for plugin authors?

**There are rules, but no single complete design manual for community plugin authors.** The official document directory that was checked has no client-plugin design chapter; `docs/cookbook/extension-cookbook.md` has only a short "A UI plugin" section. The rules are scattered across `docs/web-styling.md`, `docs/ui-radius.md`, `.agents/skills/dsh-client-ui-ux/SKILL.md`, `packages/client/AGENTS.md`, `docs/subsystems/slots.md` and the package READMEs.

That is "not seen in the directory listing" plus "these files were written for the official client packages", **not** "official material has no UI spec at all". This repository exists to gather those rules into one reference a plugin author can find, understand and check against.

## 1. Styling and tokens `[Official source]`

Source: `docs/web-styling.md`, `docs/ui-radius.md` (URL prefix `https://github.com/deepseek-ai/deepseek-harness/blob/master/`).

| Rule | Original wording |
| --- | --- |
| A feature component uses only `--dsw-alias-*` semantic tokens, never a literal colour | "Use `--dsw-alias-*` semantic tokens in feature components" |
| Take the corner radius by role from `--dsw-radius-xs\|sm\|md\|lg\|xl\|panel` (4/8/12/16/20/28); do not introduce local values such as 10/14/18/24 | "instead of introducing local values such as 10px, 14px, 18px, or 24px" |
| Concentric nested radii: inner R = max(0, outer R − inset) | "Concentric inset" |
| One material for settings cards: R20 + `0.5px solid var(--dsw-alias-settings-card-stroke)` + `--dsw-alias-settings-card-fill` | `.card { border-radius: var(--dsw-radius-xl); border: 0.5px solid … }` |
| A raised surface is `border: 0` + `box-shadow: var(--dsw-elevation-panel\|prominent\|soft)`; never layer a `--dsw-alias-border-*` border on top | "Never pair a `--dsw-alias-border-*` border with an lv/elevation shadow" |
| A full-round `border-radius` (50%/pill) must come with `corner-shape: round` | "Pair `corner-shape: round` with every full-round `border-radius`" |
| Neutral dividers and strokes use a 0.5px hairline | "draw at `0.5px`" |
| Feature CSS font weight tops out at 500; do not invent a font size for a single element | "Font weight tops out at 500 in feature CSS" / "never invent a size for a single element" |
| Menus always go through `Menu` or `MenuSurface`; never override `--dsw-menu-surface-fill` / `--dsw-menu-backdrop-filter` | "use `Menu` or wrap custom content in `MenuSurface`" |
| The modal mask stays translucent and dark, with no blur | "retain their translucent dark mask without blur" |
| Use the shared scrollbar styles rather than component-specific scrollbar selectors; the scrollbar stays inside the container and is not clipped by the corner radius | "shared scrollbar styles rather than component-specific scrollbar selectors" |
| Every colour has to be checked in both the light and the dark theme | "Verify every color in both light and dark mode" |

## 2. Interaction and feedback `[Official source]`

Source: `.agents/skills/dsh-client-ui-ux/SKILL.md`.

| Rule | Original wording |
| --- | --- |
| Extend an existing component, container or interaction before you consider building a new one | "Extend an existing component, container, or interaction before creating a new one" |
| Icons come only from the existing icon library | "Icons come from the existing icon library" |
| Rightbar content registers a slot in the existing sidebar, never a second sidebar; a tab always carries an icon | "never a separate sidebar" |
| An icon button whose meaning is unclear gets a Tooltip; information the pointer must rest on or select uses a HoverCard, not a bare `title` | "Informational content the pointer must rest on or select uses HoverCard" |
| A failed operation keeps the data visible, and never clears the content to show an error | "A failed operation keeps the data visible" |
| An inline notice is only for states tied to that surface (a failed query with Retry, field validation) | "states tied to the surface itself" |
| Error copy is a plain short sentence; a Chinese notice of two sentences or fewer drops the full stop at the end | "A Chinese notice of at most two sentences omits the trailing `句号（。）`" |
| A notice must not break the layout: reserve its space or overlay it, never shift neighbouring elements | "reserve its space or overlay it; never shift neighbouring elements" |
| Lists use their skeleton; every other page-level load centres a bare spinner instead of putting one in a corner; one page uses one loading style | "Lists use their skeleton; every other page-level load centers a bare spinner" |
| Check a menu, popover or tooltip three ways before shipping: dismissable, viewport-fitting, unclipped (portal to body when necessary) | "Dismissable / Viewport-fitting / Unclipped" |
| An immediate action's result uses a global Toast, and the Toast host has to outlive the panel that triggered it | "a toast rendered by the panel itself unmounts with that panel" |
| Spacing review: nothing sits flush against its neighbour without an intentional gap, and no unexplained one-off offsets | "nothing sits flush against its neighbour without an intentional gap" |
| Keep keyboard focus visible and respect reduced-motion | "Preserve keyboard focus visibility and reduced-motion behavior" |

## 3. Plugin structure, seats and export discipline `[Official source]`

Source: `packages/client/AGENTS.md`, `docs/subsystems/slots.md`, `packages/client/ui-primitives/README.md`.

- One UI feature = one plugin package; the `dsh.client` manifest pins `platform:'web'` and must have a `./client` export; `inject` is an informational edge only and does not decide activation order.
- A client plugin's `/client` entry is a public browser API: export only what cordis needs to load it (`apply` / `inject` / `Config`) plus types, and keep components and store handles internal.
- Never import or re-export another feature plugin's values at runtime; UI crosses packages only through a **slot**, behaviour goes through injected Cordis services, and shared types use `import type` only.
- A component never gets `ctx`: data and callbacks arrive as derived props, and business components carry no subscription mechanism.
- Every registration happens inside `apply`; module-level side effects are forbidden; and each registration has to be removable on dispose (HMR-safe).
- Contribute to someone else's slot with `ctx.slots.inject(key, () => ctx.slots.register(...))`; a bare `register` against an undeclared slot throws at load time.
- You can only render a slot key declared in your own `children`, named `<domain>.<entry>.<hole>` — **declaring it is what authorises it**.
- `single` and an already-occupied `keyed` cell are **replacement points**; an additive extension has to find another list id or an unoccupied key. `30 Seats and integration` gives the official statement of the same rule.
- Plugins do not share components with each other: shared controls can only come from `ui-primitives`; a zero-Cordis atomic component takes a complete localised label from its caller, and the package ships with no fallback copy.
- Product-visible copy (including aria names, tooltips, placeholders and unit formatting) has to go through the localisation dictionary or already-localised props.
- A third-party theme can register alias-token overrides through `ctx.theme`.

## 4. Holds only for the official `packages/client`; a third party need not copy it `[Official source]`

These are the official monorepo's engineering discipline. A plugin author has no counterpart to the three registration files, the CI or the reviewers, so copying this discipline would only add noise:

| Internal constraint | Why you need not copy it |
| --- | --- |
| Three registration surfaces (`tsconfig.client.json` references, the `dsh.client` line in `packages/bundle/web-app/cordis.patch.yml`, and the bundle package's dependency) | How the official monorepo is wired; a third party is an npm package plus runtime loading |
| `pnpm run test:gui` / `DSH_SNAPSHOT=replay pnpm run test:web` / snapshot replay | Official CI and fixtures |
| A 100% per-file coverage threshold, `/* v8 ignore -- <reason> */` | A repository-level gate |
| An Agent Note landing in the same PR (`.agents/notes/implemented/…`) | An artefact of the official documentation process |
| `verify-client-ui-i18n` / `verify-client-packages` / `verify-client-domain-graph` / `gen-client-catalog` | Official scripts; the "copy goes through the dictionary" rule behind them transfers, the scripts do not |
| workspace globs, `workspace:*`, `pnpm --filter … bundle` | The monorepo build |
| `PLATFORM_MODULES` / `web/src/platform.ts` / `ClientModuleSystem` | Shell internals; a third party only has to avoid re-declaring the baseline externals |
| `dsh.client.external` is limited to infrastructure / transport / generated wiring | A feature plugin must not request it |
| The single-package directory regime (`contract/` + domain directories that do not import each other + one `apply.ts`) | The domain-graph constraint of the official large packages |
| "a second package that needs the same control promotes it into ui-primitives" | A third party has no merge rights: reuse it or build your own |
| The design reviewer list, brand assets (FishLogo / Wordmark / the Montserrat brand font) | Official internal process and brand licensing |

## 5. Where official material is silent (filled in by this repository's proposals)

None of the official documents that were checked gives a written answer to the questions below, so this repository answers each one from runtime measurement plus a reasonable value, and marks it `[Proposed here]`:

- What value a list seat's `order` should actually take (official material only says that `list` sorts by order; it does not set a value strategy) → see `30` and `spec/11-slot-seats.md`
- The typesetting contract for a settings section page header (`h2` 18/26/600 + `p` 13/20 + 12px) is not consistent across official pages → see `20`
- The checklist items you run before submitting, and how each one is judged → see `spec/70-checklist.md` and `40`
- The yield order for conflict arbitration (when two orders collide, who goes first) → see `spec/80-conflicts.md`

## Sources

- Official public repository (master, captured 2026-10-02): `docs/web-styling.md`, `docs/ui-radius.md`, `.agents/skills/dsh-client-ui-ux/SKILL.md`, `packages/client/AGENTS.md`, `packages/AGENTS.md`, `docs/subsystems/slots.md`, `packages/client/ui-primitives/README.md`, `packages/client/ui-theme/README.md`, `docs/cookbook/extension-cookbook.md`, root `package.json`
- On this machine: `resources/app.asar` (62 `dsh-client-*` packages, all 0.2.0-rc.2), `resources/app-update.yml` (nightly channel)
- Not verified: whether the official document text matches the local 0.2.0-rc.2 artefacts word for word; whether the full listings of `docs/` and `docs/cookbook/` contain relevant pages that were not fetched (this pass used the repository directory API and direct paths, not a full-text search)
