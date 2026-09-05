---
date: 2026-03-11
type: slop
topic: what the engine actually is, and how to design it properly
---

# Engine Design

Captured 2026-03-12. The MUD framing was useful for visualizing the shape but
is not the right mental model for implementation. This note captures the
neutral framing and draws out what the engine actually needs to be.

---

## The neutral framing (what this actually is)

The library is an **object graph**. Files are objects. Frontmatter is typed
attributes. Directory structure is the containment/hierarchy edge type. Typed
links in frontmatter are other edge types.

The engine is an **object runtime**. It:
- maintains the object graph
- dispatches method calls (skills) to objects based on caller authorization
- runs a consistency check (closure) after each mutation

An agent is an **object with an associated process**. The process has an input
channel — MCP for external agents (human, AI), scheduler or event trigger for
internal ones. The engine doesn't distinguish. They all invoke the same
methods through the same interface.

This is not a MUD. The MUD framing made the shape visible but the
implementation should not think in MUD terms. The correct frame is:

> A typed object graph with capability-based method dispatch, maintained by a
> consistency kernel, accessed by processes that may or may not have external
> input sources.

---

## What the current engine actually is

Right now the engine is barely an MCP server:

- `server.py` scans for SKILL.md files and registers each as an MCP tool
- `skills.py` can execute `runtime: script` skills by running a colocated Python script
- No object registry (doesn't model what's in the library as objects)
- No capability checking (all tools visible to all callers)
- No agent/persona state (no "who is calling")
- No closure (nothing runs after mutations to check consistency)
- No process management (no concept of an agent's current state or location)

It is a file server with a thin MCP wrapper and three working skill scripts.
That's Phase 0 of the tech stack plan, roughly. But even Phase 0 is not
cleanly implemented — the three minimal skills should be the *only* operational
logic, and the engine should be a pure loader/dispatcher. Currently it still
has vestigial hardcoded structure.

---

## What a proper engine needs (layered)

### Layer 0: Datastore (have this)
Read, write, list library files. No logic. No validation. Just bytes.
The three minimal skills cover this.

### Layer 1: Skill registry (partially have)
- Load all SKILL.md manifests from the library
- Parse: id, description, runtime, inputs, outputs, region, triggers
- Validate: required fields present, id matches directory name
- Register as MCP tools (done)
- Execute: dispatch to colocated method script (done)

What's missing: input schema validation before execution, effect report
validation after execution.

### Layer 2: Persona registry (not started)
- Load persona files as objects with typed attributes
- Each persona has: roles, current state, memory reference
- Roles are pointers to role definitions in the library
- Role definitions list which skills they authorize

### Layer 3: Capability check (not started)
- Given a persona (from MCP auth) and a skill id: is this authorized?
- `tools/list` returns only skills the persona's roles authorize
- Tool calls are also checked (defense in depth)

### Layer 4: Effect reports + closure (not started)
- Every skill execution returns an effect report (created/modified/deleted paths)
- After each mutation, run a closure pass: check that the affected objects
  still satisfy their invariants (frontmatter schema, link validity, etc.)
- This is the CCE — currently entirely absent

### Layer 5: Process/agent state (not started)
- An agent has a current location (which region of the library it's in)
- Skills are scoped to the agent's current location + their role's region declarations
- Agent state is persisted in the library (as a file in the persona's directory)

### Layer 6: Semantic index (not started)
- Vector embeddings for library objects
- Enables semantic routing: "find the skill most relevant to this task"
- Enables memory retrieval: semantic search over past effect reports
- Local: sentence-transformers + chromadb or similar

---

## The actual next design question

Layers 0 and 1 are rough but present. Layer 2 (persona registry) is the next
structural thing — it unblocks Layer 3 (capability check), which is what turns
"an MCP server anyone can call" into "a runtime where agents have identity."

But before implementing Layer 2, we need to answer:

**What does a persona file look like?**

From the spec, a persona has `(role, goals, policy, Skills, Tools, Memory)`.
In library terms: a YAML file (or markdown with frontmatter) at a path like
`library/agents/personas/emsenn/PERSONA.md` with:
- `roles`: list of role ids this persona holds
- `goals`: what this persona is trying to accomplish
- `memory`: path to MEMORY.md
- `soul`: path to SOUL.md

And a role file at `library/agents/roles/writer/ROLE.md` with:
- `skills`: list of skill ids this role grants

The engine loads personas at startup, builds a map from persona id → authorized
skill ids, and uses that to filter `tools/list` per authenticated connection.

**What is the auth token?**

Simplest viable: an API key in the MCP connection's `Authorization` header,
mapped to a persona id in a config file. Not cryptographically strong but
sufficient for Phase 1.

---

## Summary: what to build next

In priority order:

1. **Persona files** — define what a PERSONA.md and ROLE.md look like, create
   emsenn's and Claude Code's persona files in the library.

2. **Persona registry in the engine** — load personas and roles at startup,
   build the authorized-skills map.

3. **Auth + filtered tools/list** — read persona from MCP auth header, return
   only that persona's authorized skills.

4. **Input/output validation** — before executing a skill, validate inputs
   against the declared schema; validate the effect report after.

Everything after that (closure, semantic index, agent state/location) follows
naturally once identity and method dispatch are working correctly.
