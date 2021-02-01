import { ERRORS } from "./errors";

const hostExpression = new RegExp('^(http(?:s)?://[^/]+)', 'im');

/**
 * @param {string} url
 * @throws {TypeError}
 * @returns {string} hostName
 */
export function getHostName(url) {
	if (url.indexOf('http') < 0) {
		url = window.location.protocol + url;
	}

	try {
		const [, hostName] = url.match(hostExpression);
		return hostName;
	} catch (_) {
		throw new TypeError(ERRORS.INVALID_IFRAME_SRC);
	}
}
