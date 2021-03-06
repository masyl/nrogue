(function () {
	var g = require("./g");
	var ai = require("./z").ai;
	var Agent = require("./agent");
	var types = require("./types");
	var mapGenerator = require("./map");
	
	module.exports = function World(width, height, zombies, density) {
		var
			world = this,
			agentsCount = 0;
		world.age = 0;
		world.tps = 1; // Ticks Per Second
		world.sps = 60; // Second Per Seconds
		world.density = density || 1;
		world.width = width || 30;
		world.height = height || 30;
		world.types = types;
		world.map = mapGenerator(world);
		world.agents = {};
		world.agentsCount = 0;
		world.datetime = new Date();
		world.sunlight = 1;
		world.spawnZombie = function () {
			world.spawn(null, ai.zombie, function (agent) {
				agent.type = "zombie";
				agent.health = 500; // Health
				agent.visionRange = 50; // Vision range
				agent.attackRange = 1; // Attack range
				agent.attackSize = 1; // Attack size
				agent.attackStrength = 50; // Attack strength
			});
		};
		world.spawn = function(conn, ai, middleware) {
			var agent;

			agentsCount++;
			
			if (conn) {
				agent = new Agent(world.age, agentsCount, g.rnd(world.width-10)+5, g.rnd(world.height-10)+5, conn, null, end, react);
			} else {
				agent = new Agent(world.age, agentsCount, g.rnd(world.width-10)+5, g.rnd(world.height-10)+5, null, ai, end, react);
			}
			if (middleware) middleware(agent);
	
			function react(action) {
				//console.log("react:", action.dir, action.walk);
				var agent2;
				var key;
				var dist;

				// Perform attack logic
				if (action.attack) {
					for (key in world.agents) {
						agent2 = world.agents[key];
						var dist = g.dist(action.attack, agent2);
						if (dist < agent.attackSize) {
							agent2.health += -agent.attackStrength;
						}
						if (agent2.health <= 0) agent.kills++;
					}
				}

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
	
					// Enforce world boundaries
					var x2, y2;
					x2 = agent.x + x;
					y2 = agent.y + y;	
					if (x2 >= world.width) x2 = world.width -1;
					if (x2 < 0) x2 = 0;
					if (y2 >= world.height) y2 = world.height-1;
					if (y2 < 0) y2 = 0;
	
					// Enforce solid blocks
					var block = world.map.f[x2 + "-" + y2];
					if (block) {
						var type = world.types[block.type];
						if (type.solid) {
							x2 = agent.x;
							y2 = agent.y;
						}
					}

					//Human specific behaviors
					if (agent.type === "human") {
						// Adjust vision according to health
						agent.vision = agent.visionRange * (agent.health/1000);

						// Gain back health if standing on a "floor", to a max of 75%
						var block = world.map.f[agent.x + "-" + agent.y];
						if (block && (block.type == "floor") && agent.health < 750) agent.health += 10;
	
						// Enforce limit on health
						if (agent.health > 1000) agent.health = 1000;
					}

					// Update age
					agent.age = world.age - agent.birth;

					// Set new coords
					agent.x = x2;
					agent.y = y2;
				}
	
				if (action.next !== undefined) {
					agent.next = action.next;
				}
	
			}
	
			function end() {
				// Spawn a new zombie
				if (agent.type == "zombie") world.spawnZombie();
				// todo: enfore zombie limit
				// Delete dead agent
				delete world.agents[agent.id];
			}
	
			world.agents[agent.id] = agent;
			return world;
		};
		world.start = function(tickPerSeconds, secondsPerTick) {
			if (tickPerSeconds) world.tps = tickPerSeconds;
			if (secondsPerTick) world.spt = secondsPerTick;
			
			// Spawn zombies
			for (var i = 0; i < zombies; i++) {
				world.spawnZombie();
			}

			setInterval(function () {
				world.tick();
			}, 1000 / world.tps);
			return world;
		};
		world.tick = function () {
			var datetime = world.datetime;
	
			// Move time forward
			datetime.setSeconds(datetime.getSeconds() + world.spt);
	
			// Adjust sunlight
			var a = new Date();
			var hours = datetime.getHours() + datetime.getMinutes() / 60;
			world.sunlight = 1 - Math.abs(hours - 12) / 12;
	
			// Move age (as ticks) forward
			world.age ++;
	
			// Poll every agent
			for (var key in world.agents) {
				world.agents[key].act(world);
			}
		};
	};

})();
