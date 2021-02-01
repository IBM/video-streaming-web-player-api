const { addEvent } = require('../src/dom');

describe('dom', () => {
	describe('addEvent', () => {
		test('should use addEventListener if possible', () => {
			const addEventListener = jest.fn();
			const target = { addEventListener };
			const event = 'test';

			addEvent(target, event, function() {});
			expect(target.addEventListener).toHaveBeenCalledTimes(1);

			const { calls } = target.addEventListener.mock;
			expect(calls[0][0]).toEqual(event);
			expect(typeof calls[0][1]).toEqual('function');
		});

		test('should fallback to attachEvent', () => {
			const attachEvent = jest.fn();
			const target = { attachEvent };
			const event = 'test';

			addEvent(target, event, function() {});
			expect(target.attachEvent).toHaveBeenCalledTimes(1);

			const { calls } = target.attachEvent.mock;
			expect(calls[0][0]).toEqual(`on${event}`);
			expect(typeof calls[0][1]).toEqual('function');
		});
	});
});
