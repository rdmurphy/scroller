import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
	await page.goto('/test/fixtures/');

	// expect the title to be set
	await expect(page).toHaveTitle(/@newswire\/scroller/);

	// find all the scenes
	const scenes = page.locator('.scene');

	// expect there to be three scenes on the page
	await expect(scenes).toHaveCount(3);

	// get the first scene
	const firstScene = scenes.first();

	// make sure the first scene isn't active
	await expect(
		await firstScene.evaluate(
			(el) => window.getComputedStyle(el).backgroundColor,
		),
	).toBe('rgb(255, 255, 224)');

	// scroll to the active point for the first scene
	await firstScene.evaluate((el) => {
		window.scrollTo(
			0,
			el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2,
		);
	});
	await page.waitForTimeout(100);

	// make sure it is active
	await expect(
		await firstScene.evaluate(
			(el) => window.getComputedStyle(el).backgroundColor,
		),
	).toBe('rgb(175, 238, 238)');

	// scroll to just after the first scene
	await firstScene.evaluate((el) => {
		window.scrollTo(
			0,
			el.getBoundingClientRect().bottom +
				1 +
				window.scrollY -
				window.innerHeight / 2,
		);
	});
	await page.waitForTimeout(100);

	// make sure it is no longer active
	await expect(
		await firstScene.evaluate(
			(el) => window.getComputedStyle(el).backgroundColor,
		),
	).toBe('rgb(255, 255, 224)');
});
