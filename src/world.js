var Agent = require("./agent");
var g = require("./g");
var types = require("./types");
var mapGenerator = require("./maps/outside");

module.exports = function World(width, height, density) {

	var
		world = this,
		agentsCount = 0;
	world.age = 0;
	world.tps = 1; // Turns Per Second
	world.density = density || 1;
	world.width = width || 30;
	world.height = height || 30;
	world.types = types;
	world.map = mapGenerator(world);
	world.agents = {};
	world.agentsCount = 0;
	world.spawn = function(conn) {
		agentsCount++;
		
		var agent = new Agent(agentsCount, g.rnd(world.width-10)+5, g.rnd(world.height-10)+5, conn, end, react);

		function react(action) {
			//console.log("react:", action.dir, action.walk);

			if (action.dir !== undefined && action.dir !== null) {
				var dir = action.dir;
				if (dir < 0 ) dir = 7; // todo, Use modulo ?
				if (dir > 7 ) dir = 0;
				agent.dir = dir;
			}

			if (action.walk != undefined) {
				var x = 0,
					y = 0,
					walk = action.walk;
				if (walk > 1) walk = 1;
				if (dir == 0) {
					x = 0;
					y = -walk;
				} else if (dir == 1) {
					x = walk;
					y = -walk;
				} else if (dir == 2) {
					x = walk;
					y = 0;
				} else if (dir == 3) {
					x = walk;
					y = walk;
				} else if (dir == 4) {
					x = 0;
					y = walk;
				} else if (dir == 5) {
					x = -walk;
					y = walk;
				} else if (dir == 6) {
					x = -walk;
					y = 0;
				} else if (dir == 7) {
					x = -walk;
					y = -walk;
				}

				// Enfore world boundaries
				// todo: use modulo instead
				var x2, y2;
				x2 = agent.x + x;
				y2 = agent.y + y;

				if (x2 >= world.width) x2 = 0;
				if (x2 < 0) x2 = world.width-1;

				if (y2 >= world.height) y2 = 0;
				if (y2 < 0) y2 = world.height-1;

				// Enforce solid blocks
				var block = world.map[x2 + "-" + y2];
				if (block) {
					var type = world.types[block.type];
					if (type.solid) {
						x2 = agent.x;
						y2 = agent.y;
					}
				}

				// Set new coords
				agent.x = x2;
				agent.y = y2;
			}

			if (action.next !== undefined) {
				agent.next = action.next;
			}

		}

		function end() {
			delete world.agents[agent.id];
		}

		world.agents[agent.id] = agent;
		return world;
	};
	world.start = function(tps) {
		if (tps) world.tps = tps;
		setInterval(function () {
			world.tick();
		}, 1000 / world.tps);
		return world;
	};
	world.tick = function () {
		world.age ++;
		for (var agent in world.agents) {
			world.agents[agent].act(world);
		}
	};
};

