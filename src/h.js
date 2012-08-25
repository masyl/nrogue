/**
 * Human AI
 */
(function (global) {
	var g = global;
	global.ai.human = function (world, self, target) {
		var move = {};
		var dist;
		var key;
		var attackTarget;
		var attackTargetDist = 999;
		var agent;
		var dir = self.dir;
		var selfId = self.id;
		var doMove;
		var change;
		var dirChange;
		var angle;
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
		if (attackTarget && target) {
			move.attack = {
				x: attackTarget.x,
				y: attackTarget.y
			}
		}

		if (target) {
			doMove = 0;
			dist = g.dist(self, target);
			if (dist > 1) {
				doMove = 1;
			}
			angle = g.ang(self, target);
			dir = Math.round(angle / 45);
		} else {
			doMove = g.rnd(4);
			change = g.rnd(3);
			dirChange = g.rnd(3);
			if (!change) dir = self.dir + dirChange - 1;
		}
		move.dir = dir;
		move.walk = (doMove) ? 1 : 0;
		return move;
	};
})(this);
