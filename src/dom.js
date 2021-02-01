/**
 * @param {HTMLElement} target
 * @param {string} event
 * @param {Function} cb
 */
export function addEvent(target, event, cb) {
	if (target.addEventListener) {
		target.addEventListener(event, cb, false);
	} else {
		target.attachEvent(`on${event}`, cb);
	}
}
