/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
	projects: [
		{
			name: 'Chromium',
			use: {
				browserName: 'chromium',
			},
		},
		{
			name: 'Firefox',
			use: {
				browserName: 'firefox',
			},
		},
		{
			name: 'WebKit',
			use: {
				browserName: 'webkit',
			},
		},
	],
	reporter: process.env.CI ? [['github'], ['dot']] : 'list',
	webServer: {
		command: 'npm start',
		port: 3000,
		timeout: 120 * 1000,
		reuseExistingServer: !process.env.CI,
	},
};
