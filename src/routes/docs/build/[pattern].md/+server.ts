import type {RequestHandler} from './$types';
import {renderMarkdown} from '#lib/server/markdown.js';
export const GET:RequestHandler=({params})=>renderMarkdown(`build/${params.pattern}`);
