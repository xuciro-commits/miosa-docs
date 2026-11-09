import { t } from '#lib/i18n.svelte.js';

const cards = [
	{
		key: 'build',
		tag: 'BUILD',
		title: 'Your agent platform\nin a few lines.',
		description: 'Create a sandbox, run code, share a live preview.',
		code: '> await miosa.sandboxes.create()\n> sbx.previews.create({port:3000})',
		link: 'Open the quickstart',
		href: '/docs/quickstart',
		background: 'linear-gradient(145deg, #ff986e, #f36b47)',
		color: '#22100a'
	},
	{
		key: 'sdks',
		tag: 'SDKs',
		title: 'Your language.\nYour infrastructure.',
		description: 'One resource model, from your first request to production.',
		code: 'npm i @miosa/sdk\npip install miosa',
		link: 'Explore the SDKs',
		href: '/docs/sdks',
		background: 'linear-gradient(145deg, #cfe3d4, #a5c7b0)',
		color: '#10261a'
	},
	{
		key: 'computers',
		tag: 'COMPUTERS',
		title: 'A real computer.\nFor every agent.',
		description: 'A browser, a desktop, and a human handoff when you need one.',
		code: '> computer.browser.open()\n> computer.screenshot()',
		link: 'Meet computers',
		href: '/docs/computers',
		background: 'linear-gradient(145deg, #d4e8f6, #a6cde9)',
		color: '#0c2236'
	},
	{
		key: 'snapshots',
		tag: 'SNAPSHOTS',
		title: 'A point you can\ncome back to.',
		description: 'Save the environment, branch the work, and keep building.',
		code: '> sandbox.snapshots.create()\n> sandbox.restore(snapshot)',
		link: 'Understand snapshots',
		href: '/docs/snapshots',
		background: 'linear-gradient(145deg, #d9e6f2, #b3c8e0)',
		color: '#0f2238'
	},
	{
		key: 'deploy',
		tag: 'DEPLOY',
		title: 'From an idea\nto a stable URL.',
		description: 'Preview a change, verify the result, publish a version.',
		code: '> miosa apps deploy\n✓ version published',
		link: 'Ship an application',
		href: '/docs/deployments',
		background: 'linear-gradient(145deg, #f4f0e7, #dedbd5)',
		color: '#20242a'
	},
	{
		key: 'api',
		tag: 'API',
		title: 'Every building block.\nOne API.',
		description: 'Explore requests, change parameters, and inspect the response.',
		code: 'POST /api/sandboxes\nGET  /api/sandboxes/:id',
		link: 'Open the API reference',
		href: '/docs/api',
		background: 'linear-gradient(145deg, #234e93, #102d60)',
		color: '#fff'
	},
	{
		key: 'learn',
		tag: 'LEARN',
		title: 'Learn by doing.\nKeep your progress.',
		description: 'Words, practical labs, and a clear path through the platform.',
		code: 'words → practice → build\n7 interactive labs',
		link: 'Start learning',
		href: '/docs/learn/earn',
		background: 'linear-gradient(145deg, #f6d6cf, #eba99c)',
		color: '#3a130b'
	}
] as const;

export const factCards = cards.map((card) => ({
	...card,
	get tag() {
		return t(`marketing.landing.${card.key}.tag`);
	},
	get title() {
		return t(`marketing.landing.${card.key}.title`);
	},
	get description() {
		return t(`marketing.landing.${card.key}.description`);
	},
	get link() {
		return t(`marketing.landing.${card.key}.link`);
	}
}));
