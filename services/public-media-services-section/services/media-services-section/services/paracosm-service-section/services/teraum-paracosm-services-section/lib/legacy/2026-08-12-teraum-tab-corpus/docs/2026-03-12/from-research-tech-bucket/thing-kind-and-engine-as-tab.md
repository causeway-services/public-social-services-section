---

date: 2026-03-12
topic: thing as base kind, engine as on-disk TAB, description as minimum differentiator
correction-2026-04-05: "The SHACL / generate_shape / validate_object sections below are this note's own PROPOSAL for how to adapt the TAB pattern to the FARS library. TAB itself does not use SHACL, does not validate via shape files, and has nothing to do with W3C shape languages. TAB's dispatch is purely via Lua __index metatable lookup (util.fnl:221-230) — a method not in the behaviors' dispatch table simply fails to resolve. Prior sessions mistook this note's SHACL proposal for a description of TAB's actual mechanism."
sources-that-contradict-shacl-claim:
  - operations/engineering/toys/tab/engine/util.fnl
  - operations/engineering/toys/tab/engine/models/thing.fnl
  - operations/engineering/toys/tab/engine/behaviors/thing.fnl
  - operations/command/endeavor/records/analyses/tab-vs-qtops-source-read.md
---

# Thing, Kind, and the Engine as On-Disk TAB

## The TAB insight

In TAB, every object inherits from `thing`. The TAB docs say it plainly:

> "The ***thing*** is the foundational model in TAB; it's what every other model uses as a base."

TAB's `thing` model has: name, behaviors list, additive-attributes list,
grammar table. But crucially, every thing in a MUD *also* needs a
description — not because it's in the base model spec, but because without
one, a player can't `look` at it. The description is what makes the thing
*perceptible*. Without a description, a thing exists in the world but cannot
be encountered. It has no surface.

The library already has a `domains/general/terms/thing.md` that reads:

> "A thing is a separation from [everything](everything) distinguished by its
> [quality|qualities](quality|qualities) or [condition](condition)."

That's the philosophical definition. What we need alongside it is a **kind
declaration**: what a thing *must have* to be valid in the library.

## Description as minimum differentiator

A `description` is the minimum required attribute because it is what makes a
thing distinguishable from nothing. In MUD terms: it's what `look` returns.
In RDF terms: without at least one observable predicate, a node is a blank
node — structurally present but informationally empty.

The claim is:

> Any library object of `kind: thing` MUST have a `description`. Without a
> description, it cannot be differentiated, and therefore cannot function as
> a node in the knowledge graph.

This is the base SHACL shape: one constraint, `description` is required,
type is string, min length > 0.

All other kinds extend `thing` and add further constraints.

## The kind file

The proposed file is `domains/general/thing.md` — not inside `terms/` (that's
the philosophical definition), but at the domain root as a **kind declaration**:

```yaml
---
title: Thing
kind: thing
description: The base kind. Any library object is a thing. A thing must have
  a description — the minimum surface that makes it perceptible and
  differentiable from nothing.
---

A thing must have a description. That is the only invariant.

All other kinds extend thing and add further constraints.
```

The `kind: thing` field is what tells the engine this is a kind declaration,
not a content file. The engine reads kind declarations and generates SHACL
shapes from them.

## The engine as on-disk TAB

TAB creates an in-memory object graph at runtime. The MUD is what you get
when you run it.

Our engine does the same thing, but writes to disk instead of memory.

| TAB | Our engine |
|-----|-----------|
| `make-thing` creates in-memory object | `generate_shape` writes a `.shacl.ttl` file |
| `tab.merge-models` merges base chain | `sh:node` references parent shape (SHACL inheritance) |
| `__index` metatable dispatches to behavior files | SHACL validator loads kind's shape file, validates |
| Dimension = in-memory world | Library = on-disk world |
| TAB model file defines a prototype | Kind markdown file defines a SHACL shape |
| Object in-memory = made thing | Object on-disk = markdown file + its TTL representation |

The runtime artifact is different (bytes on disk vs. heap in RAM) but the
logic is the same: you define a kind (model), you create instances of it
(things), the runtime enforces that instances satisfy the kind's constraints.

TAB enforces constraints through behavior dispatch — you can only call
behaviors the thing has. We enforce through SHACL validation — you can only
write a file that passes its kind's shape.

## The engine tool: `generate_shape`

An MCP tool exposed by the engine:

```
generate_shape(kind_path: str) -> effect_report
```

Given the path to a kind declaration markdown file:
1. Read and parse the kind file's frontmatter
2. Parse any field declarations in the body (to be designed)
3. Generate a SHACL shape as a `.shacl.ttl` file co-located with the kind
4. Return effect_report with path of generated file

Example: `generate_shape("domains/general/thing.md")` produces
`domains/general/thing.shacl.ttl`:

```turtle
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix lib: <library://> .

lib:ThingShape
    a sh:NodeShape ;
    sh:targetClass lib:Thing ;
    sh:property [
        sh:path lib:description ;
        sh:minCount 1 ;
        sh:datatype xsd:string ;
    ] .
```

And a more complex kind like `concept` would extend it:

```turtle
lib:ConceptShape
    a sh:NodeShape ;
    sh:node lib:ThingShape ;  # inherits thing's constraints
    sh:targetClass lib:Concept ;
    sh:property [
        sh:path lib:title ;
        sh:minCount 1 ;
    ] .
```

## The validate tool

The paired tool:

```
validate_object(object_path: str) -> conformance_report
```

1. Read the markdown file at `object_path`
2. Extract frontmatter as YAML
3. Convert frontmatter to RDF triples (using the object's `kind` to determine
   class and its fields to determine predicates)
4. Load the SHACL shape for this kind (from the co-located `.shacl.ttl`)
5. Run pySHACL validation
6. Return conformance_report: passes/fails, violation messages

This makes `write_object` composable with validation: write → validate →
report. The engine can enforce on every write.

## What this gives us (vs. grep)

grep finds text. SHACL validation finds structural violations.

But more importantly, once we have markdown → TTL extraction, we have a graph.
And once we have a graph, we have SPARQL. And SPARQL answers questions like:
- "What things have `kind: concept` and link to misopedy?"
- "What roles authorize the `write-file` skill?"
- "What kind does this path's frontmatter say it is?"

The graph is what makes the library queryable as a semioverse, not as a
filesystem.

## Where the existing thing.md definitions fit

There are currently at least 5 versions of `thing.md` in the library:
- `domains/general/terms/thing.md` — philosophical definition (good, keep)
- Three copies in `domains/relationality/triage/` — deep formal definitions
- `triage/text-to-process-someday/` variants — old notes to process

None of these are kind declarations. They are content about the concept
"thing." The kind declaration we're proposing is a different file with a
different role — it's a schema file that happens to live in the library rather
than a separate schema directory.

## Next steps

1. Design the field declaration syntax for kind files (how do you say
   "description is required, string, min length 1" in the kind markdown body?)
2. Write `domains/general/thing.md` as the first kind declaration
3. Write 2-3 derived kind declarations as examples: concept, specification, skill
4. Implement `generate_shape` tool in the engine
5. Implement `validate_object` tool in the engine
6. Use `write_object` + `validate_object` together on the first test files
