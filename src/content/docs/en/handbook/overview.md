---
slug: "handbook/overview"
title: "Handbook: the Markdown variant"
description: "Our Markdown is not rendered straight: common meanings become cards, tabs, accordions and diagrams. This set states the conventions, the boundaries and the trade-offs."
section: "Handbook"
order: 18001
---

Everyone knows Markdown syntax; almost nobody knows what we render it into. The result is that one idea gets written as a bold paragraph, another as a table, a third as a list, and the three pages read like three different products.

This handbook puts the **semantics back** into the syntax. Standard Markdown says "this is a list" and "this is a table"; it does not say "this is a navigation card", "this is a caution", "these are alternative commands". We name the latter and map each name onto a component that already exists.

## The three layers

| Layer | Decided by | Example |
|---|---|---|
| Content | Heading levels and body order | H1 is the page, H2 is a section, H3 is an entry |
| Block | The shape of the paragraph markers | Table, code fence, blockquote, list |
| Layout | The `layout` field in frontmatter | `cards`, `accordion`, `collection` |

Splitting the layers pays off: the content layer keeps structure parallel across languages, the block layer keeps the text readable when unstyled, and the layout layer optimises the rendering. Any problem can be fixed in exactly one layer.

## Three design rules

1. **Meaning before shape**: do not use bold as a heading, and do not use a list as a table. When the shape matches the meaning, the renderer knows what to do.
2. **Degradable**: every convention must stay readable without rendering. `- [Title](link): description` is still an ordinary list item, not garbage.
3. **Less is more**: if a table solves it, introduce no new block. The whole site currently has three layout markers; a fourth has to prove the first three cannot do the job.

## Why a variant renderer at all

Because reading is not one activity. A hub page needs ten entries visible at once, a reference page needs parameters one by one, a tutorial needs commands in order, and a quiz needs answers hidden. One text shape cannot serve all four, and standard Markdown has no way to say "this is a hub page".

A variant renderer closes that gap: **layout is declared, not guessed**. The declaration sits in frontmatter, invisible to readers, obvious to authors, and checkable in CI.

## Where the rules live

- [The block reference](/docs/handbook/blocks): each shape, what it renders as, when to use it, and how it fails.
- [Page archetypes](/docs/handbook/archetypes): how pages are classified, with a template and a checklist for each class.
- [Lexicon and terminological discipline](/docs/xici/lexicon): the same reasoning applied to words (fidelity, grace, reach).

For live examples, `/docs/xici/canon` is a `layout: collection` page and `/docs/faq/getting-started` is a `layout: accordion` page.
