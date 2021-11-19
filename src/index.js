/**
 * Uses Intersection Observer to monitor the page location of a series of
 * elements for scrollytelling.
 *
 * @param {object} options
 * @param {Element} [options.container] Optionally pass in what should be
 * considered the containing element of all the scenes - this gets added to the
 * Intersection Observer instance and additionally fires its own events
 * @param {number} [options.offset=0.5] How far from the top/bottom of the viewable
 * area to trigger enters/exits of scenes, represented as a value between
 * 0 and 1
 * @param {boolean} [options.progress] If true, activates scroll depth observers and sends
 * progress events on intersection
 * @param {ArrayLike<Element>} options.scenes A collection of all the elements to be
 * considered scenes of this Scroller
 * @example
 *
 * import Scroller from '@newswire/scroller';
 *
 * const scroller = new Scroller({
 *   scenes: document.querySelectorAll('.scenes')
 * });
 *
 * scroller.init();
 */
export function Scroller(options) {
	/** @type {Element[]} */
	var tracks = [];
	/** @type {Record<string, Array<(arg: any) => void>>} */
	var evts = {};
	var scenes = options.scenes;
	var container = options.container;
	var offset = options.offset;
	var progress = options.progress;
	var prevOffset = 0;

	if (offset == null) {
		offset = 0.5;
	}

	/**
	 * Sends a payload to all callback functions listening for a given event.
	 *
	 * @param {string} type Name of the event
	 * @param {*} [payload] Data to be sent to each callback attached to the listener
	 * @returns {void}
	 */
	function emit(type, payload) {
		var i = 0,
			arr = (evts[type] || []).slice();
		for (; i < arr.length; i++) arr[i](payload);
	}

	/**
	 *
	 * @param {Element} element the element who's progress to watch
	 * @param {DOMRectReadOnly | undefined} initBounds the initial bounds from the IntersectionObserver
	 * @param {(arg: any) => void} cb
	 */
	function observeProgress(element, initBounds, cb) {
		/**
		 * Called on each scroll event.
		 */
		function scroll() {
			var bounds = initBounds || element.getBoundingClientRect();
			var top = bounds.top;
			var bottom = bounds.bottom;
			var progress =
				(window.innerHeight * /** @type {number} */ (offset) - top) /
				(bottom - top);

			cb({
				bounds: bounds,
				element: element,
				progress: Math.max(0, Math.min(progress, 1)),
			});
		}

		// initial hit
		scroll();
		initBounds = undefined;

		return {
			subscribe: function () {
				window.addEventListener('scroll', scroll, false);
			},
			unsubscribe: function () {
				window.removeEventListener('scroll', scroll, false);
			},
		};
	}

	return {
		/**
		 * Adds a callback to the queue of a given event listener.
		 *
		 * @param {string} type Name of the event
		 * @param {(param: any) => void} handler Callback function added to the listener
		 * @returns {void}
		 * @example
		 *
		 * const scroller = new Scroller({
		 *   scenes: document.querySelectorAll('.scenes')
		 * });
		 *
		 * const fn = (...) => {...};
		 *
		 * // adds callback to listener
		 * scroller.on('scene:enter', fn);
		 */
		on: function (type, handler) {
			(evts[type] || (evts[type] = [])).push(handler);
		},

		/**
		 * Removes a callback from the queue of a given event listener.
		 *
		 * @param {string} type Name of the event
		 * @param {(param: any) => void} handler Callback function removed from the listener
		 * @returns {void}
		 * @example
		 *
		 * const scroller = new Scroller({
		 *   scenes: document.querySelectorAll('.scenes')
		 * });
		 *
		 * const fn = (...) => {...};
		 *
		 * // adds callback to listener
		 * scroller.on('scene:enter', fn);
		 *
		 * // removes callback from listener
		 * scroller.off('scene:enter', fn);
		 */
		off: function (type, handler) {
			var arr = evts[type] || [];
			if (arr.length) arr.splice(arr.indexOf(handler) >>> 0, 1);
		},

		/**
		 * Initializes a Scroller's IntersectionObserver on a page and begins sending
		 * any intersection events that occur.
		 *
		 * @returns {void}
		 * @example
		 *
		 * const scroller = new Scroller({
		 *   scenes: document.querySelectorAll('.scenes')
		 * });
		 *
		 * scroller.init();
		 */
		init: function () {
			var i, elem, entry, isDown;
			var tmp =
				-100 * (1 - /** @type {number} */ (offset)) +
				'% 0px ' +
				-100 * /** @type {number} */ (offset) +
				'%';
			var mapping = new Map();

			entry = new IntersectionObserver(
				function (entries) {
					i = window.pageYOffset;
					isDown = i > prevOffset;
					prevOffset = i;

					for (i = 0; i < entries.length; i++) {
						entry = entries[i];
						elem = entry.target;

						tmp = elem === container ? 'container:' : 'scene:';

						if (!mapping.has(elem)) {
							mapping.set(
								elem,
								observeProgress(
									elem,
									entry.boundingClientRect,
									emit.bind(null, tmp + 'progress'),
								),
							);
						}

						if (entry.isIntersecting) {
							mapping.get(elem).subscribe();
							tmp += 'enter';
						} else {
							mapping.get(elem).unsubscribe();
							tmp += 'exit';
						}

						emit(tmp, {
							bounds: entry.boundingClientRect,
							index: tracks.indexOf(elem),
							isScrollingDown: isDown,
							element: elem,
						});
					}
				},
				{
					rootMargin: tmp,
				},
			);

			for (i = 0; i < scenes.length; i++) {
				tracks.push((elem = scenes[i]));
				entry.observe(elem);
			}

			// a container is not required, but if provided we'll track it
			if (container) entry.observe(container);

			// scroller is ready
			emit('init');
		},
	};
}