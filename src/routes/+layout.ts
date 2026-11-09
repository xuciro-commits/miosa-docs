const staticBuild = process.env.STATIC_BUILD === '1';

export const prerender = staticBuild;
export const trailingSlash = staticBuild ? 'always' : 'never';
