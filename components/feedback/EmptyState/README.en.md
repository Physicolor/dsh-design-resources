---
source: components/feedback/EmptyState/README.md
source-sha256: e623758d4437638d
translated-at: 2026-10-05
---
# EmptyState

> The product does not ship this component. What follows is this repository's implementation advice for plugin authors — it works, and every value is anchored to a selector the product already uses, but this surface does not exist in the product itself.

A user opens "Saved searches" for the first time and there is nothing in it. They will not think "this is empty"; they will think "is it broken?" — unless you tell them, right there, why it is empty and what they can do next.

It is a centred explanation: an icon, a title line, an optional description, plus an optional action. A search that finds nothing, a list nobody has built yet, not enough permission — all of these use it.

## When to use it

- A list or a panel opens for the first time and really is empty.
- A filter or a search matches nothing — this copy has to say the filter caused it, and give a "clear filters" way out.
- Something failed but the page structure is still there; catch it with an empty state plus a retry entry point.
- A feature is blocked by permission or quota, and the reason and the way to recover have to be spelled out.
- A user deleted the last item and the page is suddenly empty; it needs a way to start over.

## When not to use it

- The data is still loading. Drawing "not loaded yet" as "empty" makes users think the data is gone — use a skeleton screen or a three-dot loader instead.
- There is already content and only one small block is empty. Think first about whether that block should be hidden altogether; an empty state takes up a big chunk of vertical space.
- The user has to choose among more than two things (upload, import, create). That is a job for an onboarding page; cram three buttons into the action area and nobody knows which one to press.
- An error one sentence can explain. Put it in place as a notice; you do not need to fill a whole screen.
- It is just that you cannot see this screen for now. That calls for an explanation of permissions and a way to upgrade, not "no data yet".

## How to use it well

**The title has to answer "why is it empty".** "No data yet" says nothing; "No conversations yet — try asking the first question" is what tells people where to go next.

**Give at most one primary action.** Put the one thing that most needs doing in the action area and tuck the rest into a secondary style. Several buttons side by side leave keyboard users unsure which one to press.

**The icon is mood, not information.** It helps people recognise an empty state, but the state itself still has to be put into words. Never ship an empty state with an icon and not a word of copy.

**Keep the copy short enough to take in at a glance.** One line for the title, two at most for the description. Any longer and it is worth asking whether the thing itself is still unclear.

**When it appears, screen reader users have to know too.** An empty state often only shows up after an action (clicking a filter, deleting the last item). When it appears asynchronously like that, have it announced.

**Do not draw "failed to load" and "genuinely nothing" the same way.** These two are not the same: one needs a retry, the other needs a start. Use the same empty state for both and users will reload a page that was empty to begin with.

| Situation | What to give |
| --- | --- |
| First open, nothing there to begin with | An invitation, plus a way to start |
| Nothing matches after a filter | Say the filter caused it, plus clear filters |
| Failed to load | The reason it failed, plus retry |
| No permission | Why you cannot see it, plus how to get access |
| The last item was just deleted | A way to create one again |

Implementation details are in SPEC.md.
