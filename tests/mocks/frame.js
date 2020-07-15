module.exports = ({ id, ready } = {}) => {
	let messageHandlers = [];
	let instance = {};

	function send(event, data, property) {
		const evt = document.createEvent('Event');
		const eventdata = {};

		evt.initEvent('message', true, true);
		evt.origin = 'http://localhost';
		evt.source = instance.id;

		if (!property) {
			eventdata.event = {};
			eventdata.event[event] = data;
		} else {
			eventdata.property = {};
			eventdata.property[property] = data;
		}

		evt.data = JSON.stringify(eventdata);

		window.dispatchEvent(evt);
	}

	function socialsend(cmd, data) {
		const evt = document.createEvent('Event');
		const eventdata = {};

		evt.initEvent('message', true, true);
		evt.origin = 'http://localhost';
		evt.source = instance.id;

		eventdata.cmd = cmd;
		eventdata.args = data;

		eventdata.sstream = true;

		evt.data = JSON.stringify(eventdata);

		window.dispatchEvent(evt);
	}

	instance = {

		id: id || '',

		getAttribute(attr) {
			switch (attr) {
				case 'src':
					return 'http://localhost/frame.html';
				default:
					return null;
			}
		},

		contentWindow: {
			postMessage(data, host) {
				const eventdata = JSON.parse(data);

				switch (eventdata.cmd) {
					case 'probe':
						if (ready) {
							send('ready', true);
						}
						break;
					case 'duration':
					case 'viewers':
					case 'progress':
					case 'playingContent':
						send(null, 100, eventdata.cmd);
						break;
					// no default
				}

				messageHandlers.forEach((callback) => {
					callback.call(window, data, host);
				});
			},
		},

		send,

		socialsend,

		on(event, cb) {
			messageHandlers.push(cb);
		},

		off() {
			messageHandlers = [];
		},
	};

	return instance;
};
