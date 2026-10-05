---
source: components/feedback/InlineNotice/README.md
source-sha256: f126342c5e645093
translated-at: 2026-10-05
---
# InlineNotice

> The official product does not ship this component. What follows is this repository's implementation proposal for plugin authors — it works, and its values are anchored one by one to official selectors that already exist, but the interface itself is not in the product.

A user fills in a screen full of form fields, presses Submit, and gets stuck. The problem is not any one field — the service is temporarily unreachable. That kind of message ("the whole thing has gone wrong, but it can still be salvaged") belongs in place, so the reader can work through it at their own pace before acting.

It is a bar that stays on the page: a status icon, a line of copy, and possibly a close control on the right. An unstable network, a quota that is nearly used up, where a draft was stored — all of those are its job.

## When to use it

- A piece of status copy has to stay visible: the network is unstable, the quota is nearly used up, where the draft was saved.
- The whole form failed to submit, and the reason belongs to no single field (the service timed out, the file was too large).
- Changing a setting has a side effect, and that needs spelling out before the user acts.
- The page is still in use, and only one thing has been downgraded: reading from the cache, offline mode, some data that did not sync.

## When not to use it

- One-off success feedback that can go the moment it has been read: use a momentary notice, which takes up no page space.
- The user has to pick one of several actions (retry, ignore, see details). A notice has only a close, so it cannot offer a choice — use a region with buttons, or a dialog.
- One field was filled in wrong. The error goes directly below that field; do not put a bar on every input row.
- Something serious happened and the user has to stop what they are doing. It does not take focus and cannot block anyone — use a dialog.
- Several are stacked on one screen. A pile of bars turns into background noise — better to merge them into one, or move them into a settings page.

## How to use it well

**Colour is not the only clue.** The tones differ only slightly in greyscale, and a user with a colour-vision deficiency may not tell them apart. Pair each one with an icon, or write the status directly into the copy.

**Say why, and what happens next.** "The network is down" only states the situation; "the network is down, retrying" tells the user whether they need to do anything.

**Keep one per screen.** Two notices side by side weaken each other, and the user does not know which to read first. If they really do have to sit side by side, they are two different matters and should be told separately.

**Leave a way back after the user closes it.** Once the user clicks the notice away, the message is gone. If the matter still has to be findable afterwards, keep the conclusion on the page as well, or leave an entry point that reopens it.

**When the whole bar is clickable, say what clicking does.** In the closable form the whole bar is itself a button, but nothing in the copy says what pressing it will do, so that has to come from the name.

**Pick the multi-line form when the copy may run past one line.** By default it is one line and does not wrap, so longer text gets clipped and the user reads half a sentence.

| Tone | Where it applies |
| --- | --- |
| Info | Neutral information with no good or bad news in it: a save location, the scope of a sync |
| Success | Something that stays in effect has been confirmed |
| Warning | It still works now, but carrying on will cause a problem |
| Error | Something has already failed, and the user has to decide what to do |

Implementation details are in SPEC.md.
