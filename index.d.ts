export interface Options {
	/**
	Determines the offset used with Scroller's Intersection Observer for the
  provided scenes.

	@default 0.5
	*/
	readonly offset: number;
}

export interface Entry<T extends Element> {
	/**
	The DOMRect for the triggered scene's element.
	*/
	bounds: IntersectionObserverEntry['boundingClientRect'];
	/**
	The index of the triggered scene.
	*/
	readonly index: number;
	/**
	A boolean that represents which direction the page was scrolled in when the
  scene triggered.
	*/
	readonly isScrollingDown: boolean;
	/**
  The element of the triggered scene.
  */
	readonly element: T;
}

/**
A callback function provided to Scroller#on() that is called whenever a scene
is triggered.

@param entry - An entry representing the scene that triggered.
*/
export type Handler<T> = (entry: Entry<T>) => void;

/**
A function returned from Scroller#on() that when called unsets the previously
set event listener.
*/
export type Off = () => void;

interface Scroller<T extends Element> {
	/**
  A callback function provided to Scroller#on() that is called whenever a scene
  is triggered.

  @param type - The type of trigger to listen for.
  @param handler - A function to call whenever this trigger fires that is passed information about the scene that activated.
  @returns A function that can be called to cancel this event listener.
  */
	on(type: 'enter' | 'exit', handler: Handler<T>): Off;
	/**
  Activates this instance of Scroller. This sets up the internal Intersection
  Observer and will begin sending scene trigger events.
  */
	init(): void;
}

/**

@param scenes - A list of Elements to observe with this instance of Scroller.
@param options
@returns An instance of Scroller.
 */
export default function Scroller<T extends Element>(
	scenes: ArrayLike<T>,
	options?: Options,
): Scroller<T>;
