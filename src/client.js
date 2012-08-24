(function (global) {
	window.ai = {};
	var d = document;
	d.g = d.getElementById;
	var mapGrid = d.g("map");
	var agentsGrid = d.g("agents");
	var canvas = d.g("c");
	var ctx = canvas.getContext("2d");
	var target = null;
	var width; // map width
	var height; // map height
	var blockSize = 5;
	var blockOffset = 3;
	var isDrawing = true;
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
	
		canvas.onmouseout = function (e) {
			target = null;
		};
		canvas.onmousemove = function(e) {
			e.preventDefault();
			var x = Math.floor((e.layerX)/ blockSize);
			var y = Math.floor((e.layerY)/ blockSize);
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
			mapCache = ctx.getImageData(0, 0, width * blockSize, height * blockSize);
		} else if (map && mapCache) {
			ctx.putImageData(mapCache, 0, 0);
		}

		// draw daytime offset
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = "rgba(0,0,0," + (world.sunlight * 0.7) + ")";
		ctx.rect(0, 0, width * blockSize, height * blockSize);
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
		ctx.arc(self.x * blockSize, self.y * blockSize, self.visionRange * blockSize, 0, Math.PI*2, true);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
		ctx.lineWidth = 5;
		ctx.stroke();

		if (action.attack) {
			ctx.beginPath();
			ctx.arc(self.x * blockSize + blockOffset, self.y * blockSize + blockOffset, self.attackRange * blockSize, 0, Math.PI*2, true);
			ctx.strokeStyle = "rgba(255, 64, 64, 0.4)";
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.restore();
		}

	}

	function drawHUD(world) {
		var datetime = new Date(world.datetime);

		// Draw heading
		ctx.beginPath();
		ctx.fillStyle = "rgba(0,0,0,0.3)";
		ctx.rect(0, 0, width * blockSize, 50);
		ctx.fill();

		// Draw datetime
		ctx.beginPath();
		ctx.font = "bold 18pt monospace";
		ctx.fontWeight = 800;
		ctx.fillStyle = "rgba(255, 255, 255, 1)";
		ctx.fillText("t" + pad(datetime.getHours(), "00", 2) + ":" + pad(datetime.getMinutes(), "00", 2), 10, 30);

		function pad(str, padding, size) {
			str = padding + str;
			str = str.substring(str.length-size);
			return str;
		}

		// Draw health
		ctx.beginPath();
		ctx.font = "bold 18pt monospace";
		ctx.fontWeight = 800;
		ctx.fillStyle = "rgba(255, 255, 255, 1)";
		// todo: blockHeight and blockHeight should be the same var
		ctx.fillText(Math.round(self.health/10) + "%", width * blockSize - 75, 30);
	}

	function drawBlock(x, y, type) {
		if (lastType !== type) {
			ctx.fill();
			ctx.beginPath();
			color = type.color;
			ctx.fillStyle = lastFill = "rgba(" + Math.floor(color.r) + "," + Math.floor(color.g) + "," + Math.floor(color.b) + ", 1);";
		}
		ctx.rect(x * blockSize, y * blockSize, blockSize, blockSize);
		lastType = type;
	}

	function startDraw() {
		ctx.beginPath();
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
				canvas.width = (width = world.width) * blockSize;
				canvas.height = (height = world.height) * blockSize;
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
			}

			var action = agent.action(worldView, world.self, target);

			action.next = {
				ready: true,
				agents: true
			};

			agent.send(action);

//			console.time("draw");
			if (isDrawing){
				drawMap(worldView, action);
				drawHUD(world);
			}
//			console.timeEnd("draw");
		};
		agent.send = function (obj) {
			conn.send(JSON.stringify(obj));
		}
	}


})(this);

