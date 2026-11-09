import { messages } from './i18n/messages/index.js';

export type Locale = 'en' | 'zh';

const STORAGE_KEY = 'miosa-locale';

function initialLocale(): Locale {
	if (typeof window === 'undefined') return 'en';
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved === 'zh' || saved === 'en') return saved;
		return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
	} catch {
		return 'en';
	}
}

export const i18n = $state({ locale: initialLocale() });

/** Translate a message key, with optional `{name}` parameters. */
export function t(key: string, params?: Record<string, string | number>): string {
	const table = messages[i18n.locale] as Record<string, string>;
	const fallback = messages.en as Record<string, string>;
	let value = table[key] ?? fallback[key] ?? key;
	if (params) {
		for (const [name, replacement] of Object.entries(params)) {
			value = value.replaceAll(`{${name}}`, String(replacement));
		}
	}
	return value;
}

export function setLocale(locale: Locale): void {
	i18n.locale = locale;
	if (typeof document !== 'undefined') {
		document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
		document.documentElement.dataset.locale = locale;
	}
	try {
		localStorage.setItem(STORAGE_KEY, locale);
	} catch {}
}

export function toggleLocale(): void {
	setLocale(i18n.locale === 'en' ? 'zh' : 'en');
}

export function initI18n(): void {
	setLocale(i18n.locale);
}

/** Apply the content dictionary to rendered SVX text nodes without forking the source files. */
const textSources = new WeakMap<Text, string>();

export function translateContent(root: HTMLElement): void {
	const dictionary = messages[i18n.locale] as Record<string, string>;
	const english = messages.en as Record<string, string>;
	const walk = (parent: Node) => {
		for (const node of parent.childNodes) {
			if (node.nodeType === Node.TEXT_NODE) {
				const textNode = node as Text;
				if (!textSources.has(textNode)) textSources.set(textNode, textNode.nodeValue ?? '');
				const source = textSources.get(textNode) ?? '';
				const trimmed = source.trim();
				const translated = dictionary[trimmed] ?? english[trimmed];
				if (translated && translated !== trimmed) {
					const leading = source.match(/^\s*/)?.[0] ?? '';
					const trailing = source.match(/\s*$/)?.[0] ?? '';
					textNode.nodeValue = `${leading}${translated}${trailing}`;
				} else if (textNode.nodeValue !== source) {
					textNode.nodeValue = source;
				}
			} else if (
				node.nodeType === Node.ELEMENT_NODE &&
				!['CODE', 'PRE', 'SCRIPT', 'STYLE', 'TEXTAREA'].includes((node as Element).tagName)
			) {
				walk(node);
			}
		}
	};
	walk(root);
}
