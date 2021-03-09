function getAttribute(attr) {
	switch (attr) {
		case 'src':
			return 'http://localhost/frame.html';
		default:
			return null;
	}
}

module.exports = ({ id, ready } = {}) => {
	const messageHandlers = [];
	let instance;

	function sendEvent(eventData) {
		const evt = document.createEvent('Event');
		evt.initEvent('message', true, true);
		evt.origin = 'http://localhost';
		evt.source = instance.id;
		evt.data = JSON.stringify(eventData);

		window.dispatchEvent(evt);
	}

	function send(event, data, property) {
		const eventData = {};
		if (!property) {
			eventData.event = {};
			eventData.event[event] = data;
		} else {
			eventData.property = {};
			eventData.property[property] = data;
		}

		sendEvent(eventData);
	}

	function socialsend(cmd, args) {
		const eventData = { cmd, args, sstream: true };
		sendEvent(eventData);
	}

	function postMessage(data, host) {
		const { cmd } = JSON.parse(data);
		switch (cmd) {
			case 'probe':
				if (ready) {
					send('ready', true);
				}
				break;
			case 'duration':
			case 'viewers':
			case 'progress':
			case 'playingContent':
				send(null, 100, cmd);
				break;
			// no default
		}

		messageHandlers.forEach((cb) => cb.call(window, data, host));
	}

	function on(_, cb) {
		messageHandlers.push(cb);
	}

	instance = {
		id,
		contentWindow: {
			postMessage,
		},
		getAttribute,
		on,
		send,
		socialsend,
	};

	return instance;
};
