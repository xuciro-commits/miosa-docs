// Extracted from the target documentation sidebar (20 sections, nested menus, 426 pages),
// extended with the Xici set (our own formal reconstruction of the Xici).
export type NavNode = {
	slug?: string;
	title: string;
	titleZh?: string;
	icon: string;
	count?: string;
	children?: NavNode[];
};
export type NavItem = NavNode & { group: string; href: string };
export const generatedNavigation: { title: string; titleZh?: string; count?: string; items: NavNode[] }[] = [
	{
		title: "Get started",
		count: "9",
		items: [
			{
				slug: "",
				title: "Introduction",
				icon: "book-open",
			},
			{
				title: "Quickstart",
				icon: "zap",
				count: "4",
				children: [
					{
						slug: "quickstart",
						title: "Overview",
						icon: "zap",
					},
					{
						slug: "quickstart/sandbox-to-deployment",
						title: "Sandbox to deployment",
						icon: "rocket",
					},
					{
						slug: "quickstart/agent-driven-build",
						title: "Agent-driven build",
						icon: "bot",
					},
					{
						slug: "quickstart/app-engine",
						title: "Docker Host",
						icon: "container",
					},
				]
			},
			{
				slug: "cli/install",
				title: "Install the CLI or SDK",
				icon: "download",
			},
			{
				slug: "sandboxes-or-computers",
				title: "Sandboxes or Computers?",
				icon: "box",
			},
			{
				slug: "learn/first-production-app",
				title: "First production app",
				icon: "rocket",
			},
			{
				slug: "use-cases",
				title: "What you can build",
				icon: "lightbulb",
			},
		]
	},
	{
		title: "Learn",
		count: "13",
		items: [
			{
				slug: "learn",
				title: "Start learning",
				icon: "graduation-cap",
			},
			{
				slug: "learn/earn",
				title: "Learn and earn",
				icon: "circle-dollar-sign",
			},
			{
				slug: "glossary",
				title: "Learn the words",
				icon: "library",
			},
			{
				slug: "learn/games",
				title: "Learn with games",
				icon: "gamepad-2",
			},
			{
				slug: "learn/videos",
				title: "Learn with videos",
				icon: "play",
			},
			{
				title: "Product model",
				icon: "layers",
				count: "8",
				children: [
					{
						slug: "concepts",
						title: "Overview",
						icon: "layers",
					},
					{
						slug: "concepts/resource-model",
						title: "Resource model",
						icon: "boxes",
					},
					{
						slug: "concepts/publish-pipeline",
						title: "The publish pipeline",
						icon: "git-branch",
					},
					{
						slug: "concepts/computers-desktop",
						title: "Computers (desktop product)",
						icon: "monitor",
					},
					{
						slug: "concepts/tenancy",
						title: "Tenancy",
						icon: "building-complex",
					},
					{
						slug: "concepts/tenant-config",
						title: "Tenant configuration",
						icon: "settings-2",
					},
					{
						slug: "concepts/data-and-bindings",
						title: "Data and bindings",
						icon: "database",
					},
					{
						slug: "concepts/tokens",
						title: "Preview and share tokens",
						icon: "ticket",
					},
				]
			},
		]
	},
	{
		title: "Services & projects",
		count: "41",
		items: [
			{
				title: "Projects",
				icon: "folder-kanban",
				count: "4",
				children: [
					{
						slug: "projects",
						title: "Overview",
						icon: "folder-kanban",
					},
					{
						slug: "projects/lifecycle",
						title: "Project lifecycle",
						icon: "rotate-ccw",
					},
					{
						slug: "projects/resources",
						title: "Project resources",
						icon: "boxes",
					},
					{
						slug: "projects/members-and-usage",
						title: "Members and usage",
						icon: "users",
					},
				]
			},
			{
				title: "Services",
				icon: "plug",
				count: "10",
				children: [
					{
						slug: "services/overview",
						title: "Overview",
						icon: "boxes",
					},
					{
						slug: "services/quickstart",
						title: "Quick start",
						icon: "rocket",
					},
					{
						slug: "services/services",
						title: "Run modes and types",
						icon: "server",
					},
					{
						slug: "services/static",
						title: "Static sites from Git",
						icon: "file-code",
					},
					{
						slug: "services/config-file",
						title: "Settings as code",
						icon: "file-key",
					},
					{
						slug: "services/variables",
						title: "Variables",
						icon: "variable",
					},
					{
						slug: "services/environments",
						title: "Environments",
						icon: "layers-2",
					},
					{
						slug: "services/previews",
						title: "Preview environments",
						icon: "git-branch",
					},
					{
						slug: "services/releases",
						title: "Releases and rollback",
						icon: "rotate-ccw-clock",
					},
					{
						slug: "migrate/railway",
						title: "Move from Railway",
						icon: "hard-drive-download",
					},
				]
			},
			{
				title: "Scale and observe",
				icon: "gauge",
				count: "4",
				children: [
					{
						slug: "services/replicas",
						title: "Replicas and scaling",
						icon: "cpu",
					},
					{
						slug: "services/dedicated-vcpu",
						title: "Dedicated vCPU",
						icon: "server-cog",
					},
					{
						slug: "services/logs",
						title: "Logs",
						icon: "scroll-text",
					},
					{
						slug: "services/metrics",
						title: "Metrics",
						icon: "gauge",
					},
				]
			},
			{
				title: "Services tooling",
				icon: "square-terminal",
				count: "2",
				children: [
					{
						slug: "services/cli",
						title: "CLI",
						icon: "terminal",
					},
					{
						slug: "services/sdk",
						title: "SDKs",
						icon: "code",
					},
				]
			},
			{
				title: "Docker Host",
				icon: "container",
				count: "13",
				children: [
					{
						slug: "docker-host/overview",
						title: "Overview",
						icon: "cloud-upload",
					},
					{
						slug: "docker-host/hosts",
						title: "Hosts",
						icon: "server-cog",
					},
					{
						slug: "docker-host/templates",
						title: "Templates",
						icon: "layout-template",
					},
					{
						slug: "docker-host/docker-deploy",
						title: "Docker Host deployments",
						icon: "file",
					},
					{
						slug: "docker-host/deployment-model",
						title: "How it works",
						icon: "layers",
					},
					{
						slug: "docker-host/publishing",
						title: "Publishing",
						icon: "rocket",
					},
					{
						slug: "docker-host/deploy-from-github",
						title: "Deploy from GitHub",
						icon: "folder-git-2",
					},
					{
						slug: "docker-host/versions",
						title: "Versions",
						icon: "git-branch",
					},
					{
						slug: "docker-host/releases",
						title: "Releases",
						icon: "package",
					},
					{
						slug: "docker-host/rollback",
						title: "Rollback",
						icon: "rotate-ccw",
					},
					{
						slug: "docker-host/environments",
						title: "Environments",
						icon: "flag",
					},
					{
						slug: "docker-host/runtime-instances",
						title: "Runtime instances",
						icon: "cpu",
					},
					{
						slug: "docker-host/domains",
						title: "Domains",
						icon: "globe",
					},
				]
			},
			{
				title: "Forge",
				icon: "git-branch",
				count: "7",
				children: [
					{
						slug: "forge",
						title: "Why Forge",
						icon: "git-branch",
					},
					{
						slug: "forge/quickstart",
						title: "Quickstart",
						icon: "zap",
					},
					{
						slug: "forge/pull-requests",
						title: "Pull requests and checks",
						icon: "list-checks",
					},
					{
						slug: "forge/sandboxes",
						title: "From a sandbox",
						icon: "box",
					},
					{
						slug: "forge/agents",
						title: "Agents and the API",
						icon: "bot",
					},
					{
						slug: "forge/cli",
						title: "CLI reference",
						icon: "square-terminal",
					},
					{
						slug: "forge/faq",
						title: "Limits and FAQ",
						icon: "life-buoy",
					},
				]
			},
			{
				slug: "ci",
				title: "CI on MIOSA",
				icon: "workflow",
			},
		]
	},
	{
		title: "Sandboxes",
		count: "35",
		items: [
			{
				title: "Basics",
				icon: "scroll-text",
				count: "13",
				children: [
					{
						slug: "develop/sandboxes",
						title: "Overview",
						icon: "box",
					},
					{
						slug: "develop/sandboxes/capabilities",
						title: "Capabilities",
						icon: "badge-check",
					},
					{
						slug: "develop/sandboxes/create",
						title: "Create and connect",
						icon: "circle-plus",
					},
					{
						slug: "develop/sandboxes/docker",
						title: "Docker in sandboxes",
						icon: "scroll-text",
					},
					{
						slug: "develop/sandboxes/lifecycle",
						title: "Lifecycle",
						icon: "rotate-ccw",
					},
					{
						slug: "develop/files-and-exec",
						title: "Files, exec, and artifacts",
						icon: "square-terminal",
					},
					{
						slug: "develop/sandboxes/sizing",
						title: "Sizing and limits",
						icon: "ruler",
					},
					{
						slug: "develop/sandboxes/timeouts",
						title: "Timeouts and auto-stop",
						icon: "timer",
					},
					{
						slug: "develop/sandboxes/events",
						title: "Sandbox events",
						icon: "radio",
					},
					{
						slug: "develop/sandboxes/connect",
						title: "Connecting to a running sandbox",
						icon: "plug",
					},
					{
						slug: "develop/sandboxes/metadata",
						title: "Metadata and labels",
						icon: "tags",
					},
					{
						slug: "develop/sandboxes/long-running-tasks",
						title: "Long-running tasks",
						icon: "workflow",
					},
					{
						slug: "develop/sandboxes/production-checklist",
						title: "Production checklist",
						icon: "list-checks",
					},
				]
			},
			{
				slug: "machines",
				title: "Machine capabilities",
				icon: "ruler",
			},
			{
				title: "Persistence",
				icon: "camera",
				count: "3",
				children: [
					{
						slug: "develop/snapshots",
						title: "Snapshots and persistence",
						icon: "camera",
					},
					{
						slug: "develop/templates",
						title: "Templates",
						icon: "layout-template",
					},
					{
						slug: "develop/sandbox-shares",
						title: "Sandbox shares",
						icon: "share-2",
					},
				]
			},
			{
				title: "Environments",
				icon: "variable",
				count: "4",
				children: [
					{
						slug: "develop/sandboxes/environments",
						title: "Runtime variables",
						icon: "variable",
					},
					{
						slug: "security/secrets",
						title: "Secrets",
						icon: "lock",
					},
					{
						slug: "security/connect-accounts",
						title: "Connections (OAuth)",
						icon: "plug",
					},
					{
						slug: "guides/managed-connectors",
						title: "Managed tools for agents",
						icon: "cable",
					},
				]
			},
			{
				title: "Runtimes",
				icon: "cpu",
				count: "2",
				children: [
					{
						slug: "soma",
						title: "SOMA",
						icon: "cpu",
					},
					{
						slug: "soma/choosing-a-runtime",
						title: "Choosing a runtime",
						icon: "route",
					},
				]
			},
			{
				title: "Browser use",
				icon: "globe",
				count: "7",
				children: [
					{
						slug: "browser-use",
						title: "Overview",
						icon: "globe",
					},
					{
						slug: "browser-use/how-it-works",
						title: "How browser use works",
						icon: "layers",
					},
					{
						slug: "browser-use/quickstart",
						title: "Quickstart",
						icon: "zap",
					},
					{
						slug: "browser-use/live-viewer",
						title: "Live viewer",
						icon: "eye",
					},
					{
						slug: "browser-use/cdp",
						title: "Drive it over CDP",
						icon: "file",
					},
					{
						slug: "browser-use/integrations",
						title: "Integrations",
						icon: "blocks",
					},
					{
						slug: "browser-use/limits",
						title: "Limits, billing, and security",
						icon: "gauge",
					},
				]
			},
			{
				title: "Recipes",
				icon: "chef-hat",
				count: "5",
				children: [
					{
						slug: "cookbook",
						title: "All recipes",
						icon: "book-bookmark",
					},
					{
						slug: "cookbook/agent-builds-app",
						title: "Agent builds an app",
						icon: "bot",
					},
					{
						slug: "cookbook/agent-with-secrets",
						title: "Agent with secrets",
						icon: "lock",
					},
					{
						slug: "cookbook/streaming-code-execution",
						title: "Streaming code execution",
						icon: "square-terminal",
					},
					{
						slug: "cookbook/browser-agent",
						title: "Browser agent",
						icon: "app-window",
					},
				]
			},
		]
	},
	{
		title: "Computers",
		count: "26",
		items: [
			{
				title: "Basics",
				icon: "monitor",
				count: "7",
				children: [
					{
						slug: "computers/overview",
						title: "Overview",
						icon: "monitor",
					},
					{
						slug: "computers/anatomy",
						title: "Inside a Computer",
						icon: "cpu",
					},
					{
						slug: "computers/vs-sandbox",
						title: "Computers vs sandbox",
						icon: "scale",
					},
					{
						slug: "computers/fast-start",
						title: "Fast start and readiness",
						icon: "zap",
					},
					{
						slug: "computers/embedding",
						title: "Embedding and streaming",
						icon: "app-window",
					},
					{
						slug: "computers/lifecycle",
						title: "Lifecycle and sizing",
						icon: "rotate-ccw",
					},
					{
						slug: "computers/production-checklist",
						title: "Production checklist",
						icon: "list-checks",
					},
				]
			},
			{
				title: "Computer use",
				icon: "mouse-pointer-click",
				count: "6",
				children: [
					{
						slug: "computer-use",
						title: "Overview and concepts",
						icon: "monitor-smartphone",
					},
					{
						slug: "computer-use/quickstart",
						title: "Quickstart",
						icon: "zap",
					},
					{
						slug: "computer-use/api-reference",
						title: "API reference",
						icon: "code",
					},
					{
						slug: "computer-use/sdk-examples",
						title: "SDK examples",
						icon: "braces",
					},
					{
						slug: "computer-use/limits",
						title: "Limits",
						icon: "gauge",
					},
					{
						slug: "computer-use/vs-browser-use",
						title: "Computer use vs browser use: which to pick",
						icon: "scale",
					},
				]
			},
			{
				title: "Your own machines",
				icon: "server",
				count: "13",
				children: [
					{
						slug: "opencomputers",
						title: "OpenComputers",
						icon: "server",
					},
					{
						slug: "opencomputers/connect",
						title: "Connect your first host",
						icon: "plug",
					},
					{
						slug: "opencomputers/hosts",
						title: "Hosts and capabilities",
						icon: "server-cog",
					},
					{
						slug: "opencomputers/containers",
						title: "Containers on a host",
						icon: "container",
					},
					{
						slug: "opencomputers/meshes",
						title: "Meshes",
						icon: "network",
					},
					{
						slug: "opencomputers/gha-runners",
						title: "GitHub Actions runners",
						icon: "file",
					},
					{
						slug: "opencomputers/backups",
						title: "Backups and snapshots",
						icon: "archive-arrow-up",
					},
					{
						slug: "opencomputers/tunnels",
						title: "Tunnels and exposing services",
						icon: "cable",
					},
					{
						slug: "opencomputers/devices",
						title: "Devices",
						icon: "smartphone",
					},
					{
						slug: "opencomputers/security",
						title: "Security model",
						icon: "shield-check",
					},
					{
						slug: "opencomputers/billing",
						title: "Billing and limits",
						icon: "receipt",
					},
					{
						slug: "opencomputers/troubleshooting",
						title: "OpenComputers troubleshooting",
						icon: "life-buoy",
					},
					{
						slug: "opencomputers/reference",
						title: "API, CLI, and SDK reference",
						icon: "book-open",
					},
				]
			},
		]
	},
	{
		title: "Databases & storage",
		count: "11",
		items: [
			{
				slug: "data/overview",
				title: "Overview",
				icon: "puzzle",
			},
			{
				title: "Databases",
				icon: "database",
				count: "5",
				children: [
					{
						slug: "data/postgres",
						title: "Postgres",
						icon: "file",
					},
					{
						slug: "data/mysql",
						title: "MySQL",
						icon: "file",
					},
					{
						slug: "data/redis",
						title: "Redis cache",
						icon: "file",
					},
					{
						slug: "data/qdrant",
						title: "Qdrant vectors",
						icon: "file",
					},
					{
						slug: "data/mongodb",
						title: "MongoDB",
						icon: "braces",
					},
				]
			},
			{
				title: "Storage",
				icon: "hard-drive",
				count: "2",
				children: [
					{
						slug: "data/storage",
						title: "Storage and buckets",
						icon: "hard-drive",
					},
					{
						slug: "data/volumes",
						title: "Volumes",
						icon: "boxes",
					},
				]
			},
			{
				title: "Managed services",
				icon: "package",
				count: "3",
				children: [
					{
						slug: "data/auth",
						title: "Auth as a service",
						icon: "shield-check",
					},
					{
						slug: "data/email",
						title: "Transactional email",
						icon: "mail",
					},
					{
						slug: "data/fractal",
						title: "Fractal enterprise data",
						icon: "logo:/docs-assets/partners/fractal/fractal-mark.png",
					},
				]
			},
		]
	},
	{
		title: "Networking & domains",
		count: "7",
		items: [
			{
				slug: "services/domains",
				title: "Domains",
				icon: "compass",
			},
			{
				slug: "develop/previews",
				title: "Previews",
				icon: "eye",
			},
			{
				slug: "develop/sandboxes/internet-access",
				title: "Internet access and egress",
				icon: "flag",
			},
			{
				slug: "security/network",
				title: "Network access rules",
				icon: "network",
			},
			{
				slug: "services/middleware",
				title: "Edge middleware",
				icon: "route",
			},
			{
				slug: "services/protection",
				title: "Protection and WAF",
				icon: "fingerprint-pattern",
			},
			{
				slug: "data/public-endpoint",
				title: "Public database endpoint",
				icon: "cable",
			},
		]
	},
	{
		title: "Agents",
		count: "25",
		items: [
			{
				title: "Start here",
				icon: "hash",
				count: "6",
				children: [
					{
						slug: "guides/agent-operating-guide",
						title: "Operating guide for agents",
						icon: "scroll-text",
					},
					{
						slug: "guides/agent-capabilities",
						title: "What agents can do",
						icon: "lightbulb",
					},
					{
						slug: "guides/agent-cli-workflow",
						title: "Agent CLI workflow",
						icon: "square-terminal",
					},
					{
						slug: "guides/agent-safety",
						title: "Agent safety and status",
						icon: "shield-check",
					},
					{
						slug: "guides/agent",
						title: "Integrating an AI agent",
						icon: "bot",
					},
					{
						slug: "guides/configure-agent",
						title: "Configure an agent",
						icon: "settings-2",
					},
				]
			},
			{
				title: "Machines and harnesses",
				icon: "binary",
				count: "4",
				children: [
					{
						slug: "agents/chat-on-a-machine",
						title: "Chat with an agent on a machine",
						icon: "bot",
					},
					{
						slug: "agents/agent-studio",
						title: "Agent Studio",
						icon: "scroll-text",
					},
					{
						slug: "agents/harnesses",
						title: "Harnesses and auth",
						icon: "key-round",
					},
					{
						slug: "agents/confinement",
						title: "Agent confinement",
						icon: "book-open",
					},
				]
			},
			{
				title: "Runtime setup",
				icon: "settings-2",
				count: "4",
				children: [
					{
						slug: "guides/agent-runtime-routing",
						title: "Agent runtime routing",
						icon: "route",
					},
					{
						slug: "guides/skills",
						title: "Claude Code skills",
						icon: "file",
					},
					{
						slug: "adk",
						title: "Agent Development Kit (ADK)",
						icon: "puzzle",
					},
					{
						slug: "guides/runtime-env",
						title: "Agent runtime environment",
						icon: "variable",
					},
				]
			},
			{
				title: "Product patterns",
				icon: "shapes",
				count: "11",
				children: [
					{
						slug: "guides/agent-product-model",
						title: "Agent product model",
						icon: "shapes",
					},
					{
						slug: "guides/agent-company-reference-map",
						title: "Agent product reference map",
						icon: "book-bookmark",
					},
					{
						slug: "guides/build-agent-company",
						title: "Build an agent-company platform",
						icon: "building-complex",
					},
					{
						slug: "guides/agent-workflow-patterns",
						title: "Workflow patterns",
						icon: "waypoints",
					},
					{
						slug: "guides/agent-device-selection",
						title: "Choose an agent device",
						icon: "scan-search",
					},
					{
						slug: "guides/connect-agent-accounts",
						title: "Connect agent accounts",
						icon: "key-round",
					},
					{
						slug: "guides/agent-devices",
						title: "Agent device model",
						icon: "cpu",
					},
					{
						slug: "guides/agent-orchestration",
						title: "Agent orchestration",
						icon: "workflow",
					},
					{
						slug: "guides/agent-company-runtime-artifacts",
						title: "Runtime profiles and artifacts",
						icon: "package",
					},
					{
						slug: "guides/agent-orchestration/patterns",
						title: "Orchestration patterns",
						icon: "scroll-text",
					},
					{
						slug: "guides/agent-orchestration/examples",
						title: "Orchestration examples",
						icon: "puzzle",
					},
				]
			},
		]
	},
	{
		title: "Optimal",
		count: "12",
		items: [
			{
				title: "Use Optimal",
				icon: "layout-dashboard",
				count: "5",
				children: [
					{
						slug: "optimal",
						title: "What Optimal is",
						icon: "layout-dashboard",
					},
					{
						slug: "optimal/quickstart",
						title: "Quickstart",
						icon: "zap",
					},
					{
						slug: "optimal/chats",
						title: "Chats and modes",
						icon: "command",
					},
					{
						slug: "optimal/brains",
						title: "Brains and agents",
						icon: "bot",
					},
					{
						slug: "optimal/machines",
						title: "Build on your machines",
						icon: "server",
					},
				]
			},
			{
				title: "Control and cost",
				icon: "sliders-horizontal",
				count: "5",
				children: [
					{
						slug: "optimal/approvals",
						title: "Approvals",
						icon: "badge-check",
					},
					{
						slug: "optimal/workspace",
						title: "Tasks, artifacts and history",
						icon: "folder-tree",
					},
					{
						slug: "optimal/team-chats",
						title: "Team chats and sharing",
						icon: "users",
					},
					{
						slug: "optimal/pricing",
						title: "Pricing and usage",
						icon: "circle-dollar-sign",
					},
					{
						slug: "optimal/isolation",
						title: "Isolation and permissions",
						icon: "shield-check",
					},
				]
			},
			{
				slug: "optimal/api",
				title: "Optimal API",
				icon: "braces",
			},
			{
				slug: "optimal/troubleshooting",
				title: "Troubleshooting",
				icon: "life-buoy",
			},
		]
	},
	{
		title: "Optimal Engine",
		count: "12",
		items: [
			{
				title: "Learn the Engine",
				icon: "book-bookmark",
				count: "3",
				children: [
					{
						slug: "optimal-engine",
						title: "What Optimal Engine is",
						icon: "database",
					},
					{
						slug: "optimal-engine/concepts",
						title: "Concepts",
						icon: "lightbulb",
					},
					{
						slug: "optimal-engine/quickstart",
						title: "Quickstart",
						icon: "zap",
					},
				]
			},
			{
				title: "Run it yourself",
				icon: "server-cog",
				count: "2",
				children: [
					{
						slug: "optimal-engine/install",
						title: "Install and configure",
						icon: "download",
					},
					{
						slug: "optimal-engine/operations",
						title: "Operations",
						icon: "archive-arrow-up",
					},
				]
			},
			{
				title: "Use the Engine",
				icon: "receipt",
				count: "3",
				children: [
					{
						slug: "optimal-engine/ingestion",
						title: "Sources and ingestion",
						icon: "cloud-upload",
					},
					{
						slug: "optimal-engine/memory-and-retrieval",
						title: "Memory and retrieval",
						icon: "scan-search",
					},
					{
						slug: "optimal-engine/agents-and-workflows",
						title: "Agents and workflows",
						icon: "bot",
					},
				]
			},
			{
				title: "Engine reference",
				icon: "badge-check",
				count: "2",
				children: [
					{
						slug: "optimal-engine/api",
						title: "API reference",
						icon: "braces",
					},
					{
						slug: "optimal-engine/cli-sdks-mcp",
						title: "CLI, SDKs and MCP",
						icon: "square-terminal",
					},
				]
			},
			{
				slug: "optimal-engine/miosa",
				title: "Optimal Engine on MIOSA",
				icon: "cloud",
			},
			{
				slug: "optimal-engine/troubleshooting",
				title: "Troubleshooting",
				icon: "wrench",
			},
		]
	},
	{
		title: "Platform builders",
		count: "26",
		items: [
			{
				title: "Start here",
				icon: "share-2",
				count: "8",
				children: [
					{
						slug: "integrations",
						title: "Overview",
						icon: "building-complex",
					},
					{
						slug: "platform/overview",
						title: "Platform builder guide",
						icon: "layers",
					},
					{
						slug: "platform/patterns",
						title: "Patterns",
						icon: "shapes",
					},
					{
						slug: "platform/agents-in-your-product",
						title: "Agents in your product",
						icon: "bot",
					},
					{
						slug: "platform/templates-and-sizing",
						title: "Templates and sizing",
						icon: "ruler",
					},
					{
						slug: "integrations/backend-orchestration",
						title: "Backend orchestration",
						icon: "workflow",
					},
					{
						slug: "integrations/examples",
						title: "Example applications",
						icon: "component",
					},
					{
						slug: "guides/internal-business-os",
						title: "Build an internal Business OS",
						icon: "layout-dashboard",
					},
				]
			},
			{
				title: "Customer identity",
				icon: "link",
				count: "3",
				children: [
					{
						slug: "platform/attribution",
						title: "Ownership and attribution",
						icon: "badge-check",
					},
					{
						slug: "platform/browser-tokens",
						title: "Browser access tokens",
						icon: "ticket",
					},
					{
						slug: "security/white-label",
						title: "End-user credentials and OAuth",
						icon: "shield-check",
					},
				]
			},
			{
				title: "Branding, events, metering",
				icon: "palette",
				count: "3",
				children: [
					{
						slug: "platform/white-label",
						title: "White-label setup",
						icon: "palette",
					},
					{
						slug: "integrations/webhooks",
						title: "Webhooks",
						icon: "webhook",
					},
					{
						slug: "platform/agent-credit-metering",
						title: "Agent credit metering",
						icon: "gauge",
					},
				]
			},
			{
				title: "Recipes",
				icon: "siren",
				count: "6",
				children: [
					{
						slug: "cookbook",
						title: "All recipes",
						icon: "book-bookmark",
					},
					{
						slug: "cookbook/multi-tenant-saas",
						title: "Multi-tenant SaaS",
						icon: "palette",
					},
					{
						slug: "cookbook/per-user-quotas-billing",
						title: "Per-user quotas and billing",
						icon: "credit-card",
					},
					{
						slug: "cookbook/embed-sandbox-iframe",
						title: "Embed a sandbox iframe",
						icon: "box",
					},
					{
						slug: "cookbook/sandbox-events-realtime",
						title: "Realtime sandbox events",
						icon: "scroll-text",
					},
					{
						slug: "cookbook/build-virtual-device-product",
						title: "Build a virtual device product",
						icon: "monitor",
					},
				]
			},
			{
				title: "UI components",
				icon: "layout-grid",
				count: "6",
				children: [
					{
						slug: "ui-components",
						title: "Overview",
						icon: "layout-dashboard",
					},
					{
						slug: "component-library",
						title: "Foundation UI library",
						icon: "layout-grid",
					},
					{
						slug: "ui-components/foundation",
						title: "Foundation packages",
						icon: "package",
					},
					{
						slug: "ui-components/react",
						title: "React",
						icon: "file",
					},
					{
						slug: "ui-components/vue",
						title: "Vue",
						icon: "file",
					},
					{
						slug: "ui-components/svelte",
						title: "Svelte",
						icon: "file",
					},
				]
			},
		]
	},
	{
		title: "Build",
		count: "68",
		items: [
			{
				slug: "build",
				title: "Build an app like...",
				icon: "file-text",
			},
			{
				title: "AI app builders",
				icon: "hammer",
				count: "9",
				children: [
					{
						slug: "build/lovable",
						title: "Lovable",
						icon: "logo:/docs-assets/brands/lovable.svg",
					},
					{
						slug: "build/bolt",
						title: "Bolt",
						icon: "logo:/docs-assets/brands/bolt.svg",
					},
					{
						slug: "build/v0",
						title: "v0",
						icon: "logo:/docs-assets/brands/v0.svg",
					},
					{
						slug: "build/replit",
						title: "Replit Agent",
						icon: "logo:/docs-assets/brands/replit.svg",
					},
					{
						slug: "build/base44",
						title: "Base44",
						icon: "logo:/docs-assets/brands/base44.png",
					},
					{
						slug: "build/emergent",
						title: "Emergent",
						icon: "logo:/docs-assets/brands/emergent.png",
					},
					{
						slug: "build/rork",
						title: "Rork",
						icon: "logo:/docs-assets/brands/rork.png",
					},
					{
						slug: "build/anything",
						title: "Anything",
						icon: "logo:/docs-assets/brands/anything.png",
					},
					{
						slug: "build/same-new",
						title: "Same.new",
						icon: "logo:/docs-assets/brands/same-new.png",
					},
				]
			},
			{
				title: "Run coding agents",
				icon: "code",
				count: "9",
				children: [
					{
						slug: "build/run-agents",
						title: "Run agents in the cloud",
						icon: "logo:/docs-assets/brands/miosa.svg",
					},
					{
						slug: "build/claude-code",
						title: "Claude Code",
						icon: "file",
					},
					{
						slug: "build/codex",
						title: "Codex",
						icon: "file",
					},
					{
						slug: "build/cursor",
						title: "Cursor",
						icon: "file",
					},
					{
						slug: "build/windsurf",
						title: "Windsurf",
						icon: "logo:/docs-assets/brands/windsurf.svg",
					},
					{
						slug: "build/github-copilot",
						title: "GitHub Copilot",
						icon: "logo:/docs-assets/brands/githubcopilot.svg",
					},
					{
						slug: "build/openhands",
						title: "OpenHands",
						icon: "logo:/docs-assets/brands/openhands.svg",
					},
					{
						slug: "build/cline",
						title: "Cline",
						icon: "logo:/docs-assets/brands/cline.svg",
					},
					{
						slug: "build/coding-agent-product",
						title: "Build a coding-agent product",
						icon: "logo:/docs-assets/brands/miosa.svg",
					},
				]
			},
			{
				title: "Autonomous agents",
				icon: "waypoints",
				count: "4",
				children: [
					{
						slug: "build/manus",
						title: "Manus",
						icon: "logo:/docs-assets/brands/manus.svg",
					},
					{
						slug: "build/genspark",
						title: "Genspark",
						icon: "logo:/docs-assets/brands/genspark.png",
					},
					{
						slug: "build/devin",
						title: "Devin",
						icon: "logo:/docs-assets/brands/devin.svg",
					},
					{
						slug: "build/claude-cowork",
						title: "Claude Cowork",
						icon: "file",
					},
				]
			},
			{
				title: "Browser and computer-use agents",
				icon: "app-window",
				count: "4",
				children: [
					{
						slug: "build/chatgpt-agent",
						title: "Build your own browser agent",
						icon: "mouse-pointer-click",
					},
					{
						slug: "build/polar",
						title: "Polar",
						icon: "logo:/docs-assets/brands/polar.svg",
					},
					{
						slug: "build/browser-use",
						title: "Browser Use",
						icon: "logo:/docs-assets/brands/browser-use.png",
					},
					{
						slug: "build/stagehand",
						title: "Stagehand",
						icon: "logo:/docs-assets/brands/stagehand.png",
					},
				]
			},
			{
				title: "AI chat and companions",
				icon: "key-round",
				count: "7",
				children: [
					{
						slug: "build/dots",
						title: "dots",
						icon: "logo:/docs-assets/brands/dots.svg",
					},
					{
						slug: "build/grok-bot",
						title: "Grok Bot",
						icon: "logo:/docs-assets/brands/grokbot.png",
					},
					{
						slug: "build/meta-muse",
						title: "Meta Muse",
						icon: "logo:/docs-assets/brands/meta.svg",
					},
					{
						slug: "build/character-ai",
						title: "Character.AI",
						icon: "logo:/docs-assets/brands/characterai.png",
					},
					{
						slug: "build/replika",
						title: "Replika",
						icon: "logo:/docs-assets/brands/replika.png",
					},
					{
						slug: "build/pi",
						title: "Pi",
						icon: "logo:/docs-assets/brands/pi.png",
					},
					{
						slug: "build/openclaw",
						title: "OpenClaw",
						icon: "logo:/docs-assets/brands/openclaw.svg",
					},
				]
			},
			{
				title: "Answer engines",
				icon: "scan-search",
				count: "5",
				children: [
					{
						slug: "build/perplexity",
						title: "Perplexity",
						icon: "logo:/docs-assets/brands/perplexity.svg",
					},
					{
						slug: "build/comet",
						title: "Perplexity Comet",
						icon: "logo:/docs-assets/brands/perplexity.svg",
					},
					{
						slug: "build/you-com",
						title: "You.com search and answer API",
						icon: "logo:/docs-assets/brands/you.png",
					},
					{
						slug: "build/phind",
						title: "Phind",
						icon: "search-code",
					},
					{
						slug: "build/deep-research",
						title: "ChatGPT deep research",
						icon: "file",
					},
				]
			},
			{
				title: "Multi-agent",
				icon: "monitor-smartphone",
				count: "3",
				children: [
					{
						slug: "build/openswarm",
						title: "OpenSwarm",
						icon: "logo:/docs-assets/brands/openswarm.png",
					},
					{
						slug: "build/hermes-agent",
						title: "Hermes Agent",
						icon: "logo:/docs-assets/brands/hermes.png",
					},
					{
						slug: "build/gemini-agent",
						title: "Delegating orchestrator",
						icon: "workflow",
					},
				]
			},
			{
				title: "Voice agents",
				icon: "radio",
				count: "6",
				children: [
					{
						slug: "build/elevenlabs",
						title: "ElevenLabs",
						icon: "logo:/docs-assets/brands/elevenlabs.svg",
					},
					{
						slug: "build/vapi",
						title: "Vapi",
						icon: "logo:/docs-assets/brands/vapi.png",
					},
					{
						slug: "build/retell",
						title: "Retell AI",
						icon: "logo:/docs-assets/brands/retell.png",
					},
					{
						slug: "build/bland",
						title: "Bland AI",
						icon: "logo:/docs-assets/brands/bland.png",
					},
					{
						slug: "build/pipecat",
						title: "Pipecat",
						icon: "logo:/docs-assets/brands/pipecat.png",
					},
					{
						slug: "build/livekit-agents",
						title: "LiveKit Agents",
						icon: "logo:/docs-assets/brands/livekit.svg",
					},
				]
			},
			{
				title: "AI design tools",
				icon: "folder-git-2",
				count: "3",
				children: [
					{
						slug: "build/figma-make",
						title: "Prompt-to-UI tool",
						icon: "logo:/docs-assets/brands/figma.svg",
					},
					{
						slug: "build/uizard",
						title: "Sketch-to-mockup tool",
						icon: "logo:/docs-assets/brands/uizard.png",
					},
					{
						slug: "build/magic-patterns",
						title: "Magic Patterns",
						icon: "logo:/docs-assets/brands/magic-patterns.png",
					},
				]
			},
			{
				title: "AI video and creative",
				icon: "bot",
				count: "6",
				children: [
					{
						slug: "build/runway",
						title: "Video generation",
						icon: "logo:/docs-assets/brands/runway.png",
					},
					{
						slug: "build/sora",
						title: "Text to video",
						icon: "file",
					},
					{
						slug: "build/heygen",
						title: "Avatar video",
						icon: "logo:/docs-assets/brands/heygen.png",
					},
					{
						slug: "build/higgsfield",
						title: "Higgsfield",
						icon: "logo:/docs-assets/brands/higgsfield.svg",
					},
					{
						slug: "build/gamma",
						title: "Gamma",
						icon: "logo:/docs-assets/brands/gamma.svg",
					},
					{
						slug: "build/descript",
						title: "Descript",
						icon: "logo:/docs-assets/brands/descript.png",
					},
				]
			},
			{
				title: "Vertical AI apps",
				icon: "store",
				count: "5",
				children: [
					{
						slug: "build/intercom-fin",
						title: "Intercom Fin",
						icon: "logo:/docs-assets/brands/intercom.svg",
					},
					{
						slug: "build/decagon",
						title: "Decagon",
						icon: "logo:/docs-assets/brands/decagon.png",
					},
					{
						slug: "build/clay",
						title: "Clay",
						icon: "logo:/docs-assets/brands/clay.png",
					},
					{
						slug: "build/gong",
						title: "Post-call analysis",
						icon: "logo:/docs-assets/brands/gong.png",
					},
					{
						slug: "build/openevidence",
						title: "OpenEvidence",
						icon: "logo:/docs-assets/brands/openevidence.png",
					},
				]
			},
			{
				title: "Internal company apps",
				icon: "cloud-upload",
				count: "6",
				children: [
					{
						slug: "build/business-os",
						title: "Internal Business OS",
						icon: "logo:/docs-assets/brands/miosa.svg",
					},
					{
						slug: "build/team-ai-workspace",
						title: "Internal AI workspace",
						icon: "layout-dashboard",
					},
					{
						slug: "build/ops-support-copilot",
						title: "Ops and support copilot",
						icon: "life-buoy",
					},
					{
						slug: "build/internal-tools-builder",
						title: "Internal tools builder",
						icon: "layout-grid",
					},
					{
						slug: "build/knowledge-base-agent",
						title: "Knowledge-base agent",
						icon: "book-bookmark",
					},
					{
						slug: "build/employee-onboarding-agent",
						title: "Employee onboarding agent",
						icon: "clipboard-list",
					},
				]
			},
		]
	},
	{
		title: "CLI, SDKs & MCP",
		count: "33",
		items: [
			{
				slug: "cli/cli-vs-mcp",
				title: "CLI or MCP: which to use",
				icon: "scale",
			},
			{
				title: "CLI",
				icon: "terminal",
				count: "14",
				children: [
					{
						slug: "cli",
						title: "CLI overview",
						icon: "terminal",
					},
					{
						slug: "cli/install",
						title: "Install the CLI or SDK",
						icon: "download",
					},
					{
						slug: "cli/account",
						title: "Account and environment",
						icon: "user-cog",
					},
					{
						slug: "cli/machines",
						title: "Machines and lifecycle",
						icon: "server",
					},
					{
						slug: "cli/work-inside",
						title: "Run commands and move files",
						icon: "square-terminal",
					},
					{
						slug: "cli/snapshots",
						title: "Snapshots, checkpoints and restore",
						icon: "camera",
					},
					{
						slug: "cli/environments",
						title: "Environments",
						icon: "variable",
					},
					{
						slug: "cli/agents",
						title: "Agents, chats and runs",
						icon: "bot",
					},
					{
						slug: "cli/platform",
						title: "Platform resources",
						icon: "blocks",
					},
					{
						slug: "cli/access-billing",
						title: "Access, org and billing",
						icon: "credit-card",
					},
					{
						slug: "cli/api",
						title: "Raw API access",
						icon: "command",
					},
					{
						slug: "cli/config",
						title: "Config and profiles",
						icon: "sliders-horizontal",
					},
					{
						slug: "cli/scripting",
						title: "JSON output and scripting",
						icon: "square-chevron-right",
					},
					{
						slug: "cli/devices",
						title: "Devices",
						icon: "cpu",
					},
				]
			},
			{
				title: "SDKs",
				icon: "file-code",
				count: "8",
				children: [
					{
						slug: "sdks",
						title: "Overview",
						icon: "blocks",
					},
					{
						slug: "sdks/typescript",
						title: "TypeScript",
						icon: "file",
					},
					{
						slug: "sdks/python",
						title: "Python",
						icon: "file",
					},
					{
						slug: "sdks/go",
						title: "Go",
						icon: "file",
					},
					{
						slug: "sdks/elixir",
						title: "Elixir",
						icon: "file",
					},
					{
						slug: "sdks/java",
						title: "Java",
						icon: "file",
					},
					{
						slug: "sdks/rust",
						title: "Rust",
						icon: "file",
					},
					{
						slug: "sdks/egress",
						title: "Secrets & network (all SDKs)",
						icon: "shield",
					},
				]
			},
			{
				title: "MCP",
				icon: "file",
				count: "10",
				children: [
					{
						slug: "mcp",
						title: "MCP overview",
						icon: "file",
					},
					{
						slug: "mcp/install",
						title: "Install and connect",
						icon: "file",
					},
					{
						slug: "mcp/tools",
						title: "Tools reference",
						icon: "file",
					},
					{
						slug: "mcp/tools/sandboxes",
						title: "Sandbox tools",
						icon: "file",
					},
					{
						slug: "mcp/tools/computers",
						title: "Computer tools",
						icon: "file",
					},
					{
						slug: "mcp/tools/deployments",
						title: "Deployment tools",
						icon: "file",
					},
					{
						slug: "mcp/tools/data",
						title: "Data tools",
						icon: "file",
					},
					{
						slug: "mcp/tools/platform",
						title: "Platform tools",
						icon: "file",
					},
					{
						slug: "mcp/advanced",
						title: "Advanced MCP setup",
						icon: "file",
					},
					{
						slug: "mcp/catalog",
						title: "Tool server catalog",
						icon: "store",
					},
				]
			},
		]
	},
	{
		title: "API reference",
		count: "56",
		items: [
			{
				title: "Using the API",
				icon: "building-complex",
				count: "9",
				children: [
					{
						slug: "authentication",
						title: "Authentication",
						icon: "key-round",
					},
					{
						title: "API fundamentals",
						icon: "folder-git-2",
						count: "6",
						children: [
							{
								slug: "fundamentals",
								title: "Overview",
								icon: "compass",
							},
							{
								slug: "fundamentals/authentication",
								title: "Authentication",
								icon: "key-round",
							},
							{
								slug: "fundamentals/requests",
								title: "Requests, limits, and errors",
								icon: "gauge",
							},
							{
								slug: "fundamentals/events",
								title: "Events (SSE)",
								icon: "radio",
							},
							{
								slug: "fundamentals/attribution",
								title: "Ownership and external attribution",
								icon: "badge-check",
							},
							{
								slug: "fundamentals/tenant-config",
								title: "Tenant configuration",
								icon: "settings-2",
							},
						]
					},
					{
						slug: "rate-limits",
						title: "Rate limits",
						icon: "gauge",
					},
					{
						slug: "regions",
						title: "Regions",
						icon: "map-pin",
					},
				]
			},
			{
				title: "Overview",
				icon: "settings",
				count: "5",
				children: [
					{
						slug: "api-reference",
						title: "Introduction",
						icon: "compass",
					},
					{
						slug: "api",
						title: "Interactive API explorer",
						icon: "play",
					},
					{
						slug: "api-reference/errors",
						title: "Error codes",
						icon: "triangle-alert",
					},
					{
						slug: "api-reference/events",
						title: "Events (SSE)",
						icon: "radio",
					},
					{
						slug: "api-reference/regions",
						title: "Region endpoints",
						icon: "map-pin",
					},
				]
			},
			{
				title: "Sandboxes",
				icon: "rotate-ccw-clock",
				count: "15",
				children: [
					{
						slug: "api-reference/sandboxes",
						title: "Sandboxes overview",
						icon: "box",
					},
					{
						slug: "api-reference/sandboxes/create",
						title: "Create and run",
						icon: "circle-plus",
					},
					{
						slug: "api-reference/sandboxes/manage",
						title: "Manage sandboxes",
						icon: "sliders-horizontal",
					},
					{
						slug: "api-reference/previews",
						title: "Previews",
						icon: "eye",
					},
					{
						slug: "api-reference/exec",
						title: "Exec",
						icon: "square-terminal",
					},
					{
						slug: "api-reference/streaming-exec",
						title: "Streaming exec",
						icon: "activity",
					},
					{
						slug: "api-reference/filesystem",
						title: "Filesystem (computers)",
						icon: "folder-tree",
					},
					{
						slug: "api-reference/files",
						title: "Files (upload and download)",
						icon: "hard-drive-download",
					},
					{
						slug: "api-reference/sandbox-files-advanced",
						title: "Files (tree, batch, watch)",
						icon: "files",
					},
					{
						slug: "api-reference/sandbox-processes",
						title: "Processes",
						icon: "cpu",
					},
					{
						slug: "api-reference/sandbox-env",
						title: "Sandbox variables",
						icon: "variable",
					},
					{
						slug: "api-reference/snapshots",
						title: "Snapshots",
						icon: "camera",
					},
					{
						slug: "api-reference/sandbox-templates",
						title: "Sandbox templates",
						icon: "layout-template",
					},
					{
						slug: "api-reference/sandbox-shares",
						title: "Sandbox shares",
						icon: "share-2",
					},
					{
						slug: "api-reference/preview-tokens",
						title: "Preview tokens",
						icon: "ticket",
					},
				]
			},
			{
				title: "Computers",
				icon: "shield",
				count: "5",
				children: [
					{
						slug: "api-reference/computers",
						title: "Computers",
						icon: "monitor",
					},
					{
						slug: "api-reference/desktop",
						title: "Desktop",
						icon: "mouse-pointer-click",
					},
					{
						slug: "api-reference/open-computers",
						title: "OpenComputers",
						icon: "server-cog",
					},
					{
						slug: "api-reference/cloud",
						title: "Cloud and BYOC",
						icon: "cloud-cog",
					},
					{
						slug: "api-reference/services",
						title: "Services (systemd)",
						icon: "wrench",
					},
				]
			},
			{
				title: "Agents",
				icon: "lock",
				count: "4",
				children: [
					{
						slug: "api-reference/agent-runs",
						title: "Agent runs",
						icon: "bot",
					},
					{
						slug: "api-reference/agent-run-groups",
						title: "Agent run groups",
						icon: "blocks",
					},
					{
						slug: "api-reference/agent-runtime-profiles",
						title: "Agent runtime profiles",
						icon: "user-cog",
					},
					{
						slug: "api-reference/runtime-env",
						title: "Agent runtime variables",
						icon: "key-round",
					},
				]
			},
			{
				title: "Deployments",
				icon: "layout-template",
				count: "6",
				children: [
					{
						slug: "api-reference/deployments",
						title: "Deployments",
						icon: "cloud-upload",
					},
					{
						slug: "api-reference/docker-deploy",
						title: "Docker Host",
						icon: "container",
					},
					{
						slug: "api-reference/versions",
						title: "Versions",
						icon: "git-branch",
					},
					{
						slug: "api-reference/releases",
						title: "Releases",
						icon: "package",
					},
					{
						slug: "api-reference/databases",
						title: "Databases",
						icon: "database",
					},
					{
						slug: "api-reference/custom-domains",
						title: "Custom domains",
						icon: "globe-lock",
					},
				]
			},
			{
				title: "Workspace and usage",
				icon: "files",
				count: "6",
				children: [
					{
						slug: "api-reference/projects",
						title: "Projects",
						icon: "folder-git-2",
					},
					{
						slug: "api-reference/invites",
						title: "Invites",
						icon: "user-plus",
					},
					{
						slug: "api-reference/credits",
						title: "Credits",
						icon: "credit-card",
					},
					{
						slug: "api-reference/quotas",
						title: "Quotas",
						icon: "gauge",
					},
					{
						slug: "api-reference/usage-rollup",
						title: "Usage rollup",
						icon: "activity",
					},
					{
						slug: "api-reference/audit-log",
						title: "Audit log",
						icon: "scroll-text",
					},
				]
			},
			{
				title: "Platform builders",
				icon: "webhook",
				count: "6",
				children: [
					{
						slug: "api-reference/webhooks",
						title: "Webhooks",
						icon: "webhook",
					},
					{
						slug: "api-reference/tenant-branding",
						title: "Organization branding",
						icon: "palette",
					},
					{
						slug: "api-reference/tenant-preview-domain",
						title: "Organization preview domain",
						icon: "earth",
					},
					{
						slug: "api-reference/tenant-events",
						title: "Organization events (SSE)",
						icon: "megaphone",
					},
					{
						slug: "api-reference/network-policy",
						title: "Network policy (per computer)",
						icon: "shield",
					},
					{
						slug: "api-reference/egress",
						title: "Egress vault and allowlist",
						icon: "scroll-text",
					},
				]
			},
		]
	},
	{
		title: "Organization & billing",
		count: "6",
		items: [
			{
				slug: "api-reference/workspaces",
				title: "Workspaces",
				icon: "credit-card",
			},
			{
				slug: "api-reference/members",
				title: "Members and invites",
				icon: "users",
			},
			{
				slug: "platform/api-keys",
				title: "API keys",
				icon: "user-plus",
			},
			{
				title: "Billing and limits",
				icon: "mail",
				count: "3",
				children: [
					{
						slug: "pricing",
						title: "Pricing and limits",
						icon: "tags",
					},
					{
						slug: "plans-and-limits",
						title: "Plans and limits",
						icon: "receipt",
					},
					{
						slug: "platform/usage-and-billing",
						title: "Billing and usage",
						icon: "scroll-text",
					},
				]
			},
		]
	},
	{
		title: "Security & compliance",
		count: "6",
		items: [
			{
				slug: "security",
				title: "Security overview",
				icon: "activity",
			},
			{
				slug: "security/api-keys",
				title: "API key scopes and rotation",
				icon: "triangle-alert",
			},
			{
				slug: "security/audit-log",
				title: "Audit log",
				icon: "rotate-ccw",
			},
			{
				slug: "data-retention",
				title: "Data retention and deletion",
				icon: "clipboard-list",
			},
			{
				slug: "infrastructure/shared-responsibility",
				title: "Shared responsibility",
				icon: "flask-conical",
			},
			{
				slug: "security/troubleshooting",
				title: "Security troubleshooting",
				icon: "search-code",
			},
		]
	},
	{
		title: "Self-hosting",
		count: "6",
		items: [
			{
				slug: "infrastructure/overview",
				title: "Infrastructure options",
				icon: "ticket",
			},
			{
				title: "Bring your own cloud",
				icon: "boxes",
				count: "3",
				children: [
					{
						slug: "infrastructure/byoc/overview",
						title: "Bring your own cloud",
						icon: "cloud",
					},
					{
						slug: "infrastructure/byoc/aws",
						title: "AWS",
						icon: "file",
					},
					{
						slug: "infrastructure/byoc/gcp",
						title: "Google Cloud",
						icon: "file",
					},
				]
			},
			{
				slug: "integrations/external-computers",
				title: "External computer providers",
				icon: "component",
			},
			{
				slug: "integrations/comparison",
				title: "Compare compute providers",
				icon: "globe-lock",
			},
		]
	},
	{
		title: "Compare",
		count: "15",
		items: [
			{
				slug: "compare",
				title: "MIOSA vs other platforms",
				icon: "earth",
			},
			{
				title: "App hosting",
				icon: "map-pin",
				count: "3",
				children: [
					{
						slug: "compare/railway",
						title: "MIOSA vs Railway",
						icon: "logo:/docs-assets/brands/railway.svg",
					},
					{
						slug: "compare/render",
						title: "MIOSA vs Render",
						icon: "logo:/docs-assets/brands/render.svg",
					},
					{
						slug: "compare/fly",
						title: "MIOSA vs Fly.io",
						icon: "logo:/docs-assets/brands/fly.svg",
					},
				]
			},
			{
				title: "Sandboxes and agent compute",
				icon: "shield-check",
				count: "11",
				children: [
					{
						slug: "compare/e2b",
						title: "MIOSA vs E2B",
						icon: "logo:/docs-assets/brands/e2b.svg",
					},
					{
						slug: "compare/daytona",
						title: "MIOSA vs Daytona",
						icon: "logo:/docs-assets/brands/daytona.svg",
					},
					{
						slug: "compare/modal",
						title: "MIOSA vs Modal",
						icon: "logo:/docs-assets/brands/modal.svg",
					},
					{
						slug: "compare/vercel",
						title: "MIOSA vs Vercel Sandbox",
						icon: "logo:/docs-assets/brands/vercel.svg",
					},
					{
						slug: "compare/cloudflare",
						title: "MIOSA vs Cloudflare Sandboxes",
						icon: "file",
					},
					{
						slug: "compare/freestyle",
						title: "MIOSA vs Freestyle",
						icon: "logo:/docs-assets/brands/freestyle.svg",
					},
					{
						slug: "compare/runloop",
						title: "MIOSA vs Runloop",
						icon: "logo:/docs-assets/brands/runloop.svg",
					},
					{
						slug: "compare/blaxel",
						title: "MIOSA vs Blaxel",
						icon: "logo:/docs-assets/brands/blaxel.svg",
					},
					{
						slug: "compare/beam",
						title: "MIOSA vs Beam",
						icon: "logo:/docs-assets/brands/beam.svg",
					},
					{
						slug: "compare/boat",
						title: "MIOSA vs boat",
						icon: "logo:/docs-assets/brands/boat.svg",
					},
					{
						slug: "compare/codesandbox",
						title: "MIOSA vs CodeSandbox",
						icon: "logo:/docs-assets/brands/codesandbox.svg",
					},
				]
			},
		]
	},
	{
		title: "Reference",
		count: "9",
		items: [
			{
				slug: "changelog",
				title: "Release notes",
				icon: "ship",
			},
			{
				title: "Migrate",
				icon: "layers-2",
				count: "3",
				children: [
					{
						slug: "migrate/railway",
						title: "Move from Railway",
						icon: "hard-drive-download",
					},
					{
						slug: "migrate/vercel",
						title: "Moving from Vercel",
						icon: "package-open",
					},
					{
						slug: "migrating-from-miosa-sandbox",
						title: "Migrating from miosa-sandbox",
						icon: "scroll-text",
					},
				]
			},
			{
				title: "Reliability",
				icon: "archive-arrow-up",
				count: "5",
				children: [
					{
						slug: "availability",
						title: "Availability and roadmap",
						icon: "gauge",
					},
					{
						slug: "known-limitations",
						title: "Known limitations",
						icon: "triangle-alert",
					},
					{
						slug: "operations/recovery",
						title: "Recovery playbooks",
						icon: "siren",
					},
					{
						slug: "evaluations",
						title: "Evaluations",
						icon: "flask-conical",
					},
					{
						slug: "benchmarks",
						title: "Benchmarks",
						icon: "scroll-text",
					},
				]
			},
		]
	},
	{
		title: "Help",
		count: "13",
		items: [
			{
				title: "FAQ",
				icon: "smartphone",
				count: "11",
				children: [
					{
						slug: "faq",
						title: "Overview",
						icon: "book-bookmark",
					},
					{
						slug: "faq/getting-started",
						title: "Getting started",
						icon: "rocket",
					},
					{
						slug: "faq/sandboxes-and-computers",
						title: "Sandboxes and computers",
						icon: "box",
					},
					{
						slug: "faq/browser-and-computer-use",
						title: "Browser and computer use",
						icon: "app-window",
					},
					{
						slug: "faq/agents",
						title: "Agents",
						icon: "bot",
					},
					{
						slug: "faq/runtimes",
						title: "SOMA and runtimes (early access)",
						icon: "cpu",
					},
					{
						slug: "faq/white-label",
						title: "White-label and platform builders",
						icon: "palette",
					},
					{
						slug: "faq/business-os",
						title: "Business OS and internal use",
						icon: "layout-dashboard",
					},
					{
						slug: "faq/security-and-compliance",
						title: "Security and compliance",
						icon: "shield-check",
					},
					{
						slug: "faq/pricing-and-limits",
						title: "Pricing and limits",
						icon: "receipt",
					},
					{
						slug: "faq/support",
						title: "Support",
						icon: "life-buoy",
					},
				]
			},
			{
				slug: "troubleshooting",
				title: "Troubleshooting",
				icon: "circle-plus",
			},
			{
				slug: "support",
				title: "Support",
				icon: "user-cog",
			},
		]
	},
	{
		title: "Xici",
		titleZh: "系辞",
		items: [
			{
				slug: "xici/overview",
				title: "Overview",
				titleZh: "导读",
				icon: "book-open",
			},
			{
				title: "Canon and commentary",
				titleZh: "本传与本注",
				icon: "scroll-text",
				count: "6",
				children: [
					{ slug: "xici/canon", title: "The Canon", titleZh: "本传二十章", icon: "book-open" },
					{ slug: "xici/commentary/01-dao-vessel", title: "Book I: the Way and the Vessel", titleZh: "卷一：道器与算子", icon: "layers" },
					{ slug: "xici/commentary/02-dynamics", title: "Book II: transition and emergence", titleZh: "卷二：变通与不测", icon: "activity" },
					{ slug: "xici/commentary/03-representation", title: "Book III: the simulacrum", titleZh: "卷三：法象与同构", icon: "shapes" },
					{ slug: "xici/commentary/04-compression", title: "Book IV: compression and the incipient", titleZh: "卷四：易简与研几", icon: "gauge" },
					{ slug: "xici/commentary/05-alignment", title: "Book V: timing and errancy", titleZh: "卷五：趣时与无妄", icon: "scale" }
				]
			},
			{
				title: "Formal apparatus",
				titleZh: "形式系统",
				icon: "variable",
				count: "2",
				children: [
					{ slug: "xici/lexicon", title: "Lexicon", titleZh: "术语映射表", icon: "file-text" },
					{ slug: "xici/equations", title: "Symbols and equations", titleZh: "符号与主方程", icon: "variable" }
				]
			}
		]
	},
];
export const generatedNavItems = generatedNavigation.flatMap((group) => {
	const walk = (items: NavNode[]): NavItem[] => items.flatMap((item: NavNode) =>
		item.children
			? [...walk(item.children)]
			: [{ ...item, group: group.title, href: `/docs${item.slug ? '/' + item.slug : ''}` }]
	);
	return walk(group.items);
});
