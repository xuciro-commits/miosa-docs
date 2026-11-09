export const navigation = [
	{
		title: 'Get started',
		items: [
			{ slug: '', title: 'Introduction', icon: 'book' },
			{ slug: 'quickstart', title: 'Quickstart', icon: 'rocket' },
			{ slug: 'installation', title: 'Install the CLI or SDK', icon: 'terminal' },
			{ slug: 'product-model', title: 'The product model', icon: 'layers' }
		]
	},
	{
		title: 'Learn',
		items: [
			{ slug: 'learn', title: 'Start learning', icon: 'learn' },
			{ slug: 'learn/earn', title: 'Learn and earn', icon: 'earn', badge: '$100' },
			{ slug: 'glossary', title: 'Learn the words', icon: 'words' },
			{ slug: 'learn/games', title: 'Learn with games', icon: 'blocks' },
			{ slug: 'learn/videos', title: 'Learn with videos', icon: 'play' }
		]
	},
	{
		title: 'Services & projects',
		items: [
			{ slug: 'projects', title: 'Projects', icon: 'layers' },
			{ slug: 'services', title: 'Services', icon: 'server' },
			{ slug: 'deployments', title: 'Deployments & rollback', icon: 'rocket' }
		]
	},
	{
		title: 'Sandboxes',
		items: [
			{ slug: 'sandboxes', title: 'Overview', icon: 'box' },
			{ slug: 'snapshots', title: 'Snapshots & persistence', icon: 'database' }
		]
	},
	{ title: 'Computers', items: [{ slug: 'computers', title: 'Computers', icon: 'monitor' }] },
	{
		title: 'Databases & storage',
		items: [{ slug: 'data', title: 'Data and bindings', icon: 'database' }]
	},
	{
		title: 'Networking & domains',
		items: [{ slug: 'networking', title: 'Domains & previews', icon: 'globe' }]
	},
	{
		title: 'Agents',
		items: [{ slug: 'agents', title: 'Models, harnesses & tools', icon: 'network' }]
	},
	{
		title: 'CLI, SDKs & MCP',
		items: [
			{ slug: 'cli', title: 'CLI reference', icon: 'terminal' },
			{ slug: 'sdks', title: 'SDKs', icon: 'code' },
			{ slug: 'mcp', title: 'MCP', icon: 'plug' }
		]
	},
	{
		title: 'API reference',
		items: [
			{ slug: 'api-reference', title: 'API fundamentals', icon: 'code' },
			{ slug: 'api', title: 'Interactive API explorer', icon: 'play' }
		]
	},
	{
		title: 'Organization & security',
		items: [
			{ slug: 'security', title: 'Permissions & secrets', icon: 'shield' },
			{ slug: 'customization', title: 'Customize this site', icon: 'settings' },
			{ slug: 'changelog', title: 'Changelog', icon: 'file' }
		]
	}
];
export const navItems = navigation.flatMap((group) =>
	group.items.map((item) => ({
		...item,
		group: group.title,
		href: `/docs${item.slug ? '/' + item.slug : ''}`
	}))
);
