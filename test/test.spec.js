import { test, expect } from '@playwright/test';
import {
	scrollAboveElement,
	scrollBelowElement,
	scrollToTopOfElement,
} from './helpers.js';

test('should do basic triggering', async ({ page }) => {
	// visit our page
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
	await expect(firstScene).not.toHaveClass(/active/);

	// scroll to the active point for the first scene
	await scrollToTopOfElement(firstScene);

	// make sure it is active
	await expect(firstScene).toHaveClass(/active/);

	// scroll to just after the first scene
	await scrollBelowElement(firstScene);

	// make sure it is no longer active
	await expect(firstScene).not.toHaveClass(/active/);
});

test('should allow for adding and removing listeners', async ({ page }) => {
	// visit our page
	await page.goto('/test/fixtures/bare/');

	// expect the title to be set
	await expect(page).toHaveTitle(/@newswire\/scroller/);

	// grab the first scene
	const allScenes = page.locator('.scene');
	const scene = allScenes.first();

	// confirm scrolling doesn't yet activate anything
	await scrollToTopOfElement(scene);
	await expect(scene).not.toHaveClass(/active/);
	await scrollAboveElement(scene);

	// get the scroller handle
	const scroller = await page.evaluateHandle('window.scroller');

	const removeHandler = await scroller.evaluateHandle((scroller) => {
		return scroller.on('enter', (d) => {
			d.element.classList.add('active');
		});
	});
	await page.waitForTimeout(15);

	// confirm scrolling now activates
	await scrollToTopOfElement(scene);
	await expect(scene).toHaveClass(/active/);
	await scrollAboveElement(scene);

	// remove the listener
	removeHandler.evaluate((fn) => fn());
	await page.waitForTimeout(15);

	// now shouldn't activate again
	await scrollToTopOfElement(scene);
	await expect(scene).not.toHaveClass(/active/);
	await scrollAboveElement(scene);
});
