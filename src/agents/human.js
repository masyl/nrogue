(function (global) {
	global.ai.human = function (world, self, target) {
		var move = {};
		var dist;
		var key;

		// Try to find an agent in attack range
		var attackTarget;
		var attackTargetDist = 99999;
		var agent;
		var selfId = self.id;
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
		if (attackTarget && target) {
			move.attack = {
				x: attackTarget.x,
				y: attackTarget.y
			}
		}

		var dir = self.dir;
		if (target) {
			doMove = 0;
			dist = global.getDistance(self, target);
			if (dist > 1) {
				doMove = 1;
			}
			var angle = global.getAngle(self, target);
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
})(this);
