(function (global) {
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
			if  (agent.id !== selfId) {
				dist = global.getDistance(agent, self);
				if (dist < self.attackRange) {
					if (dist < attackTargetDist) {
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
				dist = global.getDistance(agent, self);
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
		if (visionTarget) {
			doMove = 0;
			dist = global.getDistance(self, visionTarget);
			if (dist > 1) {
				doMove = 1;
			}
			var angle = global.getAngle(self, visionTarget);
			dir = Math.round(angle / (360 / 8));
		} else {
			var doMove = global.rnd(4);
			var change = global.rnd(3);
			var dirChange = global.rnd(3);
			if (!change) dir = self.dir + dirChange - 1;
		}
		move.dir = dir;
		move.walk = (doMove) ? 1 : 0;
		return move;
	};
})(this.exports || this);
