export type Theme = 'system' | 'light' | 'dark' | 'glass' | 'glass-dark';

export const preferences = $state({
	theme: 'system' as Theme,
	sidebarWidth: 260,
	sidebarOpen: false,
	searchOpen: false,
	askOpen: false,
	askQuestion: '',
	language: 'TypeScript',
	toast: ''
});

let toastTimer: ReturnType<typeof setTimeout>;
export function notify(message: string) {
	preferences.toast = message;
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => (preferences.toast = ''), 2600);
}

export function ask(question = '') {
	preferences.askQuestion = question;
	preferences.askOpen = true;
	preferences.searchOpen = false;
}
