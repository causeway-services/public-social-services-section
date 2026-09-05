# Teraum TAB instance

This is the live Teraum world for TAB. Its world models live in
`attributes/teraum`; TAB's generic mudlib remains with the engine.

Run `make verify` to compile and instantiate every Teraum model, validate all
local exits, and load the dimension without binding a network port.
`make load` performs the same safe load. `make topology` emits current Markdown
topology.

Teraum is standalone here. The old Fort Kelly/Okaga Immersim swirl is not a
Teraum exit; a future cross-paracosm bridge may provide it as an overlay.
