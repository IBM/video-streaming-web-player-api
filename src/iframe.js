import { ERRORS } from './errors';

/**
 * @param {HTMLIFrameElement|string} iframeOrId
 * @throws {TypeError}
 */
export function getIframe(iframeOrId) {
	let iframe = iframeOrId;
	if (typeof iframeOrId === 'string') {
		iframe = getIframeById(iframeOrId);
	}

	if (!(iframe instanceof HTMLIFrameElement)) {
		throw new TypeError(ERRORS.INVALID_IFRAME_REFERENCE);
	}

	return iframe;
}

/**
 * @param {string} id
 * @throws {TypeError}
 * @returns {HTMLIFrameElement} iframe
 */
function getIframeById(id) {
	const iframe = document.getElementById(id);
	if (!iframe) {
		throw new TypeError(ERRORS.INVALID_IFRAME_ID);
	}

	return iframe;
}