---
slug: "handbook/inference"
title: "Inference and compatibility"
description: "Which renderings can be inferred, which must be declared, and how to upgrade the renderer without disturbing pages already published: the compatibility contract."
section: "Handbook"
order: 18004
---

Authors know standard Markdown; our rendering has semantics of its own. There are only two ways to close that gap: teach the authors a new syntax, or let the renderer recognise the intent. The first adds burden, the second adds risk. This page divides the burden and the risk.

## Where rendering comes from

| Source | Automatic | Example | Risk |
|---|---|---|---|
| Syntax itself | Always | Tables, fences, quotes, heading levels | None: the shape is the meaning |
| Block inference | Automatic | Two or more `**Label**` lines each with a fence become tabs | Low: a mistake affects one block |
| Layout declaration | One line by the author | `layout: cards`, `accordion`, `collection` | None: it only applies when written |
| Layout inference | Cards only | Two or more link-and-description lists on a page become a card grid | Low: it only turns lists into cards |

## Why only cards can be inferred

Because the shape and the intent are almost 1:1. Two or more lists of linked entries on one page have hardly any other explanation than a hub, and a mistake merely makes a list look more like an entry point, which is acceptable.

The other two layouts **reinterpret the headings themselves**:

- `collection` treats `###` as a collapsible entry; inferring it would fold ordinary subsections on 44 reference pages, forcing readers to click before seeing content;
- `accordion` treats `##` as a question; inferring it would turn any page with question-shaped headings into an accordion.

Those mistakes do not look different, they hide content. So they must be declared on purpose.

## Three numbers

| Layout | Declared | Coverable by inference | Conclusion |
|---|---|---|---|
| `cards` | 98 pages | 23 pages, 18 of them already declared | Infer it, and allow declaring it |
| `accordion` | 10 pages | 0 pages | Declaration only |
| `collection` | 2 pages | 0 pages | Declaration only |

## The compatibility contract

1. **Inference adds rendering, never changes text**: every sentence in the output comes from the source; nothing is dropped, reordered or rewritten.
2. **Declaration beats inference**: a written `layout` wins, and `layout: default` switches inference off entirely.
3. **Block inference cannot be switched off**: tabs, table frames and code frames are styling, not layout; turning them off only makes pages worse.
4. **Upgrades must be auditable**: after a renderer change, run the page inventory and diff "what the previous version rendered" against "what this version renders", and write the difference into the release note.
5. **Failure degrades**: any inference that fails falls back to plain rendering, never to an error page.

## What an author has to remember

Two things only:

- write standard Markdown and get the shapes right (a list is a list, a table is a table);
- when a page should be read differently, add one `layout:` line, with one of four values: `cards`, `accordion`, `collection`, `default`.

Everything else belongs to the renderer. The purpose of a specification is to leave the author fewer rules, not more.

For the exact shape of each block see the [block reference](/docs/handbook/blocks); for page classes and templates see [page archetypes](/docs/handbook/archetypes).
