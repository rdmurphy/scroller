/** @typedef {(event: any) => void} Handler */

/**
 * @typedef {object} ScrollerOptions
 * @property {number} [offset=0.5]
 */

/**
 *
 * @param {ArrayLike<Element>} scenes
 * @param {ScrollerOptions} options
 */
export function Scroller(scenes, options) {
	/** @type {Map<string, Set<Handler>>} */
	var events = new Map();
	var offset = options.offset;
	var prevOffset = 0;

	if (offset == null) {
		offset = 0.5;
	}

	/**
	 *
	 * @param {string} type name of the event
	 * @param {any} [event] The data to send to listeners of the event
	 */
	function emit(type, event) {
		var handlers = events.get(type);

		if (handlers) {
			handlers.forEach(function eachHandler(handler) {
				handler(event);
			});
		}
	}

	return {
		/**
		 *
		 * @param {string} type name of the event
		 * @param {Handler} handler callback function to run on emit
		 */
		on: function (type, handler) {
			var handlers = events.get(type);
			var added = handlers && handlers.add(handler);

			if (!added) {
				events.set(type, new Set().add(handler));
			}

			return function off() {
				handlers = events.get(type);
				if (handlers) {
					handlers.delete(handler);
				}
			};
		},

		init: function () {
			var i, elem, entry, isDown;
			var tmp =
				-100 * (1 - /** @type {number} */ (offset)) +
				'% 0px ' +
				-100 * /** @type {number} */ (offset) +
				'%';

			entry = new IntersectionObserver(
				function (entries) {
					i = window.pageYOffset;
					isDown = i > prevOffset;
					prevOffset = i;

					for (i = 0; i < entries.length; i++) {
						entry = entries[i];
						elem = entry.target;

						emit(entry.isIntersecting ? 'enter' : 'exit', {
							bounds: entry.boundingClientRect,
							// @ts-ignore
							index: [].indexOf.call(scenes, elem),
							isScrollingDown: isDown,
							element: elem,
						});
					}
				},
				{ rootMargin: tmp },
			);

			for (let i = 0; i < scenes.length; i++) {
				entry.observe(scenes[i]);
			}

			emit('init');
		},
	};
}
