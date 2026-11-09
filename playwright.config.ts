import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	timeout: 120_000,
	fullyParallel: false,
	workers: 1,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL: 'http://localhost:5173',
		viewport: { width: 1440, height: 1000 },
		launchOptions: {
			executablePath:
				process.env.CHROME_PATH ||
				(process.platform === 'darwin'
					? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
					: undefined)
		},
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	},
	webServer: {
		command: 'npm run dev -- --host 127.0.0.1 --port 5173',
		url: 'http://localhost:5173/docs/learn/earn',
		reuseExistingServer: true
	}
});
