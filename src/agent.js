var g = require("./g");// Global package
module.exports = function Agent(id, x, y, conn, end, react) {

	var agent = this;
	agent.id = id+""; // A unique id given by the world
	agent.x = x; // X coordinate on the map
	agent.y = y; // X coordinate on the map
	agent.dir = g.rnd(8); // Which direction the agent is facing
	agent.type = "player"; // Type of agent
	agent.health = 1; // Health
	agent.next = { // The request for the next tick
		ready: true,
		agents: true,
		map: true,
		types: true
	};

	agent.act = function (world) {
		if (agent.next.ready) {
			var worldView = {
				tps: world.tps,
				age: world.age,
				self: agent
			};
			if (agent.next.agents) {
				worldView.agents = world.agents;
			}
			if (agent.next.map) {
				worldView.width = world.width;
				worldView.height = world.height;
				worldView.map = world.map;
				agent.next.map = false;
			}
			if (agent.next.types) {
				worldView.types = world.types;
				agent.next.types = false;
			}
			agent.next = {ready: false};
			conn.sendUTF(JSON.stringify(worldView));
		}
	};

	//console.log((new Date()) + ' Connection accepted.');
	conn.on('message', function(message) {
		//console.log('Received Message: ' + message.utf8Data);
		var action = JSON.parse(message.utf8Data);
		react(action);
	});

	conn.on('close', function(reasonCode, description) {
		console.log((new Date()) + ' Disconnected.');
		end();
	});
};
