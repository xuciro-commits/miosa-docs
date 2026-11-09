import type { SearchEntry } from '#lib/content/catalog.js';

export function searchDocuments(entries: SearchEntry[], query: string, section = 'All') {
	const aliases: Record<string, string> = {
		customize: 'customization',
		customise: 'customization',
		deploy: 'deployment',
		apps: 'application',
		app: 'application'
	};
	const words = query
		.toLocaleLowerCase()
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => aliases[word] ?? word);
	return entries
		.filter((entry) => section === 'All' || entry.section === section)
		.map((entry) => {
			const title = entry.title.toLocaleLowerCase();
			const description = entry.description.toLocaleLowerCase();
			const body = entry.text.toLocaleLowerCase();
			let score = words.reduce(
				(sum, word) =>
					sum +
					(title.includes(word)
						? 12
						: entry.slug.includes(word)
							? 7
							: description.includes(word)
								? 4
								: body.includes(word)
									? 1
									: 0),
				0
			);
			const phrase = words.join(' ');
			if (phrase && [phrase, phrase + 's', phrase + 'es'].includes(title)) score += 30;
			if (phrase === entry.slug) score += 20;
			const matches = words.every((word) =>
				`${title} ${entry.slug} ${description} ${body}`.includes(word)
			);
			return { ...entry, score: matches ? score : 0 };
		})
		.filter((entry) => !words.length || entry.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 12);
}
