// native
const assert = require('assert').strict;

// packages
const { chromium, webkit, firefox } = require('playwright');

const browserName = process.env.BROWSER || 'chromium';

describe('browser tests', function () {
	this.timeout(2e4);

	let browser;
	let page;

	before(async () => {
		browser = await { chromium, webkit, firefox }[browserName].launch();
		page = await browser.newPage();
	});

	after(async () => {
		await page.close();
		await browser.close();
	});

	it('should just work', () => {
		assert.equal(true, true);
	});
});
