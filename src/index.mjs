/**
 * Uses Intersection Observer to monitor the page location of a series of
 * elements for scrollytelling.
 *
 * @param {object} options
 * @param {Element} [options.container] Optionally pass in what should be
 * considered the containing element of all the scenes - this gets added to the
 * Intersection Observer instance and additionally fires its own events
 * @param {Number} [options.offset] How far from the top/bottom of the viewable
 * area to trigger enters/exits of scenes, represented as a value between
 * 0 and 1
 * @param {Element[]} options.scenes An array of all the Elements to be
 * considered scenes of this Scroller
 * @property {IntersectionObserver|null} observer Once initialized, a reference
 * to the Scroller's instance of IntersectionObserver
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
class Scroller {
	constructor({ container, offset = 0.5, scenes }) {
		// internal
		const fuzz = 0.01;

		// public
		this.observer = null;

		// private
		this.all_ = {};
		this.container_ = container;
		this.offset_ = offset + fuzz;
		this.previousOffset_ = 0;
		this.scenes_ = scenes;
	}

	/**
	 * Adds a callback to the queue of a given event listener.
	 *
	 * @param {string} type Name of the event
	 * @param {Function} handler Callback function added to the listener
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
	on(type, handler) {
		(this.all_[type] || (this.all_[type] = [])).push(handler);
	}

	/**
	 * Removes a callback from the queue of a given event listener.
	 *
	 * @param {string} type Name of the event
	 * @param {Function} handler Callback function removed from the listener
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
	off(type, handler) {
		if (this.all_[type]) {
			this.all_[type].splice(this.all_[type].indexOf(handler) >>> 0, 1);
		}
	}

	/**
	 * Sends a payload to all callback functions listening for a given event.
	 *
	 * @private
	 * @param {string} type Name of the event
	 * @param {*} [evt] Data to be sent to each callback attached to the listener, optional
	 * @returns {void}
	 */
	emit_(type, evt) {
		(this.all_[type] || []).slice().map((handler) => {
			handler(evt);
		});
	}

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
	init() {
		const observed = [];

		this.observer = new IntersectionObserver(
			(entries) => {
				const isScrollingDown = this.getDirection_();

				entries.forEach((entry) => {
					const element = entry.target;

					const payload = {
						bounds: entry.boundingClientRect,
						element,
						index: observed.indexOf(element),
						isScrollingDown,
					};

					const prefix = element === this.container_ ? 'container' : 'scene';

					if (entry.isIntersecting) {
						/**
						 * Container enter event. Fires whenever the container begins intersecting.
						 *
						 * @event Scroller#container:enter
						 * @type {object}
						 * @property {DOMRectReadOnly} bounds The bounds of the active element
						 * @property {Element} element The element that intersected
						 * @property {number} index This is always -1 on the container
						 * @property {boolean} isScrollingDown Whether the user triggered this element
						 * while scrolling down or not
						 */
						/**
						 * Scene enter event. Fires whenever a scene begins intersecting.
						 *
						 * @event Scroller#scene:enter
						 * @type {object}
						 * @property {DOMRectReadOnly} bounds The bounds of the active element
						 * @property {Element} element The element that intersected
						 * @property {number} index The index of the active element
						 * @property {boolean} isScrollingDown Whether the user triggered this element
						 * while scrolling down or not
						 */
						this.emit_(`${prefix}:enter`, payload);
					} else {
						/**
						 * Container exit event. Fires whenever the container has exited.
						 *
						 * @event Scroller#container:exit
						 * @type {object}
						 * @property {DOMRectReadOnly} bounds The bounds of the exiting element
						 * @property {Element} element The element that exited
						 * @property {number} index This is always -1 on the container
						 * @property {boolean} isScrollingDown Whether the user triggering the exit
						 * while scrolling down or not
						 */
						/**
						 * Scene enter event. Fires whenever a scene has exited.
						 *
						 * @event Scroller#scene:exit
						 * @type {object}
						 * @property {DOMRectReadOnly} bounds The bounds of the exiting element
						 * @property {Element} element The element that exited
						 * @property {number} index The index of the exiting element
						 * @property {boolean} isScrollingDown Whether the user triggering the exit
						 * while scrolling down or not
						 */
						this.emit_(`${prefix}:exit`, payload);
					}
				});
			},
			{
				rootMargin: `${-100 * (1 - this.offset_)}% 0px ${-100 * this.offset_}%`,
			},
		);

		for (let i = 0; i < this.scenes_.length; i++) {
			const item = this.scenes_[i];

			observed.push(item);
			this.observer.observe(item);
		}

		// a container is not required, but if provided we'll track it
		if (this.container_) this.observer.observe(this.container_);

		/**
		 * Init event. Fires once Scroller has finished setting up.
		 *
		 * @event Scroller#init
		 */
		this.emit_('init');
	}

	/**
	 * Determines whether the page was scrolling up or down when an intersection
	 * event is triggered. Keeps track of direction via storage of the previous
	 * pageYOffset.
	 *
	 * @private
	 * @returns {boolean} If true, the page was scrolling down
	 */
	getDirection_() {
		const currentOffset = window.pageYOffset;

		const isScrollingDown = currentOffset > this.previousOffset_;
		this.previousOffset_ = currentOffset;

		return isScrollingDown;
	}
}

export default Scroller;
