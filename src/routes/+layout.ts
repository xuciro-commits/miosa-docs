import { staticSite } from '#lib/site-mode.js';

export const prerender = staticSite ? 'auto' : false;
export const trailingSlash = staticSite ? 'always' : 'never';
