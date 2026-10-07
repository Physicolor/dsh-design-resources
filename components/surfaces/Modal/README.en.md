---
source: components/surfaces/Modal/README.md
source-sha256: 95b7614c739209d8
translated-at: 2026-10-07
---
# Modal dialog

Click "Delete conversation" and a box pops up in the middle of the screen asking "Are you sure?". The user has to answer before they can go on — that is the only reason it exists.

A mask dims everything behind it and one card floats in the centre. It speaks for the product and says one thing: stop for a moment.

## When to use it

- The user has to answer something before they can continue: confirm creating something, name a conversation, pick somewhere to save it.
- An action that is done wrong cannot be taken back, so the user has to say yes explicitly.
- Something failed and the user has to decide on the spot whether to retry or give up.
- One piece of content needs all the attention, and only for a moment.

## When not to use it

- You only need to tell the user something. Use a toast; a notification should not block what the user is doing.
- The content is long and needs scrolling. Use a drawer or a page of its own; a dialog suits short decisions.
- It is a choice between two options with nothing to explain. Put two buttons right there instead; you do not need to raise a mask over the screen.
- The same thing happens over and over. Popping up every time breaks the user's rhythm; switch to an inline form or confirm in place.
- The user is typing, selecting text, or reading something. Unless this step truly cannot go on, do not interrupt — the price is that they forget what they were doing.
- Opening a dialog on top of a dialog. Swap the content inside the box instead, or the user forgets which layer they came in from.

## How to use it well

**Every mask charges interest.** Interrupting has a price: the user is pulled away from where they were and has to find the thread again after closing. Use one only when the interruption genuinely helps them.

**The title says what this thing is called.** A user coming back from the pause finds their way by the title. Writing "Confirm" says nothing.

**Button labels name the action, not "OK".** "Delete this conversation" is a few words longer than "OK", but the user knows what they are pressing before they press it.

**Leave one clear way out.** Escape on the keyboard, a click on the mask, the close button in the top right — all three have to be there. Take them away to "force a choice" and the user only gets more anxious — the trouble with a forced flow is the flow, not this exit.

**If closing loses something, ask first.** Content the user worked to fill in should not disappear because they clicked just outside.

**Do not let Enter submit inside a dialog.** A stray keypress costs more at this layer.

| When | Use |
| --- | --- |
| You only need to tell the user something, no decision to make | A toast |
| The user has to answer before they can continue | A dialog |
| Long content that needs scrolling | A drawer or a page of its own |
| Two options, nothing to explain | A button group in place |
| An action that keeps happening | An inline form |

See SPEC.md for implementation details.
