import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import light from '@shikijs/themes/github-light';
import dark from '@shikijs/themes/github-dark-dimmed';

/**
 * Grammars are imported on demand: a page that shows one bash block downloads
 * one small grammar instead of every language the docs mention.
 */
const LANG_LOADERS: Record<string, () => Promise<unknown>> = {
	bash: () => import('@shikijs/langs/bash'),
	typescript: () => import('@shikijs/langs/typescript'),
	javascript: () => import('@shikijs/langs/javascript'),
	python: () => import('@shikijs/langs/python'),
	json: () => import('@shikijs/langs/json'),
	go: () => import('@shikijs/langs/go'),
	elixir: () => import('@shikijs/langs/elixir'),
	java: () => import('@shikijs/langs/java'),
	yaml: () => import('@shikijs/langs/yaml'),
	rust: () => import('@shikijs/langs/rust'),
	sql: () => import('@shikijs/langs/sql'),
	http: () => import('@shikijs/langs/http'),
	html: () => import('@shikijs/langs/html'),
	css: () => import('@shikijs/langs/css'),
	xml: () => import('@shikijs/langs/xml'),
	toml: () => import('@shikijs/langs/toml'),
	dockerfile: () => import('@shikijs/langs/dockerfile'),
	ini: () => import('@shikijs/langs/ini'),
	powershell: () => import('@shikijs/langs/powershell'),
	svelte: () => import('@shikijs/langs/svelte'),
	vue: () => import('@shikijs/langs/vue'),
	diff: () => import('@shikijs/langs/diff')
};

/** Markdown fence names that map onto a bundled grammar. */
const ALIASES: Record<string, string> = {
	ts: 'typescript',
	tsx: 'typescript',
	js: 'javascript',
	jsx: 'javascript',
	mjs: 'javascript',
	cjs: 'javascript',
	sh: 'bash',
	shell: 'bash',
	console: 'bash',
	zsh: 'bash',
	curl: 'bash',
	py: 'python',
	yml: 'yaml',
	docker: 'dockerfile',
	env: 'ini',
	conf: 'ini',
	ps1: 'powershell',
	pwsh: 'powershell',
	ex: 'elixir',
	exs: 'elixir',
	rs: 'rust',
	postgres: 'sql',
	postgresql: 'sql'
};

export function normalizeLang(lang: string): string {
	const value = lang.trim().toLowerCase();
	const mapped = ALIASES[value] ?? value;
	return LANG_LOADERS[mapped] ? mapped : 'text';
}

let highlighterPromise: Promise<HighlighterCore> | undefined;
const loaded = new Set<string>();

function highlighter() {
	highlighterPromise ??= createHighlighterCore({
		langs: [],
		themes: [light, dark],
		engine: createJavaScriptRegexEngine()
	});
	return highlighterPromise;
}

export async function highlight(code: string, lang: string) {
	const language = normalizeLang(lang);
	if (language === 'text') return '';
	const instance = await highlighter();
	if (!loaded.has(language)) {
		const loader = LANG_LOADERS[language];
		if (!loader) return '';
		const grammar = (await loader()) as { default?: unknown };
		await instance.loadLanguage((grammar.default ?? grammar) as never);
		loaded.add(language);
	}
	return instance.codeToHtml(code, {
		lang: language,
		themes: { light: 'github-light', dark: 'github-dark-dimmed' }
	});
}