const { ERRORS } = require('../src/errors');
const { getIframe } = require('../src/iframe');

describe('iframe', () => {
	let originalBody;

	beforeEach(() => {
		originalBody = document.body.innerHTML;
	})

	afterEach(() => {
		document.body.innerHTML = originalBody;
		originalBody = undefined;
	});

	describe('getIframe', () => {
		test('should accept reference to HTMLIframeElement', () => {
			const iframe = getIframe(document.createElement('iframe'));
			expect(iframe instanceof HTMLIFrameElement).toBe(true);
		});

		test('should query iframe by provided id', () => {
			const id = 'test';
			document.body.innerHTML = `<iframe id=${id}></iframe>`;

			const iframe = getIframe(id);
			expect(iframe instanceof HTMLIFrameElement).toBe(true);
		});

		test('should throw error if iframe is not found by the provided id', () => {
			const expectedError = new TypeError(ERRORS.INVALID_IFRAME_ID);
			expect(() => getIframe('invalidId')).toThrow(expectedError);
		});

		test('should throw error if provided reference is not an iframe', () => {
			const id = 'notIframeId';
			document.body.innerHTML = `<div id=${id}></div>`;

			const expectedError = new TypeError(ERRORS.INVALID_IFRAME_REFERENCE);
			expect(() => getIframe('notIframeId')).toThrow(expectedError);
		});
	});
});
