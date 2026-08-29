# TTI Zelo reaction adapter

This public adapter turns the committed TTI reaction configuration and observed
state into reviewable Zelo shadow input. It never reads reaction users, opens
Discord, writes state, or executes role changes. The unresolved `#dock` grant
is a hard block: no arrival binding is emitted. Visa outputs are explicit,
non-executable review proposals only.

The adapter validates the complete configuration/state join: schema/version,
guild, selectors, message-and-emoji mappings, role and channel sets, observed
integration owner, and an injected freshness bound. It deliberately omits
candidate roles, user/member identity, and reaction-user data from its output.
