(function () {
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
	var blockHeight = 3;
	var blockWidth = 3;
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

	function drawMap(action) {
		var i;
		if (map && !mapCache) {
			startDraw();
			opacity = 1;
			for (i in map) {
				block = map[i];
				//if (self) if (distance(block, self) > self.visionRange) opacity = 0.95;
				drawBlock(block.x, block.y, types[block.type], opacity);
			}
			endDraw();
			mapCache = ctx.getImageData(0, 0, width * blockWidth, height * blockHeight);
		} else if (map && mapCache) {
			ctx.putImageData(mapCache, 0, 0);
		}
		if (agents) {
			startDraw();
			for (i in agents) {
				block = agents[i];
				drawBlock(block.x, block.y, types[block.type], 1);
			}
			endDraw();
		}
		
		ctx.save();
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
	}
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
				width = (width = world.width) * blockWidth;
				height = (height = world.height) * blockHeight;
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

			var action = agent.action(worldView, world.self);
			
			action.next = {
				ready: true,
				agents: true
			};
	
			agent.send(action);
			console.time("a");
			if (isDrawing) drawMap(action);
			console.timeEnd("a");
		};
		agent.send = function (obj) {
			conn.send(JSON.stringify(obj));
		}
	}
	
	function rnd(i) {
		return Math.floor(Math.random() * i)
	}
	
	function goingAnywhere(world, self) {
		var move = {};

		// Try to find an agent in attack range
		var attackTarget;
		var attackTargetDist = 99999;
		var agent;
		var self = world.self;
		var selfId = self.id;
		for (key in world.agents) {
			agent = world.agents[key];
			if  (agent.id !== selfId) {
				var dist = getDistance(agent, self);
				if (dist < self.attackRange) {
					if (dist < attackTargetDist) {
						attackTarget = agent;
						attackTargetDist = dist;
						console.log("YATA");
					}
				}
			}
		}
		if (attackTarget && target) {
			move.attack = {
				x: attackTarget.x,
				y: attackTarget.y
			}
		}

		var dir = self.dir;
		if (target) {
			doMove = 0;
			var dist = getDistance(self, target);
			if (dist > 1) {
				doMove = 1;
			}
			var angle = getAngle(self, target);
			dir = Math.round(angle / (360 / 8));
		} else {
			var doMove = rnd(4);
			var change = rnd(3);
			var dirChange = rnd(3);
			if (!change) dir = self.dir + dirChange - 1;
		}
		move.dir = dir;
		move.walk = (doMove) ? 1 : 0;
		return move;
	}
	
	var agents = [];
	for (var i = 0; i < 1; i++) {
		var socket = new WebSocket('ws://' + document.location.host);
		agents.push(new Agent(goingAnywhere, socket));
	}
	console.log("spawned agents!", agents);


	function getDistance(point1, point2) {
		return Math.sqrt( Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2) );
	}
	function getAngle(point1, point2) {
		var angle = Math.atan2(point1.x - point2.x, point1.y - point2.y) * (180 / Math.PI);
		if(angle < 0) angle = Math.abs(angle);
		else angle = 360 - angle;
		return angle;
	}

})();