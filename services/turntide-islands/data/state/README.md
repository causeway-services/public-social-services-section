# Turntide Islands state

This directory contains public, secret-free observations of external Turntide Islands systems. State files describe what an observer returned at a stated time; they are not configuration, desired-state declarations, or authorization to mutate those systems.

`discord-guild-state.json` is produced by the Discord engineering package's GET-only `steward:snapshot-guild` command. It excludes messages, members, invites, reaction-user lists, and credentials.

`discord-reaction-system-state.json`, when present, is produced by Zelo's GET-only reaction-system projection using `content/configurations/discord-reaction-system.json`. It is limited to the established `#dock` and `#channel-visas` administrator-authored configuration messages, their aggregate emoji counts, the relevant roles/channels, and integrations. It excludes reaction-user lists, members, ordinary conversation, and credentials.
