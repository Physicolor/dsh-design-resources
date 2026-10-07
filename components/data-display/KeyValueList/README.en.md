---
source: components/data-display/KeyValueList/README.md
source-sha256: 6d196577f48fe363
translated-at: 2026-10-07
---
# KeyValueList

> The product does not ship this component. What follows is this repository's implementation advice for plugin authors — it works, and every value is anchored one by one to a selector the product already uses, but this surface does not exist in the product itself.

A column of "name … value", with the names aligned on the left and the values free to run long and wrap on their own.

The list in the model parameters panel that lists the model, the context window and the temperature is one of these. The header information laid out row by row in request details is one of these. The "path", "size" and "modified time" in file information are one of these too.

It answers "what fields is this thing made of". Users read it top to bottom, row by row, or copy one or two rows out.

## When to use it

- Show the read-only detail of one object: model parameters, request headers, a configuration summary, file information, environment variables.
- The names are fixed short words and a value can be long — a long path or URL wraps on its own instead of bursting the container.
- You want to compare a column of numbers vertically, with the values hard against the right edge so the decimal points line up.

## When not to use it

- There are only one or two rows, and the number itself is the point. Use a metric row instead: the figure stands out more and the meaning is narrower.
- The user needs to edit these fields. This is a read-only statement of structure; use an input control.
- The value is block-level content such as a list, a tree or a code block. It does fit, but row spacing squashes it; use a custom card instead.
- The names and the values are peers, with no primary-secondary relationship between them. Use a table or a tag list — the structure here expresses a "name — description" pairing.
- The same set of fields has to be compared across several objects side by side. That is the job of a table.

## How to use it well

**Short names and long values are its most comfortable shape.** The name column takes its width from the content, and the value column eats what is left. Write a name as a whole sentence and the value gets squeezed into wrapping, so the block reads as prose rather than a list.

**Let values wrap when they need to.** Truncating long paths and URLs to an ellipsis looks tidy, but then users cannot copy the whole thing or check whether it is right. Take the extra line.

**Make values darker than names.** The difference in contrast is how users tell which side is the one they are meant to read. Left and right position alone keeps the eye hunting back and forth.

**Order the fields in a group the way users recognise them.** Identity first (model, path), then specification (window, temperature), then time. Do not follow the field order in the code — that order only means something to whoever wrote it.

**When the whole group needs a name, put a heading outside it.** Do not stuff the name into the first row as a fake header; that makes that one row look different from the rest.

| Situation | Which one to use | Why |
| --- | --- | --- |
| The read-only fields of one object | A key-value list | Fixed-width names and wrapping values keep long content from overflowing |
| Only one or two metrics to emphasise | A metric row | The figure stands out more, and the meaning is narrower |
| A set of fields compared across several objects | A table | The values have to line up in a column across objects |
| The value is itself a list or code | A custom card | Block-level content needs spacing of its own, which row spacing cannot give it |

See SPEC.md for implementation details.
