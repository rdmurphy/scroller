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
export default function Scroller(options) {
  var observer, tracks=[], evts={};
  var scenes = options.scenes,
    container = options.container,
    offset = options.offset,
    prevOffset = 0;

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
    var i=0, arr=(evts[type] || []).slice();
    for (; i < arr.length; i++) arr[i](payload);
  }

  return {
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
    on: function (type, handler) {
      (evts[type] || (evts[type] = [])).push(handler);
    },

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
      var i=0, elem, entry, isDown;
      var tmp = (-100 * (1 - offset) + '% 0px ' + (-100 * offset) + '%');

      observer = new IntersectionObserver(
        function (entries) {
          offset = window.pageYOffset;
          isDown = offset > prevOffset;
          prevOffset = offset;

          for (i=0; i < entries.length; i++) {
            entry = entries[i];
            elem = entry.target;

            tmp = elem === container ? 'container:' : 'scene:';
            tmp += entry.isIntersecting ? 'enter' : 'exit';

            emit(tmp, {
              bounds: entry.boundingClientRect,
              index: tracks.indexOf(elem),
              isScrollingDown: isDown,
              element: elem,
            });
          }
        }, {
          rootMargin: tmp
        }
      );

      for (i=0; i < scenes.length; i++) {
        tracks.push(elem = scenes[i]);
        observer.observe(elem);
      }

      // a container is not required, but if provided we'll track it
      if (container) observer.observe(container);

      // scroller is ready
      emit('init');
    }
  };
}
