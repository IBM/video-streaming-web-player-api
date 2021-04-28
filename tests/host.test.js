global.window = Object.create(window);
const realLocation = window.location;

const { ERRORS } = require('../src/errors');
const { getHostName } = require('../src/host');

describe('host', () => {
	afterEach(() => {
		Object.defineProperty(window, 'location', {
			value: realLocation,
			writable: true,
		});

		jest.resetAllMocks();
		jest.resetModules();
	});

	describe('getHostName', () => {
		test('should handle http url', () => {
			const host = 'http://example.com';
			const expected = 'http://example.com';
			expect(getHostName(host)).toEqual(expected);
		});

		test('should handle https url', () => {
			const host = 'https://example.com';
			const expected = 'https://example.com';
			expect(getHostName(host)).toEqual(expected);
		});

		test('should crop path', () => {
			const host = 'https://example.com/my/path';
			const expected = 'https://example.com';
			expect(getHostName(host)).toEqual(expected);
		});

		test('should handle missing protocol', () => {
			delete window.location;
			Object.defineProperty(global.window, 'location', {
				value: { protocol: 'https:' },
				writable: true,
			});

			const host = '//example.com/my/path';
			const expected = 'https://example.com';
			expect(getHostName(host)).toEqual(expected);
		});

		test('should throw error when src is invalid', () => {
			const host = 'invalid.com';
			const expectedError = new TypeError(ERRORS.INVALID_IFRAME_SRC);
			expect(() => getHostName(host)).toThrow(expectedError);
		});

		test('should work with api-target-origin parameter', () => {
			const host = 'http://video.ibm.com?api-target-origin=https%3A%2F%2Fpages.github.ibm.com%2F';
			const expected = 'http://video.ibm.com?api-target-origin=https%3A%2F%2Fpages.github.ibm.com%2F';
			expect(getHostName(host)).toEqual(expected);
		});
	});
});
