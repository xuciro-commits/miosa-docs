/*
 * Shared rules for the homepage definition: which sections exist, which keys a
 * section may use, and how copy is resolved. The build script and the guard
 * both import this file so they can never disagree.
 */

/** Section types the generator can render. */
export const SECTION_TYPES = new Set(['hero', 'features', 'steps', 'split', 'cta', 'footer']);

/** Keys a page may reference: `marketing.` + one of these prefixes. */
export const KEY_PREFIXES = ['nav.', 'home.', 'footer.', 'status.'];

/** Links that must point at a real document, resolved by the route guard. */
export function internalLinks(section) {
	const links = [];
	const visit = (value) => {
		if (!value || typeof value !== 'object') return;
		if (Array.isArray(value)) return value.forEach(visit);
		if (typeof value.href === 'string' && value.href.startsWith('/')) links.push(value.href);
		for (const child of Object.values(value)) visit(child);
	};
	visit(section);
	return links;
}

/** Every translation key referenced by a section. */
export function sectionKeys(section) {
	const keys = [];
	const visit = (value, keyName) => {
		if (typeof value === 'string') {
			if (/^(nav|home|footer|status)\./.test(value)) keys.push(value);
			return;
		}
		if (Array.isArray(value)) return value.forEach((item) => visit(item, keyName));
		if (value && typeof value === 'object')
			for (const [name, child] of Object.entries(value)) visit(child, name);
	};
	visit(section);
	return keys;
}

/** Resolve a section list for a preset, in order. */
export function sectionOrder(definition) {
	const preset = definition.presets[definition.preset];
	if (!preset) throw new Error(`unknown preset "${definition.preset}"`);
	return preset.map((name) => {
		const section = definition.sections[name];
		if (!section) throw new Error(`preset "${definition.preset}" names missing section "${name}"`);
		return { name, ...section };
	});
}

/** Small, dependency-free validator; the JSON Schema documents the shape. */
export function validateDefinition(definition) {
	const problems = [];
	const need = (condition, message) => {
		if (!condition) problems.push(message);
	};
	need(definition.version === 1, 'version must be 1');
	need(typeof definition.defaultLocale === 'string', 'defaultLocale is required');
	need(definition.locales && Object.keys(definition.locales).length > 0, 'locales is required');
	for (const [locale, config] of Object.entries(definition.locales ?? {})) {
		need(typeof config.prefix === 'string', `locales.${locale}.prefix must be a string`);
		need(/^[a-z]{2}(-[A-Z]{2})?$/.test(config.htmlLang ?? ''), `locales.${locale}.htmlLang is invalid`);
	}
	need(definition.presets?.[definition.preset], `preset "${definition.preset}" is not defined`);

	const sections = definition.sections ?? {};
	for (const [name, section] of Object.entries(sections)) {
		need(SECTION_TYPES.has(section.type), `sections.${name}.type "${section.type}" is unknown`);
		need(sectionKeys(section).length > 0, `sections.${name} references no copy`);
	}
	for (const [presetName, order] of Object.entries(definition.presets ?? {})) {
		for (const name of order) need(sections[name], `presets.${presetName} names missing section "${name}"`);
		const last = order[order.length - 1];
		need(sections[last]?.type === 'footer', `presets.${presetName} must end with a footer`);
	}
	return problems;
}
