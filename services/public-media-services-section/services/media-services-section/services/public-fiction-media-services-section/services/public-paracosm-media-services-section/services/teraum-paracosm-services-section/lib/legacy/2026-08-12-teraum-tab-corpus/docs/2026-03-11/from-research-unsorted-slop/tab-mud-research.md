---

date: 2026-03-11
topic: TAB MUD engine research — architecture, patterns, design philosophy
---

# TAB MUD Research

Full survey of emsenn's MUD code across all versions (Python qtMUD →
Racket-MUD → Fennel/TAB), conducted 2026-03-12. Goal: understand what TAB
actually is and how emsenn likes to write MUDs, to inform the engine design.

---

## What TAB is

TAB = **Things with Attributes and Behaviors** (also "TABby"). A
Fennel-powered MUD engine written with Org-mode literate programming.

From the README:
> TAB is a system for structuring information to allow for computed analysis &
> manipulation. A *thing* is *made* from a *model* defining the thing's
> *attributes* and *behaviors*.

From the grumblings:
> TAB was created in part out of a frustration with existing note-taking
> software not accommodating computers' capabilities for quantification...
> The MUD server is just a very specialized note that explains what a MUD
> server is in such clear terms that the computer can make one.

---

## The core mechanism: `make-thing` + metatable dispatch

Everything in TAB is a "thing" made by `tab.make-thing`. The crucial line:

```fennel
(setmetatable made-thing {:__index tab.lookup-behavior-method})
```

When you call `thing:fname()`, Lua's `__index` fires, which calls
`lookup-behavior-method(thing, "fname")`. That function searches
`thing.behaviors` — a list of behavior names — and loads the first behavior
file that exports `fname`. Behaviors are separate `.fnl` files in a
`behaviors/` directory.

This means:
- **Attributes** (data) live in `attributes/` as `.fnl` files
- **Behaviors** (methods) live in `behaviors/` as `.fnl` files
- A thing's `behaviors` list declares what it can do
- Method dispatch is dynamic: the metatable looks up behavior files at call time

The model hierarchy uses `base` fields for inheritance. `tab.collect-bases`
recursively collects the base chain and `tab.merge-models` merges them all
into the made thing. Certain attributes (like `behaviors` and
`additive-attributes`) are additive — they accumulate rather than override
down the base chain.

---

## The dimension / systems architecture

The world is a **dimension** — a `sys/dimension` thing — that holds named
**systems** as a table:

```fennel
{:systems {:animation :vr/animation
           :map :marmud/vr/mapper
           :mud-server :marmud/mud/server
           :noisemaker :vr/noisemaker
           :users :marmud/users/handler
           :talker :mud/talker/system
           :timer :sys/timer}}
```

`dimension:lsr` (load-start-run) does exactly that in sequence:
1. **Load**: makes each system thing, calls `system:load(dimension)` if it exists
2. **Start**: calls `system:start()` on each
3. **Run**: calls `dimension.timer:run()` which is the main event loop

The dimension is the container for all systems. Systems reference each other
via `client.dimension.map`, `client.dimension.talker`, etc.

---

## The timer / tick loop

The timer is a bucket scheduler:

```fennel
(fn schedule [timer event ?delay]
  ; inserts event into bucket at delay (default 1)
  ...)

(fn tick [timer]
  ; fires all events in bucket 1, shifts all other buckets down by 1
  ...)

(fn run [timer]
  (timer:tick)
  (socket.select nil nil 0.2)  ; 200ms sleep
  (timer:run))  ; recursive main loop
```

Everything is non-blocking. The server's `tick` accepts new connections, reads
from each client, parses input, flushes output buffers — all in one pass.
Scheduled events fire on the next tick or N ticks later.

---

## The command system

Commands are first-class files: `commands/look.fnl`, `commands/move.fnl`,
etc. Each file returns a function `(fn [client input] ...)`.

The client's `parser` behavior:
1. Splits first word as command name, rest as args
2. Checks if command is in `client.command-list` (the agent's authorized commands)
3. If yes: calls `tab.lookup-command(command)` to load the file, then calls it
4. If no: messages "Invalid command"

`command-list` is an additive attribute — base models contribute commands,
derived models add more. Users get additional commands added when they log in
via `system-relationships`.

---

## The `look` output format (consistent across all versions)

```
<thing:fname>
  <thing:describe>
Contents: <quibble-strings of notable contents>
Exits: <quibble-strings of exit keys>
```

`notable` flag on a thing controls whether it appears in look output. Every
object is notable; lookables and noises are not (they're set dressing).

---

## The VR (virtual reality) layer

Areas are containers. Movement = `object:move(destination)` which calls
`destination:receive-object(object)`. Receive/remove broadcast to contents.

Mobiles can roam: `vr/mobile` behavior has a `roam` method that picks a
random exit (respecting optional `region-lock`), moves there, reschedules
itself on the timer.

Noises are things with `[[chance "message"] ...]` arrays. The noisemaker
system ticks through them and randomly broadcasts to nearby contents.

Animation is behavior-driven: things with `animations` lists get those methods
scheduled on the timer at startup.

---

## System relationships (authorization model)

When a user logs in, their `system-relationships` table is applied:

```fennel
{:system-relationships {:users [:admin] :talker [:client]}}
```

This causes `dimension.users:setup-admin(client)` and
`dimension.talker:setup-client(client)` to fire. Each `setup-*` method adds
commands to the client's `command-list`.

**This is the role system.** Roles are implemented as `setup-*` methods on
systems. A user's relationships declare which roles they hold on which
systems, and each role adds its commands to the agent.

---

## Persistent patterns across ALL versions (Python → Racket → Fennel)

These never changed across a decade of rewrites:

1. **"Things" with named attributes** — the central entity. Always separates
   *what something is* (data) from *what it can do* (behaviors/methods).

2. **Tick-based async loop** — schedule events, tick, sleep, repeat. Never
   blocking per-client.

3. **Containers with `receive-object`/`remove-object`** — movement always
   through container methods, broadcasting to other contents.

4. **Client has a buffer** — output accumulates per-tick, flushed as one send.

5. **Commands as first-class files** — each command is its own file,
   dynamically loaded. Consistent across every version.

6. **`look` shows: name, description, notable contents, exits** — same format
   every time.

7. **Dimension/Universe contains Systems** — the world container holds the set
   of service systems (map, server, timer, talker, users) loaded/started/run
   in sequence.

8. **Exits as named string keys** — `{north: area-id, east: other-area-id}`.
   Exit names are arbitrary, not just cardinal directions.

9. **Grammar system** — things track nouns, adjectives, article, pronouns for
   natural-language reference matching.

10. **Command authorization via additive lists** — `command-list` grows as
    roles/relationships are applied; you can only call what's in your list.

---

## What this means for our engine

The 10 patterns above are the skeleton. Translated to our system:

| TAB concept | Our system |
|---|---|
| Thing with attributes | Library file with YAML frontmatter |
| Behavior file | Skill (SKILL.md + method script) |
| `behaviors` list | Role (bundles skills a persona can use) |
| `command-list` | MCP tool list (filtered by persona/role) |
| Dimension | Library (the world) |
| Systems (map, server, timer...) | Engine services |
| Timer / tick loop | LangGraph orchestration + asyncio |
| `receive-object` / container | Fragment region — agents enter/leave regions |
| `system-relationships` | Persona role assignments |
| `setup-admin` / `setup-client` | Role activation (adds skills to persona) |

The command dispatch `lookup-command(name) → call(client, input)` maps
directly to our MCP tool dispatch: `lookup-skill(id) → execute(persona, inputs)`.

The `region-lock` on mobiles is our region scoping — an agent can be locked
to a subtree of the library.

The `notable` flag is our fragment visibility — not all library objects should
be visible to all agents.

---

## TAB file locations in the repo

```
library/triage/text-to-process-someday/org/org-20231116/pro/src/fennel/tab/
  tab.fnl          — core engine
  conf.fnl         — configuration
  attributes/      — model data files
  behaviors/       — method files
  commands/        — command files
  attributes/marmud/  — MarMUD (the GAZ community MUD) dimension
  attributes/okaga/   — starship Okaga world content
  attributes/teraum/  — Teraum world content
```

Earlier versions:
```
library/agents/persona/emsenn/projects/archive/fennel-digital-garden-mud/
library/triage/text-to-process-someday/org/old-org/mud/code/  (Racket)
library/triage/stuff-from-github/sloppyresearch-snapshots/... (Python ECS toy)
```
