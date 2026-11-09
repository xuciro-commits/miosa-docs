import products from '#lib/content/products.json';
import type {RequestHandler} from './$types';
import {renderMarkdown} from '#lib/server/markdown.js';
export const GET:RequestHandler=({params})=>renderMarkdown(`build/${params.pattern}`);

export const trailingSlash='never';

export const prerender=process.env.STATIC_BUILD==='1';

export const entries=()=>products.map(product=>({pattern:product.href.split('/').pop()!}));
