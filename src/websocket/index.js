//todo: remove configs
//make public method private
(function () {
	var r = require;
	var WebSocketRequest = r('./req');
	var util = r('./u');

	var WebSocketServer = function WebSocketServer(config) {
		var
			wss = this,
			connections = [];

		wss.unmount = function() {
			wss.config.httpServer.removeListener('upgrade', handleUpgrade.bind(wss));
		};

		wss.close = function(connection, closeReason, description) {
			var index = connections.indexOf(connection);
			if (index !== -1) {
				connections.splice(index, 1);
			}
			wss.emit('close', connection, closeReason, description);
		};

		wss.closeAll = function() {
			connections.forEach(function(connection) {
				connection.close();
			});
		};

		wss.broadcast = function(data) {
			connections.forEach(function(connection) {
				connection.send(utfData);
			});
		};

		wss.shutDown = function() {
			wss.unmount();
			wss.closeAll();
		};

		function handleUpgrade(request, socket, head) {
			var wsRequest = new WebSocketRequest(socket, request, wss.config);
			try {
				wsRequest.readHandshake();
			} catch(e) {
				wsRequest.reject(e.httpCode || 400);
				return;
			}

			wsRequest.once('requestAccepted', handleRequestAccepted.bind(wss));
			wsRequest.accept(wsRequest.requestedProtocols[0], wsRequest.origin);
		}

		function handleRequestAccepted(connection) {
			var self = this;
			connection.once('close', function(closeReason, description) {
				self.close(connection, closeReason, description);
			});
			connections.push(connection);
			wss.emit('connect', connection);
		}

		wss.mount = function(config) {
			wss.config = {
				// The http server instance to attach to.  Required.
				httpServer: null,
				// 64KiB max frame size.
				maxReceivedFrameSize: 0x10000,

				// 1MiB max message size, only applicable if
				// assembleFragments is true
				maxReceivedMessageSize: 0x100000,

				// Outgoing messages larger than fragmentationThreshold will be
				// split into multiple fragments.
//				fragmentOutgoingMessages: true,

				// Outgoing frames are fragmented if they exceed this threshold.
				// Default is 16KiB
//				fragmentationThreshold: 0x4000,

				// If true, fragmented messages will be automatically assembled
				// and the full message will be emitted via a 'message' event.
				// If false, each frame will be emitted via a 'frame' event and
				// the application will be responsible for aggregating multiple
				// fragmented frames.  Single-frame messages will emit a 'message'
				// event in addition to the 'frame' event.
				// Most users will want to leave this set to 'true'
//				assembleFragments: true,

				// The number of milliseconds to wait after sending a close frame
				// for an acknowledgement to come back before giving up and just
				// closing the socket.
				closeTimeout: 5000
			};
			util.ex(wss.config, config);

			wss.config.httpServer.on('upgrade', handleUpgrade.bind(wss));
		};

		if (config) {
			wss.mount(config);
		}
	};

	util.in(WebSocketServer, util.em);

	module.exports = WebSocketServer;
})();