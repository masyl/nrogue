//todo: remove notion of requestedProtocol
//todo: remove notion of allowedOrigin
//todo: check if "url" module is essential
//todo: t = this;
//todo: move util, crypto and events to g.
//todo: get rid of constants
//todo: Remove all code relating to v8 of protocol
//todo: chain sha1 calls

(function () {
	var r = require;
	var crypto = r('crypto');
	var util = r('./u');
	var url = r('url');
	var WebSocketConnection = r('./conn');
	var headerValueSplitRegExp = /,\s*/;
	var headerParamSplitRegExp = /;\s*/;
	var headerSanitizeRegExp = /[\r\n]/g;
	var separators = ["(", ")", "<", ">", "@", ",", ";", ":", "\\", "\"", "/", "[", "]", "?", "=", "{", "}", " ", String.fromCharCode(9)];
	var controlChars = [String.fromCharCode(127) /* DEL */];
	var cookieNameValidateRegEx = /([\x00-\x20\x22\x28\x29\x2c\x2f\x3a-\x3f\x40\x5b-\x5e\x7b\x7d\x7f])/;
	var cookieValueValidateRegEx = /[^\x21\x23-\x2b\x2d-\x3a\x3c-\x5b\x5d-\x7e]/;
	var cookieValueDQuoteValidateRegEx = /^"[^"]*"$/;
	var controlCharsAndSemicolonRegEx = /[\x00-\x20\x3b]/g;
	var cookieSeparatorRegEx = /; */;
	var cookieCaptureRegEx = /(.*?)=(.*)/;
	for (var i=0; i < 31; i ++) {controlChars.push(String.fromCharCode(i));}
	
	function WebSocketRequest(socket, httpRequest, serverConfig) {
		var wsr = this;

	    wsr.socket = socket;
	    wsr.httpRequest = httpRequest;
	    wsr.resource = httpRequest.url;
	    wsr.remoteAddress = socket.remoteAddress;
	    wsr.cfg = serverConfig;

		wsr.readHandshake = function() {
		    var request = wsr.httpRequest;
		    // Decode URL
		    wsr.resourceURL = url.parse(wsr.resource, true);
		    wsr.host = request.headers['host'];
		    wsr.key = request.headers['sec-websocket-key'];
		    wsr.origin = request.headers['origin'];
		
		    // Protocol is optional.
		    var protocolString = request.headers['sec-websocket-protocol'];
		    if (protocolString) {
		        wsr.requestedProtocols = protocolString.toLocaleLowerCase().split(headerValueSplitRegExp);
		    }
		    else {
		        wsr.requestedProtocols = [];
		    }
		    
		    if (request.headers['x-forwarded-for']) {
		        wsr.remoteAddress = request.headers['x-forwarded-for'].split(', ')[0];
		    }
		    
		    // Extensions are optional.
		    var extensionsString = request.headers['sec-websocket-extensions'];
		    wsr.requestedExtensions = wsr.parseExtensions(extensionsString);
		    
		    // Cookies are optional
		    var cookieString = request.headers['cookie'];
		    wsr.cookies = wsr.parseCookies(cookieString);
		};
		
		wsr.parseExtensions = function(extensionsString) {
		    if (!extensionsString || extensionsString.length === 0) {
		        return [];
		    }
		    extensions = extensionsString.toLocaleLowerCase().split(headerValueSplitRegExp);
		    extensions.forEach(function(extension, index, array) {
		        var params = extension.split(headerParamSplitRegExp);
		        var extensionName = params[0];
		        var extensionParams = params.slice(1);
		        extensionParams.forEach(function(rawParam, index, array) {
		            var arr = rawParam.split('=');
		            var obj = {
		                name: arr[0],
		                value: arr[1]
		            };
		            array.splice(index, 1, obj);
		        });
		        var obj = {
		            name: extensionName,
		            params: extensionParams
		        };
		        array.splice(index, 1, obj);
		    });
		    return extensions;
		};
		
		wsr.parseCookies = function(cookieString) {
		    if (!cookieString || cookieString.length === 0) {
		        return [];
		    }
		    var cookies = [];
		    var cookieArray = cookieString.split(cookieSeparatorRegEx);
		    
		    cookieArray.forEach(function(cookie) {
		        if (cookie && cookie.length !== 0) {
		            var cookieParts = cookie.match(cookieCaptureRegEx);
		            cookies.push({
		                name: cookieParts[1],
		                value: cookieParts[2]
		            });
		        }
		    });
		    return cookies;
		};
		
		wsr.accept = function(acceptedProtocol, allowedOrigin, cookies) {
		    // TODO: Handle extensions
		    var connection = new WebSocketConnection(wsr.socket, [], acceptedProtocol, false, wsr.cfg);
		    connection.remoteAddress = wsr.remoteAddress;
		    var sha1 = crypto.createHash('sha1');
		    sha1.update(wsr.key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
		    var acceptKey = sha1.digest('base64');    
		    var response = "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + acceptKey + "\r\n";
		                   
		    if (allowedOrigin) {
		        allowedOrigin = allowedOrigin.replace(headerSanitizeRegExp, '');
		        response += "Origin: " + allowedOrigin + "\r\n";
		    }
		    response += "\r\n";
			wsr.socket.write(response, 'ascii');
		    wsr.emit('requestAccepted', connection);    
		    return connection;
		};
		
		wsr.reject = function(status) {
		    wsr.socket.end("HTTP/1.1 " + status + "\r\nConnection: close\r\n\r\n", 'ascii');
		    wsr.emit('requestRejected', this);
		};

	}

	util.in(WebSocketRequest, util.em);


	module.exports = WebSocketRequest;
})();