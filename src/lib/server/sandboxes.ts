export type Sandbox = {
	id: string;
	name: string;
	template: 'node' | 'python' | 'ubuntu';
	status: 'running';
	created_at: string;
};
export const sandboxes = new Map<string, Sandbox>();
