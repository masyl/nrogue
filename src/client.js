(function () {
	var d = document;
	
	var agentList = d.getElementById("agentList");
	var worldStats = d.getElementById("worldStats");
	var mapGrid = d.getElementById("map");
	var agentsGrid = d.getElementById("agents");
	var css = d.getElementById("css");
//	var hud = d.getElementById("hud");
	var target = null;

	var blockHeight = 8;
	var blockWidth = 8;

	window.onmousemove = function(e) {
		var span = e.toElement;
		var x = parseInt(span.getAttribute("data-x"));
		var y = parseInt(span.getAttribute("data-y"));
		if (isNaN(x)) {
			target = null;
		} else {
			target = {
				x: x,
				y: y
			};
		}
	};

	function drawAgentList(agents) {
		var html = "", agent;
		for (var i in agents) {
			agent = agents[i];
			html += "<li>" + (Math.round(agent.health / 10)) + " - " + agent.id + " - " + agent.type + "</li>";
		}
		agentList.innerHTML = html;
	}
	
	function drawMap(map, types, target, self) {
		var i;
		var html = "";
		var type;
		var agent;
		var left;
		var top;
		var block;
		var selfClass;
		var isInVisionRange = "";
		for (i in map) {
			block = map[i];
			type = types[block.type];			
			left = block.x * blockWidth;
			top = block.y * blockHeight;
			selfClass = "";
			if (block.isSelf) selfClass = "isSelf";
			if (self) isInVisionRange = (distance(block, self) < self.visionRange) ? "isInVisionRange" : "notInVisionRange";
			html += "<span data-x='" + block.x + "' data-y='" + block.y + "' class='block " + isInVisionRange + " " + selfClass + "' style='width: " + blockWidth + "px; height: " + blockHeight + "px; left: " + left + "px; top: " + top + "px; color:" + type.color + "; background: " + type.bgcolor + " '>" + type.symbol + "</span>";
		}
	
		target.innerHTML = html;
	}
	
	function drawWorld(world) {
		var datetime = new Date(world.datetime);
		//css.innerHTML = "#map { -webkit-filter: opacity(" + (world.sunlight + 0.2) + "); }";
		//worldStats.innerHTML = datetime.toTimeString();
		//-webkit-filter: saturate(2) grayscale(0.1) hue-rotate(30deg) sepia(0.2)  opacity(0.2);

//		var x = blockWidth * world.self.x;
//		var y = blockHeight * world.self.y;
//		var r = blockHeight * world.self.visionRange;
//		var svg = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" style="stroke:#006600;"/>';
//		hud.innerHTML = svg;
	}
	
	function buildAgentsMap(world) {
		var agents = {};
		var agent;
		for (var key in world.agents) {
			agent = world.agents[key];
			if (key === world.self.id) agent.isSelf = true;
			agents[agent.x + "-" + agent.y] = agent;
		}
		return agents;
	}
	
	function Agent(action, conn) {
		var agent = this;
	
		var worldView = {};
	
		this.action = action || function () {};
	
		conn.onopen = function () {
			console.log('Connection open!');
			agent.send({next: {
				ready: true,
				map: true,
				agents: true,
				types: true
			}})
		};
		conn.onmessage = function (e) {
			var world = JSON.parse(e.data);
	
			drawWorld(world);
	
			worldView.tps = world.tps;
			worldView.age = world.age;
			worldView.self = world.self;

			if (world.types) {
				worldView.types = world.types;
			}
			if (world.agents) {
				worldView.agents = world.agents;
				worldView.agentsMap = buildAgentsMap(worldView);
				drawMap(worldView.agentsMap, worldView.types, agentsGrid);
			}
			if (world.map) {
				worldView.map = world.map;
				worldView.width = world.width;
				worldView.height = world.height;
			}
			if (worldView.age % 4 == 0) drawMap(worldView.map, worldView.types, mapGrid, worldView.self);
			if (world.agents) {
				drawAgentList(world.agents);
			}
			
			var action = agent.action(worldView, world.self);
			
			action.next = {
				ready: true,
				agents: true
			};
	
			agent.send(action);
		};
		agent.send = function (obj) {
			conn.send(JSON.stringify(obj));
		}
	}
	
	function rnd(i) {
		return Math.floor(Math.random() * i)
	}
	
	function goingAnywhere(world, self) {
		var dir = self.dir;
		if (target) {
			doMove = 1;
			if (self.x > target.x) {
				if (self.y > target.y) {
					dir = 7;
				} else if (self.y == target.y) {
					dir = 6;
				} else {
					dir = 5;
				}
			} else if (self.x == target.x) {
				if (self.y > target.y) {
					dir = 0;
				} else if (self.y == target.y) {
					dir = 0;
					doMove = 0;
				} else {
					dir = 4;
				}
			} else {
				if (self.y > target.y) {
					dir = 1;
				} else if (self.y == target.y) {
					dir = 2;
				} else {
					dir = 3;
				}
			}
		} else {
			var doMove = rnd(4);
			var change = rnd(3);
			var dirChange = rnd(3);
			if (!change) dir = self.dir + dirChange - 1;
		}
		return {
			dir: dir,
			walk: (doMove) ? 1 : 0
		}
	}
	
	var agents = [];
	for (var i = 0; i < 1; i++) {
		var socket = new WebSocket('ws://' + document.location.host);
		agents.push(new Agent(goingAnywhere, socket));
	}
	console.log("spawned agents!", agents);


	function distance(point1, point2) {
		return Math.sqrt( Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2) );
	}

})();