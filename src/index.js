/** !
 * Video Streaming Player Api
 * https://video.ibm.com/
 *
 * The IBM Video Streaming Player API provides methods to control
 * live streams and on demand playback of embedded players.
 */
export default (function () {
	const instances = {};
	const hostRegexp = new RegExp('^(http(?:s)?://[^/]+)', 'im');

	function Embed(iframe) {
		return createInstance(iframe);
	}

	function createInstance(iframe) {
		const iframeElement = getIframe(iframe);
		const instance = (function (element) {
			let isReady = false;
			let instanceObj;
			let embedHost;
			let sStreamConnected = false;
			let sStreamHost;
			let sStreamElement;
			let cmdQueue = [];
			let getters = {};
			let events = {};
			let ieHackEvent = [];

			embedHost = getHostName(element.getAttribute('src')).toLowerCase();

			element.onload = onLoadElement;

			function addCommandQueue(method, ...args) {
				if (method === 'socialstream') {
					addDomEvent(window, 'message', onSocialFrame);

					sStreamElement = getIframe(args[0]);
					sStreamHost = getHostName(sStreamElement.getAttribute('src'));
					sStreamConnected = true;

					if (ieHackEvent.length) {
						for (let i = 0, il = ieHackEvent.length; i < il; i++) {
							onMessage(ieHackEvent[i]);
						}
					}
					return;
				}

				if (!isReady) {
					if (!cmdQueue) {
						cmdQueue = [];
					}
					cmdQueue.push([method, ...args]);

					sendMessage(element, embedHost, { cmd: 'probe' });
					return;
				}

				if (args[0] && typeof args[0] === 'function') {
					if (!getters[method]) {
						getters[method] = [];
					}
					getters[method].push(args[0]);
				}

				sendMessage(element, embedHost, { cmd: method, args });
			}

			function execCommandQueue() {
				if (cmdQueue) {
					while (cmdQueue.length) {
						addCommandQueue.apply(this, cmdQueue.shift());
					}
					cmdQueue = null;
				}
			}

			function onSocialFrame(e) {
				const doc = sStreamElement;

				if (doc && doc.contentWindow && doc.contentWindow === e.source) {
					instanceObj.onmessage(e);
				} else if (e.source === sStreamElement.id) {
					instanceObj.onmessage(e);
				}
			}

			function onSStreamMsg(e) {
				const d = JSON.parse(e.data);

				if (!!d.cmd && d.cmd === 'ready') {
					sendMessage(sStreamElement, sStreamHost, { cmd: 'ready' });
					return;
				}

				addCommandQueue.apply(this, [d.cmd, ...d.args]);
			}

			function onLoadElement() {
				sendMessage(element, embedHost, { cmd: 'ready' });
			}

			function ready() {
				if (isReady) {
					return;
				}

				isReady = true;
				sendMessage(element, embedHost, { cmd: 'apihandshake', args: [] });
				execCommandQueue();

				if (sStreamElement) {
					sendMessage(sStreamElement, sStreamHost, { cmd: 'viewer_ready' });
				}
			}

			function callMethod(...args) {
				addCommandQueue.apply(this, args);
			}

			instanceObj = {
				host: embedHost,
				callMethod,

				getProperty(...args) {
					callMethod.apply(this, args);
				},

				addListener(event, callback) {
					if (!events[event]) {
						events[event] = [];
					}
					events[event].push(callback);
				},

				removeListener(event, callback) {
					if (callback) {
						for (let i = 0, eL = events[event].length; i < eL; i++) {
							if (events[event][i] === callback) {
								events[event].splice(i, 1);
							}
						}
					} else {
						events[event] = null;
					}
				},

				onmessage(e) {
					let d;

					if (!embedHost && !sStreamHost) {
						ieHackEvent.push({
							origin: e.origin,
							data: e.data,
						});
					}

					if (e.origin.toLowerCase() === embedHost) {
						try {
							d = JSON.parse(e.data);
						} catch (err) {
							return;
						}

						if (d.sstream) {
							onSStreamMsg(e);
							return;
						}

						if (!!d.event && d.event.ready) {
							ready();
							dispatchEvent(events, 'ready');
						}

						if (!!d.event && d.event.live === true) {
							dispatchEvent(events, 'live');
							return;
						}

						if (!!d.event && d.event.live === false) {
							dispatchEvent(events, 'offline');
							return;
						}

						if (!!d.event && !d.event.ready) {
							Object.keys(d.event).forEach((key) => {
								dispatchEvent(events, key, d.event[key]);
							});
						}

						if (d.property) {
							Object.keys(d.property).forEach((key) => {
								callGetter(getters, key, d.property[key]);
							});
						}
					} else if (sStreamConnected && e.origin === sStreamHost) {
						onSStreamMsg(e);
					}
				},

				destroy() {
					isReady = false;
					embedHost = '';
					sStreamConnected = false;
					sStreamHost = '';
					sStreamElement = null;
					cmdQueue = [];
					getters = {};
					events = {};
					ieHackEvent = [];

					if (instances[element.id]) {
						instances[element.id] = null;
						delete instances[element.id];
					}
					element = null;
				},
			};

			return instanceObj;
		})(iframeElement);

		if (!iframeElement.id) {
			iframeElement.id = `Embed${Math.ceil(Math.random() * 100000)}`;
		}

		instance.id = iframeElement.id;

		instances[iframeElement.id] = instance;
		return instance;
	}

	function getIframe(iframe) {
		if (typeof iframe === 'string') {
			iframe = document.getElementById(iframe);
		}
		return iframe;
	}

	function dispatchEvent(events, event, data) {
		if (!events[event]) {
			return;
		}

		events[event].forEach((callback) => {
			callback.call(window, event, data);
		});
	}

	function callGetter(getters, event, data) {
		if (!getters[event]) {
			return;
		}

		const items = getters[event];

		getters[event] = null;
		delete getters[event];

		items.forEach((item) => {
			item.call(window, data);
		});
	}

	function onMessage(e) {
		Object.keys(instances).forEach((id) => {
			const instance = instances[id];
			const doc = document.getElementById(id);

			if (doc && doc.contentWindow) {
				if (doc.contentWindow === e.source) {
					instance.onmessage(e);
				}
			} else if (typeof e.source === 'string' && e.source === id) {
				instance.onmessage(e);
			}
		});
	}

	function sendMessage(element, host, data) {
		element.contentWindow.postMessage(JSON.stringify(data), host);
	}

	function getHostName(url) {
		if (url.indexOf('http') < 0) {
			url = window.location.protocol + url;
		}
		return url.match(hostRegexp)[1].toString();
	}

	function addDomEvent(target, event, cb) {
		if (target.addEventListener) {
			target.addEventListener(event, cb, false);
		} else {
			target.attachEvent(`on${event}`, cb);
		}
	}

	addDomEvent(window, 'message', onMessage);

	window.PlayerAPI = Embed;
	return Embed;
})();
