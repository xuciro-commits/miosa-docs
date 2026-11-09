import * as common from './common.js';
import * as marketing from './marketing.js';
import * as docs from './docs.js';
import * as content from './content.js';

export const messages = {
	en: { ...common.en, ...marketing.en, ...docs.en, ...content.en },
	zh: { ...common.zh, ...marketing.zh, ...docs.zh, ...content.zh }
};
