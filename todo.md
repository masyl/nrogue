
# OPEN QUESTIONS

- Should zombies also be spawned by the browser? With the server controlling when each
  client are allowed to spawn zombies ? (it would save time, bytes and cpu)
- Should maps also be created by the clients ?

# BUGS

- agent doesnt get back authonomy once the mouse move out of focus
- When only the player is sight he is not highlighted
- Sunlight level doesnt match the correct time

# TODO

- War: Respawn upon death instead of disconnecting
- Respawn zombies automatically
- HUD: Should players agent health and HITS in obvious easy to read UI

- Mode: Resting: gain back health when user stops moving for long enough
- Mode: Exaustion: loose health when has been running for too long

- War: Delay before respawning
- War: Show where an attack landed
- War: Attacks have a reload delay enforced
- War: Attacks make some noise or obvious visual queue
- War: An attacker agent knows if an attack was a hit or a miss
- War: Once an agent is dead he is disconnected and the client must respawn by reconnecting
- War: Agent has a recuperation rate to gain back health slowly when standing still
- War: Agent cant attack or be attacked inside a house (on floor)
- War: Zombies can't enter a house (cant step on "floor")
- UI: Correct display of fog of war, with lighter in, darker out

- Optimization: Sync map redraw on requestAnimationFrame.
- Map: Generate ponds
- Client: "observer" type agent
- Mouse-over or click shows block or agent information
- Structure world in layers: ground, objects, people, buildings, high-vegetation, clouds.
- On the client, run "agent code" in a webworker
- Human: search mode when has enough health
- Human: rest mode when health is too low
- Human: flight mode when health is too low and hostile is visible
- Build process for optimization and packaging

# AWESOME MUSTS

- Drop mines (behave like agents ?)
- Dead agents leave a blood trace

# AWESOME MAYBE

- Buildings with doors that can be activated
- Zombie that are attracted by noise
- Zombies a lot more active during the night
- Lighting effect at night
- Ability for agent to walk or run (oversampling of ticks)
- Additionnal layers for trees, clouds
- Animated water in the river with fishies
- Notion of inside/outside buildings, open/closed building
- try Audio : http://fabiogianini.ch/?p=75

# AFTER JS13K

- Suicide command
- Re-spawn command (instead of reload)
- Map: Generate roads
- Enforce a limit of agent per clients/IPs/browsers



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