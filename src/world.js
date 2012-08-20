var Block = require("./block");
var Agent = require("./agent");
var types = require("./types");

module.exports = function World(width, height) {

	var
		world = this,
		agentsCount = 0;
	world.age = 0;
	world.tps = 1; // Turns Per Second
	world.width = width || 30;
	world.height = height || 30;
	world.types = types;
	world.map = blankGrid(this.width, this.height);
	world.agents = {};
	world.agentsCount = 0;
	world.spawn = function(conn) {
		agentsCount++;
		
		var agent = new Agent(agentsCount, Math.floor(world.width/2), Math.floor(world.height/2), conn, end, react);

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

				agent.x += x;
				agent.y += y;

				if (agent.x >= world.width) agent.x = world.width-1;
				if (agent.x < 0) agent.x = 0;

				if (agent.y >= world.height) agent.y = world.height-1;
				if (agent.y < 0) agent.y = 0;
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

function blankGrid(width, height) {
	var grid = {};
	var block;
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			block = new Block(x, y, "soil");
			grid[block.x+"-"+block.y] = block;
		}
	}
	return grid;
}
