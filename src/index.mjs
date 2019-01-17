/**
 * Uses Intersection Observer to monitor the page location of a series of
 * elements for scrollytelling.
 *
 * @param {object} options
 * @param {Number} [options.offset] How far from the top/bottom of the viewable
 * area to trigger enters/exits of scenes, represented as a value between
 * 0 and 1
 * @param {string} options.selector The CSS selector to pass to
 * querySelectorAll to find all of the scenes
 * @property {IntersectionObserver|null} observer Once initialized, a reference
 * to the Scroller's instance of IntersectionObserver
 * @property {Element[]} scenes All of the elements found by Scroller after it
 * was initialized
 * @example
 *
 * import Scroller from '@newswire/scroller';
 *
 * const scroller = new Scroller({ selector: '.scene' });
 * scroller.init();
 */
class Scroller {
  constructor({ offset = 0.5, selector }) {
    // public
    this.observer = null;
    this.scenes = [];

    // private
    this.all_ = {};
    this.offset_ = offset;
    this.previousOffset_ = 0;
    this.selector_ = selector;
  }

  /**
   * Adds a callback to the queue of a given event listener.
   *
   * @param {string} type Name of the event
   * @param {Function} handler Callback function added to the listener
   * @returns {void}
   * @example
   *
   * const scroller = new Scroller({ selector: '.scene' });
   *
   * const fn = (...) => {...};
   *
   * // adds callback to listener
   * scroller.on('enter', fn);
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
   * const scroller = new Scroller({ selector: '.scene' });
   *
   * const fn = (...) => {...};
   *
   * // adds callback to listener
   * scroller.on('enter', fn);
   *
   * // removes callback from listener
   * scroller.off('enter', fn);
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
   * @param {*} evt Data to be sent to each callback attached to the listener
   * @returns {void}
   */
  emit_(type, evt) {
    (this.all_[type] || []).slice().map(handler => {
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
   * const scroller = new Scroller({ selector: '.scene' });
   *
   * scroller.init();
   */
  init() {
    const scenes = document.querySelectorAll(this.selector_);

    this.observer = new IntersectionObserver(
      entries => {
        const isScrollingDown = this.getDirection_();

        entries.forEach(entry => {
          const payload = {
            bounds: entry.boundingClientRect,
            element: entry.target,
            index: this.scenes.indexOf(entry.target),
            isScrollingDown,
          };

          if (entry.isIntersecting) {
            /**
             * Enter event. Fires whenever a scene begins intersecting.
             *
             * @event Scroller#enter
             * @type {object}
             * @property {DOMRectReadOnly} bounds The bounds of the active element
             * @property {Element} element The element that intersected
             * @property {number} index The index of the active element
             * @property {boolean} isScrollingDown Whether the user triggered this element
             * while scrolling down or not
             */
            this.emit_('enter', payload);
          } else {
            /**
             * Exit event. Fires whenever a scene has exited.
             *
             * @event Scroller#exit
             * @type {object}
             * @property {DOMRectReadOnly} bounds The bounds of the exiting element
             * @property {Element} element The element that exited
             * @property {number} index The index of the exiting element
             * @property {boolean} isScrollingDown Whether the user triggering the exit
             * while scrolling down or not
             */
            this.emit_('exit', payload);
          }
        });
      },
      {
        rootMargin: `${-100 * (1 - this.offset_)}% 0px ${-100 * this.offset_}%`,
      }
    );

    for (let i = 0; i < scenes.length; i++) {
      const item = scenes[i];

      this.scenes.push(item);
      this.observer.observe(item);
    }

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
