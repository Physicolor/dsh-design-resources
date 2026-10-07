---
source: components/patterns/SettingsPage/README.md
source-sha256: 00471dea8e3ade47
translated-at: 2026-10-07
---
# SettingsPage skeleton

> The official primitives package does not ship this skeleton. But **the product does have the settings window itself**: 800 × 800, corner radius 28, a 188-wide navigation column on the left and a 612-wide content column on the right; the measured values are in SPEC, and the preview on this page is rendered to match it. This component is a skeleton suggestion for plugin authors — every value can be traced to its source, but do not read it as "the product has no settings page".

A column of section navigation on the left, a column of content on the right. When a plugin has to offer a complete settings page, this is the frame to build it on.

In a plugin's settings page the left column lists "General", "Models" and "Appearance", and the right column follows with the form for whichever one is current — that layout is this one. It does not fix the shape of any control; it only decides where the navigation sits, where the content sits, and how big the title is.

It suits a place users may not visit often — but when they do, they want to get everything changed in one go.

## When to use it

- The plugin has a complete settings page of its own, taking up a whole page rather than sitting as one small section inside the host's settings page.
- There are enough settings that only the section navigation on the left lets users scan them all.
- The content column keeps repeating the same shape — a small heading plus a few rows of settings — and you want them to look alike.

## When not to use it

- You are only adding one section to the host's settings page. The host hands you a container that is already laid out, and wrapping the whole skeleton around it gives you two levels of navigation.
- There are only one or two sections. A heading plus a list row group is enough; a navigation column sitting empty on the left wastes the space.
- The content is not settings. Anything with conversation semantics belongs in the conversation; do not borrow the settings page's shell.
- It is a step the main flow has to pass through. A settings page is somewhere users can choose not to go, so a key action cannot hide here.
- You only need a heading for one block. A block heading is enough; a top-level section of a full-page skeleton is a different matter, and stacking the two gives you two layers of titles.

## A settings section needs both a title and a description

When you add a section to the settings page (`settings.section`), the cell in the navigation column is only the nameplate; **the first thing users see when they click through is this page's title and description, and both have to be written**:

- Title: a semantic `<h2>`, 18/26, weight 600, primary text colour. It is also this page's entry point in the document outline and in a screen reader — drop it and the page has no name to jump to.
- Description: a `<p>`, 13/20, tertiary text colour, 12px below. It answers "what this page covers", and it is the one line users rely on to decide whether to read on.
- The two sit 12px apart (the official section's own `gap`); do not squeeze a logo icon into the title row — official titles are plain text, and icons only appear in the navigation cells on the left.

The comparison at the end of the file turns this into a reading you can take on the spot: write only the title, or only the description, and it is marked ✗ there and then. The official pages do not agree with each other either (the Models page uses 16/500 + 14/22), so what is given here is the single set adopted after normalisation.

## How to use it well

**A navigation column only pays off when there are enough sections.** From three sections up, it gives users a map of how many things are here; at two or three, the column runs longer than the content, and stacking the headings straight into the content column is faster.

**One section covers one thing.** The name on the left, the title on the right and the action in the top right corner all have to talk about the same thing. Call it "General" with model parameters mixed in, and users will not know where to click next time.

**Do not let the content column fill the whole screen.** When a line of text spans a very wide window, the name on the left and the control on the right sit too far apart, and the eye has to jump back and forth between them. Give the content a comfortable reading width and leave the rest as whitespace.

**Show where the user is.** A background fill alone is not enough to mark the current section; that difference in colour is too subtle. Darken the text as well and add the semantic marker for the current position, or screen reader users have no way to know which section they are standing in.

**Collapse it yourself on a narrow window.** The skeleton does no responsive collapsing, because it does not know where the host's breakpoints are. When the window shrinks, it is up to you to turn the navigation into horizontal scrolling at your own breakpoint, or tuck it into a menu.

**Do not steal the user's cursor.** Opening the page, or switching sections, must not pull input focus away from wherever the user is working.

| Situation | Which one to use | Why |
| --- | --- | --- |
| A complete settings page of the plugin's own | The full-page skeleton | There are several sections, and they need a navigation column |
| One section inside the host's settings page | The container the host gives you | Another layer around it turns into two levels of navigation |
| A heading for one block | A block heading | The skeleton's top-level sections are page-sized |
| Content with conversation semantics | The conversation's container | It is not settings |

Implementation details are in SPEC.md.
