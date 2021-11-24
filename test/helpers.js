export function scrollToTopOfElement(
	/** @type {import('playwright-core').Locator} */ locator,
) {
	return locator.evaluate((el) => {
		window.scrollTo(
			0,
			el.getBoundingClientRect().top +
				10 +
				window.scrollY -
				window.innerHeight / 2,
		);
	});
}

export function scrollAboveElement(
	/** @type {import('playwright-core').Locator} */ locator,
) {
	return locator.evaluate((el) => {
		window.scrollTo(
			0,
			el.getBoundingClientRect().top -
				1 +
				window.scrollY -
				window.innerHeight / 2,
		);
	});
}

export function scrollBelowElement(
	/** @type {import('playwright-core').Locator} */ locator,
) {
	return locator.evaluate((el) => {
		window.scrollTo(
			0,
			el.getBoundingClientRect().bottom +
				1 +
				window.scrollY -
				window.innerHeight / 2,
		);
	});
}

export function tick(/** @type {import('playwright-core').Page} */ page) {
	return page.evaluate(() => new Promise(requestAnimationFrame));
}
