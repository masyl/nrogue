(function () {
var
	r = require,
	World = r('./src/world'),
	static = r('./src/static'),
	webSocketServer = r('./websocket');

function startServer(world) {
	// Setup world state server
	new webSocketServer({
		httpServer: static(process.cwd() + "/src", 5000)
	}).on('connect', function(conn) {
		world.spawn(conn);
	});
}

var world = new World(200, 200, 10); // width, height, density
startServer(world.start(5, 120)); // TicksPerSeconds, SecondsPerSeconds

})();