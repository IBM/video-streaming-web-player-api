import { ERRORS } from './errors';

const hostExpression = /^(http(?:s)?:\/\/[^/]+)/im;

/**
 * @param {string} url
 * @throws {TypeError}
 * @returns {string} hostName
 */
export function getHostName(url) {
	const urlWithProtocol = url.indexOf('http') !== 0
		? `${window.location.protocol}${url}`
		: url;

	try {
		const [, hostName] = urlWithProtocol.match(hostExpression);
		return hostName;
	} catch (_) {
		throw new TypeError(ERRORS.INVALID_IFRAME_SRC);
	}
}
