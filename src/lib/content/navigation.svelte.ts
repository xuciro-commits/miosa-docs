import { generatedNavigation } from './generated-navigation.js';
import { fetchContentJson } from './remote.js';

export type NavGroup = (typeof generatedNavigation)[number];

/**
 * The sidebar reads `content/nav.json` at runtime: a page added in the editor
 * appears without rebuilding the shell. The bundled navigation is the fallback
 * for the first paint and for when the file cannot be read.
 */
export const navigationState = $state<{ groups: NavGroup[] }>({ groups: generatedNavigation });

let started = false;

export async function loadNavigation() {
	if (started) return;
	started = true;
	const remote = await fetchContentJson<NavGroup[]>('content/nav.json', fetch);
	if (remote?.length) navigationState.groups = remote;
}
