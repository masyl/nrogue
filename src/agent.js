(function (global) {

	//todo: GET RID OF GLOBAL DUPLICATION BETWEEN FRONT AND BACKEND
	global.getDistance = function (point1, point2) {
		return Math.sqrt( Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2) );
	};
	global.getAngle = function (point1, point2) {
		var angle = Math.atan2(point1.x - point2.x, point1.y - point2.y) * (180 / Math.PI);
		if(angle < 0) angle = Math.abs(angle);
		else angle = 360 - angle;
		return angle;
	};
	global.rnd = function (i) {
		return Math.floor(Math.random() * i)
	};

	var g = require("./g");// Global package
	module.exports = function Agent(id, x, y, conn, ai, end, react) {
		// defaults are for a human agent
		var agent = this;
		agent.id = id+""; // A unique id given by the world
		agent.x = x; // X coordinate on the map
		agent.y = y; // X coordinate on the map
		agent.dir = g.rnd(8); // Which direction the agent is facing
		agent.type = "player"; // Type of agent
		agent.health = 1000; // Health
		agent.visionRange = 30; // Vision range
		agent.attackRange = 4; // Attack range
		agent.attackSize = 2; // Attack size
		agent.attackStrength = 100; // Attack strength
		agent.skips = 0; // Number of ticks the agent has skipped since his last answer
		agent.next = { // The request for the next tick
			ready: true,
			agents: true,
			map: true,
			types: true
		};
	
		agent.act = function (world) {
			if (agent.next.ready) {
				agent.skips = 0;
				var worldView = {
					// todo: all these attributes should be grouped as "attrs" for simpler serialization
					height: world.height,
					width: world.width,
					tps: world.tps,
					age: world.age,
					datetime: world.datetime,
					sunlight: world.sunlight,
					self: agent
				};
				if (agent.next.agents) {
					var agent2;
					var agents = {};
					for (var key in world.agents) {
						agent2 = world.agents[key];
						if (distance(agent, agent2) < agent .visionRange) agents[key] = agent2;
					}
					worldView.agents = agents;
					// todo: filter by distance

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
				agent.next = { ready: false };
				if (conn) {
					conn.send(JSON.stringify(worldView));
				} else if (ai) {
					var action = ai(worldView, agent, global);
					action.next = {
						ready: true,
						agents: true
					};
					react(action);
				}
			} else {
				agent.skips += 1;
				if (agent.skips > 10) agent.health += -5; //todo: put params in config
			}
			if (agent.health <= 0) {
				if (conn) {
					conn.close(); //todo: figure out if it should be .end() .close() or .drop()
				} else if (ai) {
					end();
				}
			}
		};
		if (conn) {
			
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
		}
	};

	function distance(point1, point2) {
		return Math.sqrt( Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2) );
	}

})(this);
