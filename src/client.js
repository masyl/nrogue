(function () {
	var d = document;
	
	var agentList = d.getElementById("agentList");
	var worldStats = d.getElementById("worldStats");
	var mapGrid = d.getElementById("map");
	var agentsGrid = d.getElementById("agents");
	var ctx = d.getElementById("c").getContext("2d");
	var target = null;

	var blockHeight = 6;
	var blockWidth = 6;
	var isDrawing = true;
	var drawcount = 1;

	window.onfocus = function () {
		isDrawing = true;
	};
	window.onblur = function () {
		isDrawing = false;
	};
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
	
	function drawAgents(map, types, target, self) {
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
			ctx.beginPath();
			ctx.rect(left, top, blockWidth, blockHeight);
			ctx.fillStyle = type.bgcolor;
			ctx.fill();
		}
	
		target.innerHTML = html;
	}

	var i;
	var html = "";
	var types;
	var type;
	var agent;
	var x;
	var y;
	var block;
	var opacity;
	var self;
	var agents;
	function drawMap() {
		ctx.clearRect (0, 0, 900, 900);
		if (map) {
			for (i in map) {
				block = map[i];
				opacity = 1;
				if (self) if (distance(block, self) > self.visionRange) opacity = 0.9;
				drawBlock(block.x, block.y, types[block.type], opacity);
			}
		}
		if (agents) {
			for (i in agents) {
				block = agents[i];
				drawBlock(block.x, block.y, types[block.type], 1);
			}
		}
	}
	function drawBlock(x, y, type, opacity) {
		var color = type.color;
		ctx.beginPath();
		ctx.rect(x * blockWidth, y * blockHeight, blockWidth, blockHeight);
		ctx.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + ", " + opacity +");"
		ctx.fill();
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
	
			worldView.tps = world.tps;
			worldView.age = world.age;
			self = worldView.self = world.self;

			if (world.types) {
				worldView.types = world.types;
				types = world.types;
			}
			if (world.map) map = world.map;

			if (world.agents) {
				agents = worldView.agents = world.agents;
				drawAgentList(world.agents);
			}

			if (isDrawing) drawMap();
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