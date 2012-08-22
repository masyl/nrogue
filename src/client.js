(function () {
	var d = document;
	
	var agentList = d.getElementById("agentList");
	var worldStats = d.getElementById("worldStats");
	var mapGrid = d.getElementById("map");
	var agentsGrid = d.getElementById("agents");
	var css = d.getElementById("css");
	
	function drawAgentList(agents) {
		var html = "", agent;
		for (var i in agents) {
			agent = agents[i];
			html += "<li>" + (Math.round(agent.health / 10)) + " - " + agent.id + " - " + agent.type + "</li>";
		}
		agentList.innerHTML = html;
	}
	
	function drawMap(map, types, target) {
		var i;
		var html = "";
		var type;
		var agent;
		var height=8;
		var width=8;
		var left;
		var top;
		var block;
	
		for (i in map) {
			block = map[i];
			type = types[block.type];			
			left = block.x * width;
			top = block.y * height;
			html += "<span class='block' style='width: " + width + "px; height: " + height + "px; left: " + left + "px; top: " + top + "px; color:" + type.color + "; background: " + type.bgcolor + " '>" + type.symbol + "</span>";
		}
	
		target.innerHTML = html;
	}
	
	function drawWorld(world) {
		var datetime = new Date(world.datetime);
		//css.innerHTML = "#map { -webkit-filter: opacity(" + (world.sunlight + 0.2) + "); }";
		//worldStats.innerHTML = datetime.toTimeString();
		//-webkit-filter: saturate(2) grayscale(0.1) hue-rotate(30deg) sepia(0.2)  opacity(0.2);
	}
	
	function buildAgentsMap(world) {
		var agents = {};
		var agent;
		for (var key in world.agents) {
			agent = world.agents[key];
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
				drawMap(worldView.map, worldView.types, mapGrid);
			}
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
		var doMove = rnd(4);
		var change = rnd(3);
		var dirChange = rnd(3);
		if (!change) dir = self.dir + dirChange - 1;
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

})();