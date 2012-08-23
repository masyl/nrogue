(function () {
	var d = document;
	
	var agentList = d.getElementById("agentList");
	var worldStats = d.getElementById("worldStats");
	var mapGrid = d.getElementById("map");
	var agentsGrid = d.getElementById("agents");
	var canvas = d.getElementById("c");
	var ctx = canvas.getContext("2d");
	var target = null;
	var width; // map width
	var height; // map height
	var blockHeight = 6;
	var blockWidth = 6;
	var blockHeightOffset = 3;
	var blockWidthOffset = 3;
	var isDrawing = true;
	var drawcount = 1;

	window.onfocus = function () {
		isDrawing = true;
	};
	window.onblur = function () {
		isDrawing = false;
	};
	
	window.onkeypress = function (e) {
		e.preventDefault();
		return false;
	};
	canvas.onclick = function (e) {
		e.preventDefault();
	};

	canvas.onmousemove = function(e) {
		var x = Math.floor((e.layerX)/ blockWidth);
		var y = Math.floor((e.layerY)/ blockHeight);
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
	var frameMax = 0;
	var frame = frameMax;
	function drawMap() {
		frame++;
		if (map) {
			if (frame > frameMax) {
				frame = 0;
				opacity = 1;
				for (i in map) {
					block = map[i];
					//if (self) if (distance(block, self) > self.visionRange) opacity = 0.95;
					drawBlock(block.x, block.y, types[block.type], opacity);
				}
			}
		}
		if (agents) {
			for (i in agents) {
				block = agents[i];
				drawBlock(block.x, block.y, types[block.type], 1);
			}
		}
		endDraw();
		
		ctx.save();
		ctx.beginPath();
		ctx.arc(self.x * blockWidth, self.y * blockHeight, self.visionRange * blockWidth, 0, Math.PI*2, true);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
		ctx.lineWidth = 5;
		ctx.stroke();
		
		ctx.beginPath();
		ctx.arc(self.x * blockWidth + blockWidthOffset, self.y * blockHeight + blockHeightOffset, self.attackRange * blockWidth, 0, Math.PI*2, true);
		ctx.strokeStyle = "rgba(255, 0, 0, 0.1)";
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.restore();
	}
	var lastType;
	var lastFill;
	var color;
	function drawBlock(x, y, type, opacity) {
		if (lastType !== type) {
			ctx.fill();
			ctx.beginPath();
			color = type.color;
			ctx.fillStyle = lastFill = "rgb(" + Math.floor(color.r*opacity) + "," + Math.floor(color.g*opacity) + "," + Math.floor(color.b*opacity) + ");";
		}
		ctx.rect(x * blockWidth, y * blockHeight, blockWidth, blockHeight);
		lastType = type;
	}
	function endDraw() {
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
	
			if (width !== world.width || height !== world.height) {
				c.width = (width = world.width) * blockWidth;
				c.height = (height = world.height) * blockHeight;
			}
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