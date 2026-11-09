import { json } from '@sveltejs/kit';
export function GET({ url }) {
	const sandbox = {
		type: 'object',
		required: ['id', 'name', 'template', 'status', 'created_at'],
		properties: {
			id: { type: 'string', format: 'uuid' },
			name: { type: 'string' },
			template: { type: 'string', enum: ['node', 'python', 'ubuntu'] },
			status: { type: 'string', enum: ['running'] },
			created_at: { type: 'string', format: 'date-time' }
		}
	};
	const data = { type: 'object', properties: { data: { $ref: '#/components/schemas/Sandbox' } } };
	const failure = {
		description: 'Resource not found',
		content: {
			'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } }
		}
	};
	return json({
		openapi: '3.1.0',
		info: {
			title: 'Sandbox learning API',
			version: '1.0.0',
			description:
				'A working local API for this documentation project. It creates synthetic sandbox records in process memory. It does not operate real cloud resources. Restarting the server clears these examples.'
		},
		servers: [{ url: '/', description: 'Your local documentation server' }],
		tags: [{ name: 'Sandboxes', description: 'Create and inspect local example resources.' }],
		paths: {
			'/api/sandboxes': {
				get: {
					tags: ['Sandboxes'],
					summary: 'List sandboxes',
					operationId: 'listSandboxes',
					responses: {
						'200': {
							description: 'All current local examples',
							content: {
								'application/json': {
									schema: {
										type: 'object',
										properties: {
											data: { type: 'array', items: { $ref: '#/components/schemas/Sandbox' } },
											total: { type: 'integer' }
										}
									}
								}
							}
						}
					}
				},
				post: {
					tags: ['Sandboxes'],
					summary: 'Create a sandbox',
					operationId: 'createSandbox',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									required: ['name', 'template'],
									properties: {
										name: { type: 'string', minLength: 1, maxLength: 64, example: 'hello-docs' },
										template: {
											type: 'string',
											enum: ['node', 'python', 'ubuntu'],
											example: 'node'
										}
									}
								}
							}
						}
					},
					responses: {
						'201': {
							description: 'Example created',
							content: { 'application/json': { schema: data } }
						},
						'400': { description: 'Invalid name, template or JSON' }
					}
				}
			},
			'/api/sandboxes/{id}': {
				parameters: [
					{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
				],
				get: {
					tags: ['Sandboxes'],
					summary: 'Inspect a sandbox',
					operationId: 'getSandbox',
					responses: {
						'200': {
							description: 'One sandbox example',
							content: { 'application/json': { schema: data } }
						},
						'404': failure
					}
				},
				delete: {
					tags: ['Sandboxes'],
					summary: 'Remove a sandbox',
					operationId: 'deleteSandbox',
					responses: { '204': { description: 'Example removed' }, '404': failure }
				}
			}
		},
		components: { schemas: { Sandbox: sandbox } }
	});
}

export const prerender = process.env.STATIC_BUILD === '1';
export const trailingSlash = 'never';
