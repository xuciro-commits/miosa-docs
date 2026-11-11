---
slug: "handbook/archetypes"
title: "Page archetypes"
description: "Every page on the site falls into a few structural classes: hub, tutorial, reference and interactive. Each has its own layout, template and checklist."
section: "Handbook"
order: 18003
layout: collection
---

Classify before writing. The same prose behaves differently: on a hub page readers want ten entries at a glance, in a tutorial they execute in order, in a reference they look up one parameter at a time. That is a layout problem, not a prose problem.

Four classes follow, each with a definition, typical pages and a checklist. The counts come from the current inventory: 148 hubs, 135 tutorials, 94 reference pages, 39 table pages, 10 Q and A pages, 5 interactive pages and 3 diagram pages.

## Hub pages

Entry points: readers are not reading, they are choosing.

### Navigation page

Ten or so entries on one screen, each with a line saying what it solves.

> Checklist: cards aligned in two columns; every entry has a description; no dead links; descriptions never start with "this page introduces". [Example →](/docs/faq)

### Category index

A second-level entry page, grouped by topic and usually paired with cards.

> Checklist: fewer than eight categories; names are noun phrases; at least two entries per category. [Example →](/docs/api-reference)

## Tutorial pages

Readers follow along; order is correctness.

### Step-by-step guide

One action per step, command and explanation alternating, prerequisites first.

> Checklist: every step has a copyable command; steps can be verified independently; failures link to a rollback or a troubleshooting page. [Example →](/docs/quickstart)

### Code reference

Code blocks carry the page; prose only explains parameters and side effects.

> Checklist: every fence has a language; variants use tabs, not parallel sections; one sentence between adjacent blocks. [Example →](/docs/api-reference/sandboxes/create)

## Reference pages

Readers look things up; order does not matter.

### Parameter table

Tables carry the page: field, type, default, constraints.

> Checklist: units in the header; long tables grouped; split past six columns. [Example →](/docs/benchmarks)

### Concept page

Prose carries the page, explaining why a mechanism is shaped this way.

> Checklist: each section ends with a summary line; terms defined at first use; related pages linked at the end. [Example →](/docs/develop/sandboxes/sizing)

## Interactive pages

The page is a program; prose is only the shell.

### Checks and labs

Data-driven; the body supplies the lead-in, the questions come from a data file.

> Checklist: progress survives a reload; failures can be retried; the entry page explains the check. [Example →](/docs/learn/final/category/billing)

### Glossary and drills

Category filters plus cards plus a practice entry, laid out as a collection.

> Checklist: filterable by category; searchable; a practice button exists. [Example →](/docs/glossary)

## Choosing the layout

| What the page is doing | Layout | Key block |
|---|---|---|
| Letting a reader choose a path | `cards` | A list of linked cards |
| Making a reader follow steps | default | Ordered steps plus fences |
| Letting a reader look things up | default | Tables |
| Letting a reader browse grouped entries | `collection` | Group headings plus entry cards |
| Presenting questions and answers | `accordion` | Question headings plus answers |

Write in this order: pick the archetype, fill the content, declare the layout. Reverse that order and you get pages that are correct but awkward to read.
