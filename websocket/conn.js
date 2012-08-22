//todo: figure out if setCloseTimer is really essential
//toto: figure out if we can skip handling of .protocolError
(function () {
	var r = require;
	var util = r('./u');
	var WebSocketFrame = r('./frame');
	var BufferList = r('./list');
	var STATE_CLOSING = "closing";
	var STATE_CLOSED = "closed";
	
	function WebSocketConnection(socket, extensions, protocol, maskOutgoingPackets, config) {
		var wsc = this;
		var outputPaused = false;
		var outgoingFrameQueue = [];
		var bytesWaitingToFlush = 0;
		wsc.config = config;
	    wsc.extensions = extensions;
	    wsc.remoteAddress = socket.remoteAddress;
	    wsc.closeReasonCode = -1;
	    
	    // We have to mask outgoing packets if we're acting as a WebSocket client.
	    wsc.maskOutgoingPackets = maskOutgoingPackets;
	    
	    // We re-use the same buffers for the mask and frame header for all frames
	    // received on each connection to avoid a small memory allocation for each
	    // frame.
	    wsc.maskBytes = new Buffer(4);
	    wsc.frameHeader = new Buffer(10);
	    
	    // the BufferList will handle the data streaming in
	    wsc.bufferList = new BufferList();
	    
	    // Prepare for receiving first frame
	    wsc.currentFrame = new WebSocketFrame(wsc.maskBytes, wsc.frameHeader, wsc.config);
//	    wsc.fragmentationSize = 0; // data received so far...
	    wsc.frameQueue = [];
	    
	    // Various bits of connection state
	    wsc.connected = true;
	    wsc.state = "open";
	    wsc.waitingForCloseResponse = false;
	    
	    wsc.closeTimeout = wsc.config.closeTimeout;
//	    wsc.assembleFragments = wsc.config.assembleFragments;
	    wsc.maxReceivedMessageSize = wsc.config.maxReceivedMessageSize;
	
		wsc.data = function(data) {

			// Add received data to our bufferList, which efficiently holds received
			// data chunks in a linked list of Buffer objects.
			wsc.bufferList.write(data);

			// currentFrame.addData returns true if all data necessary to parse
			// the frame was available.  It returns false if we are waiting for
			// more data to come in on the wire.
			while (wsc.connected && wsc.currentFrame.addData(wsc.bufferList)) {

				// Handle possible parsing errors
				if (wsc.currentFrame.protocolError) {
					// Something bad happened.. get rid of this client.
					wsc.drop(1002, wsc.currentFrame.dropReason);
					return;
				}

//				if (!wsc.assembleFragments) {
					wsc.emit('frame', wsc.currentFrame);
//				}
				wsc.processFrame(wsc.currentFrame);
				wsc.currentFrame = new WebSocketFrame(wsc.maskBytes, wsc.frameHeader, wsc.config);
			}
		};

		wsc.error = function(error) {
			// console.log((new Date()) + " - Socket Error - Closing Connection: " + error);
			if (wsc.listeners('error').length > 0) {
				wsc.emit('error', error);
			}
			socket.end();
		};

		wsc.end = function() {
			// console.log((new Date()) + " - Socket End");
			socket.end();
			wsc.frameQueue = null;
			outgoingFrameQueue = [];
//			wsc.fragmentationSize = 0;
			wsc.bufferList = null;
		};

		wsc.close = function(hadError) {
			wsc.socketHadError = hadError;
			wsc.connected = false;
			wsc.state = STATE_CLOSED;
			if (!wsc.closeEventEmitted) {
				wsc.closeEventEmitted = true;
				// console.log((new Date()) + " - Emitting WebSocketConnection close event");
				wsc.emit('close', wsc.closeReasonCode);
			}
			wsc.clearCloseTimer();
		};

		wsc.drain = function() {
			outputPaused = false;
			wsc.processOutgoingFrameQueue();
		};

		wsc.close = function() {
			// console.log((new Date()) + " - Initating clean WebSocket close sequence.");
			if (wsc.connected) {
				wsc.closeReasonCode = 1000;
				wsc.setCloseTimer();
				wsc.sendCloseFrame();
				wsc.state = STATE_CLOSING;
				wsc.connected = false;
			}
			if (!wsc.closeEventEmitted) {
				wsc.closeEventEmitted = true;
				// console.log((new Date()) + " - Emitting WebSocketConnection close event");
				wsc.emit('close', wsc.closeReasonCode);
			}
		};

		wsc.drop = function(reasonCode, description, skipCloseFrame) {
			if (typeof(reasonCode) !== 'number') {
				reasonCode = 1002;
			}

			wsc.closeReasonCode = reasonCode;
			outgoingFrameQueue = [];
			wsc.frameQueue = [];
//			wsc.fragmentationSize = 0;
			if (!skipCloseFrame) {
				wsc.sendCloseFrame(reasonCode, "", true);
			}
			wsc.connected = false;
			wsc.state = STATE_CLOSED;
			wsc.closeEventEmitted = true;
			wsc.emit('close', reasonCode, "");
			socket.destroy();
		};

		wsc.setCloseTimer = function() {
			wsc.clearCloseTimer();
			// console.log((new Date()) + " - Setting close timer");
			wsc.waitingForCloseResponse = true;
			wsc.closeTimer = setTimeout(wsc._closeTimerHandler, wsc.closeTimeout);
		};

		wsc.clearCloseTimer = function() {
			if (wsc.closeTimer) {
				// console.log((new Date()) + " - Clearing close timer");
				clearTimeout(wsc.closeTimer);
				wsc.waitingForCloseResponse = false;
				wsc.closeTimer = null;
			}
		};

		wsc.handleCloseTimer = function() {
			wsc.closeTimer = null;
			if (wsc.waitingForCloseResponse) {
				// console.log((new Date()) + " - Close response not received from client.  Forcing socket end.");
				wsc.waitingForCloseResponse = false;
				socket.end();
			}
		};

		wsc.processFrame = function(frame) {
			var i;
			var message;

			switch(frame.opcode) {
//				case 0x02: // WebSocketFrame.BINARY_FRAME
//					if (wsc.assembleFragments) {
//						if (frame.fin) {
//							// Complete single-frame message received
//							wsc.emit('message', {
//								type: 'binary',
//								binaryData: frame.binaryPayload
//							});
//						}
//						else {
//							// beginning of a fragmented message
//							wsc.frameQueue.push(frame);
//							wsc.fragmentationSize = frame.length;
//						}
//					}
//					break;
				case 0x01: // WebSocketFrame.TEXT_FRAME
//					if (wsc.assembleFragments) {
//						if (frame.fin) {
							// Complete single-frame message received
							wsc.emit('message', {
								type: 'utf8',
								utf8Data: frame.binaryPayload.toString('utf8')
							});
//						}
//						else {
//							// beginning of a fragmented message
//							wsc.frameQueue.push(frame);
//							wsc.fragmentationSize = frame.length;
//						}
//					}
					break;
//				case 0x00: // WebSocketFrame.CONTINUATION
//					if (wsc.assembleFragments) {
//						wsc.fragmentationSize += frame.length;
//						wsc.frameQueue.push(frame);
//
//						if (frame.fin) {
//							// end of fragmented message, so we process the whole
//							// message now.  We also have to decode the utf-8 data
//							// for text frames after combining all the fragments.
//							var bytesCopied = 0;
//							var binaryPayload = new Buffer(wsc.fragmentationSize);
//							wsc.frameQueue.forEach(function (currentFrame) {
//								currentFrame.binaryPayload.copy(binaryPayload, bytesCopied);
//								bytesCopied += currentFrame.binaryPayload.length;
//							});
//
//							switch (wsc.frameQueue[0].opcode) {
////								case 0x02: // WebSocketOpcode.BINARY_FRAME
////									wsc.emit('message', {
////										type: 'binary',
////										binaryData: binaryPayload
////									});
////									break;
//								case 0x01: // WebSocketOpcode.TEXT_FRAME
//									wsc.emit('message', {
//										type: 'utf8',
//										utf8Data: binaryPayload.toString('utf8')
//									});
//									break;
//								default:
//									wsc.drop(1002);
//									return;
//							}
//
//							wsc.frameQueue = [];
//							wsc.fragmentationSize = 0;
//						}
//					}
//					break;
				case 0x09: // WebSocketFrame.PING
//					t.pong(frame.binaryPayload);
					break;
				case 0x0A: // WebSocketFrame.PONG
					break;
				case 0x08: // WebSocketFrame.CONNECTION_CLOSE
					// console.log((new Date()) + " - Received close frame");
					if (wsc.waitingForCloseResponse) {
						// Got response to our request to close the connection.
						// Close is complete, so we just hang up.
						// console.log((new Date()) + " - Got close response from peer.");
						wsc.clearCloseTimer();
						wsc.waitingForCloseResponse = false;
						wsc.state = STATE_CLOSED;
						socket.end();
					}
					else {
						// Got request from other party to close connection.
						// Send back acknowledgement and then hang up.
						wsc.state = STATE_CLOSING;
						var respondCloseReasonCode;

						// Make sure the close reason provided is legal according to
						// the protocol spec.  Providing no close status is legal.
						// WebSocketFrame sets closeStatus to -1 by default, so if it
						// is still -1, then no status was provided.
						if (frame.invalidCloseFrameLength) {
							wsc.closeReasonCode = 1005; // 1005 = No reason provided.
							respondCloseReasonCode = 1002;
						}
						else if (frame.closeStatus === -1) {
							wsc.closeReasonCode = frame.closeStatus;
							respondCloseReasonCode = 1000;
						}
						else {
							wsc.closeReasonCode = frame.closeStatus;
							respondCloseReasonCode = 1002;
						}

						wsc.sendCloseFrame(respondCloseReasonCode);
						socket.end();
						wsc.connected = false;
					}
					break;
				default:
					wsc.drop(1002);
					break;
			}
		};

		wsc.send = function(data, cb) {
			var frame = new WebSocketFrame(wsc.maskBytes, wsc.frameHeader, wsc.config);
			frame.opcode = 0x01; // WebSocketOpcode.TEXT_FRAME
			frame.binaryPayload = new Buffer(data.toString(), 'utf8');
			wsc.fragmentAndSend(frame, cb);
		};

		wsc.fragmentAndSend = function(frame, cb) {
//			if (frame.opcode > 0x07) {
//				throw new Error("You cannot fragment control frames.");
//			}
//			var threshold = wsc.config.fragmentationThreshold;
			var length = frame.binaryPayload.length;

//			if (wsc.config.fragmentOutgoingMessages && frame.binaryPayload && length > threshold) {
//				var numFragments = Math.ceil(length / threshold);
//				var sentFragments = 0;
//				var sentCallback = function (err) {
//					if (err) {
//						if (typeof cb === 'function') {
//							// pass only the first error
//							cb(err);
//							cb = null;
//						}
//						return;
//					}
//					++sentFragments;
//					if ((typeof cb === 'function') && (sentFragments === numFragments)) {
//						cb();
//					}
//				};
//				for (var i=1; i <= numFragments; i++) {
//					var currentFrame = new WebSocketFrame(wsc.maskBytes, wsc.frameHeader, wsc.config);
//
//					// continuation opcode except for first frame.
//					currentFrame.opcode = (i === 1) ? frame.opcode : 0x00;
//
//					// fin set on last frame only
//					currentFrame.fin = (i === numFragments);
//
//					// length is likely to be shorter on the last fragment
//					var currentLength = (i === numFragments) ? length - (threshold * (i-1)) : threshold;
//					var sliceStart = threshold * (i-1);
//
//					// Slice the right portion of the original payload
//					currentFrame.binaryPayload = frame.binaryPayload.slice(sliceStart, sliceStart + currentLength);
//
//					wsc.sendFrame(currentFrame, sentCallback);
//				}
//			}
//			else {
				frame.fin = true;
				wsc.sendFrame(frame, cb);
//			}
		};

		wsc.sendCloseFrame = function(reasonCode, reasonText, force) {
			if (typeof(reasonCode) !== 'number') {
				reasonCode = 1000;
			}
			var frame = new WebSocketFrame(wsc.maskBytes, wsc.frameHeader, wsc.config);
			frame.fin = true;
			frame.opcode = 0x08; // WebSocketOpcode.CONNECTION_CLOSE
			frame.closeStatus = reasonCode;
			if (typeof(reasonText) === 'string') {
				frame.binaryPayload = new Buffer(reasonText, 'utf8');
			}

			wsc.sendFrame(frame, force);
		};

		wsc.sendFrame = function(frame, force, cb) {
			if (typeof force === 'function') {
				cb = force;
				force = false;
			}
			frame.mask = wsc.maskOutgoingPackets;
			var buffer = frame.toBuffer();
			outgoingFrameQueue.unshift([buffer, cb]);
			bytesWaitingToFlush += buffer.length;
			if (!outputPaused || force) {
				wsc.processOutgoingFrameQueue();
			}
		};

		wsc.processOutgoingFrameQueue = function() {
			if (outputPaused) { return; }
			if (outgoingFrameQueue.length > 0) {
				var current = outgoingFrameQueue.pop();
				var buffer = current[0];
				var cb = current[1];
				// there is no need to accumulate messages in the queue if connection closed
				// connection will not be restored and messages will never be sent
				// therefore, notify callbacks about it
				if (!wsc.connected && (typeof cb === 'function')) {
					cb("closed");
					return;
				}
				try {
					var flushed = socket.write(buffer, cb);
				}
				catch(e) {
					if (typeof cb === 'function') {
						cb(e.toString());
					}
					if (wsc.listeners('error').length > 0) {
						wsc.emit("error", "Error while writing to socket: " + e.toString());
					}
					return;
				}
				bytesWaitingToFlush -= buffer.length;
				if (!flushed) {
					outputPaused = true;
					return;
				}
				process.nextTick(outgoingFrameQueueHandler);
			}
		};


		// The HTTP Client seems to subscribe to socket error events
		// and re-dispatch them in such a way that doesn't make sense
		// for users of our client, so we want to make sure nobody
		// else is listening for error events on the socket besides us.
		socket.removeAllListeners('error');
		socket.on('error', wsc.error.bind(this));
		socket.on('data', wsc.data.bind(this));
		socket.on('end', wsc.end.bind(this));
		socket.on('close', wsc.close.bind(this));
		socket.on('drain', wsc.drain.bind(this));

		socket.setNoDelay(true);

		outgoingFrameQueueHandler = wsc.processOutgoingFrameQueue.bind(this);
	    
	    wsc._closeTimerHandler = wsc.handleCloseTimer.bind(this);
	    
	}
	
	util.in(WebSocketConnection, util.em);
	
	module.exports = WebSocketConnection;
})();