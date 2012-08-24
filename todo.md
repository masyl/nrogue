
# BUGS

- Sunlight level doesnt match the correct time

# TODO

- War: Respawn upon death instead of disconnecting
- HUD: Should players agent health and HITS in obvious easy to read UI

- Mode: Resting: gain back health when user stops moving for long enough
- Mode: Exaustion: loose health when has been running for too long
- Humans dont attack humans
- Floors should not regenerate past 75%
- War: Zombies swarm on humans 
- War: Zombies dont attack zombies
- War: Delay before respawning
- War: Show where an attack landed
- War: Attacks have a reload delay enforced
- War: Attacks makes obvious visual cue
- War: Agent cant attack or be attacked inside a house (on floor)
- War: Zombies can't enter houses (cant step on "floor")
- War: Zombies can't see a human inside a house
- Optimization: Sync map redraw on requestAnimationFrame.
- Build process for optimization and packaging

GAMEPLAY POSSIBILITIES:
- Med packs
- Weapons
- Missions: Go grab "abc" at coord X/Y, kill XX zombies, etc... 

# AWESOME MUSTS
- On the client, run "agent code" in a webworker
- Load agent code from url or from textarea
- Map: Generate ponds
- War: If zombie kills a human, human becomes a zombie
- Human vision range shrinks with opacity
- Zombie vision range grows with opacity

# AWESOME MAYBE

- Zombies a lot more active and powerfull according to lack of sunlight... will switch their fight or flight mode
- Lighting effect at night
- Ability for agent to walk or run (oversampling of ticks)

# AFTER JS13K
- Hospitals with block types that regenerate agent instantly
- clients can also create and start maps
- Keypoints and spans during the day dawn, day, evening, night, midnight
- Dead agents leave a blood trace
- Houses are "interior" maps at a different zoom level
- Procedurally generated map stitched together infinitly
- A* path finding for humans
- War: An attacker agent knows if an attack was a hit or a miss
- Client: "observer" type agent
- Human: search mode when has enough health
- Human: flight mode when health is too low and hostile is visible
- Drop mines (behave like agents ?)
- Additionnal layers for trees, clouds
- Animated water in the river with fishies
- Notion of inside/outside buildings, open/closed building
- try Audio : http://fabiogianini.ch/?p=75
- Buildings with doors that can be activated
- Zombie that are attracted by noise
- Suicide command
- Re-spawn command (instead of reload)
- Map: Generate roads
- Enforce a limit of agent per clients/IPs/browsers
- Structure world in layers: ground, objects, people, buildings, high-vegetation, clouds.


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