---
slug: "handbook/blocks"
title: "The block reference"
description: "Every Markdown shape, what it renders as, when to use it and when it breaks: the block-level grammar of this site."
section: "Handbook"
order: 18002
---

The table below is the **block grammar** of the site. The left column is what you write, the middle is what readers see, the right is when it works and when it breaks. The only test is: would this text still read correctly with the rendering removed?

## The conventions

| Shape you write | What it renders as | When it works / when it breaks |
|---|---|---|
| `- [Title](/docs/quickstart): one line` twice or more | A grid of navigation cards (two columns, title plus description) | For index pages, declared `layout: cards`. A single item degrades to a plain list |
| `## question` followed by an answer paragraph, for the whole page | An accordion (expand, expand all, per-item anchor) | For Q and A pages; slugs under `faq/` or declared `layout: accordion` |
| `## group` + one line + `### item` + paragraph + one `>` line | A collection: pills, search, collapsible cards | For many entries that want browsing by group; declared `layout: collection` |
| `| column | column |` | A framed table with a quiet header and row rules | For comparison and parameters; past six columns, split or use a list |
| ` ```bash ` fence | A code frame with language label, copy button and highlighting | For every command and example; name the language, use `text` for formulas |
| Two or more `**Label**` lines each followed by a fence | Tabs, with icons for known platforms | For the same task on several platforms; fewer than two degrades to paragraphs |
| ` ```mermaid ` fence | A rendered diagram with a zoom overlay | For flow, sequence and state; not when the diagram outgrows the words |
| `> quoted` paragraph | A quote block (left rule, secondary colour) | For source text, cautions, aphorisms; not for long body copy |
| `1. step` ordered list | A numbered step list | For tutorials; one action per step |
| A `**bold lead**` paragraph inside a collection | The card title | Only inside `layout: collection`; never as a heading in running text |
| Inline code `` `miosa deploy` `` | A code chip | For commands, field names, paths; not for emphasis |
| A `/docs/quickstart` link | An internal link (underline, darker on hover) | For cross references; external links use the full URL |

## One shape, one job

A shape carries exactly one meaning, so the renderer never has to guess. If you need something that looks like a card but means a list, change the page layout rather than the writing.

## Failure cases

- A bold paragraph where a section heading belongs: the table of contents cannot see it, so the page loses its outline.
- A table where a card grid belongs: on mobile it becomes horizontal scrolling and the entries hide.
- A quote block holding body copy: the measure narrows and the reading rhythm breaks.
- A fence labelled `shell`: highlighting degrades, the copy button stays, but readers lose the colour cues.

## How this ties to bilingual parity

Block shapes are also the unit of structural checking: the two languages must carry the same number of headings, fences and table columns. That means you cannot add a table on one side only: add it to both, or write prose instead.

For page-level classification and templates, continue to [page archetypes](/docs/handbook/archetypes).
