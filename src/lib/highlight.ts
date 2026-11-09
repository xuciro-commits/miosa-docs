import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import typescript from '@shikijs/langs/typescript';
import javascript from '@shikijs/langs/javascript';
import python from '@shikijs/langs/python';
import bash from '@shikijs/langs/bash';
import json from '@shikijs/langs/json';
import go from '@shikijs/langs/go';
import yaml from '@shikijs/langs/yaml';
import light from '@shikijs/themes/github-light';
import dark from '@shikijs/themes/github-dark-dimmed';

const highlighter = createHighlighterCore({
	langs: [typescript, javascript, python, bash, json, go, yaml],
	themes: [light, dark],
	engine: createJavaScriptRegexEngine()
});
export async function highlight(code: string, lang: string) {
	return (await highlighter).codeToHtml(code, {
		lang,
		themes: { light: 'github-light', dark: 'github-dark-dimmed' }
	});
}
