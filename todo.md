
# BUGS

- Sunlight level doesnt match the correct time

# TODO

## MUSTS
- War: Respawn upon death instead of disconnecting
- HUD: Should players agent health and HITS in obvious easy to read UI
- Humans dont attack humans by default (collab)
- War: Delay before respawning
- War: Attacks have a reload delay enforced

## NICE TO HAVE
- Roof layer that disapears when inside a building
- Optimization: Sync map redraw on requestAnimationFrame.
- Mode: Resting: gain back health when user stops moving for long enough
- Mode: Exaustion: loose health when has been running for too long
- Floors should not regenerate past 75%
- War: Show where an attack landed
- Build process for optimization and packaging

## GAMEPLAY POSSIBILITIES:
- Item: Med packs
- Weapon: Shot gun with limited munitions
- Mission: Successive checkpoints
- Mission: Go grab "abc" at coord X/Y
- Mission: Bring back X to coord Y
- Mission: kill XX zombies
- Mission: Protect X
- Zombies cant' walk in deep water



# AWESOME MUSTS
- On the client, run "agent code" in a webworker
- Load agent code from url or from textarea
- Map: Generate ponds
- War: If zombie kills a human, human becomes a zombie
- Human vision range shrinks with opacity
- Zombie vision range grows with opacity

# AWESOME MAYBE
- sound ? http://blog.yjl.im/2010/04/single-frequency-wave-generation-using.html
- Zombies a lot more active and powerfull according to lack of sunlight... will switch their fight or flight mode
- Lighting effect at night
- Ability for agent to walk or run (oversampling of ticks)

# AFTER JS13K
- Vision range shrink at night
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
- Attacks cant go through walls

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