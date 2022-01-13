import { test, expect } from '@playwright/test';
import {
	scrollAboveElement,
	scrollBelowElement,
	scrollToTopOfElement,
	tick,
} from './helpers.js';

const activeRe = /active/;

test('should do basic triggering', async ({ page }) => {
	// visit our page
	await page.goto('/test/fixtures/basic.html');

	// expect the title to be set
	await expect(page).toHaveTitle(/@newswire\/scroller/);

	// find all the scenes
	const scenes = page.locator('.scene');

	// expect there to be three scenes on the page
	await expect(scenes).toHaveCount(3);

	// get the first scene
	const firstScene = scenes.nth(0);

	// make sure the first scene isn't active
	await expect(firstScene).not.toHaveClass(activeRe);

	// scroll to the active point for the first scene
	await scrollToTopOfElement(firstScene);

	// make sure it is active
	await expect(firstScene).toHaveClass(activeRe);

	// get the second scene
	const secondScene = scenes.nth(1);

	// make sure the second scene isn't active
	await expect(secondScene).not.toHaveClass(activeRe);

	// scroll to just after the first scene
	await scrollToTopOfElement(secondScene);

	// make sure first scene is no longer active
	await expect(firstScene).not.toHaveClass(activeRe);

	// make sure second scene is now active
	await expect(secondScene).toHaveClass(activeRe);

	// get the third scene
	const thirdScene = scenes.nth(2);

	// scroll to just after the first scene
	await scrollToTopOfElement(thirdScene);

	// make sure second scene is no longer active
	await expect(secondScene).not.toHaveClass(activeRe);

	// make sure third scene is now active
	await expect(thirdScene).toHaveClass(activeRe);

	// scroll to just after the third scene
	await scrollBelowElement(thirdScene);

	// make sure third scene is no longer active
	await expect(thirdScene).not.toHaveClass(activeRe);
});

test('should allow for adding and removing listeners', async ({ page }) => {
	// visit our page
	await page.goto('/test/fixtures/bare.html');

	// expect the title to be set
	await expect(page).toHaveTitle(/@newswire\/scroller/);

	// grab the first scene
	const allScenes = page.locator('.scene');
	const scene = allScenes.first();

	// confirm scrolling doesn't yet activate anything
	await scrollToTopOfElement(scene);
	await expect(scene).not.toHaveClass(activeRe);
	await scrollBelowElement(scene);

	// get a handle for window
	const window = await page.evaluateHandle('window');

	// add the listener
	await window.evaluate((window) => window.addListener());
	// wait a tick
	await tick(page);

	// confirm scrolling now activates
	await scrollToTopOfElement(scene);
	await expect(scene).toHaveClass(activeRe);
	await scrollBelowElement(scene);

	// // remove the listener
	await window.evaluate((window) => window.removeListener());
	// wait a tick
	await tick(page);

	// // now shouldn't activate again
	await scrollToTopOfElement(scene);
	await expect(scene).not.toHaveClass(/active/);
	await scrollBelowElement(scene);
});
