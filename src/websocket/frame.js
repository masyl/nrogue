(function () {

	
	// WebSocketConnection will pass shared buffer objects for maskBytes and
	// frameHeader into the constructor to avoid tons of small memory allocations
	// for each frame we have to parse.  This is only used for parsing frames
	// we receive off the wire.
	function WebSocketFrame(maskBytes, frameHeader, config) {
	    this.maskBytes = maskBytes;
	    this.frameHeader = frameHeader;
	    this.config = config;
	    this.maxReceivedFrameSize = config.maxReceivedFrameSize;
	    this.protocolError = false;
	    this.frameTooLarge = false;
	    this.invalidCloseFrameLength = false;
	    this.parseState = 1;
	    this.closeStatus = -1;
	}
	
	WebSocketFrame.prototype.addData = function(bufferList, fragmentationType) {
	    var temp;
	    if (this.parseState === 1) {
	        if (bufferList.length >= 2) {
	            bufferList.joinInto(this.frameHeader, 0, 0, 2);
	            bufferList.advance(2);
	            var firstByte = this.frameHeader[0];
	            var secondByte = this.frameHeader[1];
	
	            this.fin     = Boolean(firstByte  & 0x80);
	            this.rsv1    = Boolean(firstByte  & 0x40);
	            this.rsv2    = Boolean(firstByte  & 0x20);
	            this.rsv3    = Boolean(firstByte  & 0x10);
	            this.mask    = Boolean(secondByte & 0x80);
	
	            this.opcode  = firstByte  & 0x0F;
	            this.length = secondByte & 0x7F;
	            
	            if (this.length === 126) {
	                this.parseState = 2;
	            }
	            else if (this.length === 127) {
	                this.parseState = 3;
	            }
	            else {
	                this.parseState = 4;
	            }
	        }
	    }
	    if (this.parseState === 2) {
	        if (bufferList.length >= 2) {
	            bufferList.joinInto(this.frameHeader, 2, 0, 2);
	            bufferList.advance(2);
	            this.length = ruint16(this.frameHeader, 2);
	            this.parseState = 4;
	        }
	    }
	    else if (this.parseState === 3) {
	        if (bufferList.length >= 8) {
	            bufferList.joinInto(this.frameHeader, 2, 0, 8);
	            bufferList.advance(8);
	            var lengthPair = ruint64(this.frameHeader, 2);
	            if (lengthPair[0] !== 0) {
	                this.protocolError = true;
	                this.dropReason = "Unsupported 64-bit length frame received";
	                return true;
	            }
	            this.length = lengthPair[1];
	            this.parseState = 4;
	        }
	    }
	    
	    if (this.parseState === 4) {
	        if (this.mask) {
	            if (bufferList.length >= 4) {
	                bufferList.joinInto(this.maskBytes, 0, 0, 4);
	                bufferList.advance(4);
	                this.parseState = 5;
	            }
	        }
	        else {
	            this.parseState = 5;
	        }
	    }
	    
	    if (this.parseState === 5) {
	        if (this.length > this.maxReceivedFrameSize) {
	            this.frameTooLarge = true;
	            this.dropReason = "Frame size of " + this.length.toString(10) +
	                              " bytes exceeds maximum accepted frame size";
	            return true;
	        }
	        
	        if (this.length === 0) {
	            this.binaryPayload = new Buffer(0);
	            this.parseState = 6;
	            return true;
	        }
	        if (bufferList.length >= this.length) {
	            this.binaryPayload = bufferList.take(this.length);
	            bufferList.advance(this.length);
	            if (this.mask) {
	                xor(this.binaryPayload, this.maskBytes, 0);
	            }
	            
	            if (this.opcode === 0x08) { // WebSocketOpcode.CONNECTION_CLOSE
	                if (this.length === 1) {
	                    // Invalid length for a close frame.  Must be zero or at least two.
	                    this.binaryPayload = new Buffer(0);
	                    this.invalidCloseFrameLength = true;
	                }
	                if (this.length >= 2) {
	                    this.closeStatus = ruint16(this.binaryPayload, 0);
	                    this.binaryPayload = this.binaryPayload.slice(2);
	                }
	            }
	            
	            this.parseState = 6;
	            return true;
	        }
	    }
	    return false;
	};
	
	WebSocketFrame.prototype.throwAwayPayload = function(bufferList) {
	    if (bufferList.length >= this.length) {
	        bufferList.advance(this.length);
	        this.parseState = 6;
	        return true;
	    }
	    return false;
	};
	
	WebSocketFrame.prototype.toBuffer = function(nullMask) {
	    var maskKey;
	    var headerLength = 2;
	    var data;
	    var outputPos;
	    var firstByte = 0x00;
	    var secondByte = 0x00;
	    
	    if (this.fin) {
	        firstByte |= 0x80;
	    }
	    if (this.rsv1) {
	        firstByte |= 0x40;
	    }
	    if (this.rsv2) {
	        firstByte |= 0x20;
	    }
	    if (this.rsv3) {
	        firstByte |= 0x10;
	    }
	    if (this.mask) {
	        secondByte |= 0x80;
	    }
	
	    firstByte |= (this.opcode & 0x0F);
	
	    // the close frame is a special case because the close reason is
	    // prepended to the payload data.
	    if (this.opcode === 0x08) {
	        this.length = 2;
	        if (this.binaryPayload) {
	            this.length += this.binaryPayload.length;
	        }
	        data = new Buffer(this.length);
	        wuint16(this.closeStatus, data, 0);
	        if (this.length > 2) {
	            this.binaryPayload.copy(data, 2);
	        }
	    }
	    else if (this.binaryPayload) {
	        data = this.binaryPayload;
	        this.length = data.length;
	    }
	    else {
	        this.length = 0;
	    }
	
	    if (this.length <= 125) {
	        // encode the length directly into the two-byte frame header
	        secondByte |= (this.length & 0x7F);
	    }
	    else if (this.length > 125 && this.length <= 0xFFFF) {
	        // Use 16-bit length
	        secondByte |= 126;
	        headerLength += 2;
	    }
	    else if (this.length > 0xFFFF) {
	        // Use 64-bit length
	        secondByte |= 127;
	        headerLength += 8;
	    }
	
	    var output = new Buffer(this.length + headerLength + (this.mask ? 4 : 0));
	
	    // write the frame header
	    output[0] = firstByte;
	    output[1] = secondByte;
	
	    outputPos = 2;
	    
	    if (this.length > 125 && this.length <= 0xFFFF) {
	        // write 16-bit length
	        wuint16(this.length, output, outputPos);
	        outputPos += 2;
	    }
	    else if (this.length > 0xFFFF) {
	        // write 64-bit length
	        wuint64([0x00000000, this.length], output, outputPos);
	        outputPos += 8;
	    }
	    
	    if (this.length > 0) {
	        if (this.mask) {
	            if (!nullMask) {
	                // Generate a mask key
	                maskKey = parseInt(Math.random()*0xFFFFFFFF);
	            }
	            else {
	                maskKey = 0x00000000;
	            }
	            wuint32(maskKey, this.maskBytes, 0);
	
	            // write the mask key
	            this.maskBytes.copy(output, outputPos);
	            outputPos += 4;
	        
	            data.copy(output, outputPos);
	            xor(output.slice(outputPos), this.maskBytes, 0);
	        }
	        else {
	            data.copy(output, outputPos);
	        }
	    }
	    
	    return output;
	};
	    
	WebSocketFrame.prototype.toString = function() {
	    return "Opcode: " + this.opcode + ", fin: " + this.fin + ", length: " + this.length + ", hasPayload: " + Boolean(this.binaryPayload) + ", masked: " + this.mask;
	};

	function xor(payload, maskBytes, maskPos) {
		var end = payload.length;
		if (typeof(maskPos) !== 'number') {
			maskPos = 0;
		}
		for (var i=0; i < end; i++) {
			payload[i] = payload[i] ^ maskBytes[maskPos];
			maskPos = (maskPos + 1) & 3;
		}
		return maskPos;
	}


	function ruint16(buffer, offset) {
		var val = 0;
		val = buffer[offset] << 8;
		val |=  buffer[offset+1];
		return (val);
	}

	function ruint64(buffer, offset) {
		var val = new Array(2);
		val[0] = ruint32(buffer, offset);
		val[1] = ruint32(buffer, offset+4);
		return (val);
	}



	function wuint16(val, buffer, offset) {
		buffer[offset] = (val & 0xff00) >>> 8;
		buffer[offset+1] = val & 0x00ff;
	}
	function wuint32(val, buffer, offset) {
		buffer[offset] = (val - (val & 0x00ffffff)) / Math.pow(2, 24);
		buffer[offset+1] = (val >>> 16) & 0xff;
		buffer[offset+2] = (val >>> 8) & 0xff;
		buffer[offset+3] = val & 0xff;
	}

	function wuint64(value, buffer, offset) {
		wuint32(value[0], buffer, offset);
		wuint32(value[1], buffer, offset+4);
	}

	module.exports = WebSocketFrame;
})();