(function () {
var
	r = require,
	World = r('./src/world'),
	static = r('./src/static'),
	webSocket = r('websocket');

function startServer(world) {
	// Setup world state server
	new webSocket.server({
		httpServer: static(process.cwd() + "/src", 5000),
		autoAcceptConnections: false
	}).on('request', function(request) {
		world.spawn(request.accept('', request.origin));
	});
}

var world = new World(80, 30);
startServer(world.start(12));

})();