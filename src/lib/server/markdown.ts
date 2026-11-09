import { error } from '@sveltejs/kit';
import { articles, getDocument } from '#lib/content/catalog.js';
import { categories, units, videos } from '#lib/content/learning.js';
export function renderMarkdown(path: string) {
	const slug = path === 'index' ? '' : path;
	const document = getDocument(slug);
	if (!document) error(404, 'Markdown page not found');
	const article = articles.find((article) => article.slug === slug);
	let body =
		article?.raw.replace(/^---[\s\S]*?---\s*/, '').replace(/<script[\s\S]*?<\/script>\s*/g, '') ??
		'';
	if (slug === '')
		body = `## Build on MIOSA\n\n[Quickstart](/docs/quickstart) · [API reference](/docs/api)\n\n## The building blocks\n\n${articles
			.filter((a) => a.slug)
			.map((a) => `- [${a.title}](/docs/${a.slug}): ${a.description}`)
			.join(
				'\n'
			)}\n\n## Learn by doing\n\n[Learn and earn](/docs/learn/earn) · [Glossary](/docs/glossary) · [Interactive labs](/docs/learn/games)\n\n## Machine-readable documentation\n\n[Index](/llms.txt) · [Full context](/llms-full.txt)`;
	else if (slug.startsWith('build/'))
		body = `## Choose the environment\n\n${document.description}\n\nUse a sandbox for isolated code and previews, or a computer for a persistent browser, desktop and human handoff.\n\n## Run, observe, and publish\n\n1. Choose the authenticated user and workspace.\n2. Create an isolated environment and start the agent.\n3. Stream events, inspect artifacts and review a preview.\n4. Save a snapshot and publish a verified version.\n\n[Agent runs](/docs/agents) · [Snapshots](/docs/snapshots) · [Deployments](/docs/deployments)\n\n[Original MIOSA recipe](https://miosa.ai/docs/${slug})`;
	else if (slug === 'learn/earn')
		body = `## Learn the words\n\n${categories.map((c) => `- [${c.name}](/docs/learn/final/category/${c.id}): +$2.50 practice credits`).join('\n')}\n\n## Learn with games\n\n${units.map((u) => `- [${u.title}](/docs/learn/labs/${u.id}): +$${u.reward} practice credits`).join('\n')}\n\n## Learn with videos\n\nVideo lessons are not available yet.\n\n## Local practice\n\nProgress is saved in this browser. Credits are illustrative and have no monetary value. No MIOSA account is connected.`;
	else if (slug === 'glossary')
		body = categories
			.map(
				(c) =>
					`## ${c.name}\n\n${c.description}\n\n[Practice this category](/docs/glossary?category=${c.id})`
			)
			.join('\n\n');
	else if (slug === 'learn/games')
		body = units
			.map((u) => `## ${u.title}\n\n${u.subtitle}\n\n[Open the lab](/docs/learn/labs/${u.id})`)
			.join('\n\n');
	else if (slug === 'learn/videos')
		body = `## Lessons planned\n\n${videos.map((v) => `- ${v}: not available yet`).join('\n')}`;
	else if (!body)
		body = `[Learn the words](/docs/glossary) · [Try the labs](/docs/learn/games) · [Follow the quickstart](/docs/quickstart)`;
	return new Response(`# ${document.title}\n\n${document.description}\n\n${body}\n`, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
}
