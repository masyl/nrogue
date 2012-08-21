# OPEN QUESTIONS
- Should zombies also be spawned by the browser? With the server controlling when each
  client are allowed to spawn zombies ? (it would save time, bytes and cpu)

# TODO
- Build process for optimization and packaging
- DONE: Agents spawn at a random point
- DONE: By default maps borders warp to the other side
- DONE: Map: Generate trees (obstacle)
- DONE Map: Generate rocks & boulders (obstacle)
- DONE: Client: Show stats on visible agents
- Apply "vision" limit when sending the list of agents to a client
- Map: Generate ponds
- Map: Generate roads
- Server/AI: spawn agents with "zombie" ruleset from server
- Client: Highlight "local" agents
- Client: User controls with mouse and keyboard
- Client: "observer" type agent
- Suicide command
- Re-spawn command
- Mouse-over or click shows block or agent information
- Structure world in layers: ground, objects, people, buildings, high-vegetation, clouds.
- On the client, tun "agent code" in a webworker
- Human: search mode when has enough health
- Human: fight mode when hostile is found
- Human: rest mode when health is too low
- Human: flight mode when health is too low and hostile is visible
- War: Agent has a specific "range" for his attack
- War: Agent has a specific "strength" for his attack
- War: Agent tries to attack another agent once in range
- War: An agents attack covers X blocks
- War: An agents looses health if he is "hit" by an attack
- War: An attacker agent knows if an attack was a hit or a miss
- War: Once an agent has no more health he is dead
- War: Once an agent is dead he is disconnected and the client must respawn by reconnecting
- War: Agent has a recuperation rate to gain back health slowly when standing still


# AWESOME
- Buildings with doors that can be activated
- Zombie that are attracted by noise
- Zombies a lot more active during the night
- Lighting effect at night
- Dead agents leave a blood trace
- Ability for agent to walk or run (oversampling of ticks)
- Additionnal layers for trees, clouds
- Animated water in the river with fishies
- Notion of inside/outside buildings, open/closed building

# Gameplay
- Server spawns zombies at regular interval, with a maximum


# WebSocket Optimization
- Remove constants.js
- Remove xor
- Shorten package names
- Shorten public object attributes
- Move "vendor" js files into main path
- Remove "Router"
- Remove all validation
- Remove all error strings
- Trim down ctio-faster
- Remove index.js