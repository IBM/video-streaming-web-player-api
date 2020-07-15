/** !
 * Video Streaming Player Api
 * https://video.ibm.com/
 *
 * The IBM Video Streaming Player API provides methods to control
 * live streams and on demand playback of embedded players.
 */
export default (function () {
	const objectKeys = (typeof Object.keys !== 'undefined');
	const instances = {};
	const hostRegexp = new RegExp('^(http(?:s)?\://[^/]+)', 'im');

	function UstreamEmbed(iframe) {
		return createInstance(iframe);
	}

	function createInstance(iframe) {
		const element = getIframe(iframe);
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

			sendMessage(element, embedHost, { cmd: 'probe' });

			function addCommandQueue(method) {
				if (method === 'socialstream') {
					addDomEvent(window, 'message', onSocialFrame);

					sStreamElement = getIframe(arguments[1]);

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
					cmdQueue.push(arguments);
					sendMessage(element, embedHost, { cmd: 'probe' });
					return;
				}

				const args = (makeArray(arguments)).slice(1);

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
				let args;

				if (!!d.cmd && d.cmd == 'ready') {
					sendMessage(sStreamElement, sStreamHost, { cmd: 'ready' });
					return;
				}

				args = [d.cmd];
				args = args.concat(d.args);

				addCommandQueue.apply(this, args);
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

			function callMethod() {
				addCommandQueue.apply(this, arguments);
			}

			return instanceObj = {
				host: embedHost,
				callMethod,

				getProperty() {
					callMethod.apply(this, arguments);
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

					if (e.origin.toLowerCase() == embedHost) {
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
						} if (!!d.event && d.event.live === false) {
							dispatchEvent(events, 'offline');
							return;
						}

						if (!!d.event && !d.event.ready) {
							if (objectKeys) {
								Object.keys(d.event).forEach((key) => {
									dispatchEvent(events, key, d.event[key]);
								});
							} else {
								for (var key in d.event) {
									if (d.event.hasOwnProperty(key)) {
										dispatchEvent(events, key, d.event[key]);
									}
								}
							}
						}

						if (d.property) {
							if (objectKeys) {
								Object.keys(d.property).forEach((key) => {
									callGetter(getters, key, d.property[key]);
								});
							} else {
								for (var key in d.property) {
									if (d.property.hasOwnProperty(key)) {
										callGetter(getters, key, d.property[key]);
									}
								}
							}
						}
					} else if (sStreamConnected && e.origin == sStreamHost) {
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

					if (instances[element.id]) instances[element.id] = null;
					element = null;
				},
			};
		}(element));

		if (!element.id) {
			element.id = `UstreamEmbed${Math.ceil(Math.random() * 100000)}`;
		}

		instance.id = element.id;

		instances[element.id] = instance;
		return instance;
	}

	function getIframe(iframe) {
		if (typeof iframe === 'string') {
			iframe = document.getElementById(iframe);
		}
		return iframe;
	}

	function dispatchEvent(events, event, data) {
		for (const cb in events[event]) {
			if (events[event].hasOwnProperty(cb)) {
				events[event][cb].call(window, event, data);
			}
		}
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
		let ins; let
			doc;
		for (ins in instances) {
			if (instances.hasOwnProperty(ins) && instances[ins]) {
				doc = document.getElementById(ins);
				if (doc && doc.contentWindow) {
					if (doc.contentWindow === e.source) {
						instances[ins].onmessage(e);
					}
				} else if (typeof e.source === 'string' && e.source == ins) {
					instances[ins].onmessage(e);
				}
			}
		}
	}

	function sendMessage(element, host, data) {
		element.contentWindow.postMessage(JSON.stringify(data), host);
	}

	function getHostName(url) {
		if (url.indexOf('http') < 0) {
			url = location.protocol + url;
		}
		return url.match(hostRegexp)[1].toString();
	}

	function makeArray(smtg) {
		return Array.prototype.slice.call(smtg, 0);
	}

	function addDomEvent(target, event, cb) {
		if (target.addEventListener) {
			target.addEventListener(event, cb, false);
		} else {
			target.attachEvent(`on${event}`, cb);
		}
	}

	addDomEvent(window, 'message', onMessage);

	return (window.UstreamEmbed = UstreamEmbed);
}());
