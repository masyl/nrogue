/**
 * Zombie AI
 */
(function (global) {
	var g = require("./g");
	if (!global.ai) global.ai = {};
	global.ai.zombie = function (world, self, _global) {
		if (_global) global = _global;
		var move = {};
		var key;
		var dist;
		var agent;
		var selfId = self.id;
	
		// Try to find an agent in vision range
		var visionTarget;
		var visionTargetDist = 99999;
		for (key in world.agents) {
			agent = world.agents[key];
			if  (agent.id !== selfId && agent.type === "human") {
				dist = g.dist(agent, self);
				if (dist < self.visionRange) {
					if (dist < visionTargetDist) {
						visionTarget = agent;
						visionTargetDist = dist;
					}
				}
			}
		}
	
		// Try to find an agent in attack range
		var attackTarget;
		var attackTargetDist = 99999;
		for (key in world.agents) {
			agent = world.agents[key];
			if  (agent.id !== selfId) {
				dist = g.dist(agent, self);
				if (dist < self.attackRange) {
					if (dist < attackTargetDist) {
						attackTarget = agent;
						attackTargetDist = dist;
					}
				}
			}
		}
		if (attackTarget) {
			move.attack = {
				x: attackTarget.x,
				y: attackTarget.y
			}
		}
	
		var dir = self.dir;
		// Setup random move
		var doMove = g.rnd(4);
		var change = g.rnd(3);
		var dirChange = g.rnd(3);
		// If a target was found, there is 1 chance out of two
		// that the zombie will follow
		if (visionTarget) {
			if (g.rnd(2)) {
				dist = g.dist(self, visionTarget);
				doMove = 1;
				var angle = g.ang(self, visionTarget);
				dir = Math.round(angle / (360 / 8));
			} else {
				doMove = 1;
				change = 0;
			}
		}
		if (!change) dir = self.dir + dirChange - 1;
		move.dir = dir;
		move.walk = (doMove) ? 1 : 0;
		return move;
	};
})(this.exports || this);
