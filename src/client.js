(function (global) {
	window.ai = {};
	var d = document;
	d.g = d.getElementById;
	var agentList = d.g("agentList");
	var worldStats = d.g("worldStats");
	var mapGrid = d.g("map");
	var agentsGrid = d.g("agents");
	var canvas = d.g("c");
	var ctx = canvas.getContext("2d");
	var target = null;
	var width; // map width
	var height; // map height
	var blockHeight = 5;
	var blockWidth = 5;
	var blockHeightOffset = 3;
	var blockWidthOffset = 3;
	var isDrawing = true;
	var html = "";
	var types;
	var type;
	var agent;
	var x;
	var y;
	var block;
	var opacity;
	var self;
	var mapCache;
	var lastType;
	var lastFill;
	var color;
	var agents = [];

	window.onload = init;
	
	function init() {

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
		
	
		for (var i = 0; i < 1; i++) {
			var socket = new WebSocket('ws://' + document.location.host);
			agents.push(new Agent(global.ai.human, socket));
		}
		console.log("spawned agents!", agents);

	}

	//todo: remove code duplication

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


	function drawMap(world, action) {
		lastType = null;
		var i;
		
		// Draw map
		if (map && !mapCache) {
			startDraw();
			opacity = 1;
			for (i in map) {
				block = map[i];
				//if (self) if (distance(block, self) > self.visionRange) opacity = 0.95;
				drawBlock(block.x, block.y, types[block.type]);
			}
			endDraw();
			mapCache = ctx.getImageData(0, 0, width * blockWidth, height * blockHeight);
		} else if (map && mapCache) {
			ctx.putImageData(mapCache, 0, 0);
		}

		// draw daytime offset
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = "rgba(0,0,0," + (world.sunlight * 0.7) + ")";
		ctx.rect(0, 0, width * blockWidth, height * blockHeight);
		ctx.fill();
		ctx.restore();


		// Draw agents
		if (agents) {
			startDraw();
			for (i in agents) {
				agent = agents[i];
				if (agent.id === self.id) {
					type = types["you"];
				} else {
					type = types[agent.type];
				}
				drawBlock(agent.x, agent.y, type);
			}
			endDraw();
		}

		// draw vision range
		ctx.beginPath();
		ctx.arc(self.x * blockWidth, self.y * blockHeight, self.visionRange * blockWidth, 0, Math.PI*2, true);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
		ctx.lineWidth = 5;
		ctx.stroke();

		if (action.attack) {
			ctx.beginPath();
			ctx.arc(self.x * blockWidth + blockWidthOffset, self.y * blockHeight + blockHeightOffset, self.attackRange * blockWidth, 0, Math.PI*2, true);
			ctx.strokeStyle = "rgba(255, 64, 64, 0.4)";
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.restore();
		}

		// Draw heading
		ctx.beginPath();
		ctx.fillStyle = "rgba(0,0,0,0.3)";
		ctx.rect(0, 0, width * blockWidth, 50);
		ctx.fill();
		drawTime(new Date(world.datetime));
	}

	function drawTime(datetime) {
		ctx.beginPath();
		ctx.font = "bold 14pt monospace";
		ctx.fontWeight = 800;
		ctx.fillStyle = "rgba(255, 255, 255, 1)";
		ctx.fillText(datetime.toTimeString().split(" ")[0], 10, 30);
	}

	function drawBlock(x, y, type) {
		if (lastType !== type) {
			ctx.fill();
			ctx.beginPath();
			color = type.color;
			ctx.fillStyle = lastFill = "rgba(" + Math.floor(color.r) + "," + Math.floor(color.g) + "," + Math.floor(color.b) + ", 1);";
		}
		ctx.rect(x * blockWidth, y * blockHeight, blockWidth, blockHeight);
		lastType = type;
	}

	function startDraw() {
		ctx.beginPath();
	}

	function endDraw() {
		ctx.fill();
	}



	function drawAgentList(agents) {
		var html = "", agent;
		for (var i in agents) {
			agent = agents[i];
			html += "<li>" + (Math.round(agent.health / 10)) + " - " + agent.id + " - " + agent.type + "</li>";
		}
		agentList.innerHTML = html;
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
				canvas.width = (width = world.width) * blockWidth;
				canvas.height = (height = world.height) * blockHeight;
			}
			worldView.tps = world.tps;
			worldView.age = world.age;
			worldView.datetime = world.datetime;
			worldView.sunlight = world.sunlight;

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

			var action = agent.action(worldView, world.self, target);

			action.next = {
				ready: true,
				agents: true
			};

			agent.send(action);

//			console.time("draw");
			if (isDrawing) drawMap(worldView, action);
//			console.timeEnd("draw");
		};
		agent.send = function (obj) {
			conn.send(JSON.stringify(obj));
		}
	}


})(this);

