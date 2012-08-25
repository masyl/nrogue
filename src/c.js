/**
 * Client App
 */
(function (global) {
	var w = window;
	var nullAlias = null;
	var i;
	var d = document;
	var canvas = d.getElementById("c");
	var ctx = canvas.getContext("2d");
	var world;
	var target;
	var mapSizeInBlocks; // map width
	var blockSize = 7;
	var blockOffset = 3;
	var isDrawing = true;
	var types;
	var type;
	var map;
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
	var mapSizeInPx;
	var rgbaBlack = "rgba(0,0,0,";
	var rgbaWhite = "rgba(255,255,255,";
	var M = Math;
	var pow = M.pow;
	var floor = M.floor;
	var PI = Math.PI;

	// Function prototype aliasing
	// Used for creating local function names bound to the original function
	var p = Function.prototype;
	p.b = p.bind;

	// Canvas method substitution
	var ctx_lineTo = ctx.lineTo.b(ctx);
	var ctx_beginPath = ctx.beginPath.b(ctx);
	var ctx_fill = ctx.fill.b(ctx);
	var ctx_fillText = ctx.fillText.b(ctx);

	w.ai = {};

	w.onload = init;
	
	function init() {

		w.onfocus = function () {
			isDrawing = true;
		};
		w.onblur = function () {
			isDrawing = false;
		};
		
		w.onkeypress = function (e) {
			e.preventDefault();
			return false;
		};
		canvas.onclick = function (e) {
			e.preventDefault();
		};
	
		canvas.onmouseout = function (e) {
			target = nullAlias;
		};
		canvas.onmousemove = function(e) {
			e.preventDefault();
			var x = floor((e.layerX)/ blockSize);
			var y = floor((e.layerY)/ blockSize);
			if (isNaN(x)) {
				target = nullAlias;
			} else {
				target = {
					x: x,
					y: y
				};
			}
		};
		
		for (i = 0; i < 1; i++) {
			agents.push(
				new Agent(
					global.ai.human,
					new WebSocket('ws://' + d.location.host)
				)
			);
		}

	}

	function drawMap(world, action) {
		lastType = nullAlias;
		// Draw map
		if (map && !mapCache) {
			ctx_beginPath();
			opacity = 1;
			for (i in map) {
				block = map[i];
				//if (self) if (distance(block, self) > self.visionRange) opacity = 0.95;
				drawBlock(block.x, block.y, types[block.type]);
			}
			ctx_fill();
			mapCache = ctx.getImageData(0, 0, mapSizeInBlocks * blockSize, mapSizeInBlocks * blockSize);
		} else if (map && mapCache) {
			ctx.putImageData(mapCache, 0, 0);
		}

		// draw daytime offset
		ctx_beginPath();
		ctx.fillStyle = rgbaBlack + (world.sunlight * 0.7) + ")";
		ctx.rect(0, 0, mapSizeInBlocks * blockSize, mapSizeInBlocks * blockSize);
		ctx_fill();


		// Draw agents
		if (agents) {
			ctx_beginPath();
			for (i in agents) {
				agent = agents[i];
				if (agent.id === self.id) {
					type = types["you"];
				} else {
					type = types[agent.type];
				}
				drawBlock(agent.x, agent.y, type);
			}
			ctx_fill();
		}

		// draw fog-of-war
		mapSizeInPx = mapSizeInBlocks * blockSize;
		ctx_beginPath();
		ctx.arc(self.x * blockSize, self.y * blockSize, self.vision * blockSize, 0, PI*2, false);
		ctx_lineTo(mapSizeInPx, self.y * blockSize);
		ctx_lineTo(mapSizeInPx, 0);
		ctx_lineTo(0, 0);
		ctx_lineTo(0, mapSizeInPx);
		ctx_lineTo(mapSizeInPx, mapSizeInPx);
		ctx_lineTo(mapSizeInPx, self.y * blockSize);
		ctx.fillStyle = rgbaBlack + "0.2)";
		ctx.lineWidth = 5;
		ctx_fill();

		if (action.attack) {
			ctx_beginPath();
			ctx.arc(self.x * blockSize + blockOffset, self.y * blockSize + blockOffset, self.attackRange * blockSize, 0, PI*2, true);
			ctx.strokeStyle = "rgba(255, 64, 64, 0.4)";
			ctx.lineWidth = 2;
			ctx.stroke();
		}

	}

	function drawHUD(world) {
		var datetime = new Date(world.datetime);

		// Draw heading
		ctx_beginPath();
		ctx.fillStyle = rgbaBlack+ "0.3)";
		ctx.rect(0, 0, mapSizeInBlocks * blockSize, 50);
		ctx_fill();
		// Font style
		ctx.font = "bold 18pt monospace";
		ctx.fontWeight = 800;
		ctx.fillStyle = rgbaWhite + "1)";
		// Draw datetime
		ctx_fillText("t" + pad(datetime.getHours(), "00", 2) + ":" + pad(datetime.getMinutes(), "00", 2), 10, 30);
		// Draw kills
		ctx_fillText(self.kills + " kills", 140, 30);
		ctx_fillText(self.age + " lifespan", 280, 30);

		ctx_fillText(M.round(self.health/10) + "%", mapSizeInBlocks * blockSize - 75, 30);
	}

	function drawBlock(x, y, type) {
		if (lastType !== type) {
			ctx_fill();
			ctx_beginPath();
			color = type.color;
			ctx.fillStyle = lastFill = "rgba(" + floor(color.r) + "," + floor(color.g) + "," + floor(color.b) + ", 1);";
		}
		ctx.rect(x * blockSize, y * blockSize, blockSize, blockSize);
		lastType = type;
	}

	function Agent(action, conn) {
		var agent = this;

		agent.action = action || function () {};

		conn.onopen = function () {
			//console.log('open!');
			agent.send({next: {
				ready: true,
				map: true,
				agents: true,
				types: true
			}})
		};
		conn.onmessage = function (e) {
			world = JSON.parse(e.data);

			if (mapSizeInBlocks !== world.width) {
				canvas.height = canvas.width = (mapSizeInBlocks = world.height) * blockSize;
			}
			self = world.self;

			if (world.types) types = world.types;
			if (world.map) map = world.map;
			if (world.agents) agents = world.agents;

			var action = agent.action(world, world.self, target);

			action.next = {
				ready: true,
				agents: true
			};

			agent.send(action);

//			console.time("draw");
			if (isDrawing){
				drawMap(world, action);
				drawHUD(world);
			}
//			console.timeEnd("draw");
		};
		agent.send = function (obj) {
			conn.send(JSON.stringify(obj));
		}
	}

	/**
	 * Utility for padding a string
	 * @param str
	 * @param padding
	 * @param size
	 * @return {String}
	 */
	function pad(str, padding, size) {
		str = padding + str;
		return str.substring(str.length-size);
	}

})(this);

