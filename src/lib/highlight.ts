import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import typescript from '@shikijs/langs/typescript';
import javascript from '@shikijs/langs/javascript';
import python from '@shikijs/langs/python';
import bash from '@shikijs/langs/bash';
import json from '@shikijs/langs/json';
import go from '@shikijs/langs/go';
import yaml from '@shikijs/langs/yaml';
import toml from '@shikijs/langs/toml';
import sql from '@shikijs/langs/sql';
import http from '@shikijs/langs/http';
import diff from '@shikijs/langs/diff';
import rust from '@shikijs/langs/rust';
import java from '@shikijs/langs/java';
import elixir from '@shikijs/langs/elixir';
import dockerfile from '@shikijs/langs/dockerfile';
import ini from '@shikijs/langs/ini';
import powershell from '@shikijs/langs/powershell';
import html from '@shikijs/langs/html';
import css from '@shikijs/langs/css';
import xml from '@shikijs/langs/xml';
import light from '@shikijs/themes/github-light';
import dark from '@shikijs/themes/github-dark-dimmed';

const highlighter = createHighlighterCore({
	langs: [
		typescript,
		javascript,
		python,
		bash,
		json,
		go,
		yaml,
		toml,
		sql,
		http,
		diff,
		rust,
		java,
		elixir,
		dockerfile,
		ini,
		powershell,
		html,
		css,
		xml
	],
	themes: [light, dark],
	engine: createJavaScriptRegexEngine()
});

/** Markdown fence names that map onto a bundled grammar. */
const ALIASES: Record<string, string> = {
	ts: 'typescript',
	tsx: 'typescript',
	js: 'javascript',
	jsx: 'javascript',
	mjs: 'javascript',
	sh: 'bash',
	shell: 'bash',
	console: 'bash',
	zsh: 'bash',
	py: 'python',
	yml: 'yaml',
	docker: 'dockerfile',
	'env': 'ini',
	conf: 'ini',
	ps1: 'powershell',
	pwsh: 'powershell',
	ex: 'elixir',
	exs: 'elixir',
	rs: 'rust',
	postgres: 'sql',
	postgresql: 'sql',
	curl: 'bash'
};

const SUPPORTED = new Set([
	'typescript',
	'javascript',
	'python',
	'bash',
	'json',
	'go',
	'yaml',
	'toml',
	'sql',
	'http',
	'diff',
	'rust',
	'java',
	'elixir',
	'dockerfile',
	'ini',
	'powershell',
	'html',
	'css',
	'xml'
]);

export function normalizeLang(lang: string): string {
	const value = lang.trim().toLowerCase();
	const mapped = ALIASES[value] ?? value;
	return SUPPORTED.has(mapped) ? mapped : 'text';
}

export async function highlight(code: string, lang: string) {
	const language = normalizeLang(lang);
	if (language === 'text') return '';
	return (await highlighter).codeToHtml(code, {
		lang: language,
		themes: { light: 'github-light', dark: 'github-dark-dimmed' }
	});
}