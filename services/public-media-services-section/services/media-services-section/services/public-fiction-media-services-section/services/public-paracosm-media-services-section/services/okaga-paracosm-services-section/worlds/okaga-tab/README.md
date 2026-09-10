# Okaga TAB instance

This is the live Okaga world for TAB. Its seven world models are in
`attributes/okaga`; TAB's generic mudlib stays with the engine.

`make verify` compiles and instantiates the world, validates exits, and safely
loads the dimension without binding its network port. `make load` is the same
safe load, and `make topology` emits current Markdown topology.

The former Immersim-to-Teraum exit is excluded from standalone Okaga. A future
cross-paracosm bridge may provide it as an overlay.
