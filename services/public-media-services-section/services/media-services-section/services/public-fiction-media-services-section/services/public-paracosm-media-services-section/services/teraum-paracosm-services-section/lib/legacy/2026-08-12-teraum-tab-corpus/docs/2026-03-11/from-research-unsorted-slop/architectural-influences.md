---

date: 2026-03-11
topic: architectural influences — MUDs, ActivityPub, blockchain
---

# Architectural Influences

What MUDs, ActivityPub, and blockchain each contribute to the engine design.
Emerged from conversation 2026-03-12. emsenn's prompt verbatim:

> So my next question is, what can we learn from ActivityPub, blockchain, and
> MUDs, about how to implement this system, with the goal being giving you and
> me ever-more-capable roles in an ever-more-capable semioverse.
>
> Like how do things like... orchestration and hand-offs and uh, all that other
> stuff work, so that we actually have like, procedural decision-making and
> semantic vector graphs and all this fancy shit?

---

## MUDs — the runtime model

The verb/object system is the core contribution. In a MUD, every object in the
world has a set of verbs you can perform on it, and your character class
determines which verbs you can use. This maps directly onto our system:

- Library objects have skills that operate on them
- Persona/role determines which skills are available to a given agent
- The **room** is our **region**: you can only act on what's in your region
- The event loop serializes writes within a room while allowing parallelism
  across rooms
- Character persistence between sessions = persona with `SOUL.md`/`MEMORY.md`

The original TAB MUD engine is the explicit historical reference for this
project. The goal is to re-implement TAB with contemporary understanding —
meaning all the same structural insights (verb/object, rooms, character
classes, persistence) but running on Markdown/YAML/Python with LLM agents as
the "players."

---

## ActivityPub — the communication model

The central insight: everything is a typed **Activity**. An actor performs an
action on an object, optionally directed at another actor. Not "write file" —
`emsenn Creates document X in domain Y`. Structure: actor, verb, object,
target. This is the effect report formalized as a transmissible message.

Key patterns to adopt:

**Inbox/outbox**: Each actor (persona) has an inbox and outbox. Instead of
synchronous calls, agents post Activities to each other's inboxes and process
them asynchronously. This is how multi-agent coordination works without
everything blocking on everything else.

**Handoffs**: One actor posts a `Delegate` activity to another's inbox. The
receiving actor picks it up, performs its skills, posts a `Respond` back. No
shared mutable state, no tight coupling.

**Following = authorization**: If I follow you, I see your activities. The
access control model is social, not ACL-based. This connects naturally to the
persona/role scoping: a persona's roles determine whose activities they're
"following" and what they can see.

**Typed activities**: Every operation in the system is an Activity with a
declared type. This gives us a complete audit log and makes replay possible.

---

## Blockchain — the provenance model

Every state change is:
- **Content-addressed**: hash = identity. The path can change; the hash doesn't.
- **Signed**: every change is attributed to its author (persona).
- **Append-only**: changes are committed to a log, not mutated in place.

The library's git history *is* a blockchain. This is not a metaphor — git is
append-only, content-addressed (SHA hashes), and author-attributed. We get
provenance for free by using git correctly.

**Smart contracts** = skills that trigger automatically when conditions are
met. In our system: hooks. When fragment X is modified, run skill Y. This is
already in the Claude Code hooks model and in the skill manifest's
`PostToolUse` hook pattern.

Content-addressing means every library object has a stable identity
independent of its path. The provenance layer the spec requires is grounded
here.

---

## How these combine

**Orchestration** = ActivityPub's actor model + LangGraph's state machine.

A procedure is a LangGraph graph where each node invokes a skill, edges are
conditional transitions based on effect reports, and the whole thing runs as
an actor that posts Activities when it needs something from another agent.

**Semantic vector graphs** = the `search` skill with embeddings instead of
keywords. Every library item gets a vector embedding. "Find the skill most
relevant to this task" becomes a vector similarity query. Locally:
`sentence-transformers` + `chromadb`. Agent memory (`MEMORY.md`) is the
structured record; the semantic index is what makes it retrievable across
sessions.

**Procedural decision-making**: the LangGraph state machine's transitions are
determined by effect reports from previous skills + agent reasoning (LLM) +
policy constraints (what the persona's roles allow next). A "procedure" is a
declared sequence of skill invocations with conditional branching.

---

## The full stack

```
Actor layer    — personas with inboxes/outboxes, typed Activities (ActivityPub)
Region layer   — locality, concurrency, scope (MUD rooms)
Skill layer    — library-defined procedures with manifests
Provenance     — signed, content-addressed, append-only (blockchain/git)
Semantic layer — vector embeddings for routing and memory retrieval
Orchestration  — state machines chaining skills into procedures (LangGraph)
```

The engine is a router: receives Activities from actors, routes to skills,
skills emit new Activities, everything is traceable back to a signed commit.
Agents only see the region they're in and the skills their roles allow.

None of this requires a novel insight — it combines patterns that each exist
and work. The novel part is that the library *is* the world, and the math
(QCHTTopos) provides the closure guarantees that keep that world consistent as
multiple agents act on it simultaneously.

---

## Open questions this surfaces

1. Do we adopt ActivityPub's JSON-LD format for Activities, or define our own
   typed activity schema in YAML? JSON-LD has interoperability advantages but
   is heavyweight.

2. How do persona inboxes/outboxes get represented in the library? As
   directories? As special files? This needs to be pegged before implementing
   async handoffs.

3. Vector embeddings require an embedding model. What runs locally alongside
   Ollama? `nomic-embed-text` is a reasonable choice — small, runs on Ollama
   already.

4. The "smart contract" / hook pattern: do skill manifests declare their own
   trigger conditions (when to fire automatically), or is that a separate
   policy layer?
