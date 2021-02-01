const PlayerAPI = require('../src/index').default;
const createMockIFrame = require('./mocks/iframe');

jest.mock('../src/iframe', () => ({
	getIframe: val => val,
	esModule: true,
}));

describe('EmbedAPI tests', () => {
	let mockFrame = null;

	beforeEach(() => {
		mockFrame = createMockIFrame();
	});

	afterEach(() => {
		mockFrame = null;
	});

	afterAll(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	describe('addListener', () => {
		test('ready', () => {
			const	embedapi = PlayerAPI(mockFrame);
			const callback = jest.fn();

			embedapi.addListener('ready', callback);
			mockFrame.send('ready', true);

			expect(callback).toHaveBeenCalledTimes(1);
		});

		test('live', () => {
			const	embedapi = PlayerAPI(mockFrame);
			const callback = jest.fn();

			embedapi.addListener('live', callback);

			mockFrame.send('ready', true);
			mockFrame.send('live', true);

			expect(callback).toHaveBeenCalledTimes(1);
		});
	});

	describe('removeListener', () => {
		test('live', () => {
			const	embedapi = PlayerAPI(mockFrame);
			const callback = jest.fn();

			embedapi.addListener('live', callback);
			mockFrame.send('ready', true);

			mockFrame.send('live', true);
			embedapi.removeListener('live', callback);
			mockFrame.send('live', true);

			expect(callback).toHaveBeenCalledTimes(1);
		});
	});

	describe('callMethod', () => {
		test('play', () => {
			const	embedapi = PlayerAPI(mockFrame);
			const callback = jest.fn();

			mockFrame.on('message', callback);
			mockFrame.send('ready', true);

			embedapi.callMethod('play');

			expect(JSON.parse(callback.mock.calls[0][0])).toMatchObject({
				cmd: 'apihandshake',
			});
			expect(JSON.parse(callback.mock.calls[1][0])).toMatchObject({
				cmd: 'play',
			});
		});

		test('pause', () => {
			const	embedapi = PlayerAPI(mockFrame);
			const callback = jest.fn();

			mockFrame.on('message', callback);
			mockFrame.send('ready', true);

			embedapi.callMethod('pause');

			expect(JSON.parse(callback.mock.calls[0][0])).toMatchObject({
				cmd: 'apihandshake',
			});
			expect(JSON.parse(callback.mock.calls[1][0])).toMatchObject({
				cmd: 'pause',
			});
		});

		test('stop', () => {
			const	embedapi = PlayerAPI(mockFrame);
			const callback = jest.fn();

			mockFrame.on('message', callback);
			mockFrame.send('ready', true);

			embedapi.callMethod('stop');

			expect(JSON.parse(callback.mock.calls[0][0])).toMatchObject({
				cmd: 'apihandshake',
			});
			expect(JSON.parse(callback.mock.calls[1][0])).toMatchObject({
				cmd: 'stop',
			});
		});

		test('load', () => {
			const	embedapi = PlayerAPI(mockFrame);
			const callback = jest.fn();

			mockFrame.on('message', callback);
			mockFrame.send('ready', true);

			embedapi.callMethod('load', 'channel', 1524);

			expect(JSON.parse(callback.mock.calls[0][0])).toMatchObject({
				cmd: 'apihandshake',
			});
			expect(JSON.parse(callback.mock.calls[1][0])).toMatchObject({
				cmd: 'load',
				args: ['channel', 1524],
			});
		});

		test('seek', () => {
			const	embedapi = PlayerAPI(mockFrame);
			const callback = jest.fn();

			mockFrame.on('message', callback);
			mockFrame.send('ready', true);

			embedapi.callMethod('seek', 180);

			expect(JSON.parse(callback.mock.calls[0][0])).toMatchObject({
				cmd: 'apihandshake',
			});
			expect(JSON.parse(callback.mock.calls[1][0])).toMatchObject({
				cmd: 'seek',
				args: [180],
			});
		});

		test('volume', () => {
			const	embedapi = PlayerAPI(mockFrame);
			const callback = jest.fn();

			mockFrame.on('message', callback);
			mockFrame.send('ready', true);

			embedapi.callMethod('volume', 30);

			expect(JSON.parse(callback.mock.calls[0][0])).toMatchObject({
				cmd: 'apihandshake',
			});
			expect(JSON.parse(callback.mock.calls[1][0])).toMatchObject({
				cmd: 'volume',
				args: [30],
			});
		});

		test('quality', () => {
			const	embedapi = PlayerAPI(mockFrame);
			const callback = jest.fn();

			mockFrame.on('message', callback);
			mockFrame.send('ready', true);

			embedapi.callMethod('quality', 16);

			expect(JSON.parse(callback.mock.calls[0][0])).toMatchObject({
				cmd: 'apihandshake',
			});
			expect(JSON.parse(callback.mock.calls[1][0])).toMatchObject({
				cmd: 'quality',
				args: [16],
			});
		});

		test('callMethod with missed ready event', () => {
			mockFrame = createMockIFrame({ ready: true });
			mockFrame.send('ready', true);

			const	embedapi = PlayerAPI(mockFrame); // late init

			const callback = jest.fn();
			mockFrame.on('message', callback);

			embedapi.callMethod('play');

			expect(JSON.parse(callback.mock.calls[0][0])).toMatchObject({
				cmd: 'apihandshake',
			});
			expect(JSON.parse(callback.mock.calls[1][0])).toMatchObject({
				cmd: 'play',
			});
		});
	});

	describe('socialstream connect', () => {
		let ssFrame = null;

		beforeEach(() => {
			ssFrame = createMockIFrame('socialStream');
		});
	
		afterEach(() => {
			ssFrame = null;
		});

		test('listen to sstream iframe', () => {
			const embedapi = PlayerAPI(mockFrame);
			const windowSpy = jest.spyOn(window, 'addEventListener');
			embedapi.callMethod('socialstream', ssFrame);

			expect(windowSpy).toHaveBeenCalledTimes(1);
			expect(windowSpy.mock.calls[0][0]).toBe('message');
		});

		test('ready', () => {
			const callback = jest.fn();

			ssFrame.on('message', callback);

			const embedapi = PlayerAPI(mockFrame);
			mockFrame.send('ready', true);
			embedapi.callMethod('socialstream', ssFrame);

			ssFrame.socialsend('ready');

			expect(JSON.parse(callback.mock.calls[0][0])).toMatchObject({
				cmd: 'ready',
			});
		});

		test('load', () => {
			const callback = jest.fn();
			const ssCallback = jest.fn();
			const embedapi = PlayerAPI(mockFrame);

			mockFrame.on('message', callback);
			ssFrame.on('message', ssCallback);
			mockFrame.onload();
			mockFrame.send('ready', true);
			ssFrame.socialsend('ready');

			embedapi.callMethod('socialstream', ssFrame);

			ssFrame.socialsend('load', ['video', 123456]);

			expect(JSON.parse(callback.mock.calls[0][0])).toMatchObject({
				cmd: 'ready',
			});
			expect(JSON.parse(callback.mock.calls[1][0])).toMatchObject({
				cmd: 'apihandshake',
			});
			expect(JSON.parse(callback.mock.calls[2][0])).toMatchObject({
				cmd: 'load',
				args: ['video', 123456],
			});
		});
	});

	describe('getProperty', () => {
		test('duration', () => {
			const callback = jest.fn();
			const embedapi = PlayerAPI(mockFrame);

			mockFrame.send('ready', true);
			embedapi.getProperty('duration', callback);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback.mock.calls[0][0]).toBe(100);
		});

		test('viewers', () => {
			const callback = jest.fn();
			const embedapi = PlayerAPI(mockFrame);

			mockFrame.send('ready', true);
			embedapi.getProperty('viewers', callback);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback.mock.calls[0][0]).toBe(100);
		});

		test('progress', () => {
			const callback = jest.fn();
			const embedapi = PlayerAPI(mockFrame);

			mockFrame.send('ready', true);
			embedapi.getProperty('progress', callback);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback.mock.calls[0][0]).toBe(100);
		});

		describe('playingContent', () => {
			test('called once', () => {
				const callback = jest.fn();
				const embedapi = PlayerAPI(mockFrame);
	
				mockFrame.send('ready', true);
				embedapi.getProperty('playingContent', callback);
	
				expect(callback).toHaveBeenCalledTimes(1);
				expect(callback.mock.calls[0][0]).toBe(100);
			});

			test('called twice', () => {
				const callback = jest.fn();
				const embedapi = PlayerAPI(mockFrame);
				mockFrame.send('ready', true);

				embedapi.callMethod('playingContent', () => {
					embedapi.callMethod('playingContent', callback);
				});

				expect(callback).toHaveBeenCalledTimes(1);
				expect(callback.mock.calls[0][0]).toBe(100);
			});
		});

		test('getProperty with missed ready event', () => {
			mockFrame = createMockIFrame({ ready: true });
			mockFrame.send('ready', true);

			const	embedapi = PlayerAPI(mockFrame); // late init
			const callback = jest.fn();

			embedapi.getProperty('duration', callback);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback.mock.calls[0][0]).toBe(100);
		});
	});

	describe('destroy', () => {
		test('destroy', () => {
			const callback = jest.fn();
			const callback2 = jest.fn();
			const embedapi = PlayerAPI(mockFrame);

			embedapi.addListener('ready', callback);
			embedapi.addListener('live', callback);

			mockFrame.send('ready', true);
			mockFrame.send('live', true);

			expect(callback).toHaveBeenCalledTimes(2);

			embedapi.addListener('live', callback2);
			embedapi.destroy();

			mockFrame.send('live', false);

			expect(callback2).not.toHaveBeenCalled();
		});
	});

});
