---
source: components/patterns/PanelSeat/README.md
source-sha256: 19c45931c6b33293
translated-at: 2026-10-07
---
# PanelSeat

> The product does not ship this component. What follows is this repository's implementation advice for plugin authors — it works, and every value is anchored to a selector the product already uses, but this surface does not exist in the product itself.

The skeleton a plugin uses when it inserts a block of its own content into the conversation flow: a title row, one or two actions to the right of the title, and body copy underneath.

A plugin finishes a build and pastes a "Build output" block under the reply, with a "Copy" action to the right of the title — that block is this one. It gives the plugin a reasonable place to land: what gets inserted has a name and a boundary, instead of turning into a run of bare text mixed into the conversation.

It does not steal focus, does not block interaction, and its width shrinks to fit its content. What gets inserted should read as part of the conversation, not as a panel laid over it.

## When to use it

- A plugin needs to put a block of self-describing structured content in the conversation flow: build results, cited sources, a checklist waiting for confirmation, the plugin's own local state.
- The block needs a title, and one or two actions to the right of the title.
- The content varies in width, and you want it to shrink to fit rather than stretch across the whole row.

## When not to use it

- The content is not part of the conversation. Global settings and switching between targets belong to the settings page and the sidebar; do not borrow the conversation flow's shell to squeeze them in.
- It is only a one-sentence notice. Use a momentary notice that goes away on its own, or a static tag; do not wrap a titled container around one line of text.
- The user has to deal with it before they can carry on. That is a job for a dialog or a risk confirmation; this one does not steal focus and does not block interaction by default, so it cannot carry a step the user must go through.
- A panel that has to stay visible and has little to do with this stretch of conversation. That belongs in the rightbar, and should not scroll away with the conversation.
- It is only a run of monospaced code or output. Use a code block; it already handles line numbers and horizontal scrolling.
- The title bar across the top of a panel, a drawer or a sidebar. That is the panel header's job: it has a fixed height, and its title is not a heading element; the title here is a real heading, and its width follows the content.

## How to use it well

**Work out what the user is doing right now before you decide whether to insert.** Dropping a block into the conversation while the user is writing their next sentence is taking their attention away from it. Build results and cited sources — content tied directly to the step just taken — are worth inserting; a plugin's startup message or version number is not.

**What gets inserted should read like a turn of conversation, not like an advertisement.** Conversation is read straight down the page, so the default is a transparent background and no full-width stretch. A two-line notice filling the whole message area breaks the rhythm of the surrounding context. Give it a fill only when it genuinely needs to feel like its own sheet of paper.

**One block of content carries one title.** The title is the nameplate of that block, and a repeated title makes people think they are looking at two different things. When several blocks sit in the same stretch of conversation, their titles have to set them apart from one another: write "Build output", not "Result".

**Keep the actions to the right of the title restrained.** One or two is enough, and they should be actions this block itself needs: copy, retry, expand. Anything the user has to confirm before carrying on does not belong here; use a dialog instead.

**Do not take the user's cursor away.** While a plugin inserts content, the user may be typing in the composer. Inserting should not move input focus elsewhere, and should not pop up on its own and cover the composer.

**Leave whitespace to the host.** Inside the conversation, the distance between rows is controlled by the host in one place; add another ring of padding in the container and the two stack into a double gap. Only the variant with a fill needs a ring of padding of its own.

| Situation | Insert? | Why |
| --- | --- | --- |
| The direct result of the step the user just took | Yes | It follows on from the current topic, and the user wants to see it |
| Something the user has to confirm before carrying on | No — use a dialog | This one does not block interaction, so it slips straight past |
| A plugin's startup message or version number | No | Unrelated to the current conversation; it belongs in the rightbar or the settings page |
| A status panel that is always visible | No | That belongs in the rightbar, and should not scroll away with the conversation |
| A notice that fits in one sentence | No — use a momentary notice | A titled container is too heavy a wrapper for it |

See SPEC.md for implementation details.
