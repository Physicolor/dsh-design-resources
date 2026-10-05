---
source: components/feedback/Toast/README.md
source-sha256: f1c51e4120b4c2af
translated-at: 2026-10-05
---
# Toast

You hit Save and nothing on the page appears to happen. The file was actually saved, but the user does not know that, so they hit Save again. This is the moment it is meant for: the job is done, and there is no change worth looking at.

It sits centred at the top of the window, stays a while, then fades out on its own. A successful copy, a background task that finished, the network reconnecting: all of those are its job.

## When to use it

- Something finished and the user has no next step to take: saved, copied, reconnected.
- You want a bit of confirmation without giving up a permanent spot on the page.
- The same action fires over and over (saving a few times in a row), and each time one short line of feedback is enough.
- The action itself leaves almost no visible result, and the user needs an "I hit it" echo.

## When not to use it

- The user needs to read for a while, or needs to act (retry, see details). It leaves on its own, and it is gone before they finish reading: use an inline notice, which stays on the page.
- One field in a form was filled in wrong. The error belongs beside that field, not floating at the top of the window: that is the inline notice's job.
- You want to ask before deleting. That confirmation has to stop the user, and this thing accepts no clicks and has no room for buttons: use a dialog.
- There are several things to say at once. It always sits in the same spot, so they cover each other; fold them into one line instead, or use an inline notice that can queue.
- The welcome message when a page first opens. That is static content: it needs no animation and no countdown.

## How to use it well

**Report the result; do not block anyone.** It floats above the content and accepts no clicks at all, so any control placed on it is impossible to hit. Anything the user has to act on belongs in an inline notice or a dialog.

**Say it in one line.** "Saved" reads far better than "The operation completed successfully and your changes have been stored locally." The user glances at it; they do not read it word by word.

**Give the user enough time to finish reading.** The longer the copy, the longer it should stay. If the message is heavy enough to need a second read, it was never something this component could carry.

**Show it only on success.** Users assume their action worked; they only need telling when it did not. One popping up on every click soon becomes background noise nobody reads.

**Keep one at a time.** There is one slot, and a second message pushes the first aside or covers it. For a run of actions, report only the last one, or fold several into one line.

**Leave a trace on the page after it goes.** A line on a dark background is an announcement a screen reader speaks at once, which is exactly what it is for; but once spoken, it is gone. If the matter will still need to be checked later, leave the result on the page.

| Situation | Use |
| --- | --- |
| Done, with no next step | It |
| Status copy that has to stay visible | Inline notice |
| Nothing continues without a yes | Dialog |
| Content has not arrived yet, position known | Three-dot loader |
| Filtered down to nothing | Empty state |
| The spot is empty and the first step needs guiding | Empty state |

Implementation details are in SPEC.md.
