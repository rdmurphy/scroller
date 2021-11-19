/**
 * @template {Element} T
 * @typedef {import('../index').Handler<T>} Handler
 */

/**
 *
 * @template {Element} T
 * @param {ArrayLike<T>} scenes
 * @param {import('../index').Options} options
 */
export default function Scroller(scenes, options) {
	/** @type {Map<string, Set<Handler<T>>>} */
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
		 * @template {Element} T
		 * @param {string} type name of the event
		 * @param {Handler<T>} handler callback function to run on emit
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
			var i, isDown, entry, element;

			entry = new IntersectionObserver(
				function (entries) {
					i = window.pageYOffset;
					isDown = i > prevOffset;
					prevOffset = i;

					for (i = 0; i < entries.length; i++) {
						entry = entries[i];
						element = entry.target;

						emit(entry.isIntersecting ? 'enter' : 'exit', {
							bounds: entry.boundingClientRect,
							// @ts-ignore
							index: entries.indexOf.call(scenes, element),
							isScrollingDown: isDown,
							element: element,
						});
					}
				},
				{
					rootMargin: -100 * (1 - offset) + '% 0px ' + -100 * offset + '%',
				},
			);

			for (i = 0; i < scenes.length; i++) {
				entry.observe(scenes[i]);
			}

			emit('init');
		},
	};
}
